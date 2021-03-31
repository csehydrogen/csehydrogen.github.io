---
layout: post
title: 블로그 시작
---

글과 사진으로 기록을 남기는 것이 중요하다고 생각한다. 그래서 여러번 블로그를 시작했지만 2~3개의 글을 쓴 후 귀찮음으로 버려두곤 했다. 글 쓰기 장벽을 최대한 낮추어 다시 시도해본다.

새 블로그를 구축하면서 고려한 사항은 다음과 같다.
* Code snippet 삽입이 가능한가?
* 수식 렌더링이 가능한가?
* 그림 삽입이 자유로운가?
* 쉽게 서버 환경 구축을 할 수 있는가? github.io로 publish하기 편한가?
* 글을 작성하기 쉬운가?

Wordpress도 괜찮지만 무거운 감이 있어서, Jekyll을 사용하기로 했다. 테마는 [자주 보던 블로그](https://jalammar.github.io/)를 본따 Jekyll Now를 사용했다. 다 좋은데, ruby 기반인게 개인적으로 맘에 안든다.

## Local Environment Setup

```bash
# Follow rbenv install guide
$ sudo apt install rbenv
$ rbenv init # edit bashrc and restart shell

# Install ruby-build for recent ruby versions
$ mkdir -p "$(rbenv root)"/plugins
$ git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build

# Check available versions, then install
$ rbenv install -l
$ rbenv install 2.7.2
$ rbenv versions # check selected version

# Install plugins
$ gem install github-pages

# Turn on server
$ jekyll serve -H 0.0.0.0 -P YOUR_PORT
```
