---
layout: post
title: mmap의 최소 주소값
---

앞선 ELF 글에서 신경쓰지 않았던 부분이 있는데, 링크시에 text 섹션의 위치를 조절하여 프로그램이 로드되는 가상 주소와 entry point를 조절할 수 있다. 그런데 text 섹션의 위치를 0x10000 보다 낮게 설정하면 segfault가 발생하는 것을 볼 수 있다.

```bash
$ as -o a.o e.S; ld --oformat binary -o a.out a.o
$ readelf -h a.out
  Entry point address:               0x400020
$ as -o a.o e.S; ld --oformat binary -Ttext=0x10000 -o a.out a.o
$ readelf -h a.out
  Entry point address:               0x10020
$ ./a.out # OK
$ as -o a.o e.S; ld --oformat binary -Ttext=0x1000 -o a.out a.o
$ readelf -h a.out
  Entry point address:               0x1020
$ ./a.out
Segmentation fault
```

결론부터 말하자면, 파일 내용을 가상 주소에 올릴때 mmap을 사용하는데 매핑 가능한 최소 주소가 높게 설정되어 있을 수 있다. 이 값을 0으로 수정하면 주소 0에 로드해도 문제 없이 실행되는 것을 확인할 수 있다.

```bash
$ sysctl vm.mmap_min_addr
vm.mmap_min_addr = 65536 # which is 0x10000
$ sysctl -w vm.mmap_min_addr=0
vm.mmap_min_addr = 0
$ as -o a.o e.S; ld --oformat binary -Ttext=0 -o a.out a.o
$ ./a.out # OK
```

그런데 이상한 점은 평범하게 gcc로 컴파일한 프로그램은 entry point가 0x10000보다 낮음에도 불구하고 잘 실행이 된다는 점이다.

```bash
$ cat a.c
int main() { return 0; }
$ gcc a.c
$ readelf -h a.out
  Entry point address:               0x1040
$ ./a.out # no segfault
```

gdb로 실제 실행 과정을 확인해보면 코드가 프로그램 헤더에 명시된 주소가 아니라 다른 높은 주소에 로드 된것을 확인할 수 있다.

```bash
$ gdb a.out
(gdb) p _start
0x1040
(gdb) starti
(gdb) p _start
0x555555555040
```

이는 프로그램이 PIE(Position Independent Executable)로 컴파일되고 ASLR(Address Space Layout Randomization)이 적용되어 실행되고 있기 때문이다. `-no-pie` 옵션으로 ASLR이 적용될 수 없는 실행파일을 생성해보면 entry point가 보다 높게 잡히는 것을 확인할 수 있다. 또한 `mmap_min_addr`을 해당 값보다 높게 설정하고 실행하면 segfault를 관찰할 수 있다.

```bash
$ gcc -no-pie a.c
$ readelf -h a.out 
  Entry point address:               0x401020
$ sysctl -w vm.mmap_min_addr=0x500000
vm.mmap_min_addr = 0x500000
$ ./a.out 
Segmentation fault
```