---
title: 5. Booter
description: 配置 OpenRuntime.efi（Slide 值计算、KASLR）
type: docs
author_info: 由 Sukka、derbalkon、cike-567 整理，由 Sukka、derbalkon、cike-567 翻译。
last_updated: 2022-08-04
---

## 5.1 简介

本部分允许在 Apple BootLoader（`boot.efi`）上应用不同种类的 UEFI 修改。目前，这些修改为不同的固件提供了各种补丁和环境更改。其中一些功能最初是作为 [AptioMemoryFix.efi](https://github.com/acidanthera/AptioFixPkg) 的一部分，如今 `AptioMemoryFix.efi` 已经不再维护。如果你还在使用，请参考 [技巧和窍门](12-troubleshooting.html#12-5-技巧和窍门) 章节提供的迁移步骤。

对 Booter 的修补按照如下顺序执行：

- Quirks
- Patch

如果您是第一次在自定义固件上使用此功能，则首先需要执行一系列检查。开始之前，请确保您符合以下条件：

- 具有最新版本的 UEFI 固件（去主板厂家的官网上看看）。
- 禁用了 `Fast Boot` 和 `Hardware Fast Boot`。如果 BIOS 里有相关选项，禁用掉。
- 如果有 `Above 4G Decoding` 或类似功能，请在固件设置中启用。注意，在某些主板上（特别是 ASUS WS-X299-PRO）这个选项会造成不良影响，必须禁用掉。虽然目前还不知道是不是其他主板也有同样问题，但是如果你遇到了不稳定的启动故障，可以首先考虑检查一下这个选项。
- 启用了 `DisableIoMapper` Quirk、或者在 BIOS 中禁用 `VT-d`、或者删去了 ACPI `DMAR` 表。
- NVRAM 和其他地方都 **没有** `slide` 启动参数。 除非你没法开机、并且在日志里看见了 `No slide values are usable! Use custom slide!`，否则不论如何也不要使用这个启动参数。
- `CFG Lock` (`MSR 0xE2` 写保护) 在 BIOS 中被禁用。如果 BIOS 中没有、而且你心灵手巧，你可以考虑 [手动打补丁将其禁用](https://github.com/LongSoft/UEFITool/blob/master/UEFIPatch/patches.txt) 。更多细节请参考 ControMsrE2（位于7.8节）。
- 在 BIOS 中禁用 `CSM` (Compatibility Support Module)。NVIDIA 6xx / AMD 2xx 或更老的平台可能需要刷新 GOP ROM，具体步骤参考 [GopUpdate](https://www.win-raid.com/t892f16-AMD-and-Nvidia-GOP-update-No-requests-DIY.html) 或者 [AMD UEFI GOP MAKER](http://www.insanelymac.com/forum/topic/299614-asus-eah6450-video-bios-uefi-gop-upgrade-and-gop-uefi-binary-in-efi-for-many-ati-cards/page-1#entry2042163)。
- 如果有 `EHCI / XHCI Hand-off` 功能，建议仅在出现 USB 设备连接时启动停滞的情况下启用。
- 在 BIOS 中启用 `VT-x`、`Hyper Threading`、`Execute Disable Bit`。
- 有时你还可能需要在 BIOS 中禁用 `Thunderbolt Support`、`Intel SGX` 和 `Intel Platform Trust`。但是这一操作不是必须的。

在调试睡眠问题时，可能需要（临时）禁用 Power Nap 和自动关闭电源，因为这二者似乎有时会导致旧的平台唤醒黑屏或循环启动。具体问题可能因人而异，但通常你应首先检查 ACPI 表。

这是在 [Z68 主板](http://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/#entry2534645) 上找到的一些 Bug。要关闭 Power Nap 和其他功能，请在终端中运行以下命令：

```bash
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
```

*注*：这些设置可能会在硬件更改、操作系统更新和某些其他情况下重置。要查看它们的当前状态，请在终端中使用 `pmset -g` 命令。

## 5.2 属性列表

### 1. `MmioWhitelist`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 设计为用 `plist dict` 值填充，用来描述在启用 `DevirtualiseMmio` 这个 Quirk 时特定固件能够运作的关键地址。详见下面的 MmioWhitelist 属性部分。

> 译者注：如果开机卡在 `PCI...` 可以尝试开启 Item 1 下的 Patch。

### 2. `Patch`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 在启动器中执行二进制补丁。

设计为用 `plist dictionary` 值填充，用来描述每个补丁。参加下面的 Patch 属性部分。

### 3. `Quirks`

**Type**: `plist dict`
**Description**: 应用下面的 Quirks 属性部分中所述的各个引导 Quirk。

## 5.3 MmioWhitelist 属性

### 1. `Address`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 指排除在外的 MMIO 地址，其内存描述符（Memory Descriptor）应被 `DevirtualiseMmio` 虚拟化（保持不变）。该值所在的区域会被分配一个虚拟地址，因此在操作系统运行期间，固件能够直接与该内存区域进行通信。

这里写入的地址必须是内存映射的一部分，具有 `EfiMemoryMappedIO` 类型和 `EFI_MEMORY_RUNTIME` 属性（最高 bit）。可以使用调试日志找到可能的地址。

### 2. `Comment`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 3. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 MMIO 地址排除在 devirtualisation 程序之外。

## 5.4 Patch 属性

### 1. `Arch`

**Type**: `plist string`
**Failsafe**: `Any` (适用于任何支持的架构)
**Description**: 启动器补丁架构（`i386`, `x86_64`）。

### 2. `Comment`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 3. `Count`

**Type**: `plist integer`
**Failsafe**: `0` （全部修补）
**Description**: 修补的次数，超过这一次数后便不再修补。

### 4. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 设置为 `true`，则应用该补丁。

### 5. `Find`

**Type**: `plist data`
**Failsafe**: Empty
**Description**: 要查找的数据。如果设置，则必须与 `Replace` 的大小相等。

### 6. `Identifier`

**Type**: `plist string`
**Failsafe**: Empty (匹配任何启动器)
**Description**: `Apple` 代表 macOS 启动器（通常是 `boot.efi`）；带有后缀的名称（例如：`bootmgfw.efi`）代表特定的启动器。

### 7. `Limit`

Type: `plist integer`
Failsafe: `0` (搜索所以引导程序)
Description: 搜索的最大字节数。

### 8. `Mask`

**Type**: `plist data`
**Failsafe**: Empty (Ignored)
**Description**: 在查找比较的过程中使用的数据位掩码。允许通过忽略未被屏蔽的 bit（设置为 `0`）进行模糊搜索。如果设置，则其大小必须等于 `Find`。

### 9. `Replace`

**Type**: `plist data`
**Failsafe**: Empty
**Description**: 一个或多个字节的替换数据。

### 10. `ReplaceMask`

**Type**: `plist data`
**Failsafe**: Empty (Ignored)
**Description**: 替换时使用的数据位掩码。允许通过更新掩码（设置为非 `0`）来进行模糊替换。如果设置，否则其大小必须等于 `Replace`。

### 11. `Skip`

**Type**: `plist integer`
**Failsafe**: `0` （不跳过任何发现的事件）
**Description**: 在替换前要跳过的发现的事件数。

## 5.5 Quirks 属性

### 2. `AllowRelocationBlock`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许通过重定位块来启动 macOS。

重定位块（Relocation Block）是一个分配在低位 4GB 内存的缓冲区。EfiBoot 使用该这部分内存加载内核和相关结构，否则这部分区块会被「非运行时」数据（假定）所占用。在内核启动之前，重定位块的内容会被复制回位于低位的保留内存。同理，所有指向重定位块的其他内存地址也会作出相应调整。在下述情况中重定位块会被使用：

- 没有更好的 slide（所有内存都被使用了）
- 强制 `slide=0`（通过参数或安全模式设置）
- 不支持 KASLR (slide)（macOS 10.7 及更旧的版本）

这个 Quirk 需要同时启用 `ProvideCustomSlide`（必需）和 `AvoidRuntimeDefrag`（通常情况下）才能正常运行。使用重定位块启动时不支持休眠（启用这个 Quirk 并不意味着总是使用重定位块，需要时才会使用重定位块。）。

*注*：虽然某些低层内存被占用的平台需要这个 Quirk 来运行旧版 macOS 系统，但是这个 Quirk 并不兼容某些硬件及 macOS 11。这种情况下可能需要用 `EnableSafeModeSlide` 来替代。

### 2. `AvoidRuntimeDefrag`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 `boot.efi` 运行时执行内存碎片整理。

这个选项修复了包括日期、时间、NVRAM、电源控制等 UEFI Runtime 服务。提供使用可变存储的某些服务的固件的支持，如变量存储。可变存储可能会尝试通过非可变存储区域的物理地址访问内存，但这有时可能已经被 `boot.efi` 移动了。这个选项可以防止 `boot.efi` 移动这种数据。

*注*：除 Apple 和 VMware 固件外，都需要启用此选项。

### 3. `DevirtualiseMmio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 从某些 MMIO 区域中删除 Runtime 属性。

通过删除已知内存区域的 Runtime bit，此选项可减少内存映射中 Stolen Memory Footprint。 这个 Quirk 可能会使可用的 KASLR slide 增加，但如果没有其他措施，则不一定与目标主板兼容。 通常，这会释放 64 到 256MB 的内存（具体数值会显示在调试日志中）。在某些平台上这是引导 macOS 的唯一方法，否则在引导加载程序阶段会出现内存分配错误。

该选项通常对所有固件都有用，除了一些非常古老的固件（例如 Sandy Bridge）。在某些固件上，可能需要一个例外映射列表。为了使 NVRAM 和休眠功能正常工作，获取其虚拟地址仍然是必要的。 请参考 `MmioWhitelist` 部分来实现。

> 译者注：对于某些 300 系列主板是必须的

### 4. `DisableSingleUser`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用 Apple 单用户模式。

这个选项可以禁用 `CMD+S` 热键和 `-s` 启动参数来限制单用户模式。启用这一 Quirk 后预期行为应和 T2 的机型行为类似。请参考 Apple 的 [这篇文章](https://web.archive.org/web/20200517125051/https://support.apple.com/zh-cn/HT201573)（译者注：原文章已被关闭，此为网站时光机的存档副本）以了解如何在启用这一 Quirk 后继续使用单用户模式。

### 5. `DisableVariableWrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 防止 macOS 获取 NVRAM 的写入权限。

这个选项可以限制 macOS 对 NVRAM 的写入。这个 Quirk 需要 `OpenRuntime.efi`（原名 `FwRuntimeServices.efi`）提供了 `OC_FIRMWARE_RUNTIME` 协议的实现。

*注*：这个 Quirk 也可以作为一个临时性的变通办法。避免由于无法将变量写入 NVRAM 而导致的对操作系统的破坏。

> 译者注：在 Z390/HM370 等没有原生 macOS 支持 NVRAM 的主板上需要开启。

### 6. `DiscardHibernateMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 复用原始的休眠内存映射。

这一选项强制 XNU 内核忽略新提供的内存映射，并假定它在从休眠状态唤醒后没有改变。这种行为是 [Windows](https://docs.microsoft.com/windows-hardware/design/device-experiences/oem-uefi#hibernation-state-s4-transition-requirements) 要求的。 因为 Windows 强制要求 `S4` 唤醒后保留运行内存的大小和位置。

注*：这可能用于解决较旧较罕见的硬件上的错误内存映射。例如：Insyde 固件的 Ivy Bridge 笔记本电脑（Acer V3-571G）。除非您完全了解这一选项可能导致的后果，否则请勿使用此功能。


### 7. `EnableSafeModeSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 修补引导加载程序以在安全模式下启用 KASLR。

这个选项与启动到安全模式（启动时按住 Shift 或使用 `-x` 启动参数）有关。默认情况下，安全模式会使用 `slide=0`，就像系统在启动时使用 `slide=0` 启动参数一样。这个 Quirk 会试图给 `boot.efi` 打上补丁，解除这一限制，并允许使用其他值(从 1 到 255)。这个 Quirks 需要启用 `ProvideCustomSlide` 。

*注*：除非启动到安全模式失败，否则不需要启用此选项。

### 8. `EnableWriteUnprotector`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 关闭 `CR0` 寄存器中的写入保护。

这个选项在 UEFI Runtime Services 的代码页中绕过 `WˆX` 权限，在其执行过程中从 `CR0` 寄存器中移除写保护 `WP` bit。这个 Quirk 需要 `OpenRuntime.efi` 里的 `OC_FIRMWARE_RUNTIME` 协议来实现。

*注*：这个 Quirk 可能会潜在地削弱固件的安全性。如果你的固件支持内存属性表 (MAT)，请优先使用下文中的 `RebuildAppleMemoryMap` Quirk。是否支持 MAT，请参考 `OCABC: MAT support is 1/0` 日志条目来确定。

### 9. `ForceBooterSignature`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 macOS 启动器签名设置为 OpenCore 启动器。

启动器签名，本质上是加载的镜像的 SHA-1 哈希值，在从休眠唤醒时，Mac EFI 使用该签名来验证启动器的真实性。该选项强制 macOS 使用 OpenCore 启动器的 SHA-1 哈希值作为启动器签名，以便让 OpenCore shim 在 Mac EFI 固件上进行休眠唤醒。

*注*：OpenCore 启动器路径由 `LauncherPath` 属性决定。

### 10. `ForceExitBootServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在失败时用新的内存映射（Memory Map）重试 `ExitBootServices`。

开启后会确保 `ExitBootServices` 即使在 MemoryMap 参数过期时也能调用成功，方法主要是获取当前的内存映射，并重试调用 `ExitBootServices`。

*注*：是否启用这个 Quirk 取决于你是否遇到了 Early Boot 故障。除非你详细了解这一选项可能导致的后果，否则请勿启用这一选项。

### 11. `ProtectMemoryRegions`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护内存区域免于不正确的读写。

有些固件会错误映射内存区域：

- CSM 区域会被标记为引导服务的代码或数据，从而成为 XNU 内核的空闲内存。
- MMIO 区域会被标记为预留内存，保持不被映射的状态，但在运行时可能需要在 NVRAM 的支持下才能访问。

这一 Quirk 会尝试修复这些区域的类型，比如用 ACPI NVS 标记 CSM，MMIO 标记 MMIO。

*注*：是否启用这一 Quirk 取决于你是否遇到了休眠、睡眠无法唤醒、启动失败或其他问题。一般来说，只有古董固件才需要启用。

### 12. `ProtectSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 安全启动变量不被写入。

尝试从操作系统写入 `db`、`dbx`、`PK` 和 `KEK` 时生成报告。

*注*：这个 Quirk 主要试图避免碎片整理导致的 NVRAM 相关问题，例如：Insyde 或 `MacPro5,1`。

### 13. `ProtectUefiServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 保护 UEFI 服务不被固件覆盖。

一些现代的固件，包括 VMware 等虚拟机上的固件，可能会在加载驱动及相关操作的过程中，更新 UEFI 服务的指针。这一行为会直接破坏其他影响内存管理的 Quirk，例如 `DevirtualiseMmio`、`ProtectMemoryRegions` 或 `RebuildAppleMemoryMap`。也可能会破坏其他 Quirk，具体取决于 Quirk 的作用。

GRUB-shim 对各种 UEFI image services 进行了类似的即时更改，这些服务也受到这个 Quirk 的保护。

*注 1*：在 VMware 上，是否需要开启这个 Quirk 取决于是否有 `Your Mac OS guest might run unreliably with more than one virtual core.` 这样的消息。

*注 2*：如果 OpenCore 是从启用了 BIOS 安全启动的 GRUB 中链式加载的，则需要这个 Quirk。

### 14. `ProvideCustomSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为低内存设备提供自定义 KASLR slide 值。

开启这个选项后，将会对固件进行内存映射分析，检查所有 slide（从 `1` 到 `255`）中是否有可用的。由于 `boot.efi` 私用 rdrand 或伪随机 rdtsc 随机生成此值，因此有可能出现冲突的 slide 值被使用并导致引导失败。如果出现潜在的冲突，这个选项将会强制为 macOS 选择一个伪随机值。这同时确保了 `slide=` 参数不会被传递给操作系统（出于安全原因）。

*注*：OpenCore 会自动检查是否需要启用这一选项。如果 OpenCore 的调试日志中出现 `OCABC: Only N/256 slide values are usable!` 则请启用这一选项。

### 15. `ProvideMaxSlide`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 当更大的 KASLR slide 值不可用时，手动提供最大 KASLR slide 值。

当 `ProvideCustomSlide` 启用时，该选项通过用户指定的 `1` 到 `254`（含）之间的值来覆盖上限为 255 的最大 slide 值。较新的固件会从上到下分配内存池中的内存，导致扫描 slide 时的空闲内存被当作内核加载时的临时内存来使用。如果这些内存不可用，启用这个选项则不会继续评估更高的 slide 值。

*注*：当 `ProvideCustomSlide` 启用、并且随机化的 slide 落入不可用的范围时，如果出现随机的启动失败，则有必要开启这个 Quirk。开启 `AppleDebug` 时，调试日志通常会包含 `AAPL: [EB|‘LD:LKC] } Err(0x9)` 这样的信息。如果要找到最合适的值，请手动将 `slide=X` 追加到 `boot-args` 里，并用日志记录下不会导致启动失败的最大值。

### 16. `RebuildAppleMemoryMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 生成与 macOS 兼容的内存映射。

Apple 内核在解析 UEFI 内存映射时有几个限制：
- 内存映射的大小不能超过 4096 字节，因为 Apple 内核将其映射为一个 `4KiB` 页面。由于某些固件的内存映射大小非常大（大约超过 100 个条目），Apple 内核会在启动时崩溃。
- 内存属性表会被忽略。`EfiRuntimeServicesCode` 内存静态获得 `RX` 权限，其他内存类型则获得 `RW` 权限。某些固件驱动会在运行时把数据写到全局变量中，因此 Apple 内核在调用 UEFI Runtime Services 时会崩溃，除非驱动的 `.data` 部分有 `EfiRuntimeServicesData` 类型。
为了解决这些限制，这个 Quirk 将内存属性表的权限应用到传递给 Apple 内核的内存映射中，如果生成的内存映射超过 `4KiB`，则可选择尝试统一类似类型的连续插槽。

*注 1*：由于许多固件自带的内存保护不正确，所以这个 Quirk 一般要和 `SyncRuntimePermissions` 一起启用。

*注 2*：根据是否遇到第一阶段启动失败再决定是否启用这一 Quirk。在支持内存属性表 (MAT) 的平台上，这一 Quirk 是 `EnableWriteUnprotector` 更好的替代。在使用 `OpenDuetPkg` 时一般是不需要启用这个 Quirk 的，但如果要启动 macOS 10.6 或更早的版本则可能需要启用，原因暂不明确。

### 17. `ResizeAppleGpuBars`

**Type**: `plist boolean`
**Failsafe**: `-1`
**Description**: 减少 GPU PCI BAR 的大小，以便与 MacOS 兼容。

这个 Quirk 将 MacOS 的 GPU PCI BAR 大小减少到指定的值，如果不支持的话，则更低。指定的值遵循 PCI Resizable BAR 规则。虽然 MacOS 支持理论上的1GB最大值。实际上，所有非默认值可能无法正常工作。由于这个原因，这个 Quirk 的唯一支持值是最小的 BAR 大小，即 0。 使用 -1 来禁用这个 Quirk。

出于开发的目的，可以冒险尝试其他数值。考虑具有 2 个 BAR 的 GPU。
- BAR0 支持从 256MB 到 8GB 的大小。它的值是 4GB。
- BAR1 支持从 2MB 到 256MB 的大小。它的值是 256MB。

*例 1*：将 ResizeAppleGpuBars 设置为 1GB，将 BAR0 改为 1GB，BAR1 保持不变。

*例 2*: 将 ResizeAppleGpuBars 设置为 1MB 将改变 BAR0 为 256MB，BAR0 为 2MB。

*例 3*：将 ResizeAppleGpuBars 设置为 16GB，将不做任何改变。

*注*：请参阅 `ResizeGpuBars` quirk 了解 GPU PCI BAR size 配置和有关该技术的更多详细信息。

### 18. `SetupVirtualMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `SetVirtualAddresses` 调用修复为虚拟地址。

选择让固件在调用 `SetVirtualAddresses` 后通过虚拟地址访问内存，可能会导致 Early Boot 故障。这个 Quirk 可通过对分配的虚拟地址和物理内存进行 Early Boot 身份映射来解决这个问题。

*注*：是否启用这个 Quirk 取决于你是否遇到了 Early Boot 故障。

### 19. `SignalAppleOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 不论使用什么操作系统，总是向 OS Info 报告启动的是 macOS。

Mac 设备在不同的操作系统中具有不同的行为，因此如果你在使用 Mac 设备，这一功能会非常有用。例如，你可以通过启用这一选项为某些双 GPU 的 MacBook 型号中在 Windows 和 Linux 中启用 Intel GPU。

### 20. `SyncRuntimePermissions`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新运行时环境的内存权限。

某些固件无法正确处理运行时权限，表现为：
- 把 `OpenRuntime` 在内存映射中错误地标记为不可执行。
- 把 `OpenRuntime` 在内存属性表中错误的标记为不可执行。
- 在 `OpenRuntime` 加载之后丢失内存属性表中的条目。
- 把内存属性表中的项目标记为 `read-write-execute`。
这个 Quirk 会通过更新内存映射和内存属性表来纠正这一问题。

*注*：是否开启这一 Quirk 取决于是否遇到 Early Boot 故障（包括但不限于在黑屏时停止以及更明显的崩溃，影响同一台机子上的其他系统）。一般来说，只有 2017 年以后发布的固件才会受到影响。
