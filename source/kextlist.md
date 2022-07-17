---
title: 附录 1. OpenCore 兼容 Kext 列表
description: OpenCore 支持的内核驱动 (Kext) 及其用途
type: docs
author_info: 由 Sukka、derbalkon 整理，感谢黑果小兵的博客提供的资料。
last_updated: 2022-07-17
---

## 有线网卡

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [AppleRTL8169Ethernet](https://www.realtek.com/en/directly-download) | Realtek RTL8169 官方驱动，通过电子邮件发送下载链接 | — | — |
| [AtherosE2200Ethernet.kext](https://github.com/Mieze/AtherosE2200Ethernet) | 高通 Atheros Killer E2200 系列驱动 | — | — |
| [AtherosL1cEthernet.kext](https://github.com/al3xtjames/AtherosL1cEthernet) | 高通 Atheros AR813x/815x 驱动 | — | — |
| [IntelMausi.kext](https://github.com/acidanthera/IntelMausi) | 由 Acidanthera 维护的英特尔有线网卡驱动 | 13.0.0 (10.9) | — |
| [IntelSnowMausi.kext](https://github.com/acidanthera/IntelMausi) | 由 Acidanthera 维护的 macOS 10.6-10.8 可用的英特尔有线网卡驱动 | 10.0.0 (10.6) Not tested | — |
| [IntelMausiEthernet.kext](https://github.com/Mieze/IntelMausiEthernet) | 由原作者（Mieze）提供的英特尔有线网卡驱动 | — | — |
| [NullEthernetInjector.kext](https://github.com/RehabMan/OS-X-Null-Ethernet) | RehabMan 提供的仿冒内建网卡 | — | — |
| [RealtekR1000SL.kext](https://github.com/SergeySlice/RealtekLANv3) | Realtek 8111B/C/D/E/EP/F/G/GU/8411B 系列驱动 | — | — |
| [RealtekRTL8100.kext](https://github.com/Mieze/RealtekRTL8100) | Realtek RTL810X 系列驱动 | — | — |
| [RealtekRTL8111.kext](https://github.com/Mieze/RTL8111_driver_for_OS_X) | Realtek RTL8111/8168 系列驱动 | — | — |

## Wi-Fi 和蓝牙

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [AirPortAtheros40.kext](https://i.applelife.ru/2018/12/442854_AirPortAtheros40.kext.zip) | 高通 Atheros AR92xx/AR93xx 驱动，仅适用于 macOS 10.13.6 和 macOS 10.14+ | 18.0.0 (10.14) From 10.13 | — |
| [AirportBrcmFixup.kext](https://github.com/acidanthera/AirportBrcmFixup) | 非苹果官方博通网卡修复 | 12.0.0 (10.8) | — |
| [ATH9KFixup.kext](https://github.com/chunnann/ATH9KFixup) | 高通 Atheros AR9xxx 无线网卡修复 | — | — |
| [BrcmPatchRAM.kext](https://github.com/acidanthera/BrcmPatchRAM) | 博通网卡蓝牙固件 | 14.0.0 (10.10) | — |
| [IntelBluetoothFirmware](https://github.com/zxystd/IntelBluetoothFirmware) | Intel 蓝牙固件驱动 | — | — |
| [MT7610](https://d86o2zu8ugzlg.cloudfront.net/mediatek-craft/drivers/MT7612_7610U_D5.0.1.25_SDK1.0.2.18_UI5.0.0.27_20151209.zip) | 联发科 MT7610 官方驱动 | — | — |
| [RT5370](https://d86o2zu8ugzlg.cloudfront.net/mediatek-craft/drivers/RTUSB_D2870-4.2.9.2_UI-4.0.9.6_2013_11_29.zip) | 联发科 RT5370 官方驱动 | — | — |
| [RTL8192CU](https://drive.google.com/file/d/1ZtdMqlvKBbHULJhl1u9omuLOy6j0vx48/view?usp=sharing) | Realtek RTL8192CU 驱动 | — | — |

> 译者注：上述 `RTL8192CU` 驱动链接为 Google Drive 分享，直链下载地址：
>
> - [macOS 10.6](/download/RTL8192CU/10.6/RTL8192CUs.kext.zip)
> - [macOS 10.9](/download/RTL8192CU/10.9/RTL8192CU9.kext.zip)

## 键盘、鼠标和触摸设备

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [ApplePS2SmartTouchPad.kext](https://osxlatitude.com/forums/topic/1948-elan-focaltech-and-synaptics-smart-touchpad-driver-mac-os-x/) | 触摸板和键盘 | — | — |
| [GK701HIDDevice.kext](https://github.com/osy86/GK701HIDDevice) | 华硕 Fn 键、键盘背光灯和环境光传感器驱动 | — | — |
| [NoTouchID.kext](https://github.com/al3xtjames/NoTouchID) | 禁用 Touch ID 检测 | 17.0.0 (10.13) | — |
| [SerialMouse.kext](https://github.com/Goldfish64/SerialMouse) | 使用 Microsoft 串行鼠标协议的串行鼠标驱动 | — | — |
| [VoodooI2C.kext](https://github.com/alexandred/VoodooI2C) | 驱动 I2C 触摸板 / 屏 | 16.0.0 (10.12) | — |
| [VoodooPS2Controller.kext](https://github.com/acidanthera/VoodooPS2) | 驱动 PS2 键盘 / 鼠标 / 触摸板 | 15.0.0 (10.11) | — |
| [VoodooPS2Keyboard.kext](https://github.com/acidanthera/VoodooPS2) | — | 15.0.0 (10.11) | — |
| [VoodooPS2Mouse.kext](https://github.com/acidanthera/VoodooPS2) | — | 15.0.0 (10.11) | — |
| [VoodooPS2Trackpad.kext](https://github.com/acidanthera/VoodooPS2) | — | 15.0.0 (10.11) | — |
| [VoodooInput.kext](https://github.com/acidanthera/VoodooInput) | 为 PS2 输入源提供 Magic TrackPad 2 触控模拟 | 15.0.0 (10.11) | — |
| [VoodooSMBus.kext](https://github.com/leo-labs/VoodooSMBus) | 提供 i801 SMBus 支持和 Thinkpad T480s, L380, P52 的 ELAN 触摸板驱动 | 18.0.0 (10.14) | — |
| [VoodooRMI.kext](https://github.com/VoodooSMBus/VoodooRMI) | 驱动 Synaptic SMBus 触摸板 / 小红点 | 15.0.0 (10.11) | — |
| [AlpsT4USB.kext](https://github.com/blankmac/AlpsT4USB) | VoodooI2C 的卫星插件 Kext，为 Alps T4 USB 触控板提供原生苹果手势支持 | — | — |

## 音频和视频

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [AppleALC.kext](https://github.com/acidanthera/AppleALC) | 定制声卡驱动 | 12.0.0 (10.8) | — |
| [EMUUSBAudio.kext](https://github.com/Wouter1/EMU-driver) | 适用于 Creative Labs EMU USB 的驱动程序 | — | — |
| [kXAudioDriver.kext](https://github.com/kxproject/kx-audio-driver) | 适用于 kX 音频设备的驱动 | — | — |
| [Nvidia CUDA drivers](https://www.nvidia.com/object/mac-driver-archive.html) | NVIDIA CUDA 官方驱动 | 10.0.0 (10.6) | 17.9.9 (10.13) |
| [Nvidia Web-drivers](https://gfe.nvidia.com/mac-update) | NVIDIA 显卡官方驱动 | 12.0.0 (10.8) | 17.9.9 (10.13) |
| [SNBGraphicsMojaveInstaller](https://github.com/Andrej-Antipov/SNBGraphicsMojaveInstaller) | 二代酷睿核显驱动，仅适用于 macOS 10.13.6 和 macOS 10.14+ | 18.0.0 (10.14) From 10.13 | — |
| [VoodooHDA.kext](https://sourceforge.net/projects/voodoohda/) | 万能声卡驱动 | — | — |
| [WhateverGreen.kext](https://github.com/acidanthera/WhateverGreen) | 显卡补丁驱动 | 12.0.0 (10.8) | — |
| [Polaris22Fixup.kext](https://github.com/osy86/Polaris22Fixup) | Polaris22/VegaM 显卡修复 | 18.0.0 (10.14) | — |

## CPU 和 SMC

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [AAAMouSSE.kext](https://forums.macrumors.com/threads/mp3-1-others-sse-4-2-emulation-to-enable-amd-metal-driver.2206682/) | — | 16.0.0 (10.12) | — |
| [AppleMCEReporterDisabler.kext](https://github.com/acidanthera/bugtracker/issues/424#issuecomment-535624313) | — | — | — |
| [AsusSMC.kext](https://github.com/hieplpvip/AsusSMC) | VirtualSMC 插件，为华硕笔记本电脑上的 ALS、键盘背光、Fn 键提供支持 | — | — |
| [CPUFriend.kext](https://github.com/acidanthera/CPUFriend) | CPU 变频管理 | 15.0.0 (10.11) | — |
| [HWPEnabler.kext](https://github.com/headkaze/HWPEnable) | 启用 HWP 驱动 | — | — |
| [OpcodeEmulator.kext](https://www.insanelymac.com/forum/topic/329704-opcode-emulator-opemu-plug-in-project/) | Opcode 模拟驱动 | — | — |
| [telemetrap.kext](https://forums.macrumors.com/posts/28447707) | — | 18.0.0 (10.14) | — |
| [TSCAdjustReset.kext](https://github.com/interferenc/TSCAdjustReset) | TSC 频率同步驱动 | — | — |
| [VoodooTSCSync.kext](https://github.com/RehabMan/VoodooTSCSync) | 由 Rehabman 提供的 TSC 频率同步驱动 | — | — |
| [CpuTscSync.kext](https://github.com/acidanthera/CpuTscSync) | Lilu 插件，合并了 VoodooTSCSync 功能 | 12.0.0 (10.8) | — |
| [FakeSMC.kext](https://github.com/CloverHackyColor/FakeSMC3_with_plugins) | Clover 官方的 FakeSMC | — | — |
| [VirtualSMC.kext](https://github.com/acidanthera/VirtualSMC) | Acidanthera 提供的 VirtualSMC | 10.0.0 (10.6) | - |
| [SMCLightSensor.kext](https://github.com/acidanthera/VirtualSMC) | VirtualSMC 插件，提供光线传感器支持 | 10.0.0 (10.6) Not tested | — |
| [SMCSuperIO.kext](https://github.com/acidanthera/VirtualSMC) | VirtualSMC 插件，提供风扇信息读取支持 | 10.0.0 (10.6) Not tested | — |
| [SMCBatteryManager.kext](https://github.com/acidanthera/VirtualSMC) | VirtualSMC 插件，提供电池相关的传感器支持 | 10.0.0 (10.6) Not tested | — |
| [SMCProcessor.kext](https://github.com/acidanthera/VirtualSMC) | VirtualSMC 插件，提供 CPU 温度传感器支持 | 11.0.0 (10.7) Not tested | — |
| [SMCDellSensor.kext](https://github.com/acidanthera/VirtualSMC) | VirtualSMC 插件，为戴尔电脑提供温度和风扇传感器支持 | 11.0.0 (10.7) Not tested | — |
| [AMDRyzenCPUPowerManagement.kext](https://github.com/trulyspinach/SMCAMDProcessor) | XNU 内核扩展，用于 AMD 处理器的电源管理和监控。 | 11.0.0 (10.7) Not tested | — |
| [SMCAMDProcessor.kext](https://github.com/trulyspinach/SMCAMDProcessor) | 收集传感器数据，并发送到 VirtualSMC，以使 macOS 应用程序能够显示传感器数据，该 kext 依赖 AMDRyzenCPUPowerManagement.kext | 11.0.0 (10.7) Not tested | — |

## USB 和其他端口

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [IOElectrify.kext](https://github.com/the-darkvoid/macOS-IOElectrify) | 在雷电 3 设备上启用常开电源 | — | — |
| [Legacy_InternalHub-EHCx.kext](https://applelife.ru/posts/537459) | — | 15.0.0 (10.11) | — |
| [Legacy_USB3.kext](https://applelife.ru/posts/537459) | — | 15.0.0 (10.11) | — |
| [NVMeFix.kext](https://github.com/acidanthera/NVMeFix) | 由 Acidanthera 提供的改善第三方 SSD 兼容性的驱动程序 | 18.0.0 (10.14) | — |
| [USBWakeFixup.kext](https://github.com/osy86/USBWakeFixup) | 解决从 USB 唤醒设备时无法唤醒显示器，需要再按一次按键或再按一次鼠标来唤醒显示器的问题 | — | — |
| [SASMegaRAID.kext](https://github.com/dukzcry/osx-goodies) | LSI MegaRAID SAS 系列 RAID 控制器驱动 | — | — |
| [Sinetek-rtsx.kext](https://www.insanelymac.com/forum/topic/321080-sineteks-driver-for-realtek-rtsx-sdhc-card-readers/?do=findComment&comment=2376387) | Realtek RTSX SDHC 读卡器驱动 | — | — |
| [VoodooSDHC.kext](https://github.com/lvs1974/VoodooSDHCMod) | SDHC 读卡器驱动 | — | — |

## 其他

| Name | Description | MinKernel (Min macOS) | MaxKernel (Max macOS) |
|------|-------------|-----------------------|-----------------------|
| [AppleIntelInfo.kext](https://github.com/headkaze/AppleIntelInfo) | CPU / 核显变频测试 | — | — |
| [DebugEnhancer.kext](https://github.com/acidanthera/DebugEnhancer) | macOS 内核调试输出驱动 | 12.0.0 (10.8) | — |
| [HibernationFixup.kext](https://github.com/acidanthera/HibernationFixup) | 修复因 RTC 变量和 NVRAM 造成的睡眠问题 | 14.0.0 (10.10) | — |
| [Lilu.kext](https://github.com/acidanthera/Lilu) | SDK & Library | 10.0.0 (10.6) | — |
| [RTCMemoryFixup.kext](https://github.com/lvs1974/RTCMemoryFixup) | 修复 BIOS CMOS (RTC) 内存和 AppleRTC 之间的冲突问题 | 12.0.0 (10.8) | — |
| [NightShiftEnabler.kext](https://github.com/cdf/NightShiftEnabler) | 解锁 Night Shift | 16.0.0 (10.12) | — |
| [WebCamera.kext](https://www.applelife.ru/threads/asus-x550vc-i-asus-x550cc.41752/page-130#post-593586) | 某些旧设备的摄像头驱动 | — | — |
| [TOSMotionSensor.kext](https://github.com/jslegendre/TOSMotionSensor) | 东芝设备的加速度传感器驱动 | — | — |
| [NVMeFix.kext](https://github.com/acidanthera/NVMeFix) | NVMeFix 是 Apple NVMe 存储驱动程序 IONVMeFamily 的一组补丁。其目标是提高与非 Apple SSD 的兼容性。它可以在苹果和非苹果计算机上使用 | — | — |

> 更完整的列表（包含旧版）托管在 [这里](https://docs.google.com/spreadsheets/d/15S-ocrkm_VTUJpKxNII-YUyQFd5VYdjbe0DHlZVCQyM)。完整的 Lilu 插件列表（包含旧版）托管在 [这里](https://github.com/acidanthera/Lilu/blob/master/KnownPlugins.md)。仅供开发者使用。
>
> [Acidanthera GitHub 仓库](https://github.com/acidanthera) 之外的内核扩展均与 Acidanthera 无关。此列表仅供参考，不作任何形式的保证。
