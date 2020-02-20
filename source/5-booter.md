---
title: 5. Booter
description: 配置 FwRuntimeServices.efi（Slide 值计算、KASLR）
type: docs
author_info: 由 Sukka 整理，由 Sukka 翻译。
last_updated: 2020-02-14
---

## 5.1 简介

本部分允许在 Apple BootLoader（`boot.efi`）上应用不同种类的 UEFI 修改。目前，这些修改为不同的固件提供了各种补丁和环境更改。其中一些功能最初是作为 [AptioMemoryFix.efi](https://github.com/acidanthera/AptioFixPkg) 的一部分，如今 `AptioMemoryFix.efi` 已经不再维护。如果你还在使用，请参考 `Tips and Tricks` 章节提供的迁移步骤。

如果您是第一次在自定义固件上使用此功能，则首先需要执行一系列检查。开始之前，请确保您具有：

- 最新版本的 UEFI 固件（去主板厂家的官网上看看）
- 禁用了 `Fast Boot` 和 `Hardware Fast Boot`。如果 BIOS 里有相关选项，禁用掉。
- `Above 4G Decoding` or similar enabled in firmware settings if present. Note, that on some motherboards (notably ASUS WS-X299-PRO) this option causes adverse effects, and must be disabled. While no other motherboards with the same issue are known, consider this option to be first to check if you have erratic boot failures.
- 启用了 `DisableIoMapper` quirk、或者在 BIOS 中禁用 `VT-d`、或者删去了 ACPI DMAR 表。
- 启动参数中 **没有** `slide`。 除非你没法开机、并且在日志里看见了 `No slide values are usable! Use custom slide!`，否则不论如何也不要使用这个启动参数。
- `CFG Lock` (MSR `0xE2` 写保护) 在 BIOS 中被禁用。如果 BIOS 中没有、而且你心灵手巧，你可以考虑 [手动打补丁将其禁用](https://github.com/LongSoft/UEFITool/blob/master/UEFIPatch/patches.txt) 。更多细节请参考 [VerifyMsrE2](https://github.com/acidanthera/AppleSupportPkg#verifymsre2)。
- 在 BIOS 中禁用 `CSM` (Compatibility Support Module)。You may need to flash GOP ROM on NVIDIA 6xx/AMD 2xx or older. Use [GopUpdate](https://www.win-raid.com/t892f16-AMD-and-Nvidia-GOP-update-No-requests-DIY.html) or [AMD UEFI GOP MAKER](http://www.insanelymac.com/forum/topic/299614-asus-eah6450-video-bios-uefi-gop-upgrade-and-gop-uefi-binary-in-efi-for-many-ati-cards/page-1#entry2042163) in case you are not sure how.
- 除非 USB 设备断开连接，否则如果引导停止，则仅在 BIOS 中启用 `EHCI / XHCI Hand-off`。
- 在 BIOS 中启用 `VT-x`、`Hyper Threading`、`Execute Disable Bit`。
- 有时你还可能需要在 BIOS 中禁用 `Thunderbolt support`、`Intel SGX` 和 `Intel Platform Trust`。但是这一操作不是必须的。

在调试睡眠问题时，您可能希望（临时）禁用 Power Nap 和自动关闭电源，这似乎有时会导致在旧平台上唤醒黑屏或循环启动的问题。具体问题可能因人而异，但通常你应首先检查 ACPI 表，比如这是在 [Z68 主板](http://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/#entry2534645) 上找到的一些 Bug。要关闭 Power Nap 和其他功能，请在终端中运行以下命令：

```bash
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
```

**注**：这些设置可能会在硬件更改、操作系统更新和某些其他情况下重置。要查看它们的当前状态，请在终端中使用 `pmset -g` 命令。

## 5.2 属性列表

### 5.2.1 MmioWhitelist

**Type**: plist array
**Description**: Designed to be filled with `plist dict` values, describing addresses critical for particular firmware functioning when `DevirtualiseMmio` quirk is in use. See MmioWhitelist Properties section below.

> 译者注：如果开机卡在 `PCI...` 可以尝试开启 Item 1 下的 Patch

### 5.2.2 Quirks

**Type**: plist dict
**Description**: 应用下面的 Quirks 属性部分中所述的各个引导 Quirk。

## 5.3 MmioWhitelist 属性

### 5.3.1 Address

**Type**: plist integer
**Failsafe**: 0
**Description**: Exceptional MMIO address, which memory descriptor should be left virtualised (unchanged) by `DevirtualiseMmio`. This means that the firmware will be able to directly communicate with this memory region during operating system functioning, because the region this value is in will be assigned a virtual address.

### 5.3.2 Comment

**Type**: plist string
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

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

> 译者注：对于某些 300 系列主板是必须的

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

> 译者注：在 Z390/HM370 等没有原生 macOS 支持 NVRAM 的主板上需要开启。

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
**Description**: 关闭 CR0 寄存器中的写入保护

This option bypasses `RX̂` permissions in code pages of UEFI runtime services by removing write protection (`WP`) bit from `CR0` register during their execution. This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

*注*：The necessity of this quirk is determined by early boot crashes
of the firmware.

### 5.4.8 `ForceExitBootServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 开启后会确保 `ExitBootServices` 即使在 MemoryMap 发生更改时也能调用成功

Try to ensure that `ExitBootServices` call succeeds even with outdated MemoryMap key argument by obtaining current memory map and retrying `ExitBootServices` call.

*注*：The necessity of this quirk is determined by early boot crashes of the firmware. 请勿启用这一选项，除非你详细了解这一选项可能导致的后果。

### 5.4.9 `ProtectCsmRegion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 CSM 区域免于重新分配

确保将 CSM 内存区域标记为 ACPI NVS，以防止 boot.efi 或 XNU 重新定位或使用这一区域。

*注*：是否启用这一 Quirk 取决于你是否遇到了休眠或其他问题。`AvoidRuntimeDefrag` 理应能够解决所有类似的问题，所以已知的固件都不需要启用这一选项。除非你完全了解这一选项及其后果，否则请勿使用。


### 5.4.10 `ProtectSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 安全启动变量不被写入。

尝试从操作系统写入 `db`、`dbx`、`PK` 和 `KEK` 时生成报告。

*注*：这个 Quirk 主要试图避免碎片整理导致的 NVRAM 相关问题，如 Insyde 或 `MacPro5,1`。

### 5.4.11 `ProvideCustomSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为低内存设备提供自定义 KASLR slide 值。

开启这个选项后，将会对固件进行内存映射分析，检查所有 slide（从 1 到 255）中是否有可用的。由于 boot.efi 私用 rdrand 或伪随机 rdtsc 随机生成此值，因此有可能出现冲突的 slide 值被使用并导致引导失败。如果出现潜在的冲突，这个选项将会强制为 macOS 选择一个伪随机值。这同时确保了 `slide=` 参数不会被传递给操作系统。

*注*: OpenCore 会自动检查是否需要启用这一选项。如果 OpenCore 的调试日志中出现 `OCABC: Only N/256 slide values are usable!` 则请启用这一选项。

### 5.4.12 `SetupVirtualMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `SetVirtualAddresses` 调用修复为虚拟地址.

Select firmwares access memory by virtual addresses after `SetVirtualAddresses` call, which results in early boot crashes. This quirk workarounds the problem by performing early boot identity mapping of assigned virtual addresses to physical memory.

*注*：是否启用这个 Quirks 取决于你是否遇到了 Early Boot 故障。目前具有内存保护支持的新固件（例如 OVMF ）由于一些原因不支持此 Quirks：[acidanthera/bugtracker#719](https://github.com/acidanthera/bugtracker/issues/719)。

### 5.4.13 `ShrinkMemoryMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试合并相似的内存映射条目。

Select firmwares have very large memory maps, which do not fit Apple kernel, permitting up to `64` slots for runtime memory. This quirk attempts to unify contiguous slots of similar types to prevent boot failures.

*注*：是否启用这个 Quirks 取决于你是否遇到了 Early Boot 故障。Haswell 及更新版本一般都不需要启用。除非你完全了解这一选项及其后果，否则请勿使用。

### 5.4.14 `SignalAppleOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 不论使用什么操作系统、总是向 OSInfo 报告启动的是 macOS。

Mac 设备在不同的操作系统中具有不同的行为，因此如果你在使用 Mac 设备，这一功能会非常有用。例如，你可以通过启用这一选项为某些双 GPU 的 MacBook 型号中在 Windows 和 Linux 中启用 Intel GPU。
