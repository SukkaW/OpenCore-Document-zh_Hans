---
title: 附录 1. OpenCore 兼容 Kext 列表
description: OpenCore 支持的内核驱动 (Kext) 及其用途
type: docs
author_info: 由 Sukka 整理，感谢黑果小兵的博客提供的资料。
last_updated: 2020-02-15
---

## 有线网卡

- [AppleRTL8169Ethernet](https://www.realtek.com/en/directly-download) --- Realtek RTL8169 官方驱动，通过电子邮件发送下载链接
- [AtherosE2200Ethernet.kext](https://github.com/Mieze/AtherosE2200Ethernet) --- 高通 Atheros Killer E2200 系列驱动
- [AtherosL1cEthernet.kext](https://github.com/al3xtjames/AtherosL1cEthernet) --- 高通 Atheros AR813x/815x 驱动
- [IntelMausi.kext](https://github.com/acidanthera/IntelMausi) --- 由 Acidanthera 维护的英特尔有线网卡驱动
- [IntelMausiEthernet.kext](https://github.com/Mieze/IntelMausiEthernet) --- 由原作者（Mieze）英特尔有线网卡
- [NullEthernetInjector.kext](https://github.com/RehabMan/OS-X-Null-Ethernet) --- RehabMan 提供的仿冒内建网卡
- [RealtekR1000SL.kext](https://github.com/SergeySlice/RealtekLANv3) --- Realtek 8111B/C/D/E/EP/F/G/GU/8411B 系列驱动
- [RealtekRTL8100.kext](https://github.com/Mieze/RealtekRTL8100) --- Realtek RTL810X 系列驱动
- [RealtekRTL8111.kext](https://github.com/Mieze/RTL8111_driver_for_OS_X) --- Realtek RTL8111/8168 系列驱动

## Wi-Fi 和蓝牙

- [AirPortAtheros40.kext](https://i.applelife.ru/2018/12/442854_AirPortAtheros40.kext.zip) --- 高通 Atheros AR92xx/AR93xx 驱动，仅适用于 macOS 10.13.6 和 macOS 10.14+
- [AirportBrcmFixup.kext](https://github.com/acidanthera/AirportBrcmFixup) --- 非苹果官方博通网卡修复
- [ATH9KFixup.kext](https://github.com/chunnann/ATH9KFixup) --- 高通 Atheros AR9xxx 无线网卡修复
- [BrcmPatchRAM.kext](https://github.com/acidanthera/BrcmPatchRAM) --- 博通网卡蓝牙固件
- [BT4LEContinuityFixup.kext](https://github.com/acidanthera/BT4LEContinuityFixup) --- IOBluetoothFamily 修补
- [MT7610](https://d86o2zu8ugzlg.cloudfront.net/mediatek-craft/drivers/MT7612_7610U_D5.0.1.25_SDK1.0.2.18_UI5.0.0.27_20151209.zip) --- 联发科 MT7610 官方驱动
- [RT5370](https://d86o2zu8ugzlg.cloudfront.net/mediatek-craft/drivers/RTUSB_D2870-4.2.9.2_UI-4.0.9.6_2013_11_29.zip) --- 联发科 RT5370 官方驱动
- [RTL8192CU](https://drive.google.com/file/d/1ZtdMqlvKBbHULJhl1u9omuLOy6j0vx48/view?usp=sharing) --- Realtek RTL8192CU 驱动

> 译者注：上述链接为 Google Drive 分享，直链下载地址：
> - [macOS 10.6](/download/RTL8192CU/10.6/RTL8192CUs.kext.zip)
> - [macOS 10.9](/download/RTL8192CU/10.9/RTL8192CU9.kext.zip)

## 键盘、鼠标和触摸设备

- [ApplePS2SmartTouchPad.kext](https://osxlatitude.com/forums/topic/1948-elan-focaltech-and-synaptics-smart-touchpad-driver-mac-os-x/) --- 触摸板和键盘
- [GK701HIDDevice.kext](https://github.com/osy86/GK701HIDDevice) --- 华硕 Fn 键、键盘背光灯和环境光传感器 驱动
- [NoTouchID.kext](https://github.com/al3xtjames/NoTouchID) --- 禁用 Touch ID 检测
- [SerialMouse.kext](https://github.com/Goldfish64/SerialMouse) --- 使用 Microsoft 串行鼠标协议的串行鼠标驱动
- [VoodooI2C.kext](https://github.com/alexandred/VoodooI2C) --- I2C 触摸板/屏 驱动
- [VoodooPS2Controller.kext](https://github.com/acidanthera/VoodooPS2) --- PS2 键盘/触摸板 驱动
- [VoodooInput.kext](https://github.com/acidanthera/VoodooInput) --- 为 PS2 键盘/触摸板 提供模拟 Magic TrackPad 2 触控模拟

## Video and audio

- [AppleALC.kext](https://github.com/acidanthera/AppleALC) --- 定制万能声卡驱动
- [EMUUSBAudio.kext](https://github.com/Wouter1/EMU-driver) --- 适用于 Creative Labs EMU USB 的驱动程序
- [kXAudioDriver.kext](https://github.com/kxproject/kx-audio-driver) --- 适用于 kX 音频设备的驱动
- [Nvidia CUDA drivers](https://www.nvidia.com/object/mac-driver-archive.html) --- NVIDIA CUDA 官方驱动
- [Nvidia Web-drivers](https://gfe.nvidia.com/mac-update) --- NVIDIA 显卡官方驱动
- [SNBGraphicsMojaveInstaller](https://github.com/Andrej-Antipov/SNBGraphicsMojaveInstaller) --- 二代酷睿核显驱动，仅适用于 macOS 10.13.6 和 macOS 10.14+
- [VoodooHDA.kext](https://sourceforge.net/projects/voodoohda/) --- 万能声卡驱动
- [WhateverGreen.kext](https://github.com/acidanthera/WhateverGreen) --- 显卡补丁驱动
- [Polaris22Fixup.kext](https://github.com/osy86/Polaris22Fixup) --- Polaris22/VegaM 显卡修复

## CPU 和 SMC

- [AppleMCEReporterDisabler.kext](https://github.com/acidanthera/bugtracker/issues/424#issuecomment-535624313)
- [AsusSMC.kext](https://github.com/hieplpvip/AsusSMC) --- 为 ASUS 笔记本电脑上的 ALS、键盘背光、Fn 键提供支持 VirtualSMC 插件
- [CPUFriend.kext](https://github.com/acidanthera/CPUFriend) - CPU 变频管理
- [FakeSMC.kext 以及配套传感器驱动](https://github.com/CloverHackyColor/FakeSMC3_with_plugins) --- Clover 官方的 FakeSMC
- [HWPEnabler.kext](https://github.com/headkaze/HWPEnable) --- 启用 HWP 驱动
- [OpcodeEmulator.kext](https://www.insanelymac.com/forum/topic/329704-opcode-emulator-opemu-plug-in-project/) --- Opcode 模拟驱动
- [TSCAdjustReset.kext](https://github.com/interferenc/TSCAdjustReset) --- TSC 频率同步驱动
- [VirtualSMC.kext 以及配套传感器驱动](https://github.com/acidanthera/VirtualSMC)
- [VoodooTSCSync.kext](https://github.com/RehabMan/VoodooTSCSync) --- 由 Rehabman 提供的 TSC 频率同步驱动

## USB and other ports

- [IOElectrify.kext](https://github.com/the-darkvoid/macOS-IOElectrify) --- 在雷电 3 设备上启用常开电源
- [Legacy_InternalHub-EHCx.kext](https://applelife.ru/posts/537459)
- [Legacy_USB3.kext](https://applelife.ru/posts/537459)
- [NVMeFix.kext](https://github.com/acidanthera/NVMeFix) --- 由 acidanthera 提供的改善第三方 SSD 兼容性的驱动程序
- [USBWakeFixup.kext](https://github.com/osy86/USBWakeFixup) --- 修复 Skylake 平台 USB 唤醒黑屏
- [SASMegaRAID.kext](https://github.com/dukzcry/osx-goodies) --- LSI MegaRAID SAS 系列 RAID 控制器驱动
- [Sinetek-rtsx.kext](https://www.insanelymac.com/forum/topic/321080-sineteks-driver-for-realtek-rtsx-sdhc-card-readers/?do=findComment&comment=2376387) --- Realtek RTSX SDHC 读卡器驱动
- [VoodooSDHC.kext](https://github.com/lvs1974/VoodooSDHCMod) --- SDHC 读卡器驱动

## Other kexts

- [AppleIntelInfo.kext](https://github.com/headkaze/AppleIntelInfo) --- CPU / 核显 变频测试
- [DebugEnhancer.kext](https://github.com/acidanthera/DebugEnhancer) --- macOS 内核调试输出驱动
- [HibernationFixup.kext](https://github.com/acidanthera/HibernationFixup) --- 修复因 RTC 变量和 NVRAM 造成的睡眠问题
- [Lilu.kext](https://github.com/acidanthera/Lilu) --- SDK & Library
- [LiluFriend.kext](https://github.com/PMheart/LiluFriend) --- 用于确保 Lilu 在 L/E 下正常加载
- [RTCMemoryFixup.kext](https://github.com/lvs1974/RTCMemoryFixup) --- 修复 BIOS CMOS (RTC) 内存和 AppleRTC 之间的冲突问题
- [NightShiftUnlocker.kext](https://github.com/0xFireWolf/NightShiftUnlocker) --- 解锁 NightShift
- [WebCamera.kext](https://www.applelife.ru/threads/asus-x550vc-i-asus-x550cc.41752/page-130#post-593586) --- 某些旧设备的摄像头驱动
