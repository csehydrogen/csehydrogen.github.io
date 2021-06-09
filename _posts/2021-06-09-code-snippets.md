---
layout: post
title: 무지성 복붙용 코드 창고
---

Copy-Paste Oriented Programming.

```c++
#include <ctime>
double GetTime() {
  timespec t;
  clock_gettime(CLOCK_MONOTONIC, &t);
  return t.tv_sec + t.tv_nsec / 1e9;
}
```