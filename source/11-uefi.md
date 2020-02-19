---
title: 11. UEFI
description: UEFI 驱动以及加载顺序（待翻译）
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka 翻译
last_updated: 2020-02-19
---

## 11.1 Introduction

[UEFI](https://uefi.org/specifications)（统一可扩展固件接口）是一种规范，用于定义操作系统和平台固件之间的软件接口。本部分允许加载其他 UEFI 模块 和/或 对板载固件进行调整。要检查固件内容，应用修改并执行升级，可以使用 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和其他实用程序。

## 11.2 Properties

### `ConnectDrivers`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 驱动程序加载后执行 UEFI 控制器连接操作。

此选项对于加载文件系统驱动很有用，因为文件系统驱动通常遵循 UEFI 驱动模型（并且可能无法自行启动）。此选项对会自动连接的驱动程序来说是不必要的，并且可能会稍微减慢启动速度。

*注*：某些固件（特别是 Apple 的）仅连接包含操作系统的驱动器以加快启动过程。启用此选项可以在拥有多个驱动器时查看所有引导选项。

### `Drivers`

**Type**: `plist array`
**Failsafe**: None
**Description**: 从 `OC/Drivers` 目录下加载选择的驱动。

设计为填充要作为 UEFI 驱动程序加载的文件名。根据固件不同、可能需要不同的驱动程序。加载不兼容的驱动程序可能会导致无法启动系统，甚至导致固件永久性损坏。OpenCore 可以使用的驱动程序包括：

- [`ApfsDriverLoader`](https://github.com/acidanthera/AppleSupportPkg) --- APFS 文件系统引导驱动程序在 UEFI 固件的可启动 APFS 容器中添加了对嵌入式 APFS 驱动程序的支持。
- [`FwRuntimeServices`](https://github.com/acidanthera/OcSupportPkg) --- `OC_FIRMWARE_RUNTIME` 协议通过支持只读、只写 NVRAM 变量，提升了 OpenCore 和 Lilu 的安全性。有些 Quirks 如 `RequestBootVarRouting` 依赖此驱动程序。
由于 runtime 驱动饿性质（与目标操作系统并行运行），因此它不能在 OpenCore 本身实现，而是与 OpenCore 捆绑在一起。
- [`HiiDatabase`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 HII 服务驱动。Ivy Bridge 及其以后的大多数固件中都已内置此驱动程序。某些带有 GUI 的应用程序（例如 UEFI Shell）可能需要此驱动程序才能正常工作。
- [`EnhancedFatDxe`](https://github.com/acidanthera/audk) --- 来自 `FatPkg` 的 FAT 文件系统驱动程序。这个驱动程序已经被嵌入到所有 UEFI 固件中，无法为 OpenCore 使用。众所周知，许多固件的 FAT 支持实现都有错误，导致在尝试写操作时损坏文件系统。如果在引导过程中需要写入 EFI 分区，则可能组要将此驱动程序嵌入固件中。
- [`NvmExpressDxe`](https://github.com/acidanthera/audk) --- 来自`MdeModulePkg` 的 NVMe 驱动程序。从 Broadwell 一代开始的大多数固件都包含此驱动程序。对于 Haswell 以及更早的版本，如果安装了 NVMe SSD 驱动器，则将其嵌入固件中可能会更理想。
- [`AppleUsbKbDxe`](https://github.com/acidanthera/OcSupportPkg) --- USB 键盘驱动在自定义 USB 键盘驱动程序的基础上新增了对 `AppleKeyMapAggregator` 协议的支持。这是内置的 `KeySupport` 的等效替代方案。根据固件不同，效果可能会更好或者更糟。
- [`VBoxHfs`](https://github.com/acidanthera/AppleSupportPkg) --- 带有 bless 支持的 HFS 文件系统驱动。是 Apple 固件中 `HFSPlus` 驱动的开源替代。虽然功能完善，但是启动速度比 `HFSPlus` 慢三倍，并且尚未经过安全审核。
- [`XhciDxe`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 XHCI USB controller 驱动程序。从 Sandy Bridge 代开始的大多数固件中都包含此驱动程序。在较早的固件或旧系统可以用于支持外部 USB 3.0 PCI 卡。

要从 UDK（EDK II）编译驱动程序，可以使用编译 OpenCore 类似的命令。

```bash
git clone https://github.com/acidanthera/audk UDK
cd UDK
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p FatPkg/FatPkg.dsc
build -a X64 -b RELEASE -t XCODE5 -p MdeModulePkg/MdeModulePkg.dsc
```

### 3. `Input`

**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual settings designed for input (keyboard and mouse) in [Input Properties]() section below.

### 4. `Output`
**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual settings designed for output (text and graphics) in [Output Properties]() section below.

### 5. `Protocols`
**Type**: `plist dict`
**Failsafe**: None
**Description**: Force builtin versions of select protocols described in [Protocols Properties]() section below.
*注*：all protocol instances are installed prior to driver loading.

### 6. `Quirks`
**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual firmware quirks described in [Quirks Properties]() section below.


## 11.3 Input Properties

### 1. `KeyForgetThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 两次按键之间的间隔时间，单位为毫秒。

`AppleKeyMapAggregator` 协议应该包含当前按下的键的固定长度的缓冲。但是大部分驱动程序仅将按键按下报告为中断、并且按住按键会导致在一定的时间间隔后再提交按下行为。一旦超时到期，我们就是用超时从缓冲区中删除一次按下的键，并且没有新提交。

此选项允许根据你的平台设置此超时。在大多数平台上有效的推荐值为 `5` 毫秒。作为参考，在 VMWare 上按住一个键大约每 2 毫秒就会重复一次，而在 APTIO V 上是 3 - 4 毫秒。因此，可以在较快的平台上设置稍低的值、在较慢的平台设置稍高的值，以提高响应速度。

### 2. `KeyMergeThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 按住按键被重置的间隔时间，单位为毫秒。

与 `KeyForgetThreshold` 类似，这一选项适用于按键提交的顺序。为了能够识别同时按下的按键，我们需要设置一个超时时间，在这个时间内可以假定这两个按键是同时按下的。

对于 VMWare，同时按下多个键的间隔是 2 毫秒。对于 APTIO V 平台为 1 毫毛。一个接一个地按下按键会导致 6 毫秒和 10 毫秒的延迟。此选项的建议值为 2 毫秒，但对于较快的平台可以选取较小的值，反之亦然。

### 3. `KeySupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用这一选项后将会开启内置键盘支持。

这一选项基于 `AppleGenericInput`（`AptioInputFix`），激活内部键盘拦截器驱动程序以填充 `AppleKeyMapAggregator` 数据库以实现输入功能。如果使用了单独的驱动程序（如 `AppleUsbKbDxe`），则永远不要开启这一选项。

### 4. `KeySupportMode`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: 将内部键盘的输入转换设置为 `AppleKeyMapAggregator` 协议模式。

- `Auto` --- 从下述选项中自动选择
- `V1` --- UEFI 传统输入协议 `EFI_SIMPLE_TEXT_INPUT_PROTOCOL`.
- `V2` --- UEFI 现代标准输入协议 `EFI_SIMPLE_TEXT_INPUT_EX_PROTOCOL`.
- `AMI` --- APTIO 输入协议 `AMI_EFIKEYCODE_PROTOCOL`.

### 5. `KeySwap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用后将交换 `Command` 和 `Option`。

此选项对于 `Option` 键位于 `Command` 右侧的键盘来说会很有用。

### 6. `PointerSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用后将试图修复 UEFI 选择器协议。

该选项通过选择 OEM 协议实现标准 UEFI 指针协议 `EFI_SIMPLE_POINTER_PROTOCOL`。该选项在 Z87 华硕主板可能有用（该主板的 `EFI_SIMPLE_POINTER_PROTOCOL` 存在问题）。

### 7. `PointerSupportMode`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: 设置用于内部指针驱动程序的 OEM 协议。

目前只支持 `ASUS` 值，使用的是 Z87 和 Z97主板上的特殊协议。更多详情请参考 [`LongSoft/UefiTool#116`](https://github.com/LongSoft/UEFITool/pull/116)。

### 8. `TimerResolution`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 固件始终刷新的频率（单位 100 纳秒）

设置较低的值可以提高界面和输入处理性能的响应能力。建议值为 `50000`（即 5 毫秒）或稍高一些。选择 ASUS Z87 主板时，请使用 `60000`，苹果主板请使用 `100000`。你也可以将此值保留为 0，由 OpenCore 自动计算。

## 11.4 Output Properties

### 1. `TextRenderer`
**Type**: `plist string`
**Failsafe**: `BuiltinGraphics`
**Description**: Chooses renderer for text going through standard
  console output.

  Currently two renderers are supported: `Builtin` and `System`. `System` renderer uses firmware services for text rendering. `Builtin` bypassing firmware services and performs text rendering on its own. Different renderers support a different set of options. It is recommended to use `Builtin` renderer, as it supports HiDPI mode and uses full screen resolution.

  UEFI firmwares generally support `ConsoleControl` with two rendering modes: `Graphics` and `Text`. Some firmwares do not support `ConsoleControl` and rendering modes. OpenCore and macOS expect text to only be shown in `Graphics` mode and graphics to be drawn in any mode. Since this is not required by UEFI specification, exact behaviour varies.

  Valid values are combinations of text renderer and rendering mode:

   - `BuiltinGraphics` --- Switch to `Graphics` mode and use `Builtin` renderer with custom `ConsoleControl`.
   - `SystemGraphics` --- Switch to `Graphics` mode and use `System` renderer with custom `ConsoleControl`.
   - `SystemText` --- Switch to `Text` mode and use `System` renderer with custom `ConsoleControl`.
   - `SystemGeneric` --- Use `System` renderer with system `ConsoleControl` assuming it behaves correctly.

  The use of `BuiltinGraphics` is generally straightforward. For most platforms it is necessary to enable `ProvideConsoleGop`, set `Resolution` to `Max`.

  The use of `System` protocols is more complicated. In general the preferred setting is `SystemGraphics` or `SystemText`. Enabling `ProvideConsoleGop`, setting `Resolution` to `Max`, enabling `ReplaceTabWithSpace` is useful on almost all platforms. `SanitiseClearScreen`, `IgnoreTextInGraphics`, and `ClearScreenOnModeSwitch` are more specific, and their use depends on the firmware.

*注*：Some Macs, namely `MacPro5,1`, may have broken console output with newer GPUs, and thus only `BuiltinGraphics` may work for them.

### 2. `ConsoleMode`
**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Sets console output mode as specified
  with the `WxH` (e.g. `80x24`) formatted string.

  Set to empty string not to change console mode. Set to `Max` to try to use largest available console mode. Currently `Builtin` text renderer supports only one console mode, so this option is ignored.

*注*：This field is best to be left empty on most firmwares.

### 3. `Resolution`
**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Sets console output screen resolution.

  - Set to `WxH@Bpp` (e.g. `1920x1080@32`) or `WxH` (e.g. `1920x1080`) formatted string to request custom resolution from GOP if available.
  - Set to empty string not to change screen resolution.
  - Set to `Max` to try to use largest available screen resolution.

  On HiDPI screens `APPLE_VENDOR_VARIABLE_GUID` `UIScale` NVRAM variable may need to be set to `02` to enable HiDPI scaling in in `Builtin` text renderer, FileVault 2 UEFI password interface, FileVault 2 UEFI password interface and boot screen logo. Refer to [Recommended Variables]() section for more details.

*注*：This will fail when console handle has no GOP protocol. When the firmware does not provide it, it can be added with `ProvideConsoleGop` set to `true`.

### 4. `ClearScreenOnModeSwitch`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Some firmwares clear only part of screen when switching from graphics to text mode, leaving a fragment of previously drawn image visible. This option fills the entire graphics screen with black color before switching to text mode.

*注*：This option only applies to `System` renderer.

### 5. `DirectGopRendering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Use builtin graphics output protocol renderer for console.

On some firmwares this may provide better performance or even fix rendering issues, like on `MacPro5,1`. However it is recommended not to use this option unless there is an obvious benefit as it may even result in slower scrolling.

### 6. `IgnoreTextInGraphics`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Select firmwares output text onscreen in both graphics and text mode. This is normally unexpected, because random text may appear over graphical images and cause UI corruption. Setting this option to `true` will discard all text output when console control is in mode different from `Text`.

*注*：This option only applies to `System` renderer.

### 7. `ReplaceTabWithSpace`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Some firmwares do not print tab characters or even everything that follows them, causing difficulties or inability to use the UEFI Shell builtin text editor to edit property lists and other documents. This option makes the console output spaces instead of tabs.

*注*：This option only applies to `System` renderer.

### 8. `ProvideConsoleGop`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Ensure GOP (Graphics Output Protocol) on console handle.

  macOS bootloader requires GOP to be present on console handle, yet the exact location of GOP is not covered by the UEFI specification. This option will ensure GOP is installed on console handle if it is present.

*注*：This option will also replace broken GOP protocol on console handle, which may be the case on `MacPro5,1` with newer GPUs.

### 9. `ReconnectOnResChange`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Reconnect console controllers after changing screen resolution.

  On some firmwares when screen resolution is changed via GOP, it is required to reconnect the controllers, which produce the console protocols (simple text out). Otherwise they will not produce text based on the new resolution.

*注*：On several boards this logic may result in black screen when launching OpenCore from Shell and thus it is optional. In versions prior to 0.5.2 this option was mandatory and not configurable. Please do not use this unless required.

### 10. `SanitiseClearScreen`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Some firmwares reset screen resolution to a failsafe value (like `1024x768`) on the attempts to clear screen contents when large display (e.g. 2K or 4K) is used. This option attempts to apply a workaround.

*注*：This option only applies to `System` renderer. On all known affected systems `ConsoleMode` had to be set to empty string for this to work.

## 11.5 Protocols Properties

### 1. `AppleBootPolicy`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Boot Policy 协议，可用于确保 VM 或旧版 Mac 设备上的 APFS 兼容性。

*注*：某些 Mac 设备（如 `MacPro5,1`）虽然兼容 APFS，但是其 Apple Boot Policy 协议包含了恢复分区检测问题，因此也建议启用这一选项。

### 2. `AppleEvent`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Event 协议，可以确保在 VM 或旧版 Mac 设备上的 Faile Vault V2 兼容性。

### 3. `AppleImageConversion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Image Conservation 协议。

### 4. `AppleKeyMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Key Map 协议

### 5. `AppleSmcIo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 SMC I/O 协议。

这一协议代替了传统的 `VirtualSmc.efi`，并与所有 SMC kext 驱动兼容。如果你在用 FakeSMC，可能需要手动往 NVRAM 中添加键值对。

### 6. `AppleUserInterfaceTheme`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple User Interface Theme 协议。

### 7. `DataHub`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装具有内置版本的 Data Hub 协议。如果已经安装了协议，这将删除所有先前的属性。

### 8. `DeviceProperties`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置版本的 Device Property 协议。 如果已经安装，它将删除所有以前的属性。这一选项可用于确保在 VM 或旧版 Mac 设备上的兼容性。

### 9. `FirmwareVolume`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制包装固件卷协议或安装新版本以支持 File Vault 2 的自定义光标图像。建议启用这一选项以确保 File Vault 2 在除 VM 和传统 Mac 设备之外的兼容性。

*注*：包括 VMWare 在内的多个虚拟机在 HiDPI 模式下光标会损坏，因此建议为所有虚拟机启用这一选项。

### 10. `HashServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Forcibly reinstalls Hash Services protocols with builtin versions. Should be set to `true` to ensure File Vault 2 compatibility on platforms providing broken SHA-1 hashing. Can be diagnosed by invalid cursor size with `UIScale` set to `02`, in general platforms prior to APTIO V (Haswell and older) are affected.

### 11. `OSInfo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制使用内置版本重新安装 OS Info 协议。该协议通常用于通过固件或其他应用程序从 macOS 引导加载程序接收通知。

### 12. `UnicodeCollation`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Forcibly reinstalls unicode collation services with builtin version. 建议启用这一选项以确保 UEFI Shell 的兼容性。一些较旧的固件破坏了 Unicode 排序规则, 设置为 YES 可以修复这些系统上 UEFI Shell 的兼容性 (通常为用于 IvyBridge 或更旧的设备)

## 11.6 Quirks Properties

### 1. `ExitBootServicesDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 在 `EXIT_BOOT_SERVICES` 事件后添加延迟，单位为毫秒。

This is a very ugly quirk to circumvent "Still waiting for root device" message on select APTIO IV firmwares, namely ASUS Z87-Pro, when using FileVault 2 in particular. It seems that for some reason they execute code in parallel to `EXIT_BOOT_SERVICES`, which results in SATA controller being inaccessible from macOS. A better approach should be found in some future. Expect 3-5 seconds to be enough in case the quirk is needed.

### 2. `IgnoreInvalidFlexRatio`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Select firmwares, namely APTIO IV, may contain invalid values in `MSR_FLEX_RATIO` (`0x194`) MSR register. These values may cause macOS boot failure on Intel platforms.

*注*：While the option is not supposed to induce harm on unaffected firmwares, its usage is not recommended when it is not required.

### 3. `ReleaseUsbOwnership`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Attempt to detach USB controller ownership from the firmware driver. While most firmwares manage to properly do that, or at least have an option for, select firmwares do not. As a result, operating system may freeze upon boot. Not recommended unless required.

### 4. `RequestBootVarFallback`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Request fallback of some `Boot` prefixed variables from `OC_VENDOR_VARIABLE_GUID` to newline `EFI_GLOBAL_VARIABLE_GUID`.

  This quirk requires `RequestBootVarRouting` to be enabled and therefore `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

  By redirecting `Boot` prefixed variables to a separate GUID namespace we achieve multiple goals:
  - Operating systems are jailed and only controlled by OpenCore boot environment to enhance security.
  - Operating systems do not mess with OpenCore boot priority, and guarantee fluent updates and hibernation wakes for cases that require reboots with OpenCore in the middle.
  - Potentially incompatible boot entries, such as macOS entries, are not deleted or anyhow corrupted.

  However, some firmwares do their own boot option scanning upon startup by checking file presence on the available disks. Quite often this scanning includes non-standard locations, such as Windows Bootloader paths. Normally it is not an issue, but some firmwares, ASUS firmwares on APTIO V in particular, have bugs. For them scanning is implemented improperly, and firmware preferences may get accidentally corrupted due to `BootOrder` entry duplication (each option will be added twice) making it impossible to boot without cleaning NVRAM.

  To trigger the bug one should have some valid boot options (e.g. OpenCore) and then install Windows with `RequestBootVarRouting` enabled. As Windows bootloader option will not be created by Windows installer, the firmware will attempt to create it itself, and then corrupt its boot option list.

  This quirk forwards all UEFI specification valid boot options, that are not related to macOS, to the firmware into `BootF###` and `BootOrder` variables upon write. As the entries are added to the end of `BootOrder`, this does not break boot priority, but ensures that the firmware does not try to append a new option on its own after Windows installation for instance.

### 5. `RequestBootVarRouting`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Request redirect of all `Boot` prefixed variables from `EFI_GLOBAL_VARIABLE_GUID` to newline `OC_VENDOR_VARIABLE_GUID`.

  This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`. The quirk lets default boot entry preservation at times when firmwares delete incompatible boot entries. Simply said, you are required to enable this quirk to be able to reliably use [Startup Disk](https://support.apple.com/HT202796) preference pane in a firmware that is not compatible with macOS boot entries by design.

### 6. `UnblockFsConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件通过「按驱动程序」模式下来阻止引导项加载。

*注*：如果惠普笔记本在 OpenCore 界面没有看到引导项时启用这一选项。
