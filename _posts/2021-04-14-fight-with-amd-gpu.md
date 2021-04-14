---
layout: post
title: AMD 망했으면
---

AMD GPU 관련해서 조우한 문제점들 적는 글. 계속 업데이트 됨.

## mpirun Hang

AMD GPU가 탑재된 서버에서 뜬금없이 mpirun이 안되는 경우가 있다.

```bash
$ mpirun hostname
(... nothing happens ...)
```

원인분석을 위해 strace를 따봤더니 `/tmp/.X11-unix/X0` 소켓에 연결 후 응답을 기다리고 있었다.
서버에 설치된 X 서버가 Xorg임을 확인하고 로그를 확인하니 오류가 있었다.

```bash
(EE) 
(EE) Backtrace:
(EE) 0: /usr/lib/xorg/Xorg (OsLookupColor+0x13c) [0x55a4a2e4959c]
(EE) 1: /lib/x86_64-linux-gnu/libpthread.so.0 (funlockfile+0x60) [0x7f9ffafae41f]
(EE) 2: /usr/lib/xorg/modules/libglamoregl.so (glamor_egl_create_textured_pixmap_from_gbm_bo+0x5b) [0x7f9ff9fc9a9b]
(EE) unw_get_proc_name failed: no unwind info found [-10]
(EE) 3: /usr/lib/xorg/modules/drivers/amdgpu_drv.so (?+0x0) [0x7f9ffa12b210]
(EE) unw_get_proc_name failed: no unwind info found [-10]
(EE) 4: /usr/lib/xorg/modules/drivers/amdgpu_drv.so (?+0x0) [0x7f9ffa11dee0]
(EE) 5: /usr/lib/xorg/Xorg (InitExtensions+0x692) [0x55a4a2d579c2]
(EE) 6: /usr/lib/xorg/Xorg (InitFonts+0x229) [0x55a4a2cebe39]
(EE) 7: /lib/x86_64-linux-gnu/libc.so.6 (__libc_start_main+0xf3) [0x7f9ffadcc0b3]
(EE) 8: /usr/lib/xorg/Xorg (_start+0x2e) [0x55a4a2cd5a2e]
(EE) 
(EE) Segmentation fault at address 0x2fb8
(EE) 
Fatal server error:
(EE) Caught signal 11 (Segmentation fault). Server aborting
(EE) 
(EE) 
Please consult the The X.Org Foundation support 
	 at http://wiki.x.org
 for help. 
(EE) Please also check the log file at "/var/log/Xorg.0.log" for additional information.
(EE) 
(EE) Server terminated with error (1). Closing log file.
Aborted (core dumped)
```

Xorg 잘못인지 AMD 잘못인지는 시간이 없는 관계로 더 추적해보지는 않았다. 또한 왜 mpirun이 굳이 X 서버에 접속하는지도 모르겠고, 접속하지 않는 옵션도 찾지 못했다. 결과적으로는 `apt purge xserver-xorg`로 X 서버를 지워버리니 mpirun은 잘 실행되었다.