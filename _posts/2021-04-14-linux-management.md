---
layout: post
title: Linux 관리
---

Linux 서버 관리 하면서 만나는 상황들 적는 글. 계속 업데이트 됨.

## Package Management - Ubuntu

```bash
# 설치된 패키지 나열
$ apt list --installed

# 어떤 패키지가 해당 파일을 제공하는지 검색
$ dpkg -S filename
$ dpkg -S $(realpath filename) # 파일이 심볼릭 링크면 검색이 안되므로 realpath 활용

# 패키지가 제공하는 파일 나열
$ dpkg -L package # 설치된 패키지인 경우
$ apt-file list package # 설치되지 않은 패키지인 경우

$ apt remove package # 환경설정 파일은 제외하고 삭제
$ apt purge package # 환경설정 파일 포함하여 삭제
```