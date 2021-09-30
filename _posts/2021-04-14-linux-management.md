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

# OS 최신화
$ sudo apt update
$ sudo apt dist-upgrade
$ sudo reboot
# 커널 자동 업데이트 막고 최신 커널 하나만 남기기
$ sudo apt remove linux-image-generic # 뒤에 버전 없는 패키지가 자동 업데이트되는 패키지
$ dpkg --list | grep linux-image-generic # 안쓰는 커널도 제거
```

### Package Version

버전 요구사항이 가장 까다로운 Lustre를 먼저 체크해서 OS, kernel, OFED 버전을 정하자. 예를 들어, 제공되는 설치파일 경로가 아래와 같다 치자.

```
https://downloads.whamcloud.com/public/lustre/lustre-2.13.0-ib/MOFED-4.7-1.0.0.1/ubuntu1804/client/lustre-client-modules-4.15.0-64-generic_2.13.0-1_amd64.deb
```

그러면, `OFED-4.7-1.0.0.1`, `Ubutun 18.04`, `Linux kernel 4.15.0-64`를 맞추어 설치해야 된다. Minor version까지는 달라도 될 수 있지만 (예를 들어, `Linux kernel 4.15.0-72`) 장담할 수는 없다. 버전 확인 했으면 OFED를 먼저 설치하러 가자. 직접 컴파일하거면 별 상관 없다.

### Mellanox OFED

설치파일 경로를 통해 

```
# Install
$ tar xf MLNX_OFED_LINUX-5.3-1.0.5.0-ubuntu18.04-x86_64.tgz
$ cd MLNX_OFED_LINUX-5.3-1.0.5.0-ubuntu18.04-x86_64
$ ./mlnxofedinstall
$ update-initramfs -u -k `uname -r`
$ reboot

# Uninstall
$ ofed_uninstall.sh
```

### Lustre

```
# Install with provided package
$ wget -r -nH -np --cut-dirs=2 https://downloads.whamcloud.com/public/lustre/lustre-2.13.0-ib/MOFED-4.7-1.0.0.1/ubuntu1804/client/
$ cd lustre-2.13.0-ib/MOFED-4.7-1.0.0.1/ubuntu1804/client/
$ dpkg -i lustre-client-modules*.deb lustre-client-utils*.deb lustre-dev*.deb lustre-iokit*.deb

# Build from source (server)
$ wget https://github.com/lustre/lustre-release/archive/refs/tags/2.14.52.tar.gz
$ tar xf 2.14.52.tar.gz 
$ cd lustre-release-2.14.52
$ sh autogen.sh
$ apt install zfs-dkms
$ ./configure --with-linux=/usr/src/linux-headers-4.15.0-72-generic --with-o2ib=/usr/src/ofa_kernel/default --with-zfs
$ make debs -j$(nproc)
$ ls debs
$ dpkg -i lustre-server-modules*.deb lustre-server-utils*.deb lustre-dev*.deb lustre-iokit*.deb
$ rm /etc/depmod.d/lustre.conf
$ depmod
$ reboot

# Build from source (client)
$ wget https://github.com/lustre/lustre-release/archive/refs/tags/2.14.52.tar.gz
$ tar xf 2.14.52.tar.gz 
$ cd lustre-release-2.14.52
$ sh autogen.sh
$ ./configure --with-linux=/usr/src/linux-headers-4.15.0-72-generic --with-o2ib=/usr/src/ofa_kernel/default --disable-server
$ make debs -j$(nproc)
$ ls debs
$ dpkg -i lustre-client-modules*.deb lustre-client-utils*.deb lustre-dev*.deb lustre-iokit*.deb
$ rm /etc/depmod.d/lustre.conf
$ depmod
$ reboot

# Uninstall
$ apt purge "lustre*"
```

**When you give o2ib path, you should give `/usr/src/ofa_kernel/default`, not `/usr/src/ofa_kernel-5.3` or `/usr/src/mlnx-ofed-kernel-5.3`.** Countless errors during configure (e.g., cannot find config.h, can't compile with OpenIB gen2 headers, ...) come from this. Believe me, I spent 10 hours to realize this.

Also, delete `/etc/depmod.d/lustre.conf`. It causes inkernel ib modules to be loaded instead of the mlnx one.

```
# After installing lustre 2.14
$ modinfo ib_core
filename:       /lib/modules/4.15.0-72-generic/kernel/drivers/infiniband/core/ib_core.ko
$ rm /etc/depmod.d/lustre.conf
$ depmod
$ modinfo ib_core
filename:       /lib/modules/4.15.0-72-generic/updates/dkms/ib_core.ko
```

### CUDA

```
# Install
$ dpkg -i cuda-repo-ubuntu1804-11-4-local_11.4.2-470.57.02-1_amd64.deb
$ apt update
$ apt install cuda

# Uninstall
$ apt purge "cuda*"
$ apt autoremove --purge
$ apt list --installed | grep cuda
$ apt list --installed | grep nvidia
```