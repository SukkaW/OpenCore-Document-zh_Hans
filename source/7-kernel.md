---
title: 7. Kernel
description: OpenCore 安全配置，Kext 加载顺序以及屏蔽（待翻译）
type: docs
author_info: 由 Sukka 整理，由 Sukka 翻译。
last_updated: 2020-02-14
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
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

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
**Description**: Disables `PKG_CST_CONFIG_CONTROL` (`0xE2`) MSR modification in AppleIntelCPUPowerManagement.kext, commonly causing early kernel panic, when it is locked from writing.

Certain firmwares lock `PKG_CST_CONFIG_CONTROL` MSR register. To check
its state one can use bundled `VerifyMsrE2` tool. Select firmwares have
this register locked on some cores only.

As modern firmwares provide `CFG Lock` setting, which allows configuring
`PKG_CST_CONFIG_CONTROL` MSR register lock, this option should be
avoided whenever possible. For several APTIO firmwares not displaying
`CFG Lock` setting in the GUI it is possible to access the option
directly:

1. Download [UEFITool](https://github.com/LongSoft/UEFITool/releases) and [IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases).
2. Open your firmware image in UEFITool and find CFG Lock unicode string. If it is not present, your firmware may not have this option and you should stop.
3. Extract the Setup.bin PE32 Image Section (the one UEFITool found) through Extract Body menu option.
4. Run IFR-Extractor on the extracted file (e.g. ./ifrextract Setup.bin Setup.txt).
5. Find CFG Lock, VarStoreInfo (VarOffset/VarName): in Setup.txt and remember the offset right after it (e.g. `0x123`).
6. Download and run [Modified GRUB Shell](http://brains.by/posts/bootx64.7z) compiled by [brainsucker](https://geektimes.com/post/258090) or use [a newer version](https://github.com/datasone/grub-mod-setup_var) by [datasone](https://github.com/datasone).
7. Enter setup_var 0x123 0x00 command, where 0x123 should be replaced by your actual offset, and reboot.

**WARNING**: Variable offsets are unique not only to each motherboard
but even to its firmware version. Never ever try to use an offset
without checking.

### `AppleXcpmCfgLock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Disables `PKG_CST_CONFIG_CONTROL` (`0xE2`) MSR
modification in XNU kernel, commonly causing early kernel panic, when it
is locked from writing (XCPM power management).

*注*：This option should be avoided whenever possible. See
`AppleCpuPmCfgLock` description for more details.

### `AppleXcpmExtraMsrs`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Disables multiple MSR access critical for select CPUs, which have no native XCPM support.

This is normally used in conjunction with `Emulate` section on Haswell-E, Broadwell-E, Skylake-X, and similar CPUs. More details on the XCPM patches are outlined in [acidanthera/bugtracker#365](https://github.com/acidanthera/bugtracker/issues/365).

*注*：Additional not provided patches will be required for Ivy Bridge or Pentium CPUs. It is recommended to use `AppleIntelCpuPowerManagement.kext` for the former.

### `AppleXcpmForceBoost`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 XCPM 模式下强制使用最大性能。

This patch writes `0xFF00` to `MSR_IA32_PERF_CONTROL` (`0x199`), effectively setting maximum multiplier for all the time.

*注*：While this may increase the performance, this patch is strongly discouraged on all systems but those explicitly dedicated to scientific or media calculations. In general only certain Xeon models benefit from the patch.

### `CustomSMBIOSGuid`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 对 UpdateSMBIOSMode 自定义模式执行 GUID 修补，通常用于戴尔笔记本电脑。

### `DisableIoMapper`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Disables `IOMapper` support in XNU (VT-d), which may conflict with the firmware implementation.

*注*：This option is a preferred alternative to dropping `DMAR` ACPI table and disabling VT-d in firmware preferences, which does not break VT-d support in other systems in case they need it.

### `DummyPowerManagement`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Disables `AppleIntelCpuPowerManagement`.

*注*：This option is a preferred alternative to `NullCpuPowerManagement.kext` for CPUs without native power management driver in macOS.

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
**Description**: Disables kernel panic on LAPIC interrupts.

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
