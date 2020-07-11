---
title: 5. Booter
description: 配置 OpenRuntime.efi（Slide 值计算、KASLR）
type: docs
author_info: 由 Sukka、derbalkon 整理，由 Sukka、derbalkon 翻译。
last_updated: 2020-07-11
---

## 5.1 简介

本部分允许在 Apple BootLoader（`boot.efi`）上应用不同种类的 UEFI 修改。目前，这些修改为不同的固件提供了各种补丁和环境更改。其中一些功能最初是作为 [AptioMemoryFix.efi](https://github.com/acidanthera/AptioFixPkg) 的一部分，如今 `AptioMemoryFix.efi` 已经不再维护。如果你还在使用，请参考 `Tips and Tricks` 章节提供的迁移步骤。

如果您是第一次在自定义固件上使用此功能，则首先需要执行一系列检查。开始之前，请确保您符合以下条件：

- 具有最新版本的 UEFI 固件（去主板厂家的官网上看看）
- 禁用了 `Fast Boot` 和 `Hardware Fast Boot`。如果 BIOS 里有相关选项，禁用掉。
- 如果有 `Above 4G Decoding` 或类似功能，请在固件设置中启用。注意，在某些主板上（特别是 ASUS WS-X299-PRO）这个选项会造成不良影响，必须禁用掉。虽然目前还不知道是不是其他主板也有同样问题，但是如果你遇到了不稳定的启动故障，可以首先考虑检查一下这个选项。
- 启用了 `DisableIoMapper` Quirk、或者在 BIOS 中禁用 `VT-d`、或者删去了 ACPI DMAR 表。
- 启动参数中 **没有** `slide`。 除非你没法开机、并且在日志里看见了 `No slide values are usable! Use custom slide!`，否则不论如何也不要使用这个启动参数。
- `CFG Lock` (MSR `0xE2` 写保护) 在 BIOS 中被禁用。如果 BIOS 中没有、而且你心灵手巧，你可以考虑 [手动打补丁将其禁用](https://github.com/LongSoft/UEFITool/blob/master/UEFIPatch/patches.txt) 。更多细节请参考 [VerifyMsrE2](https://github.com/acidanthera/AppleSupportPkg#verifymsre2)。
- 在 BIOS 中禁用 `CSM` (Compatibility Support Module)。NVIDIA 6xx / AMD 2xx 或更老的平台可能需要刷新 GOP ROM，具体步骤参考 [GopUpdate](https://www.win-raid.com/t892f16-AMD-and-Nvidia-GOP-update-No-requests-DIY.html) 或者 [AMD UEFI GOP MAKER](http://www.insanelymac.com/forum/topic/299614-asus-eah6450-video-bios-uefi-gop-upgrade-and-gop-uefi-binary-in-efi-for-many-ati-cards/page-1#entry2042163)。
- 如果有 `EHCI / XHCI Hand-off` 功能，建议仅在出现 USB 设备连接时启动停滞的情况下启用。
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

**Type**: `plist array`
**Description**: 设计为用 `plist dict` 值填充，用来描述在启用 `DevirtualiseMmio` 这个 Quirk 时特定固件能够运作的关键地址。详见下面的 MmioWhitelist Properties 章节。

> 译者注：如果开机卡在 `PCI...` 可以尝试开启 Item 1 下的 Patch

### 5.2.2 Quirks

**Type**: `plist dict`
**Description**: 应用下面的 Quirks 属性部分中所述的各个引导 Quirk。

## 5.3 MmioWhitelist 属性

### 5.3.1 Address

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 指排除在外的 MMIO 地址, 其内存描述符（Memory Descriptor）会被 `DevirtualiseMmio` 虚拟化（不变）。该值所在的区域会被分配一个虚拟地址，因此在操作系统运行期间，固件能够直接与该内存区域进行通信。

### 5.3.2 Comment

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 5.3.3 Enabled

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 除非设置为 `true`，否则此地址将被虚拟化。

## 5.4 Quirks 属性

### `AvoidRuntimeDefrag`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 `boot.efi` 运行时执行内存碎片整理

这个选项通过提供对可变存储的支持，修复了包括日期、时间、NVRAM、电源控制等 UEFI Runtime 服务。

*注*: 除 Apple 和 VMware 固件外，都需要启用此选项。

### `DevirtualiseMmio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 从选定的 MMIO 区域中删除 Runtime 属性。

通过删除已知内存区域的 Runtime bit，此选项可减少内存映射中 Stolen Memory Footprint。 这个 Quirk 可能会导致可用的 KASLR slides 增加，但如果没有其他措施，不一定与目标主板兼容。 通常，这会释放 64 到 256 MB的内存（具体数值会显示在调试日志中）。在某些平台上这是引导 macOS 的唯一方法，否则在引导加载程序阶段会出现内存分配错误。

该选项通常对所有固件都有用，除了一些非常古老的固件（例如 Sandy Bridge）。 在某些固件上，它可能需要一个例外映射列表。为了使 NVRAM 和休眠功能正常工作，获取其虚拟地址仍然是必要的。 请参考 `MmioWhitelist` 章节来实现这个。

> 译者注：对于某些 300 系列主板是必须的

### `DisableSingleUser`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 Apple 单用户模式

这个选项可以禁用 `CMD+S` 热键和 `-s` 启动参数来限制单用户模式。启用这一 Quirk 后预期行为应和 T2 的模型行为类似。请参考 Apple 的 [这篇文章](https://support.apple.com/HT201573) 以了解如何在启用这一 Quirk 后继续使用单用户模式。

### `DisableVariableWrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 macOS 获取 NVRAM 的写入权限。

这个选项可以限制 macOS 对 NVRAM 的写入。这个 Quirk 需要 `OpenRuntime.efi`（原名 `FwRuntimeServices.efi`）提供了 `OC_FIRMWARE_RUNTIME` 协议的实现.

*注*: 这个 Quirk 也可以避免由于无法将变量写入 NVRAM 而导致的对操作系统的破坏。

> 译者注：在 Z390/HM370 等没有原生 macOS 支持 NVRAM 的主板上需要开启。

### `DiscardHibernateMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 复用原始的休眠内存映射。

这一选项强制 XNU 内核忽略新提供的内存映射、认定设备从休眠状态唤醒后无需对其更改。如果你在使用 Windows，则 [务必启用](https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi#hibernation-state-s4-transition-requirements) 这一选项，因为 Windows 要求 S4 唤醒后保留运行内存的大小和未知。

*注*: 这可能用于解决较旧硬件上的错误内存映射。如 Insyde 固件的 Ivy Bridge 笔记本电脑或者 Acer V3-571G。 除非您完全了解这一选项可能导致的后果，否则请勿使用此功能。

### `EnableSafeModeSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补引导加载程序以在安全模式下启用 KASLR。

这个选项与启动到安全模式（启动时按住 Shift 或受用了 `-x` 启动参数）有关。默认情况下，安全模式会使用 `slide=0`，这个 Quirk 试图通过修补 `boot.efi` 接触这一限制。只有当 `ProvideCustomSlide` 启用后才可以启用本 Quirks。

*注*: 除非启动到安全模式失败，否则不需要启用此选项。

### `EnableWriteUnprotector`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 关闭 `CR0` 寄存器中的写入保护。

这个选项会在 UEFI Runtime Services 执行过程中，删除 `CR0` 寄存器中的写保护 `WP` bit，从而绕过其代码页的 `RX̂` 权限。这个 Quirk 需要配合 `OpenRuntime.efi`（原 `FwRuntimeServices.efi`）里的 `OC_FIRMWARE_RUNTIME` 协议来实现。

*注*：这个 Quirk 可能会破坏你的固件的安全性。如果你的固件支持内存属性表 (MAT)，请优先使用下文中的 `RebuildAppleMemoryMap` 那个 Quirk。

### `ForceExitBootServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在失败时用新的内存映射（Memory Map）重试 `ExitBootServices`。

开启后会确保 `ExitBootServices` 即使在 MemoryMap 参数过期时也能调用成功，方法主要是获取当前的内存映射，并重试调用 `ExitBootServices`。

*注*：是否启用这个 Quirk 取决于你是否遇到了 Early Boot 故障。除非你详细了解这一选项可能导致的后果，否则请勿启用这一选项。

### `ProtectMemoryRegions`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护内存区域免于不正确的读写。

有些固件会错误映射内存区域：

- CSM 区域会被标记为引导服务的代码或数据，从而成为 XNU 内核的空闲内存。
- MMIO 区域会被标记为预留内存，保持不被映射的状态，但在运行时可能需要在 NVRAM 的支持下才能访问。

这一 Quirk 会尝试修复这些区域的类型，比如用 ACPI NVS 标记 CSM，MMIO 标记 MMIO。

*注*：是否启用这一 Quirk 取决于你是否遇到了休眠、睡眠无法唤醒、启动失败或其他问题。一般来说，只有古董固件才需要启用。


### `ProtectSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 安全启动变量不被写入。

尝试从操作系统写入 `db`、`dbx`、`PK` 和 `KEK` 时生成报告。

*注*：这个 Quirk 主要试图避免碎片整理导致的 NVRAM 相关问题，如 Insyde 或 `MacPro5,1`。

### `ProtectUefiServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 服务不被固件覆盖。

某些现代固件（包括硬件和 VMware 之类的虚拟机）可能会在加载驱动及相关操作的过程中，更新 UEFI 服务的指针。这一行为会直接破坏其他影响内存管理的 Quirk，如 `DevirtualiseMmio`、`ProtectMemoryRegions`，或 `RebuildAppleMemoryMap`；也可能会破坏其他 Quirk，具体取决于 Quirk 的作用。

*注*：在 VMware 上，是否需要开启这个 Quirk 取决于是否有 `Your Mac OS guest might run unreliably with more than one virtual core.` 这样的消息。

### `ProvideCustomSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为低内存设备提供自定义 KASLR slide 值。

开启这个选项后，将会对固件进行内存映射分析，检查所有 slide（从 1 到 255）中是否有可用的。由于 `boot.efi` 私用 rdrand 或伪随机 rdtsc 随机生成此值，因此有可能出现冲突的 slide 值被使用并导致引导失败。如果出现潜在的冲突，这个选项将会强制为 macOS 选择一个伪随机值。这同时确保了 `slide=` 参数不会被传递给操作系统。

*注*: OpenCore 会自动检查是否需要启用这一选项。如果 OpenCore 的调试日志中出现 `OCABC: Only N/256 slide values are usable!` 则请启用这一选项。

### `ProvideMaxSlide`
**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 当更高的 KASLR slide 值不可用时提供最最大 KASLR slide 值。

当 `ProvideCustomSlide` 启用时，该选项通过用户指定的 `1` 到 `254`（含）之间的值来覆盖上限为 `255` 的最大 slide 值。较新的固件会从上到下分配内存池中的内存，导致扫描 slide 时的空闲内存被当作内核加载时的临时内存来使用。如果这些内存不可用，启用这个选项则不会继续评估更高的 slide 值。

*注*：当 `ProvideCustomSlide` 启用、并且随机化的 slide 落入不可用的范围时，如果出现随机的启动失败，则有必要开启这个 Quirk。开启 `AppleDebug` 时，调试日志通常会包含 `AAPL: [EB|‘LD:LKC] } Err(0x9)` 这样的信息。如果要找到最合适的值，请手动将 `slide=X` 追加到 `boot-args` 里，并用日志记录下不会导致启动失败的最大值。

### `RebuildAppleMemoryMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 生成与 macOS 兼容的内存映射。

Apple 内核在解析 UEFI 内存映射时有几个限制：

- 内存映射的大小不能超过 4096 字节，因为 Apple 内核将其映射为一个 4 KiB 页面。由于某些固件的内存映射大小非常大（大约超过 100 个条目），Apple 内核会在启动时崩溃。
- 内存属性表会被忽略。`EfiRuntimeServicesCode` 内存静态获得 `RX` 权限，其他内存类型则获得 `RW` 权限。某些固件驱动会在运行时把数据写到全局变量中，因此 Apple 内核在调用 UEFI Runtime Services 时会崩溃，除非驱动的 `.data` 部分有 `EfiRuntimeServicesData` 类型。

为了解决这些限制，这个 Quirk 将内存属性表的权限应用到传递给 Apple 内核的内存映射中，如果生成的内存映射超过 4KiB，则可选择尝试统一类似类型的连续插槽。

*注 1*：由于许多固件自带的内存保护不正确，所以这个 Quirk 一般要和 `SyncRuntimePermissions` 一起启用。
*注 2*：根据是否遇到第一阶段启动失败再决定是否启用这一 Quirk。在支持内存属性表 (MAT) 的平台上，这一 Quirk 是 `EnableWriteUnprotector` 更好的替代。

### `SetupVirtualMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `SetVirtualAddresses` 调用修复为虚拟地址.

选择让固件在调用 `SetVirtualAddresses` 后通过虚拟地址访问内存，可能会导致 Early Boot 故障。这个 Quirk 可通过对分配的虚拟地址和物理内存进行 Early Boot 身份映射来解决这个问题。

*注*：是否启用这个 Quirk 取决于你是否遇到了 Early Boot 故障。目前具有内存保护支持的新固件（例如 OVMF ）由于一些原因不支持此 Quirk: [acidanthera/bugtracker#719](https://github.com/acidanthera/bugtracker/issues/719)。

### `SignalAppleOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 不论使用什么操作系统、总是向 OSInfo 报告启动的是 macOS。

Mac 设备在不同的操作系统中具有不同的行为，因此如果你在使用 Mac 设备，这一功能会非常有用。例如，你可以通过启用这一选项为某些双 GPU 的 MacBook 型号中在 Windows 和 Linux 中启用 Intel GPU。

### `SyncRuntimePermissions`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新运行时环境的内存权限。

某些固件无法正确处理运行时权限，表现为：

- 把 `OpenRuntime` 在内存映射中错误地标记为不可执行。
- 把 `OpenRuntime` 在内存属性表中错误的标记为不可执行。
- 在 `OpenRuntime` 加载之后丢失内存属性表中的条目。
- 把内存属性表中的项目标记为 read-write-execute。

这个 Quirk 会通过更新内存映射和内存属性表来纠正这一问题。

*注*：是否开启这一 Quirk 取决于 macOS、Linux 或 Windows 是否遇到 Early Boot 故障。一般来说，只有 2018 年以后发布的固件才会受到影响。
