---
title: 7. Kernel
description: OpenCore 安全配置，Kext 加载顺序以及屏蔽（待翻译）
type: docs
author_info: 由 Sukka 整理，由 Sukka 翻译。
last_updated: 2020-02-18
---

## 7.1 简介

This section allows to apply different kinds of kernelspace modifications on Apple Kernel ([XNU](https://opensource.apple.com/source/xnu)). The modifications currently provide driver (kext) injection, kernel and driver patching, and driver blocking.

## 7.2 属性列表

### 7.2.1 Add

**Type**: plist array
**Failsafe**: Empty
**Description**: Load selected kernel drivers from `OC/Kexts` directory.

Designed to be filled with plist dict values, describing each driver. See Add Properties section below. Kernel driver load order follows the item order in the array, thus the dependencies should be written prior to their
consumers.

### 7.2.2 Block

**Type**: plist array
**Failsafe**: Empty
**Description**: Remove selected kernel drivers from prelinked kernel.

Designed to be filled with plist dictionary values, describing each blocked driver. See Block Properties section below.

### 7.2.3 Emulate

**Type**: plist dict
**Description**: Emulate select hardware in kernelspace via parameters described in Emulate Properties section below.

### 7.2.4 Patch

**Type**: plist array
**Failsafe**: Empty
**Description**: Perform binary patches in kernel and drivers prior to driver addition and removal.

Designed to be filled with plist dictionary values, describing each patch. See Patch Properties section below.

### 7.2.5 Quirks

**Type**: plist dict
**Description**: Apply individual kernel and driver quirks described in Quirks Properties section below.

## 7.3 Add 属性

### 7.3.1 `BundlePath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 相对于 `EFI/OC/kexts/Other/` 的路径 (e.g. `Lilu.kext` or `MyKext.kext/Contents/PlugIns/MySubKext.kext`).

> 注，如 `VoodooPS2Controller.kext` 这种包括其他 kext 驱动的，需要分别单独添加，如 `VoodooPS2Controller.kext/Contents/PlugIns/VoodooPS2Keyboard.kext`。

### 7.3.2 `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 7.3.3 `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否加载该驱动.

### 7.3.4 `ExecutablePath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中实际可执行文件的路径（如 `Lilu.kext` 中的可执行文件路径是 `Contents/MacOS/Lilu`）。

> 译者注：空壳 Kext 没有可执行文件（如 `USBPorts.kext`），此项留空即可

### 7.3.5 `MaxKernel`
**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Adds kernel driver on specified macOS version or older.

Kernel version can be obtained with `uname -r` command, and should look like 3 numbers separated by dots, for example `18.7.0` is the kernel version for `10.14.6`. Kernel version interpretation is implemented as follows:

![7-1.png](/img/7-1.png)

Kernel version comparison is implemented as follows:

![7-2.png](/img/7-2.png)

Here `ParseDarwinVersion` argument is assumed to be 3 integers obtained by splitting Darwin kernel version string from left to right by the `.` symbol. `FindDarwinVersion` function looks up Darwin kernel version by locating ![](/img/7-3.png) string in the kernel image.

### 7.3.6 `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Adds kernel driver on specified macOS version or newer.

*注*：Refer to [`Add` `MaxKernel` description](#kernmatch) for
matching logic.

### 7.3.7 `PlistPath`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext 中 `Info.plist` 文件的路径。一般为 `Contents/Info.plist`。

## 7.4 Block 属性

### 7.4.1 `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 7.4.2 `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: This kernel driver will not be blocked unless set to `true`.

### 7.4.3 `Identifier`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext bundle identifier (e.g.
`com.apple.driver.AppleTyMCEDriver`).

### 7.4.4 `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Blocks kernel driver on specified macOS version or older.

*注*：Refer to [`Add` `MaxKernel` description](#kernmatch) for matching logic.

### 7.4.5 `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Blocks kernel driver on specified macOS version or newer.

*注*：Refer to [`Add` `MaxKernel` description](#kernmatch) for
matching logic.

## 7.5 Emulate 属性

### 7.5.1 `Cpuid1Data`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**Description**: Sequence of `EAX`, `EBX`, `ECX`, `EDX` values to replace `CPUID (1)` call in XNU kernel.

This property serves for two needs:

- Enabling support of an unsupported CPU model.
- Enabling XCPM support for an unsupported CPU variant.

Normally it is only the value of `EAX` that needs to be taken care of, since it represents the full CPUID. The remaining bytes are to be left as zeroes. Byte order is Little Endian, so for example, `A9 06 03 00` stands for CPUID `0x0306A9` (Ivy Bridge).

For XCPM support it is recommended to use the following combinations.

- Haswell-E (`0x306F2`) to Haswell (`0x0306C3`):

  `Cpuid1Data`: `C3 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00`  
  `Cpuid1Mask`: `FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00`

- Broadwell-E (`0x0406F1`) to Broadwell (`0x0306D4`):  
  `Cpuid1Data`: `D4 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00`  
  `Cpuid1Mask`: `FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00`

Further explanations can be found at [acidanthera/bugtracker#365](https://github.com/acidanthera/bugtracker/issues/365). See `Special NOTES` for Haswell+ low-end.

### 7.5.2 `Cpuid1Mask`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**Description**: Bit mask of active bits in `Cpuid1Data`.

When each `Cpuid1Mask` bit is set to 0, the original CPU bit is used,
otherwise set bits take the value of `Cpuid1Data`.

## 7.6 Patch 属性

### 7.6.1 `Base`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Selects symbol-matched base for patch lookup (or immediate replacement) by obtaining the address of provided symbol name. Can be set to empty string to be ignored.

### 7.6.2 `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 7.6.3 `Count`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Number of patch occurrences to apply. `0` applies the patch to all occurrences found.

### 7.6.4 `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: This kernel patch will not be used unless set to `true`.

### 7.6.5 `Find`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data to find. Can be set to empty for immediate replacement at `Base`. Must equal to `Replace` in size otherwise.

### 7.6.6 `Identifier`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Kext bundle identifier (e.g.
`com.apple.driver.AppleHDA`) or `kernel` for kernel patch.

### 7.6.7 `Limit`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Maximum number of bytes to search for. Can be set to `0` to look through the whole kext or kernel.

### 7.6.8 `Mask`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data bitwise mask used during find comparison. Allows fuzzy search by ignoring not masked (set to zero) bits. Can be set to empty data to be ignored. Must equal to `Replace` in size otherwise.

### 7.6.9 `MaxKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Patches data on specified macOS version or older.

*注*：Refer to [`Add` `MaxKernel` description](#kernmatch) for matching logic.

### 7.6.10 `MinKernel`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Patches data on specified macOS version or newer.

*注*：Refer to [`Add` `MaxKernel` description](#kernmatch) for matching logic.

### 7.6.11 `Replace`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Replacement data of one or more bytes.

### 7.6.12 `ReplaceMask`

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data bitwise mask used during replacement. Allows fuzzy replacement by updating masked (set to non-zero) bits. Can be set to empty data to be ignored. Must equal to `Replace` in size otherwise.

### 7.6.13 `Skip`
**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Number of found occurrences to be skipped before replacement is done.

## 7.7 Quirks 属性

### `AppleCpuPmCfgLock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 `AppleIntelCPUPowerManagement.kext` 中的 `PKG_CST_CONFIG_CONTROL` (`0xE2`) 修改，从而避免早期 Kernel Panic。

某些固件会锁定 `PKG_CST_CONFIG_CONTROL` MSR 寄存器。可以使用捆绑的 `VerifyMsrE2` 工具检查其状态。

由于现代固件已经提供了 `CFG Lock` 相关设置、从而可以配置 `PKG_CST_CONFIG_CONTROL` 寄存器锁定，此选项应该尽可能避免。对于一些不显示 `CFG Lock` 配置的固件，可以按照下述配置进行修改：

1. 下载 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和 [IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases)
2. 使用 UEFITool 中打开固件镜像文件，找到 CFG Lock 的 Unicode 字符串。如果你没有找到，意味着你的固件可能不支持 CFG Lock 解锁，那么你现在可以停下来了。
3. 从 UEFITool 菜单中的 `Extract Body` 选项提取 `Setup.bin` 中的 PE32 镜像部分。
4. 对提取出来的文件执行 IFR-Extractor（`./ifrextract Setup.bin Setup.txt`）。
5. 从 Setup.txt 中找到 CFG Lock，VarStoreInfo（或者 VarOffset、VarName），记住紧随其后的偏移量值（例如 `0x123`）。
6. 下载并执行由 [brainsucker](https://geektimes.com/post/258090) 编译的 [修改版 GRUB Shell](http://brains.by/posts/bootx64.7z)。你也可以是使用 [datasone](https://github.com/datasone) 制作的 [新版本 GRUB Shell](https://github.com/datasone/grub-mod-setup_var)。
7. 在 GRUB Shell 中，使用 `setup_var 0x123 0x00`（其中 `0x123` 应该被替换为你在前几步找到的偏移值），然后重启电脑。

**警告**: 可变偏移量对于每个主板乃至每一个固件版本都是唯一的。永远不要尝试使用别人的偏移量！

### `AppleXcpmCfgLock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 XNU 内核对 `PKG_CST_CONFIG_CONTROL` (`0xE2`) 修改，从而避免早期 Kernel Panic。

*注*：这一选项应该避免被使用，请参考上文中关于 `AppleCpuPmCfgLock` 的介绍。

### `AppleXcpmExtraMsrs`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 对于没有 XCMP 支持的设备，禁用对选定 CPU 的多 MSR 访问。

通常将其与 Haswell-E，Broadwell-E，Skylake-X和类似 CPU 的 `Emulate` 结合使用。更多关于 XCPM 修补的信息可以在 [acidanthera/bugtracker#365](https://github.com/acidanthera/bugtracker/issues/365) 找到。

*注*：Ivy Bridge 或 Pentium CPU 将需要其他未提供的补丁。建议对前者使用 `AppleIntelCpuPowerManagement.kext`。

### `AppleXcpmForceBoost`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 XCPM 模式下强制使用最大性能。

This patch writes `0xFF00` to `MSR_IA32_PERF_CONTROL` (`0x199`), effectively setting maximum multiplier for all the time.

*注*：尽管有助于提高性能，但是在所有操作系统上都强烈建议不要启用这一选项。只有在某些 Xeon 型号的 CPU 才有可能从这个选项中受益。

### `CustomSMBIOSGuid`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 对 UpdateSMBIOSMode 自定义模式执行 GUID 修补，通常用于戴尔笔记本电脑。

### `DisableIoMapper`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 XNU (VT-d) 中的 `IOMapper` 支持，这可能与固件的实现相冲突。

*注*：相比直接在 ACPI 表中删除 `DMAR`，我们更推荐大家使用这一选项。这样不会破坏其他操作系统中的 VT-d 支持（总会有人需要用到的，对吧？）。

### `DummyPowerManagement`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 `AppleIntelCpuPowerManagement`。

*注*：这一选项旨在替代 `NullCpuPowerManagement.kext`，用于 macOS 中没有电源管理驱动程序的 CPU。

### `ExternalDiskIcons`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补 `AppleAHCIPort.kext` 图标，使 macOS 将所有 AHCI 存储设备显示为内部硬盘。

*注*：这一选项应尽量避免使用。现代固件通常情况下都是兼容的。

### `IncreasePciBarSize`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 IOPCIFamily 中 32 位 PCI Bar 的大小从 1 GB 增加到 4 GB。

*注*：你应该尽可能避免使用这一选项。通常这一选项只需要在配置错误或损坏的固件上开启。

> 译者注：如果你的 BIOS 中存在 Above4GDecoding 选项，请直接在 BIOS 中启用。

### `LapicKernelPanic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 LAPIC 中断导致的 Kernal Panic。

> 译者注：惠普电脑可能需要启用这一选项。

### `PanicNoKextDump`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在发生内核崩溃时阻止输出 Kext 列表，提供可供排错参考的崩溃日志。

### `PowerTimeoutKernelPanic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修复 macOS Catalina 中由于设备电源状态变化超时而导致的内核崩溃。

An additional security measure was added to macOS Catalina (10.15) causing kernel panic on power change timeout for Apple drivers. Sometimes it may cause issues on misconfigured hardware, notably digital audio, which sometimes fails to wake up. For debug kernels `setpowerstate_panic=0` boot argument should be used, which is otherwise equivalent to this quirk.

### `ThirdPartyDrives`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补 `IOAHCIBlockStorage.kext`，以在第三方驱动器启用 TRIM、硬盘休眠等功能。

*注*：NVMe SSD 通常无需这一修改。对于 AHCI SSD（如 SATA SSD），macOS 从 10.15 开始提供 `trimforce`，可以将 `01 00 00 00` 值写入 `APPLE_BOOT_VARIABLE_GUID` 命名空间中的 `EnableTRIM` 变量。

### `XhciPortLimit`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补 `AppleUSBXHCI.kext`、`AppleUSBXHCIPCI.kext`、`IOUSBHostFamily.kext` 以移除 15 端口限制。

*注*：请尽可能避免使用这一选项。USB port limit is imposed by the amount of used bits in locationID format and there is no possible way to workaround this without heavy OS modification. The only valid solution is to limit the amount of used ports to 15 (discarding some). More details can be found on [AppleLife.ru](https://applelife.ru/posts/550233).
