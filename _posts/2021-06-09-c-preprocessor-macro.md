---
layout: post
title: C Preprocessor Macro
---

C Preprocessor에는 Macro라는 기능이 있다. Type specialization을 하고 싶은데 C++ template 따위를 쓰지 못하는 상황이면 (OpenCL C로 커널을 짠다던지...) 매크로를 적극적으로 활용하곤 한다.
매크로에는 여러가지 기능이 있는데, 그 중에서도 token concatenation을 해주는 `##` 연산자가 아주 유용하다. 다음 코드를 보자.

```c
#include <stdio.h>
#define CAT(A, B) A ## _ ## B
float add_float(float x, float y) { return x + y; }
int main() {
  printf("%f\n", CAT(add, float)(1.0, 2.0));
  return 0;
}
```

`CAT(A, B)` 매크로는 토큰 `A`, `_`, `B`를 이어 붙여준다. 그래서 `CAT(add, float)`와 같이 사용하면 `add_float`가 된다.
그런데 희한하게도 다음 코드는 에러가 발생한다.

```bash
$ cat a.c
#include <stdio.h>
#define OP add
#define TYPE float
#define CAT(A, B) A ## _ ## B
float add_float(float x, float y) { return x + y; }
int main() {
  printf("%f\n", CAT(OP, TYPE)(1.0, 2.0));
  return 0;
}
$ gcc a.c
a.c: In function ‘main’:
a.c:7:22: warning: implicit declaration of function ‘OP_TYPE’; did you mean ‘TYPE’? [-Wimplicit-function-declaration]
    7 |   printf("%f\n", CAT(OP, TYPE)(1.0, 2.0));
      |                      ^~
a.c:4:19: note: in definition of macro ‘CAT’
    4 | #define CAT(A, B) A ## _ ## B
      |                   ^
/usr/bin/ld: /tmp/cc3tmTHR.o: in function `main':
a.c:(.text+0x44): undefined reference to `OP_TYPE'
collect2: error: ld returned 1 exit status
```

OP는 add고, TYPE은 float니까, CAT(OP, TYPE)은 add_float일 것 같은데 왜 안될까? 또, 희한하게도 아래와 같이 이중으로 감싸면 잘 동작한다.

```bash
$ cat a.c
#include <stdio.h>
#define OP add
#define TYPE float
#define CAT2(A, B) A ## _ ## B
#define CAT(A, B) CAT2(A, B)
float add_float(float x, float y) { return x + y; }
int main() {
  printf("%f\n", CAT(OP, TYPE)(1.0, 2.0));
  return 0;
}
$ gcc a.c
$ ./a.out 
3.000000
```

Preprocessor의 동작을 알아야 이 현상을 이해할 수 있다. [설명](https://gcc.gnu.org/onlinedocs/cpp/Concatenation.html)을 보면 `If either of the tokens next to an ‘##’ is a parameter name, it is replaced by its actual argument before ‘##’ executes. As with stringizing, the actual argument is not macro-expanded first.`라고 되어있다. 즉, `##`의 피연산자가 매크로의 파라미터인 경우 macro-expanded 되지 않고 붙인다는 것이다.
첫번째 경우를 다시 보면 CAT의 A와 B 모두 `##`의 피연산자이기 때문에 `CAT(OP, TYPE) -> OP_TYPE`와 같이 계산되어 오류가 발생하게 된다.
두번째 경우는 `#define CAT(A, B) CAT2(A, B)`와 같이 되어 있어서 A와 B가 `##`의 피연산자가 아니다. 그래서 `CAT(OP, TYPE) -> CAT2(add, float) -> add_float`와 같이 올바르게 계산된다.