---
title: 11. UEFI
description: UEFI 驱动以及加载顺序（待翻译）
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka 翻译
last_updated: 2020-05-19
---

## 11.1 Introduction

[UEFI](https://uefi.org/specifications)（统一可扩展固件接口）是一种规范，用于定义操作系统和平台固件之间的软件接口。本部分允许加载其他 UEFI 模块 和/或 对板载固件进行调整。要检查固件内容，应用修改并执行升级，可以使用 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和其他实用程序。

## 11.2 Drivers

根据固件不同、可能需要不同的驱动程序。加载不兼容的驱动程序可能会导致无法启动系统，甚至导致固件永久性损坏。OpenCore 目前对以下 UEFI 驱动提供支持。OpenCore 可能兼容对其他 UEFI 驱动，但不能确定。

- [`OpenRuntime`](https://github.com/acidanthera/OpenCorePkg) --- （原名 `FwRuntimeServices.efi`）`OC_FIRMWARE_RUNTIME` 协议通过支持只读、只写 NVRAM 变量，提升了 OpenCore 和 Lilu 的安全性。有些 Quirks 如 `RequestBootVarRouting` 依赖此驱动程序。由于 runtime 驱动饿性质（与目标操作系统并行运行），因此它不能在 OpenCore 本身实现，而是与 OpenCore 捆绑在一起。
- [`HiiDatabase`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 HII 服务驱动。Ivy Bridge 及其以后的大多数固件中都已内置此驱动程序。某些带有 GUI 的应用程序（例如 UEFI Shell）可能需要此驱动程序才能正常工作。
- [`EnhancedFatDxe`](https://github.com/acidanthera/audk) --- 来自 `FatPkg` 的 FAT 文件系统驱动程序。这个驱动程序已经被嵌入到所有 UEFI 固件中，无法为 OpenCore 使用。众所周知，许多固件的 FAT 支持实现都有错误，导致在尝试写操作时损坏文件系统。如果在引导过程中需要写入 EFI 分区，则可能组要将此驱动程序嵌入固件中。
- [`NvmExpressDxe`](https://github.com/acidanthera/audk) --- 来自`MdeModulePkg` 的 NVMe 驱动程序。从 Broadwell 一代开始的大多数固件都包含此驱动程序。对于 Haswell 以及更早的版本，如果安装了 NVMe SSD 驱动器，则将其嵌入固件中可能会更理想。
- [`OpenUsbKbDxe`](https://github.com/acidanthera/OpenCorePkg) --- USB 键盘驱动在自定义 USB 键盘驱动程序的基础上新增了对 `AppleKeyMapAggregator` 协议的支持。这是内置的 `KeySupport` 的等效替代方案。根据固件不同，效果可能会更好或者更糟。
- [`HfsPlus`](https://github.com/acidanthera/OcBinaryData) - Apple 固件中常见的具有 Bless 支持的专有 HFS 文件系统驱动程序。对于 `Sandy Bridge` 和更早的 CPU，由于缺少 `RDRAND` 指令支持，应使用 `HfsPlusLegacy` 驱动程序。
- [`VBoxHfs`](https://github.com/acidanthera/OpenCorePkg) --- 带有 bless 支持的 HFS 文件系统驱动。是 Apple 固件中 `HfsPlus` 驱动的开源替代。虽然功能完善，但是启动速度比 `HFSPlus` 慢三倍，并且尚未经过安全审核。
- [`XhciDxe`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 XHCI USB controller 驱动程序。从 Sandy Bridge 代开始的大多数固件中都包含此驱动程序。在较早的固件或旧系统可以用于支持外部 USB 3.0 PCI 卡。
- [`AudioDxe`](https://github.com/acidanthera/OpenCorePkg) --- UEFI 固件中的 HDA 音频驱动程序，适用于大多数 Intel 和其他一些模拟音频控制器。Refer to [acidanthera/bugtracker#740](https://github.com/acidanthera/bugtracker/issues/740) for known issues in AudioDxe.
- [`ExFatDxe`](https://github.com/acidanthera/OcBinaryData) --- 用于 Bootcamp 支持的专有 ExFAT 文件系统驱动程序，通常可以在 Apple 固件中找到。 对于 `Sandy Bridge` 和更早的 CPU，由于缺少 `RDRAND` 指令支持，应使用 `ExFatDxeLegacy` 驱动程序。
- [`Ps2KeyboardDxe`](https://github.com/acidanthera/audk) --- 从 `MdeModulePkg` 提取出来的 PS/2 键盘驱动。OpenDuetPkg 和一些固件可能不包括这个驱动，但对于 PS/2 键盘来说该驱动是必须的。注：和 `OpenUsbKbDxe` 不同，该驱动不提供对 `AppleKeyMapAggregator` 的支持、因此需要启用 `KeySupport` 这个 Quirk。
- [`Ps2MouseDxe`](https://github.com/acidanthera/audk) --- 从 `MdeModulePkg` 提取出来的 PS/2 鼠标驱动。该固件，虽然只有非常老旧的笔记本的固件中可能没有不包含该驱动，但是笔记本依赖该驱动才能在引导界面使用触控板。
- [`UsbMouseDxe`](https://github.com/acidanthera/audk) --- 从 `MdeModulePkg` 提取出来的 USB 鼠标驱动。该固件，一般只有虚拟机（如 OVMF）的固件中可能没有不包含该驱动，但是这些虚拟机依赖该驱动才能在引导界面使用鼠标。

要从 UDK（EDK II）编译驱动程序，可以使用编译 OpenCore 类似的命令。

```bash
git clone https://github.com/acidanthera/audk UDK
cd UDK
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p FatPkg/FatPkg.dsc
build -a X64 -b RELEASE -t XCODE5 -p MdeModulePkg/MdeModulePkg.dsc
```

## 11.3 Tools

一些不依赖 OpenCore 的工具可以帮助调试固件和硬件。下面列出了一些已知的工具。虽然有些工具可以从 OpenCore 启动，但大部分工具都应该直接或从 `OpenCoreShell` 中单独运行。

要启动到 `OpenShell` 或任何其他工具，直接将 `OpenShell.efi` 保存在 FAT32 分区中的 `EFI/BOOT/BOOTX64.EFI` 下。此时分区方案是 `GPT` 还是 `MBR` 并不重要。
虽然这种方法可以在 Mac 和其他计算机上都可以使用，但是如果只在 Mac 上使用的话还可以在 HFS+ 或 APFS 分区上使用该工具。

```bash
sudo bless --verbose --file /Volumes/VOLNAME/DIR/OpenShell.efi --folder /Volumes/VOLNAME/DIR/ --setBoot
```

*Note 1*: You may have to copy `/System/Library/CoreServices/BridgeVersion.bin` to `/Volumes/VOLNAME/DIR`.
*Note 2*: To be able to use `bless` you may have to [disable System Integrity Protection](https://developer.apple.com/library/archive/documentation/Security/Conceptual/System_Integrity_Protection_Guide/ConfiguringSystemIntegrityProtection/ConfiguringSystemIntegrityProtection.html).
*Note 3*: To be able to boot you may have to [disable Secure Boot](https://support.apple.com/HT208330) if present.

一些已知的 UEFI 工具：

- [`BootKicker`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 进入 Apple 的 BootPicker 菜单（仅 Mac 同款显卡才可以使用）。
- [`ChipTune`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 测试 BeepGen 协议，生成不同频率和长度的音频信号。
- [`CleanNvram`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 重置 NVRAM，以一个单独的工具呈现。
- [`FwProtect`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 解锁和回锁 NVRAM 保护，让其他工具在从 OpenCore 启动时能够获得完整的 NVRAM 访问权限。
- [`GopStop`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 用一个 [简单的场景](https://github.com/acidanthera/OpenCorePkg/tree/master/Application/GopStop) 测试 GraphicOutput 协议。
- [`HdaCodecDump`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 解析和转储高清晰度音频编解码器（Codec）信息（需要 `AudioDxe`）。
- [`KeyTester`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 在 `SimpleText` 模式下测试键盘输入。
- [`OpenCore Shell`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 由 OpenCore 配置的 [`UEFI Shell`](http://github.com/tianocore/edk2)，与绝大部分固件兼容。
- [`RtcRw`](https://github.com/acidanthera/OpenCorePkg) - Utility to read and write RTC (CMOS) memory.
- [`PavpProvision`](https://github.com/acidanthera/OpenCorePkg) - Perform EPID provisioning (requires certificate data configuration).
- [`ResetSystem`](https://github.com/acidanthera/OpenCorePkg) - Utility to perform system reset. Takes reset type as an argument: `ColdReset`, `WarmReset`, `Shutdown`. Default to `ColdReset`.
- [`VerifyMsrE2`](https://github.com/acidanthera/OpenCorePkg) (**内置**) - 检查 `CFG Lock`（MSR `0xE2` 写保护）在所有 CPU 核心之间的一致性。

## 11.4 OpenCanopy

OpenCanopy 是一个 OpenCore 的图形化界面接口，基于 [OpenCorePkg](https://github.com/acidanthera/OpenCorePkg) `OcBootManagementLib` 实现，提供与现有的文字模式类似的功能。当 `PickerMode` 设置为 `External` 时启用。

OpenCanopy 所需的图象资源位于 `Resources` 目录下，一些简单的资源（字体和图标）可以在 [OcBinaryData 仓库](https://github.com/acidanthera/OcBinaryData) 中获取。
字体为 12pt 的 Helvetica，比例缩放。

Font format corresponds to [AngelCode binary BMF](https://www.angelcode.com/products/bmfont). While there are many utilities to generate font files, currently it is recommended to use [dpFontBaker](https://github.com/danpla/dpfontbaker) to generate bitmap font ([using CoreText produces best results](https://github.com/danpla/dpfontbaker/pull/1)) and [fonverter](https://github.com/usr-sse2/fonverter) to export it to binary format.

*Note*: OpenCanopy 是一个试验性质的功能、不应用于日常使用。你可以在 [acidanthera/bugtracker#759](https://github.com/acidanthera/bugtracker/issues/759) 获取相关的详细信息。

## 11.5 OpenRuntime

`OpenRuntime` 是一个 OpenCore 的插件，提供了对 `OC_FIRMWARE_RUNTIME` 协议的实现。该协议对 OpenCore 的部分功能提供了支持，而这部分功能由于需要 Runtime（如操作系统）中运行、因此无法内置在 OpenCore 中。该协议提供了包括但不限于如下功能：

- NVRAM namespaces, allowing to isolate operating systems from accessing select variables (e.g. `RequestBootVarRouting` or `ProtectSecureBoot`).
- Read-only and write-only NVRAM variables, enhancing the security of OpenCore, Lilu, and Lilu plugins, like VirtualSMC, which implements `AuthRestart` support.
- NVRAM isolation, allowing to protect all variables from being written from an untrusted operating system (e.g. `DisableVariableWrite`).
- UEFI Runtime Services memory protection management to workaround read-only mapping (e.g. `EnableWriteUnprotector`).

## 11.6 Properties

### `APFS`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置 APFS 分区驱动，具体配置内容参见下文 `APFS Properties` 部分。

### `Audio`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置音频后端支持，具体配置如下文所述。

Audio support provides a way for upstream protocols to interact with the selected hardware and audio resources. All audio resources should reside in `\EFI\OC\Resources\Audio` directory. Currently the only supported audio file format is WAVE PCM. While it is driver-dependent which audio stream format is supported, most common audio cards support 16-bit signed stereo audio at 44100 or 48000 Hz.

Audio file path is determined by audio type, audio localisation, and audio path. Each filename looks as follows: `[audio type]_[audio localisation]_[audio path].wav`. For unlocalised files filename does not include the language code and looks as follows: `[audio type]_[audio path].wav`.

- Audio type can be `OCEFIAudio` for OpenCore audio files or `AXEFIAudio` for macOS bootloader audio files.
- Audio localisation is a two letter language code (e.g. `en`) with an exception for Chinese, Spanish, and Portuguese. Refer to [`APPLE_VOICE_OVER_LANGUAGE_CODE` definition](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h) for the list of all supported localisations.
- Audio path is the base filename corresponding to a file identifier. For macOS bootloader audio paths refer to [`APPLE_VOICE_OVER_AUDIO_FILE` definition](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h). For OpenCore audio paths refer to [`OC_VOICE_OVER_AUDIO_FILE` definition](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Protocol/OcAudio.h). The only exception is OpenCore boot chime file, which is `OCEFIAudio_VoiceOver_Boot.wav`.

Audio localisation is determined separately for macOS bootloader and OpenCore. For macOS bootloader it is set in `preferences.efires` archive in `systemLanguage.utf8` file and is controlled by the operating system. For OpenCore the value of `prev-lang:kbd` variable is used. When native audio localisation of a particular file is missing, English language (`en`) localisation is used. Sample audio files can be found in [OcBinaryData repository](https://github.com/acidanthera/OcBinaryData).

### `ConnectDrivers`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 驱动程序加载后执行 UEFI 控制器连接操作。

此选项对于加载某些遵循 UEFI 驱动模型的 驱动程序（如文件系统驱动、音频输出驱动）很有用，因为这些驱动可能无法自行启动。此选项对会自动连接的驱动程序来说是不必要的，并且可能会稍微减慢启动速度。

*注*：某些固件（特别是 Apple 的）仅连接包含操作系统的驱动器以加快启动过程。启用此选项可以在拥有多个驱动器时查看所有引导选项。

### `Drivers`

**Type**: `plist array`
**Failsafe**: None
**Description**: 从 `OC/Drivers` 目录下加载选择的驱动。

设计为填充 UEFI 驱动程序加载的文件名。

### `Input`

**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual settings designed for input (keyboard and mouse) in [Input Properties]() section below.

### `Output`

**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual settings designed for output (text and graphics) in [Output Properties]() section below.

### `ProtocolOverrides`

**Type**: `plist dict`
**Failsafe**: None
**Description**: Force builtin versions of select protocols described in [ProtocolOverrides Properties]() section below.

*注*：all protocol instances are installed prior to driver loading.

### `Quirks`

**Type**: `plist dict`
**Failsafe**: None
**Description**: Apply individual firmware quirks described in [Quirks Properties]() section below.

### `ReservedMemory`

**Type**: `plist array`
**Description**: Designed to be filled with `plist dict` values, describing memory areas exquisite to particular firmware and hardware functioning, which should not be used by the operating system. An example of such memory region could be second 256 MB corrupted by Intel HD 3000 or an area with faulty RAM.

## 11.7 APFS Properties

### `EnableJumpstart`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 从一个 APFS 容器中加载 APFS 驱动。

APFS 的 EFI 驱动内置在所有可以作为系统启动盘的 APFS 容器之中。这一选项将会根据基于 `ScanPolicy` 找到的 APFS 容器，从中加载 APFS 驱动。更多详情请查看 [苹果 APFS 文件系统参考手册](https://developer.apple.com/support/apple-file-system/Apple-File-System-Reference.pdf) 中的 `EFI Jummpstart` 章节。

### `HideVerbose`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 是否隐藏 APFS 驱动的 verbose 信息。

APFS 驱动的 verbose 信息有助于 debug。

### `JumpstartHotPlug`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 允许从进入 OpenCore 引导菜单后插入的可移除硬盘上的 APFS 容器中加载 APFS 驱动。

这一选项不仅提供了进入 OpenCore 以后再插入 U 盘的支持，而且还允许了在 OpenCore 引导菜单下 APFS U 盘的热插拔。

### `MinDate`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 允许加载的最老 APFS 驱动的发布日期

APFS 驱动的版本号基于其发布日期。较旧版本的 APFS 驱动可能与较新的系统不兼容、或者有未修补的漏洞。通过这一选项可以避免 OpenCore 加载过旧版本的 APFS 驱动。

- `0` - 使用默认数值。OpenCore 会随着未来更新，内置的默认数值也会不断更新。如果你会一直更新你的系统，我们推荐使用这一数值。目前默认数值为 `2018/06/21`。
- `-1` - 允许使用任何版本的 APFS 驱动（强烈不推荐）。
- 其他数值 - 数值格式应为形如 `20200401` 的格式。你可以从 OpenCore 的启动日志和 [OcApfsLib](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Library/OcApfsLib.h) 中找到 APFS 驱动的版本号。

### `MinVersion`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 允许加载的最老 APFS 驱动的版本号

APFS 驱动的版本号和 macOS 版本相关。较旧版本的 APFS 驱动可能与较新的系统不兼容、或者有未修补的漏洞。通过这一选项可以避免 OpenCore 加载过旧版本的 APFS 驱动。

- `0` - 使用默认数值。OpenCore 会随着未来更新，内置的默认数值也会不断更新。如果你会一直更新你的系统，我们推荐使用这一数值。目前默认数值选自 App Store 中能够下载到的 High Sierra（`748077008000000`）。
- `-1` - 允许使用任何版本的 APFS 驱动（强烈不推荐）。
- 其他数值 - 数值格式应为形如 `1412101001000000` 的格式（这是 macOS Catalina 10.15.4 的 APFS 驱动版本号）你可以从 OpenCore 的启动日志和 [OcApfsLib](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Library/OcApfsLib.h) 中找到 APFS 驱动的版本号。

## 11.8 Audio Properties

### `AudioCodec`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Codec address on the specified audio controller for audio support.

Normally this contains first audio codec address on the builtin analog audio controller (`HDEF`). Audio codec addresses, e.g. `2`, can be found in the debug log (marked in bold):

`OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(<redacted>,00000000) (4 outputs)`
`OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(<redacted>,00000000) (1 outputs)`
`OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(<redacted>,02000000) (7 outputs)`

As an alternative this value can be obtained from `IOHDACodecDevice` class in I/O Registry containing it in `IOHDACodecAddress` field.

### `AudioDevice`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: Device path of the specified audio controller for audio support.

Normally this contains builtin analog audio controller (`HDEF`) device path, e.g. `PciRoot(0x0)/Pci(0x1b,0x0)`. The list of recognised audio controllers can be found in the debug log (marked in bold):

`OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(<redacted>,00000000) (4 outputs)`
`OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(<redacted>,00000000) (1 outputs)`
`OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(<redacted>,02000000) (7 outputs)`

As an alternative `gfxutil -f HDEF` command can be used in macOS. Specifying empty device path will result in the first available audio controller to be used.

### `AudioOut`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Index of the output port of the specified codec starting from 0.

Normally this contains the index of the green out of the builtin analog audio controller (`HDEF`). The number of output nodes in the debug log (marked in bold):

`OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(<redacted>,00000000) (4 outputs)`
`OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(<redacted>,00000000) (1 outputs)`
`OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(<redacted>,02000000) (7 outputs)`

The quickest way to find the right port is to bruteforce the values from `0` to `N - 1`.

### `AudioSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 通过连接到固件音频驱动程序以激活音频支持。

Enabling this setting routes audio playback from builtin protocols to a dedicated audio port (`AudioOut`) of the specified codec (`AudioCodec`) located on the audio controller (`AudioDevice`).

### `MinimumVolume`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Minimal heard volume level from `0` to `100`.

Screen reader will use this volume level, when the calculated volume level is less than `MinimumVolume`. Boot chime sound will not play if the calculated volume level is less than `MinimumVolume`.

### `PlayChime`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 开机时播放 Mac 特有的风铃的声音。

Enabling this setting plays boot chime through builtin audio support. Volume level is determined by `MinimumVolume` and `VolumeAmplifier` settings and `SystemAudioVolume` NVRAM variable.

*Note*: this setting is separate from `StartupMute` NVRAM variable to avoid conflicts when the firmware is able to play boot chime.

### `VolumeAmplifier`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Multiplication coefficient for system volume to raw volume linear translation from `0` to `1000`.

Volume level range read from `SystemAudioVolume` varies depending on the codec. To transform read value in `[0, 127]` range into raw volume range
`[0, 100]` the read value is scaled to `VolumeAmplifier` percents:

```
RawVolume = MIN{ [(SystemAudioVolume * VolumeAmplifier) / 100], 100 }
```

*Note*: the transformation used in macOS is not linear, but it is very close and this nuance is thus ignored.

## 11.9 Input Properties

### `KeyFiltering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Enable keyboard input sanity checking.

Apparently some boards like GA Z77P-D3 may return uninitialised data in `EFI_INPUT_KEY` with all input protocols. This option discards keys that are neither ASCII, nor are defined in the UEFI specification (see tables 107 and 108 in version 2.8).

### `KeyForgetThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 两次按键之间的间隔时间，单位为毫秒。

`AppleKeyMapAggregator` 协议应该包含当前按下的键的固定长度的缓冲。但是大部分驱动程序仅将按键按下报告为中断、并且按住按键会导致在一定的时间间隔后再提交按下行为。一旦超时到期，我们就是用超时从缓冲区中删除一次按下的键，并且没有新提交。

此选项允许根据你的平台设置此超时。在大多数平台上有效的推荐值为 `5` 毫秒。作为参考，在 VMWare 上按住一个键大约每 2 毫秒就会重复一次，而在 APTIO V 上是 3 - 4 毫秒。因此，可以在较快的平台上设置稍低的值、在较慢的平台设置稍高的值，以提高响应速度。

### `KeyMergeThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 按住按键被重置的间隔时间，单位为毫秒。

与 `KeyForgetThreshold` 类似，这一选项适用于按键提交的顺序。为了能够识别同时按下的按键，我们需要设置一个超时时间，在这个时间内可以假定这两个按键是同时按下的。

对于 VMWare，同时按下多个键的间隔是 2 毫秒。对于 APTIO V 平台为 1 毫毛。一个接一个地按下按键会导致 6 毫秒和 10 毫秒的延迟。此选项的建议值为 2 毫秒，但对于较快的平台可以选取较小的值，反之亦然。

### `KeySupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用这一选项后将会开启内置键盘支持。

这一选项基于 `AppleGenericInput`（`AptioInputFix`），激活内部键盘拦截器驱动程序以填充 `AppleKeyMapAggregator` 数据库以实现输入功能。如果使用了单独的驱动程序（如 `AppleUsbKbDxe`），则永远不要开启这一选项。

### `KeySupportMode`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: 将内部键盘的输入转换设置为 `AppleKeyMapAggregator` 协议模式。

- `Auto` --- 从下述选项中自动选择
- `V1` --- UEFI 传统输入协议 `EFI_SIMPLE_TEXT_INPUT_PROTOCOL`.
- `V2` --- UEFI 现代标准输入协议 `EFI_SIMPLE_TEXT_INPUT_EX_PROTOCOL`.
- `AMI` --- APTIO 输入协议 `AMI_EFIKEYCODE_PROTOCOL`.

*Note*: Currently `V1`, `V2`, and `AMI` unlike `Auto` only do filtering of the particular specified protocol. This may change in the future versions.

### `KeySwap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用后将交换 `Command` 和 `Option`。

此选项对于 `Option` 键位于 `Command` 右侧的键盘来说会很有用。

### `PointerSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用后将试图修复 UEFI 选择器协议。

该选项通过选择 OEM 协议实现标准 UEFI 指针协议 `EFI_SIMPLE_POINTER_PROTOCOL`。该选项在 Z87 华硕主板可能有用（该主板的 `EFI_SIMPLE_POINTER_PROTOCOL` 存在问题）。

### `PointerSupportMode`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: 设置用于内部指针驱动程序的 OEM 协议。

目前只支持 `ASUS` 值，使用的是 Z87 和 Z97主板上的特殊协议。更多详情请参考 [`LongSoft/UefiTool#116`](https://github.com/LongSoft/UEFITool/pull/116)。

### `TimerResolution`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 固件始终刷新的频率（单位 100 纳秒）

设置较低的值可以提高界面和输入处理性能的响应能力。建议值为 `50000`（即 5 毫秒）或稍高一些。选择 ASUS Z87 主板时，请使用 `60000`，苹果主板请使用 `100000`。你也可以将此值保留为 0，由 OpenCore 自动计算。

## 11.10 Output Properties

### `TextRenderer`
**Type**: `plist string`
**Failsafe**: `BuiltinGraphics`
**Description**: 选择通过标准控制台输出的渲染器。

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

### `ConsoleMode`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Sets console output mode as specified with the `WxH` (e.g. `80x24`) formatted string.

Set to empty string not to change console mode. Set to `Max` to try to use largest available console mode. Currently `Builtin` text renderer supports only one console mode, so this option is ignored.

*注*：This field is best to be left empty on most firmwares.

### `Resolution`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 设置控制台的屏幕分辨率。

- Set to `WxH@Bpp` (e.g. `1920x1080@32`) or `WxH` (e.g. `1920x1080`) formatted string to request custom resolution from GOP if available.
- Set to empty string not to change screen resolution.
- Set to `Max` to try to use largest available screen resolution.

On HiDPI screens `APPLE_VENDOR_VARIABLE_GUID` `UIScale` NVRAM variable may need to be set to `02` to enable HiDPI scaling in in `Builtin` text renderer, FileVault 2 UEFI password interface, FileVault 2 UEFI password interface and boot screen logo. Refer to [Recommended Variables]() section for more details.

*注*：This will fail when console handle has no GOP protocol. When the firmware does not provide it, it can be added with `ProvideConsoleGop` set to `true`.

### `ClearScreenOnModeSwitch`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件在从图形模式切换到文本模式时，只会清除部分屏幕、而会留下一部分之前绘制的图像。启用这一选项后，在切换到文本模式之前会用黑色填充整个图形屏幕。

*注*：这一选项只会在 `System` 渲染器上生效。

### `DirectGopRendering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Use builtin graphics output protocol renderer for console.

On some firmwares this may provide better performance or even fix rendering issues, like on `MacPro5,1`. However it is recommended not to use this option unless there is an obvious benefit as it may even result in slower scrolling.

### `IgnoreTextInGraphics`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Select firmwares output text onscreen in both graphics and text mode. This is normally unexpected, because random text may appear over graphical images and cause UI corruption. Setting this option to `true` will discard all text output when console control is in mode different from `Text`.

*注*：This option only applies to `System` renderer.

### `ReplaceTabWithSpace`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Some firmwares do not print tab characters or even everything that follows them, causing difficulties or inability to use the UEFI Shell builtin text editor to edit property lists and other documents. This option makes the console output spaces instead of tabs.

*注*：This option only applies to `System` renderer.

### `ProvideConsoleGop`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Ensure GOP (Graphics Output Protocol) on console handle.

macOS bootloader requires GOP to be present on console handle, yet the exact location of GOP is not covered by the UEFI specification. This option will ensure GOP is installed on console handle if it is present.

*注*：This option will also replace broken GOP protocol on console handle, which may be the case on `MacPro5,1` with newer GPUs.

### `ReconnectOnResChange`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Reconnect console controllers after changing screen resolution.

On some firmwares when screen resolution is changed via GOP, it is required to reconnect the controllers, which produce the console protocols (simple text out). Otherwise they will not produce text based on the new resolution.

*注*：On several boards this logic may result in black screen when launching OpenCore from Shell and thus it is optional. In versions prior to 0.5.2 this option was mandatory and not configurable. Please do not use this unless required.

### `SanitiseClearScreen`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Some firmwares reset screen resolution to a failsafe value (like `1024x768`) on the attempts to clear screen contents when large display (e.g. 2K or 4K) is used. This option attempts to apply a workaround.

*注*：This option only applies to `System` renderer. On all known affected systems `ConsoleMode` had to be set to empty string for this to work.

## 11.11 Protocols Properties

### `AppleAudio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Reinstalls Apple audio protocols with builtin versions.

Apple audio protocols allow macOS bootloader and OpenCore to play sounds and signals for screen reading or audible error reporting. Supported
protocols are beep generation and VoiceOver. VoiceOver protocol is specific to Gibraltar machines (T2) and is not supported before macOS High Sierra (10.13). Instead older macOS versions use AppleHDA protocol, which is currently not implemented.

Only one set of audio protocols can be available at a time, so in order to get audio playback in OpenCore user interface on Mac system implementing some of these protocols this setting should be enabled.

*Note*: Backend audio driver needs to be configured in `UEFI Audio` section for these protocols to be able to stream audio.

### `AppleBootPolicy`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Boot Policy 协议，可用于确保 VM 或旧版 Mac 设备上的 APFS 兼容性。

*注*：某些 Mac 设备（如 `MacPro5,1`）虽然兼容 APFS，但是其 Apple Boot Policy 协议包含了恢复分区检测问题，因此也建议启用这一选项。

### `AppleDebugLog`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple 调试日志输出协议。

### `AppleEvent`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Event 协议，可以确保在 VM 或旧版 Mac 设备上的 Faile Vault V2 兼容性。

### `AppleImageConversion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Image Conservation 协议。

### `AppleKeyMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Key Map 协议。

### `AppleRtcRam`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple RTC RAM 协议。

*注*：内置的 Apple RTC RAM 协议可能会过滤掉 RTC 内存地址的潜在 I/O。地址列表可以在 `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:rtc-blacklist` 中以数组的方式指定。

### `AppleSmcIo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 SMC I/O 协议。

这一协议代替了传统的 `VirtualSmc.efi`，并与所有 SMC kext 驱动兼容。如果你在用 FakeSMC，可能需要手动往 NVRAM 中添加键值对。

### `AppleUserInterfaceTheme`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple User Interface Theme 协议。

### `DataHub`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装具有内置版本的 Data Hub 协议。如果已经安装了协议，这将删除所有先前的属性。

### `DeviceProperties`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置版本的 Device Property 协议。 如果已经安装，它将删除所有以前的属性。这一选项可用于确保在 VM 或旧版 Mac 设备上的兼容性。

### `FirmwareVolume`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制包装固件卷协议或安装新版本以支持 File Vault 2 的自定义光标图像。建议启用这一选项以确保 File Vault 2 在除 VM 和传统 Mac 设备之外的兼容性。

*注*：包括 VMWare 在内的多个虚拟机在 HiDPI 模式下光标会损坏，因此建议为所有虚拟机启用这一选项。

### `HashServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制重新安装内置版本的 Hash Services 协议。为了在 SHA-1 哈希协议不完整的固件上确保 File Vault 2 的兼容性，这一 Quirk 应设置为 `true`。对于大多数固件来说，你可以通过将 `UIScale` 设置为 `02` 查看是否会出现禁行图标，来诊断你的固件是否需要这一 Quirk。一般来说，APTIO V（Haswell 和更早的平台）之前的平台都会受到影响。

### `OSInfo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制使用内置版本重新安装 OS Info 协议。该协议通常用于通过固件或其他应用程序从 macOS 引导加载程序接收通知。

### `UnicodeCollation`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制重新安装内置版本的 Unicode Collation 服务。建议启用这一选项以确保 UEFI Shell 的兼容性。一些较旧的固件破坏了 Unicode 排序规则, 启用后可以修复这些系统上 UEFI Shell 的兼容性 (通常为用于 IvyBridge 或更旧的设备)

## 11.12 Quirks 

### `DeduplicateBootOrder`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Remove duplicate entries in `BootOrder` variable in `EFI_GLOBAL_VARIABLE_GUID`.

This quirk requires `RequestBootVarRouting` to be enabled and therefore `OC_FIRMWARE_RUNTIME` protocol implemented in `OpenRuntime.efi`.

By redirecting `Boot` prefixed variables to a separate GUID namespace with the help of `RequestBootVarRouting` quirk we achieve multiple goals:

- Operating systems are jailed and only controlled by OpenCore boot environment to enhance security.
- Operating systems do not mess with OpenCore boot priority, and guarantee fluent updates and hibernation wakes for cases that require reboots with OpenCore in the middle.
- Potentially incompatible boot entries, such as macOS entries, are not deleted or anyhow corrupted.

However, some firmwares do their own boot option scanning upon startup by checking file presence on the available disks. Quite often this scanning includes non-standard locations, such as Windows Bootloader paths. Normally it is not an issue, but some firmwares, ASUS firmwares on APTIO V in particular, have bugs. For them scanning is implemented improperly, and firmware preferences may get accidentally corrupted due to `BootOrder` entry duplication (each option will be added twice) making it impossible to boot without cleaning NVRAM.

To trigger the bug one should have some valid boot options (e.g. OpenCore) and then install Windows with `RequestBootVarRouting` enabled. As Windows bootloader option will not be created by Windows installer, the firmware will attempt to create it itself, and then corrupt its boot option list.

This quirk removes all duplicates in `BootOrder` variable attempting to resolve the consequences of the bugs upon OpenCore loading. It is recommended to use this key along with `BootProtect` option.

### `ExitBootServicesDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 在 `EXIT_BOOT_SERVICES` 事件后添加延迟，单位为毫秒。

这是一个非常丑陋的 Quirks，用于修复 `Still waiting for root device` 提示信息。在使用 FileVault 2 时，特别是华硕 Z87-Pro 等 APTIO IV 固件这种错误经常发生。似乎因为某种原因，FileVault 与 `EXIT_BOOT_SERVICES` 同时执行、导致 macOS 无法访问 SATA 控制器。未来应该会找到一个更好的方法。如果需要启用这一选项，设置 3-5 秒的延时就可以了。

### `IgnoreInvalidFlexRatio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Select firmwares, namely APTIO IV, may contain invalid values in `MSR_FLEX_RATIO` (`0x194`) MSR register. These values may cause macOS boot failure on Intel platforms.

*注*：While the option is not supposed to induce harm on unaffected firmwares, its usage is not recommended when it is not required.

### `ReleaseUsbOwnership`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试从固件驱动程序中分离 USB 控制器所有权。尽管大多数固件都设法正确执行了该操作或者提供有一个选项，但某些固件没有，从而导致操作系统可能会在启动时冻结。除非需要，否则不建议启用这一选项。

### `RequestBootVarRouting`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 请求将所有带有 `Boot` 前缀的变量从 `EFI_GLOBAL_VARIABLE_GUID` 重定向到 `OC_VENDOR_VARIABLE_GUID`。

This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `OpenRuntime.efi`（原名 `FwRuntimeServices.efi`）. 当固件删除不兼容的启动条目时，这一 Quirk 可以让默认的启动条目保存在引导菜单中。简单地说就是，如果你想使用「系统偏好设置」中的「[启动磁盘](https://support.apple.com/HT202796)」，就必须启用这一 Quirk。

### `UnblockFsConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件通过「按驱动程序」模式下来阻止引导项加载。

*注*：如果惠普笔记本在 OpenCore 界面没有看到引导项时启用这一选项。

## 11.13 ReservedMemory Properties

### `Address`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Start address of the reserved memory region, which should be allocated as reserved effectively marking the memory of this type inaccessible to the operating system.

The addresses written here must be part of the memory map, have `EfiConventionalMemory` type, and page-aligned (4 KBs).

### `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### `Size`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: Size of the reserved memory region, must be page-aligned (4 KBs).

### `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: This region will not be reserved unless set to `true`.
