---
layout: post
title: Windows Remote Desktop 세팅
---

* "Remote Desktop Settings" 검색 - "Enable Remote Desktop" (Windows 10)
* Powershell을 관리자로 실행

```
# 22589로 포트 변경
$ Set-ItemProperty 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\Wds\rdpwd\Tds\tcp' -Name 'PortNumber' -Value '22589'
$ Set-ItemProperty 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name 'PortNumber' -Value '22589'

# 변경 확인
$ Get-ItemProperty -Path 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\Wds\rdpwd\Tds\tcp' -Name 'PortNumber'
$ Get-ItemProperty -Path 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name 'PortNumber'

# 방화벽에서 TCP/UDP 포트 오픈
$ New-NetFirewallRule -DisplayName "RemoteDesktop 22589 Any TCP" -Direction Inbound -Protocol TCP -LocalPort 22589 -Action Allow -Profile Any
$ New-NetFirewallRule -DisplayName "RemoteDesktop 22589 Any UDP" -Direction Inbound -Protocol TCP -LocalPort 22589 -Action Allow -Profile Any

# 서비스 재시작
$ Restart-Service -Force -DisplayName "Remote Desktop Services"
```