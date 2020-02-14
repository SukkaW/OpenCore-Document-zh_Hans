---
title: 5. Booter
description: 配置 FwRuntimeServices.efi（Slide 值计算、KASLR）
type: docs
author_info: 由 Sukka 整理，由 Sukka 翻译。
last_updated: 2020-02-13
---

## 5.1 简介

This section allows to apply different kinds of UEFI modifications on Apple bootloader (`boot.efi`). The modifications currently provide various patches and environment alterations for different firmwares. Some of these features were originally implemented as a part of [AptioMemoryFix.efi](https://github.com/acidanthera/AptioFixPkg), which is no longer maintained. See `Tips and Tricks` section for migration steps.

If you are using this for the first time on a customised firmware, there is a
list of checks to do first. Prior to starting please ensure that you have:


- Most up-to-date UEFI firmware (check your motherboard vendor website).
- `Fast Boot` and `Hardware Fast Boot` disabled in firmware settings if present.
- `Above 4G Decoding` or similar enabled in firmware settings if present. Note, that on some motherboards (notably ASUS WS-X299-PRO) this option causes adverse effects, and must be disabled. While no other motherboards with the same issue are known, consider this option to be first to check if you have erratic boot failures.
- `DisableIoMapper` quirk enabled, or `VT-d` disabled in firmware settings if present, or ACPI DMAR table dropped.
- **No** `slide` boot argument present in NVRAM or anywhere else. It is not necessary unless you cannot boot at all or see `No slide values are usable! Use custom slide!` message in the log.
- `CFG Lock` (MSR `0xE2` write protection) disabled in firmware settings if present. Cconsider [patching it](https://github.com/LongSoft/UEFITool/blob/master/UEFIPatch/patches.txt) if you have enough skills and no option is available. See [VerifyMsrE2](https://github.com/acidanthera/AppleSupportPkg#verifymsre2) nots for more details.
- `CSM` (Compatibility Support Module) disabled in firmware settings if present. You may need to flash GOP ROM on NVIDIA 6xx/AMD 2xx or older. Use [GopUpdate](https://www.win-raid.com/t892f16-AMD-and-Nvidia-GOP-update-No-requests-DIY.html#msg15730) or [AMD UEFI GOP MAKER](http://www.insanelymac.com/forum/topic/299614-asus-eah6450-video-bios-uefi-gop-upgrade-and-gop-uefi-binary-in-efi-for-many-ati-cards/page-1#entry2042163) in case you are not sure how.
- `EHCI/XHCI Hand-off` enabled in firmware settings `only` if boot stalls unless USB devices are disconnected.
- `VT-x`, `Hyper Threading`, `Execute Disable Bit` enabled in firmware settings if present.
- While it may not be required, sometimes you have to disable `Thunderbolt support`, `Intel SGX`, and `Intel Platform Trust` in firmware settings present.

When debugging sleep issues you may want to (temporarily) disable Power Nap and automatic power off, which appear to sometimes cause wake to black screen or boot loop issues on older platforms. The particular issues may vary, but in general you should
check ACPI tables first. Here is an example of a bug found in some [Z68 motherboards](http://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/#entry2534645). To turn Power Nap and the others off run the following commands in Terminal:

```bash
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
```

**Note**: These settings may reset at hardware change and in certain other circumstances.
To view their current state use `pmset -g` command in Terminal.

## 5.2 属性列表

### 5.2.1 MmioWhitelist

**Type**: plist array
**Description**: Designed to be filled with `plist dict` values, describing addresses critical for particular firmware functioning when `DevirtualiseMmio` quirk is in use. See MmioWhitelist Properties section below.

> 译者注：如果开机卡在 `PCI...` 可以尝试开启 Item 1 下的 Patch

### 5.2.2 Quirks

**Type**: plist dict
**Description**: Apply individual booter quirks described in Quirks Properties section below.

## 5.3 MmioWhitelist 属性

### 5.3.1 Address

**Type**: plist integer
**Failsafe**: 0
**Description**: Exceptional MMIO address, which memory descriptor should be left virtualised (unchanged) by `DevirtualiseMmio`. This means that the firmware will be able to directly communicate with this memory region during operating system functioning, because the region this value is in will be assigned a virtual address.

### 5.3.2 Comment

**Type**: plist string
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation
defined whether this value is used.

### 5.3.3 Enabled

**Type**: plist boolean
**Failsafe**: false
**Description**: This address will be devirtualised unless set to `true`.

## 5.4 Quirks 属性

### 5.4.1 `AvoidRuntimeDefrag`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 boot.efi 运行时执行内存碎片整理

这个选项通过提供对可变存储的支持，修复了包括日期、时间、NVRAM、电源控制等 UEFI Runtime 服务。

*注*: 除 Apple 和 VMware 固件外，都需要启用此选项。

### 5.4.2 `DevirtualiseMmio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 从选定的 MMIO 区域中删除 Runtime 属性。

通过删除已知内存区域的 runtime bit，此选项可减少内存映射中 stolen memory footprint。 这个 Quirks 可能会导致可用的 KASLR slides 增加，但如果没有其他措施，不一定与目标主板兼容。 通常，这会释放 64 到 256 MB的内存（具体数值会显示在调试日志中）。在某些平台上这是引导 macOS 的唯一方法，否则在引导加载程序阶段会出现内存分配错误。

该选项通常对所有固件都有用，除了一些非常古老的固件（例如 Sandy Bridge）。 在某些固件上，它可能需要一个例外映射列表。为了使 NVRAM 和休眠功能正常工作，获取其虚拟地址仍然是必要的。 请参考 `MmioWhitelist` 章节来实现这个。

### 5.4.3 `DisableSingleUser`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 Apple 单用户模式

这个选项可以禁用 `CMD+S` 热键和 `-s` 启动参数来限制单用户模式。启用这一 Quirks 后预期行为应和 T2 的模型行为类似。请参考 Apple 的 [这篇文章](https://support.apple.com/HT201573) 以了解如何在启用这一 Quirks 后继续使用单用户模式。

### 5.4.4 `DisableVariableWrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 macOS 获取 NVRAM 的写入权限。

这个选项可以限制 macOS 对 NVRAM 的写入。这个 Quirk 需要 `FwRuntimeServices.efi` 提供了 `OC_FIRMWARE_RUNTIME` 协议的实现.

*注*: 这个 Quirk 也可以避免由于无法将变量写入 NVRAM 而导致的对操作系统的破坏。

### 5.4.5 `DiscardHibernateMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 复用原始的休眠内存映射。

这一选项强制 XNU 内核忽略新提供的内存映射、认定设备从休眠状态唤醒后无需对其更改。如果你在使用 Windows，则 [务必启用]((https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi#hibernation-state-s4-transition-requirements)) 这一选项，因为 Windows 要求 S4 花心后保留运行内存的大小和未知。

*注*: 这可能用于解决较旧硬件上的错误内存映射。如 Insyde 固件的 Ivy Bridge 笔记本电脑或者 Acer V3-571G。 除非您完全了解这一选项可能导致的后果，否则请勿使用此功能。

### 5.4.6 `EnableSafeModeSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补引导加载程序以在安全模式下启用 KASLR。

这个选与启动到安全模式（启动时按住 Shift 或受用了 `-x` 启动参数）有关。默认情况下，安全模式会使用 `slide=0`，这个 Quirks 试图通过修补 boot.efi 接触这一限制。只有当 `ProvideCustomSlide` 启用后才可以启用本 Quirks。

*注*: 除非启动到安全模式失败，否则不需要启用此选项。

### 5.4.7 `EnableWriteUnprotector`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Permit write access to UEFI runtime services code.

This option bypasses `RX̂` permissions in code pages of UEFI runtime services by removing write protection (`WP`) bit from `CR0` register during their execution. This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

*Note*: The necessity of this quirk is determined by early boot crashes
of the firmware.

### 5.4.8 `ForceExitBootServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Retry `ExitBootServices` with new memory map on failure.

Try to ensure that `ExitBootServices` call succeeds even with outdated MemoryMap key argument by obtaining current memory map and retrying `ExitBootServices` call.

*Note*: The necessity of this quirk is determined by early boot crashes of the firmware. Do not use this unless you fully understand the consequences.

### 5.4.9 `ProtectCsmRegion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 CSM 区域免于重新分配

确保将 CSM 内存区域标记为 ACPI NVS，以防止 boot.efi 或 XNU 重新定位或使用这一区域。

*Note*: 是否启用这一 Quirk 取决于你是否遇到了休眠或其他问题。`AvoidRuntimeDefrag` 理应能够解决所有类似的问题，所以已知的固件都不需要启用这一选项。除非你完全了解这一选项及其后果，否则请勿使用。


### 5.4.10 `ProtectSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 安全启动变量不被写入。

尝试从操作系统写入 `db`、`dbx`、`PK` 和 `KEK` 时生成报告。

*Note*: 这个 Quirk 主要试图避免碎片整理导致的 NVRAM 相关问题，如 Insyde 或 `MacPro5,1`。

### 5.4.11 `ProvideCustomSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为低内存设备提供自定义 KASLR slide 值。

开启这个选项后，将会对固件进行内存映射分析，检查所有 slide（从 1 到 255）中是否有可用的。由于 boot.efi 私用 rdrand 或伪随机 rdtsc 随机生成此值，因此有可能出现冲突的 slide 值被使用并导致引导失败。如果出现潜在的冲突，这个选项将会强制为 macOS 选择一个伪随机值。这同时确保了 `slide=` 参数不会被传递给操作系统。

*注*: OpenCore 会自动检查是否需要启用这一选项。如果 OpenCore 的调试日志中出现 `OCABC: Only N/256 slide values are usable!` 则请启用这一选项。

### 5.4.12 `SetupVirtualMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Setup virtual memory at `SetVirtualAddresses`.

Select firmwares access memory by virtual addresses after `SetVirtualAddresses` call, which results in early boot crashes. This quirk workarounds the problem by performing early boot identity mapping of assigned virtual addresses to physical memory.

*Note*: 是否启用这个 Quirks 取决于你是否遇到了 Early Boot 故障。

### 5.4.13 `ShrinkMemoryMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试合并相似的内存映射条目。

Select firmwares have very large memory maps, which do not fit Apple kernel, permitting up to `64` slots for runtime memory. This quirk attempts to unify contiguous slots of similar types to prevent boot failures.

*注*: 是否启用这个 Quirks 取决于你是否遇到了 Early Boot 故障。Haswell 及更新版本一般都不需要启用。除非你完全了解这一选项及其后果，否则请勿使用。

### 5.4.14 `SignalAppleOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 不论使用什么操作系统、总是向 OSInfo 报告启动的是 macOS。

Mac 设备在不同的操作系统中具有不同的行为，因此如果你在使用 Mac 设备，这一功能会非常有用。例如，你可以通过启用这一选项为某些双 GPU 的 MacBook 型号中在 Windows 和 Linux 中启用 Intel GPU。
