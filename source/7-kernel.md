---
title: 7. Kernel
description: OpenCore 安全配置，Kext 加载顺序以及屏蔽
type: docs
author_info: 由 Sukka、derbalkon 整理，由 Sukka、derbalkon 翻译。
last_updated: 2020-09-18
---

## 7.1 简介

本章节介绍了如何在 Apple Kernel（[XNU](https://opensource.apple.com/source/xnu)）上应用各种不同的内核空间修改，包括内核驱动程序（Kext）注入、修补以及屏蔽。

## 7.2 属性列表

### 1. Add

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 `OC/Kexts` 目录加载选定的 Kext 驱动。

设计为使用 `plist dict` 数据填充以描述每个驱动程序。请参阅下述 Add 属性章节。Kext 驱动程序加载的顺序遵照数组中项目的顺序，因此如 Lilu 这种其他驱动程序的依赖驱动应该位于前面。

可以通过检查 Kext 驱动中 `Info.plist` 的 `OSBundleLibraries` 值的方法来确定其依赖驱动的加载顺序。`OSBundleLibraries` 中的任何依赖驱动都必须在此 Kext 之前加载。

*注*：Kext 驱动的内部可能也附带另外的 Kext (`Plug-Ins`)，每个内部的 Kext 也都必须单独添加（参考下文 Add 属性章节）。

### 2. Block

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 Prelinked Kernel 中移除选定的 Kext。

设计为使用 `plist dict` 数据填充以描述每个驱动程序。请参阅下述 Block 属性章节。Kext 驱动程序加载的顺序遵照数组中项目的顺序，因此如 Lilu 这种其他驱动程序的依赖驱动应该位于前面。

### 3. Emulate

**Type**: `plist dict`
**Description**: 在内核空间中仿真选定的硬件。请参考下文 Emulate 属性。

### 4. Force

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 如果内核驱动没有被缓存，则从系统卷宗强制加载内核驱动。

设计为使用 `plist dict` 值来填充，用于描述驱动程序。参见下面的 Force 属性部分。依赖其他驱动的驱动程序不能被缓存，该部分着重解决了这种驱动程序注入的难点。这个问题会映像到旧的操作系统，在旧的操作系统中存在各种依赖性的 Kext，比如 `IOAudioFamily` 和 `IONetworkingFamily`，可能默认不存在于内核缓存中。内核驱动的加载是有顺序的，因此依赖驱动应该排在前面。`Force` 发生在 `Add`。

*注*：「强制加载」的内核驱动不会被检查，因此，使用安全启动的同时使用这个功能是不可取的。另外，这个功能可能无法在较新的操作系统的加密分区上工作。

### 5. Patch

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 在添加和删除驱动程序步骤之前执行的对现有 Kext 驱动程序的二进制修补。

设计为使用 `plist dictionary` 数据填充以描述每个驱动程序。请参阅下述 Patch 属性章节。

### 6. Quirks

**Type**: `plist dict`
**Description**: 应用下面的 Quirks 属性章节中描述的各个内核和驱动程序 Quirk。

### 7. Scheme

**Type**: `plist dict`
**Description**: 通过参数来定义内核空间的操作模式，具体参数见下面 Scheme 属性部分的描述。

## 7.3 Add 属性

### 1. `Arch`

**Type**: `plist string`
**Failsafe**: `Any`
**Description**: Kext 架构（`Any`, `i386`, `x86_64`）。

### 2. `BundlePath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 相对于 `EFI/OC/kexts/Other/` 的路径，如 `Lilu.kext` 或 `MyKext.kext/Contents/PlugIns/MySubKext.kext`。

> 译者注：如 `VoodooPS2Controller.kext` 这种包括其他 Kext 驱动的，需要分别单独添加，如 `VoodooPS2Controller.kext/Contents/PlugIns/VoodooPS2Keyboard.kext`。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否加载该驱动。

### 5. `ExecutablePath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中实际可执行文件的路径（如 `Lilu.kext` 中的可执行文件路径是 `Contents/MacOS/Lilu`）。

> 译者注：空壳 Kext 没有可执行文件（如 `USBPorts.kext`），此项留空即可。

### 6. `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在小于等于指定的 macOS 版本中添加该 Kext 驱动程序。

你可以使用 `uname -r` 指令获取当前内核版本，一般为三个整数、中间由半角局点分隔，如 `18.7.0` 代表的是 `10.14.6`。OpenCore 对内核版本解释的实现方式如下图所示：

![7-1.svg](/img/7-1.svg)

内核版本比较的实现如下图所示：

![7-2.svg](/img/7-2.svg)

将 Darwin 内核版本号字符串从左到右以 `.` 符号作为分隔符分割成三个整数，即为 `ParseDarwinVersion` 的三个参数。`FindDarwinVersion` 函数将会通过在内核镜像中查找形如 ![7-3.svg](/img/7-3.svg) 的字符串来定位 Darwin 内核版本号。

### 7. `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在大于等于指定的 macOS 版本中添加该 Kext 驱动程序。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

> 译者注：以上两个属性定义了这个驱动将在什么版本范围的 macOS 中加载。留空表示在所有的 macOS 版本下都加载。

### 8. `PlistPath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中 `Info.plist` 文件的路径。一般为 `Contents/Info.plist`。

## 7.4 Block 属性

### 1. `Arch`

**Type**: `plist string`
**Failsafe**: `Any`
**Description**: Kext block 架构（`Any`, `i386`, `x86_64`）。

### 2. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 3. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非设置为 `true`，否则这个内核驱动不会被加载。

### 4. `Identifier`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext Bundle 标识符（比如 `com.apple.driver.AppleTyMCEDriver`）。

### 5. `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在小于等于指定的 macOS 版本中阻止 Kext 驱动程序。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

### 6. `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在大于等于指定的 macOS 版本中阻止 Kext 驱动程序。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

## 7.5 Emulate 属性

### 1. `Cpuid1Data`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**Description**: `EAX`、`EBX`、`ECX`、`EDX` 值的序列，用来取代 XNU 内核中的 `CPUID (1)` 调用。

该属性应用于以下两种需求：

- 对不支持的 CPU 型号启用支持。
- 对不支持的 CPU Variant 启用 XCPM 支持。

通常来讲只需要处理 `EAX` 的值，因为它代表完整的 CPUID。剩余的字节要留为 0。字节顺序是小端字节序（Little Endian），比如 `C3 06 03 00` 代表 CPUID `0x0306C3` (Haswell)。

推荐使用下面的组合启用 XCPM 支持：

- Haswell-E (`0x0306F2`) to Haswell (`0x0306C3`):

  `Cpuid1Data`: `C3 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00`  
  `Cpuid1Mask`: `FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00`

- Broadwell-E (`0x0406F1`) to Broadwell (`0x0306D4`):  
  `Cpuid1Data`: `D4 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00`  
  `Cpuid1Mask`: `FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00`

请记住，目前以下配置并不兼容（至少还没有人成功过）：

- 消费级的 Ivy Bridge（`0x0306A9`），因为苹果针对它禁用了 XCPM 并推荐用户使用传统的电源管理。如果要使用这一选项，你还需要手动添加 `_xcpm_patch` 二进制修补以强制启用 XCPM。
- 低端处理器（如基于 Haswell 或更新架构奔腾处理器），因为它们不被 macOS 支持。如果要启用这些 CPU 请参阅 [acidanthera/bugtracker#365](https://github.com/acidanthera/bugtracker/issues/365) 中的 `Special NOTES` 相关内容。

### 2. `Cpuid1Mask`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**Description**: `Cpuid1Data` 中激活的 bit 的位掩码。

当每个 `Cpuid1Mask` bit 都设置为 `0` 时将使用原始的 CPU bit，否则取 `Cpuid1Data` 的值。

## 7.6 Force 属性

### 1. `Arch`

**Type**: `plist string`
**Failsafe**: `Any`
**Description**: Kext 架构（`Any`, `i386`, `x86_64`）。

### 2. `BundlePath`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: Kext 路径，如 `System/Library/Extensions/IONetworkingFamily.kext`。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否加载该驱动。

### 5. `ExecutablePath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中实际可执行文件的路径，如 `Contents/MacOS/IONetworkingFamily`。

### 6. `Identifier`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 标识符，以便在添加前检查是否存在，如 `com.apple.iokit.IONetworkingFamily`。只有在缓存中找不到标识符的驱动程序才会被添加。

### 7. `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在小于等于指定的 macOS 版本中添加 Kext 驱动程序。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

### 8. `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在大于等于指定的 macOS 版本中添加 Kext 驱动程序。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

### 9. `PlistPath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中 `Info.plist` 文件的路径。一般为 `Contents/Info.plist`。

## 7.7 Patch 属性

### 1. `Arch`

**Type**: `plist string`
**Failsafe**: `Any`
**Description**: Kext patch 架构（`Any`, `i386`, `x86_64`）。

### 2. `Base`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 通过获取所提供的 Symbol 名称的地址，来选择 Symbol 匹配的 Base 进行补丁查找（或直接替换）。可以设置为空字符串以忽略。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Count`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 修补的次数，超过这一次数后便不再修补。`0` 表示修补所有查找到的。

### 5. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非设置为 `true`，否则不对内核进行该修补。

### 6. `Find`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 需要查找的数据。可留空，在 `Base` 处直接替换。若不留空，其大小必须等于 `Replace`。

### 7. `Identifier`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext Bundle 标识符（如 `com.apple.driver.AppleHDA`）或内核补丁的 `kernel`。

### 8. `Limit`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 搜索的最大字节数。可以设置为 `0` 来查找整个 Kext 或内核。

### 9. `Mask`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 在查找比较的过程中使用数据位掩码。允许通过忽略未被屏蔽的 bit（设置为 `0`）进行模糊搜索。若留空则代表忽略，否则其大小必须等于 `Replace`。

### 10. `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在指定的或更早的 macOS 版本上打补丁。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

### 11. `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 在指定的或更新的 macOS 版本上打补丁。

*注*：匹配逻辑请参阅 `Add` `MaxKernel` 的描述。

### 12. `Replace`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 一个或多个字节的替换数据。

### 13. `ReplaceMask`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 替换时使用的数据位掩码。允许通过更新掩码（设置为非 `0`）来进行模糊替换。若留空则代表忽略，否则其大小必须等于 `Replace`。

### 14. `Skip`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 在替换前要跳过的发现事件数。

## 7.8 Quirks 属性

### 1. `AppleCpuPmCfgLock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.4
**Description**: 禁用 `AppleIntelCPUPowerManagement.kext` 中的 `PKG_CST_CONFIG_CONTROL` (`0xE2`) 修改，从而避免早期 Kernel Panic。

某些固件会锁定 `PKG_CST_CONFIG_CONTROL` MSR 寄存器。可以使用附带的 `VerifyMsrE2` 工具检查其状态。

由于现代固件已经提供了 `CFG Lock` 相关设置、从而可以配置 `PKG_CST_CONFIG_CONTROL` 寄存器锁定，此选项应该尽可能避免。对于一些不显示 `CFG Lock` 配置的固件，可以按照下述配置进行修改：

1. 下载 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和 [IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases)
2. 使用 UEFITool 中打开固件镜像文件，找到 CFG Lock 的 Unicode 字符串。如果你没有找到，意味着你的固件可能不支持 CFG Lock 解锁，那么你现在可以停下来了。
3. 从 UEFITool 菜单中的 `Extract Body` 选项提取 `Setup.bin` 中的 PE32 镜像部分。
4. 对提取出来的文件执行 IFR-Extractor（`./ifrextract Setup.bin Setup.txt`）。
5. 从 Setup.txt 中找到 `CFG Lock`，`VarStoreInfo`（或者 `VarOffset`、`VarName`），记住紧随其后的偏移量值（例如 `0x123`）。
6. 下载并执行由 [brainsucker](https://geektimes.com/post/258090) 编译的 [修改版 GRUB Shell](http://brains.by/posts/bootx64.7z)。你也可以是使用 [datasone](https://github.com/datasone) 制作的 [新版本 GRUB Shell](https://github.com/datasone/grub-mod-setup_var)。
7. 在 GRUB Shell 中，使用 `setup_var 0x123 0x00`（其中 `0x123` 应该被替换为你在前几步找到的偏移值），然后重启电脑。

{% note danger 警告 %}
可变偏移量对于每个主板乃至每一个固件版本都是唯一的。永远不要尝试使用别人的偏移量！
{% endnote %}

### 2. `AppleXcpmCfgLock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.8 (not required for older)
**Description**: 禁用 XNU 内核对 `PKG_CST_CONFIG_CONTROL` (`0xE2`) 修改，从而避免早期 Kernel Panic。

*注*：这一选项应该避免被使用，请参考上文中关于 `AppleCpuPmCfgLock` 的介绍。

### 3. `AppleXcpmExtraMsrs`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.8 (not required for older)
**Description**: 对于没有 XCMP 支持的设备，禁用对选定 CPU 的多 MSR 访问。

通常将其与 Haswell-E，Broadwell-E，Skylake-SP 和类似 CPU 的 `Emulate` 结合使用。更多关于 XCPM 修补的信息可以在 [acidanthera/bugtracker#365](https://github.com/acidanthera/bugtracker/issues/365) 找到。

*注*：Ivy Bridge 或 Pentium CPU 将需要其他未提供的补丁。建议对前者使用 `AppleIntelCpuPowerManagement.kext`。

### 4. `AppleXcpmForceBoost`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.8 (not required for older)
**Description**: 在 XCPM 模式下强制使用最大性能。

该补丁将 `0xFF00` 写入 `MSR_IA32_PERF_CONTROL` (`0x199`)，有效地做到了一直保持最大倍数。

*注*：尽管有助于提高性能，但是在所有操作系统上都强烈建议不要启用这一选项。只有在某些 Xeon 型号的 CPU 才有可能从这个选项中受益。

### 5. `CustomSMBIOSGuid`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.4
**Description**: 对 `UpdateSMBIOSMode` 自定义模式执行 GUID 修补，通常用于戴尔笔记本电脑。

### 6. `DisableIoMapper`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.8 (not required for older)
**Description**: 禁用 XNU (VT-d) 中的 `IOMapper` 支持，这可能与固件的实现相冲突。

*注*：相比直接在 ACPI 表中删除 `DMAR`，我们更推荐大家使用这一选项。这样不会破坏其他操作系统中的 VT-d 支持（总会有人需要用到的，对吧？）。

### 7. `DisableLinkeditJettison`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 11.0
**Description**: 禁止丢弃 `__LINKEDIT`。

这个选项能让 `Lilu.kext` 和其他一些功能在 macOS Big Sur 中以最佳性能运行，而不需要 `keepsyms=1` 启动参数。

### 8. `DisableRtcChecksum`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.4
**Description**: 禁用 AppleRTC 初始校验和（`0x58` - `0x59`）写入。

*注 1*：这个选项不能确保其他区域不被覆盖，如有需要，请使用 [RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup)。

*注 2*：这个选项不能确保区域在固件阶段不被覆盖（例如 macOS bootloader）。如有需要，请参阅 `AppleRtcRam` 协议描述。

### 9. `DummyPowerManagement`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.4
**Description**: 禁用 `AppleIntelCpuPowerManagement`。

*注*：这一选项旨在替代 `NullCpuPowerManagement.kext`，用于 macOS 中没有电源管理驱动程序的 CPU。

### 10. `ExternalDiskIcons`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.4
**Description**: 修补 `AppleAHCIPort.kext` 图标，使 macOS 将所有 AHCI 存储设备显示为内部硬盘。

*注*：这一选项应尽量避免使用。现代固件通常情况下都是兼容的。

### 11. `IncreasePciBarSize`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.10
**Description**: 将 IOPCIFamily 中 32 位 PCI Bar 的大小从 1 GB 增加到 4 GB。

*注*：你应该尽可能避免使用这一选项。通常这一选项只需要在配置错误或损坏的固件上开启。

> 译者注：如果你的 BIOS 中存在 Above4GDecoding 选项，请直接在 BIOS 中启用。

### 12. `LapicKernelPanic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.6 (64-bit)
**Description**: 禁用 LAPIC 中断导致的 Kernal Panic。

> 译者注：惠普电脑可能需要启用这一选项。

### 13. `PanicNoKextDump`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.13 (not required for older)
**Description**: 在发生内核崩溃时阻止输出 Kext 列表，提供可供排错参考的崩溃日志。

### 14. `PowerTimeoutKernelPanic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.15 (not required for older)
**Description**: 修复 macOS Catalina 中由于设备电源状态变化超时而导致的内核崩溃。

macOS Catalina 新增了一项额外的安全措施，导致在电源切换超时的时候会出现 Kernel Panic。配置错误的硬件可能会因此出现问题（如数字音频设备）、有的时候会导致睡眠唤醒的问题。这一 Quirk 和引导参数 `setpowerstate_panic=0` 功能大部分一致，但是后者只应该用于调试用途。

### 15. `ThirdPartyDrives`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.6 (not required for older)
**Description**: 修补 `IOAHCIDeleteStorage.kext`，以在第三方驱动器启用 TRIM、硬盘休眠等功能。

*注*：NVMe SSD 通常无需这一修改。对于 AHCI SSD（如 SATA SSD），macOS 从 10.15 开始提供 `trimforce`，可以将 `01 00 00 00` 值写入 `APPLE_BOOT_VARIABLE_GUID` 命名空间中的 `EnableTRIM` 变量。

### 16. `XhciPortLimit`

**Type**: `plist boolean`
**Failsafe**: `false`
**Requirement**: 10.11 (not required for older)
**Description**: 修补 `AppleUSBXHCI.kext`、`AppleUSBXHCIPCI.kext`、`IOUSBHostFamily.kext` 以移除 15 端口限制。

*注*：请尽可能避免使用这一选项。USB 端口数量限制是由 locationID 的 bit 决定的，想要移除限制就需要对操作系统进行大量修改。真正长期有效的解决方案是限制可用的 USB 端口个数在 15 以下（通过 USB 定制的方法）。

## 7.9 Scheme 属性

这些属性对于旧版 macOS 操作系统尤为重要。更多关于如何安装此类 macOS 及相关排错的详细信息，请参考 [旧版 Apple 操作系统](12-troubleshooting.html#12-1-旧版-Apple-操作系统)。

### 1. `FuzzyMatch`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 使用校验值不同的 `kernelcache`（如果可用）。

在 macOS 10.6 和更早的版本中，`kernelcache` 文件名有一个校验值，本质上是对 SMBIOS 产品名称和 EfiBoot 设备路径进行 `adler32` 校验和的计算。在某些固件上，由于 ACPI 或硬件的特殊性，UEFI 和 macOS 的 EfiBoot 设备路径不同，使得 `kernelcache` 的校验和总是不同。

这一设置可以在无后缀的 `kernelcache` 不可用时，将最新的 `kernelcache` 与合适的架构进行匹配，从而提高 macOS 10.6 在多个平台上的启动性能。

### 2. `KernelArch`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 如果可用，优先选择指定的内核架构（`Auto`, `i386`, `i386-user32`, `x86_64`）。

macOS 10.7 和更早的 XNU 内核可能不会使用 `x86_64` 架构来启动，具体选择取决于很多因素，包括启动参数、SMBIOS 以及操作系统类型。当 macOS 和配置支持时，该设置将使用指定的架构来启动 macOS:

- `Auto` --- 自动选择首选的架构。
- `i386` --- 如果可用，则使用 `i386`（32 位）内核。
- `i386-user32` — 在可用的情况下使用 `i386`（32 位）内核，并在 64 位处理器上强制使用 32 位用户空间。在 macOS 上，64 位处理器会被认为支持 `SSSE3` 指令集，但对于较老的 64 位奔腾处理器来说，实际情况并非如此，因此会导致一些应用程序在 macOS 10.6 上崩溃。该行为对应 `-legacy` 内核启动参数。
- `x86_64` --- 如果可用，则使用 `x86_64`（64 位）内核。

下面是确定内核架构的计算过程：

1. `arch` 参数位于映像参数（比如从 UEFI Shell 启动时）或 `boot-args` 变量中，覆盖兼容性检查，强制指定架构，并完成此计算过程。
2. 对于 32 位 CPU Variant，OpenCore 会将架构兼容性限制在 `i386` 和 `i386-user32` 模式。
3. 确定 EfiBoot 版本所限制的架构:
   - 10.4-10.5 --- `i386` 或 `i386-user32`
   - 10.6 --- `i386`、`i386-user32` 或 `x86_64`
   - 10.7 --- `i386` 或 `x86_64`
   - 10.8 及更新的版本 --- `x86_64`
4. 如果 `KernelArch` 被设置为 `Auto`，并且 CPU 不支持 `SSSE3` 指令集， 则兼容性会被限制为 `i386-user32`（如果 EfiBoot 支持的话）。 
5. 主板标识符（来自 SMBIOS）基于 EfiBoot 版本，如果有任何 `i386` 的 CPU Variant 与之兼容，就会在不支持的机型上禁用 `x86_64` 架构。`Auto` 不参与这个过程，因为在 EfiBoot 中，该列表是不可覆盖的。
6. 当没有设置为 `Auto` 时，`KernelArch` 会把系统支持限制在明确指定的架构（如果该架构兼容）。
7. 按以下顺序选择参数可以获得最佳的架构支持：`x86_64`、`i386`、`i386-user32`。

macOS 10.7 只会将特定的主板标识符视为仅 `i386` 架构的设备，macOS 10.5 或更早版本的内核则不支持 `x86_64`，而 macOS 10.6 非常特殊，与这二者都不同。macOS 10.6 上的架构选择取决于很多因素，不仅包括主板标识符，还包括 macOS 的类型（客户端 或 服务器端）、macOS 发布时间和内存容量。检测这些因素很复杂，也不实用，因为好几个发布版本都有 bug，不能在第一时间正确地进行服务器检测。因此，对于 macOS 10.6，无论主板支持情况如何，OpenCore 都会回退到 `x86_64` 架构，就像 macOS 10.7 那样。以下是 64 位 Mac 型号的兼容性介绍，对应于 macOS 10.6.8 和 10.7.5 EfiBoot 的实际行为：

   | **Model**  | **10.6 (minimal)** | **10.6 (client)** | **10.6 (server)** | **10.7 (any)**   |
   | ---------- | ------------------ | ----------------- | ----------------- | ---------------- |
   | Macmini    | 4,x (Mid 2010)     | 5,x (Mid 2011)    | 4,x (Mid 2010)    | 3,x (Early 2009) |
   | MacBook    | Unsupported        | Unsupported       | Unsupported       | 5,x (2009/09)    |
   | MacBookAir | Unsupported        | Unsupported       | Unsupported       | 2,x (Late 2008)  |
   | MacBookPro | 4,x (Early 2008)   | 8,x (Early 2011)  | 8,x (Early 2011)  | 3,x (Mid 2007)   |
   | iMac       | 8,x (Early 2008)   | 12,x (Mid 2011)   | 12,x (Mid 2011)   | 7,x (Mid 2007)   |
   | MacPro     | 3,x (Early 2008)   | 5,x (Mid 2010)    | 3,x (Early 2008)  | 3,x (Early 2008) |
   | Xserve     | 2,x (Early 2008)   | 2,x (Early 2008)  | 2,x (Early 2008)  | 2,x (Early 2008) |

*注*：不支持用热键 `3+2` 和 `6+4` 来选择偏好架构，这是因为这个热键是由 EfiBoot 处理的，很难正确地检测到。

### 3. `KernelCache`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 如果可用，优先选择指定的内核缓存（Kernel Cache）类型（`Auto`, `Cacheless`, `Mkext`, `Prelinked`）。

macOS 的版本不同，支持的内核缓存变量也不同，其目的是提高启动性能。如果出于调试和稳定性的考虑，可利用这个设置防止使用较快的内核缓存变量。举个例子，如果指定 `Mkext`，那么会为 10.6 禁用 `Prelinked`，10.7 则不受影响。

可用的内核缓存类型及其当前在 OpenCore 中的支持列表如下：

| **macOS**   | **i386 NC** | **i386 MK** | **i386 PK** | **x86_64 NC** | **x86_64 MK** | **x86_64 PK** | **x86_64 KC** |
| ----------- | ----------- | ----------- | ----------- | ------------- | ------------- | ------------- | ------------- |
| 10.4        | YES         | YES (V1)    | NO (V1)     | —             | —             | —             | —             |
| 10.5        | YES         | YES (V1)    | NO (V1)     | —             | —             | —             | —             |
| 10.6        | YES         | YES (V2)    | NO (V2)     | YES           | YES (V2)      | YES (V2)      | —             |
| 10.7        | YES         | —           | NO (V3)     | YES           | —             | YES (V3)      | —             |
| 10.8-10.9   | —           | —           | —           | YES           | —             | YES (V3)      | —             |
| 10.10-10.15 | —           | —           | —           | —             | —             | YES (V3)      | —             |
| 11.0+       | —           | —           | —           | —             | —             | YES (V3)      | YES           |
