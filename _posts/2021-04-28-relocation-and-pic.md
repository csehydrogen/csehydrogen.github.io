---
layout: post
title: Relocation과 PIC
---

프로그램이 여러 개의 오브젝트 파일로 구성되어 있는 경우 서로의 데이터를 접근하거나 코드를 호출해야 하는데, 링킹을 하기 전까지는 정확한 주소를 알 수 없다. 그래서 컴파일때 이러한 부분들을 적절히 기록해놓고 링킹 때 코드를 수정하여 올바른 주소를 가리키도록 하는 일련의 과정이 필요한데, 이를 **Relocation**이라고 한다. 다음 예시를 보자.

```bash
$ cat bar.c
extern int foo;
int bar() { return foo; }
$ gcc -c -o bar.o bar.c
$ objdump -S bar.o
0000000000000000 <bar>:
   0:	f3 0f 1e fa          	endbr64 
   4:	55                   	push   %rbp
   5:	48 89 e5             	mov    %rsp,%rbp
   8:	8b 05 00 00 00 00    	mov    0x0(%rip),%eax        # e <bar+0xe>
   e:	5d                   	pop    %rbp
   f:	c3                   	retq   
$ readelf -r bar.o
Relocation section '.rela.text' at offset 0x1f0 contains 1 entry:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
00000000000a  000a00000002 R_X86_64_PC32     0000000000000000 foo - 4
```

`bar.c`에서 `foo`를 접근하는데 아직 foo의 주소를 모르는 상황이다. 그래서 `foo`를 가져오는 명령 `mov offset(%rip),%eax`에서 offset 부분은 0으로 채워져있다. 대신 **Relocation table**이 `.rela.text`라는 섹션에 존재하고, 각 entry는 offset, info, addend 값을 가진다. Offset은 말 그대로 값을 수정해야 할 코드 상의 위치를 말한다. Info는 relocation type과 symbol table의 위치 정보를 담고 있는데, `readelf`가 Type과 Sym. Name 필드로 해석해서 보여주고 있다. Addend는 값을 채워넣기 전에 더해줘야 하는 일종의 보정값이다. 또한 아키텍처별 문서를 보면 아래와 같이 relocation type 별로 값을 어떻게 계산해야되는지 나와있다.

* R_X86_64_PC32: value=2, field=word32, calculation=S+A-P
* S: Represents the value of the symbol whose index resides in the relocation entry.
* A: Represents the addend used to compute the value of the relocatable field.
* P: Represents the place (section offset or address) of the storage unit being relocated (computed using r_offset).

실제 규칙대로 값이 채워지는지 링킹해보자.

```bash
$ cat main.c
int foo = 42;
int main() { return 0; }
$ gcc -c -o main.o main.c
$ gcc -o main main.o bar.o
$ objdump -S main
0000000000001138 <bar>:
    1138:	f3 0f 1e fa          	endbr64 
    113c:	55                   	push   %rbp
    113d:	48 89 e5             	mov    %rsp,%rbp
    1140:	8b 05 ca 2e 00 00    	mov    0x2eca(%rip),%eax        # 4010 <foo>
    1146:	5d                   	pop    %rbp
    1147:	c3                   	retq   
    1148:	0f 1f 84 00 00 00 00 	nopl   0x0(%rax,%rax,1)
    114f:	00
$ readelf -s main
    57: 0000000000004010     4 OBJECT  GLOBAL DEFAULT   23 foo
```

Symbol table을 보면 foo가 0x4010 값을 가지므로 S는 0x4010이다. A는 addend이므로 -4다. P는 relocation 되는 위치이므로 0x1142이다. S+A-P=0x2eca로 0x1142 위치에 쓰인 값과 일치한다. Addend가 -4인 이유는 %rip가 현재 인스트럭션이 아닌 다음 인스트럭션의 위치를 가리키기 때문이다.

## Position-independent code(PIC)

PIC란 코드가 위치한 주소에 상관없이 잘 동작하는 코드를 말한다. 예를 들어, shared library는 임의의 주소에 올려도 동작할 수 있어야 하므로 PIC로 컴파일 되어야 한다[^1]. Executable은 프로세스가 실행될 때 자기만의 고유의 가상 주소 공간을 할당받으므로 PIC일 필요는 없지만, 프로그램이 로드되는 주소를 랜덤화해서 공격을 막는 ASLR 같은 기법을 적용하기 위해서 PIC로 컴파일 하기도 한다. 이 경우 PIE(Position-Independent Executable)이라고도 한다.

그런데 현재 컴파일된 bar 코드는 position-independent하다고 볼 수 없다. 왜냐하면 코드 주소가 바뀌면 foo와의 상대적 위치가 바뀌기 때문에 동작하지 않기 때문이다[^2]. 실제로 bar를 shared library로 컴파일하려고 시도하면 PIC 옵션을 넣으라는 에러를 볼 수 있다.

```bash
$ gcc -shared -o bar.so bar.c
/usr/bin/ld: /tmp/ccXJG2dz.o: relocation R_X86_64_PC32 against undefined symbol `foo' can not be used when making a shared object; recompile with -fPIC
/usr/bin/ld: final link failed: bad value
collect2: error: ld returned 1 exit status
```

그러면 shared library로 컴파일 후에 살펴보자.

```bash
$ gcc -shared -fPIC -o bar.so bar.c
$ objdump -S bar.so
00000000000010f9 <bar>:
    10f9:	f3 0f 1e fa          	endbr64 
    10fd:	55                   	push   %rbp
    10fe:	48 89 e5             	mov    %rsp,%rbp
    1101:	48 8b 05 e8 2e 00 00 	mov    0x2ee8(%rip),%rax        # 3ff0 <foo>
    1108:	8b 00                	mov    (%rax),%eax
    110a:	5d                   	pop    %rbp
    110b:	c3                   	retq
$ readelf -r bar.so
Relocation section '.rela.dyn' at offset 0x420 contains 8 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000003ff0  000400000006 R_X86_64_GLOB_DAT 0000000000000000 foo + 0
$ readelf -S bar.so
  [17] .got              PROGBITS         0000000000003fd8  00002fd8
       0000000000000028  0000000000000008  WA       0     0     8
```

코드를 보면 이전처럼 foo 값을 mov로 바로 가져오는 것이 아니라, 어디선가 foo의 주소값을 가져온 뒤 (`mov 0x2ee8(%rip),%rax`) dereference(`mov (%rax),%eax`)하는 것을 볼 수 있다. 이 "어디선가"에 해당하는 것이 GOT(Global Offset Table)이다. GOT는 PIC를 생성하기 위해 도입된 개념으로, 런타임때 객체들의 실제 주소를 담는 테이블이다.

위의 예에서 foo를 로드하는 인스트럭션에서의 %rip 값인 0x1108과 foo 주소가 담긴 GOT entry 위치 0x3ff0이 절대값은 바뀔지라도 상대거리 0x2ee8는 유지된다. 그렇기 때문에 bar.so가 어느 곳에 로드되더라도 코드는 수정될 필요가 없고(position-independent) GOT entry만 foo의 실제 주소로 잘 채워주면 된다. 채워주는 것은 R_X86_64_GLOB_DAT 타입의 relocation entry를 dynamic loader가 읽음으로써 해결된다.

### PIC: 함수는?

주소가 알려지지 않은 데이터를 접근하는 상황에서 PIC를 생성할 때 GOT를 사용하는 것을 알게 되었다. 그러면 주소가 알려지지 않은 함수를 호출하는 것은 어떻게 처리될까? PIC인 경우와 아닌 경우를 비교해보자.

```bash
$ cat bar.c
int foo();
int bar() { return foo(); }
$ gcc -c -o bar.o bar.c
$ objdump -S bar.o
0000000000000000 <bar>:
   0:	f3 0f 1e fa          	endbr64 
   4:	55                   	push   %rbp
   5:	48 89 e5             	mov    %rsp,%rbp
   8:	b8 00 00 00 00       	mov    $0x0,%eax
   d:	e8 00 00 00 00       	callq  12 <bar+0x12>
  12:	5d                   	pop    %rbp
  13:	c3                   	retq   
$ readelf -r bar.o
Relocation section '.rela.text' at offset 0x220 contains 1 entry:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
00000000000e  000b00000004 R_X86_64_PLT32    0000000000000000 foo - 4
```

데이터를 접근하는 경우와 달리 relocation의 타입이 R_X86_64_PLT32이다. 문서를 살펴보자.

* R_X86_64_PLT32: value=4, field=word32, calculation=L+A-P
* L: Represents the place (section offset or address) of the Procedure Linkage Table
entry for a symbol.

R_X86_64_PLT32 타입이 오묘한게, L이 PLT(Procedure Linakage Table)의 entry 주소를 가리킨다고 되어있지만 static linking을 하면 S처럼 그냥 symbol address로 계산된다.

```bash
$ cat main.c
int foo() { return 42; }
int main() { return 0; }
$ gcc -c -o main.o main.c
$ gcc -o main main.o bar.o
$ objdump -S main
0000000000001147 <bar>:
    1147:	f3 0f 1e fa          	endbr64 
    114b:	55                   	push   %rbp
    114c:	48 89 e5             	mov    %rsp,%rbp
    114f:	b8 00 00 00 00       	mov    $0x0,%eax
    1154:	e8 d0 ff ff ff       	callq  1129 <foo>
    1159:	5d                   	pop    %rbp
    115a:	c3                   	retq   
    115b:	0f 1f 44 00 00       	nopl   0x0(%rax,%rax,1)
$ readelf -s main
    57: 0000000000001129    15 FUNC    GLOBAL DEFAULT   14 foo
```

`L + A - P = 0x1129 - 4 - 0x1155 = 0xffffffd0`로 계산되었다. 또한, R_X64_64_PC32 타입과 달리 PIC 옵션을 굳이 주지 않아도 오류 없이 shared library가 잘 생성된다. 물론 이경우에는 L이 PLT의 entry 주소를 가리키게 되어 PIC가 생성된다.

```bash
$ gcc -shared -o bar.so bar.c # no error even without -fPIC
$ objdump -S bar.so
Disassembly of section .plt:
0000000000001020 <.plt>:
    1020:	ff 35 e2 2f 00 00    	pushq  0x2fe2(%rip)        # 4008 <_GLOBAL_OFFSET_TABLE_+0x8>
    1026:	f2 ff 25 e3 2f 00 00 	bnd jmpq *0x2fe3(%rip)        # 4010 <_GLOBAL_OFFSET_TABLE_+0x10>
    102d:	0f 1f 00             	nopl   (%rax)
    1030:	f3 0f 1e fa          	endbr64 
    1034:	68 00 00 00 00       	pushq  $0x0
    1039:	f2 e9 e1 ff ff ff    	bnd jmpq 1020 <.plt>
    103f:	90                   	nop
Disassembly of section .plt.sec:
0000000000001050 <foo@plt>:
    1050:	f3 0f 1e fa          	endbr64 
    1054:	f2 ff 25 bd 2f 00 00 	bnd jmpq *0x2fbd(%rip)        # 4018 <foo>
    105b:	0f 1f 44 00 00       	nopl   0x0(%rax,%rax,1)
Disassembly of section .text:
0000000000001119 <bar>:
    1119:	f3 0f 1e fa          	endbr64 
    111d:	55                   	push   %rbp
    111e:	48 89 e5             	mov    %rsp,%rbp
    1121:	b8 00 00 00 00       	mov    $0x0,%eax
    1126:	e8 25 ff ff ff       	callq  1050 <foo@plt>
    112b:	5d                   	pop    %rbp
    112c:	c3                   	retq   
```

많이 복잡한데 차근차근 살펴보자. 먼저, 0x1126에서 static linking 했을때 foo를 직접 call 했던것과 달리 .plt.sec[^3]의 foo@plt를 호출한다. foo@plt는 0x4018의 값을 보고 그곳으로 jmp하는데, 0x4018은 .got.plt에 포함된 entry로 초기값이 0x1030이다. 즉, .plt의 0x1030으로 점프하게 된다. 점프 후에는 0을 push한 다음에 0x1020으로 점프하는데, 0은 함수 identifier다. 함수가 여러개 있었다면 1을 push한 후 0x1020으로 점프하는 코드, 2를 push한 후 0x1020으로 점프하는 코드 등이 줄줄이 붙어있었을 것이다. 0x1020에서는 .got.plt의 0x4008에 있는 값을 push 후 0x4010에 있는 주소로 점프하게 된다.

0x4010에는 dynamic loader의 코드 주소가 기다리고 있다. Dynamic loader는 필요한 일들을 수행한 뒤 실제 foo 함수를 호출한다. 여기서 중요한 것은 0x4018의 값을 실제 foo 함수의 주소로 바꾼다는 것이다. 그래서 두번째 호출부터는 .plt를 거치지 않고, foo@plt에서 foo로 바로 점프하게 된다. 다시 말해, shared library를 로드할때 초기화가 일어나는 것이 아니라, 함수가 첫번째로 호출되는 시점에서 여러가지 초기화 작업이 일어나고, 두번째 함수 호출부터는 직접 함수가 호출되는 lazy binding 방식이다.

섹션들도 다시 정리해보자면, .got.plt는 .got처럼 writable한 공간인데 .plt가 사용하는 값들을 담는다. .plt.got(.plt.sec)은 함수별로 .got.plt에서 주소값을 가져와 jmp하는 루틴을 담고 있다. .plt는 (굳이 코드를 entry로 나누자면) 첫번째 entry는 dynamic loader로 jmp하는 루틴이고, i번째 entry는 i-1번째 함수에 대한 identifier를 스택에 쌓은 뒤 첫번째 entry로 jmp하는 루틴이다.

## 요약

Relocation은 어떤 심볼을 당장 resolve할 수 없을 때 relocation table에 offset, type, addend를 기록해 둔 뒤 링커가 테이블을 보면서 resolve하는 방식으로 일어난다.

PIC는 shared library처럼 코드가 어느 주소에 로드 되더라도 실행되어야되는 경우에 필요하며, 코드가 read-only이기 때문에 writable한 영역인 GOT를 만들어서 런타임에 주소값들을 담아주고, 코드는 GOT entry를 상대주소로 가리키게 하여 position-independent하게 하는 전략임을 확인했다.

[^1]: Shared library 코드가 position-dependent하다면 shared library끼리 겹치지 않도록 주소 공간을 약속해야 하므로 골치가 아프다. Domain name 받듯이 관리 기관을 설립해서 선착순으로 공간을 받아야 한다거나...
[^2]: "Relocate를 다시하면 되지않냐?"라고 생각할 수 있는데, position-indepedent 한지는 코드가 **고정된 이후에** 따지는 것이다.
[^3]: .plt.sec은 .plt.got의 secure 버젼으로 일단은 .plt.got로 이해하면 된다.