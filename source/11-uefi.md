---
title: 11. UEFI
description: UEFI 驱动以及加载顺序
type: docs
author_info: 由 xMuu、Sukka、derbalkon 整理，由 Sukka、derbalkon 翻译
last_updated: 2020-07-11
---

## 11.1 Introduction

[UEFI](https://uefi.org/specifications)（统一可扩展固件接口）是一种规范，用于定义操作系统和平台固件之间的软件接口。本部分允许加载其他 UEFI 模块 和/或 对板载固件进行调整。要检查固件内容，应用修改并执行升级，可以使用 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和其他实用程序。

## 11.2 Drivers

根据固件不同、可能需要不同的驱动程序。加载不兼容的驱动程序可能会导致无法启动系统，甚至导致固件永久性损坏。OpenCore 目前对以下 UEFI 驱动提供支持。OpenCore 可能兼容对其他 UEFI 驱动，但不能确定。

- [`CrScreenshotDxe`](https://github.com/acidanthera/OpenCorePkg) --- 截图驱动。启用后，按下 <kbd>F10</kbd> 将能够截图并保存在 EFI 分区根目录下。该驱动基于 [Nikolaj Schlej](https://github.com/NikolajSchlej ) 修改的 LongSoft 开发的 [`CrScreenshotDxe`](https://github.com/LongSoft/CrScreenshotDxe)。
- [`OpenRuntime`](https://github.com/acidanthera/OpenCorePkg) --- （原名 `FwRuntimeServices.efi`）`OC_FIRMWARE_RUNTIME` 协议通过支持只读、只写 NVRAM 变量，提升了 OpenCore 和 Lilu 的安全性。有些 Quirks 如 `RequestBootVarRouting` 依赖此驱动程序。由于 runtime 驱动的性质（与目标操作系统并行运行），因此它不能在 OpenCore 本身实现，而是与 OpenCore 捆绑在一起。
- [`HiiDatabase`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 HII 服务驱动。Ivy Bridge 及其以后的大多数固件中都已内置此驱动程序。某些带有 GUI 的应用程序（例如 UEFI Shell）可能需要此驱动程序才能正常工作。
- [`EnhancedFatDxe`](https://github.com/acidanthera/audk) --- 来自 `FatPkg` 的 FAT 文件系统驱动程序。这个驱动程序已经被嵌入到所有 UEFI 固件中，无法为 OpenCore 使用。众所周知，许多固件的 FAT 支持实现都有错误，导致在尝试写操作时损坏文件系统。如果在引导过程中需要写入 EFI 分区，则可能组要将此驱动程序嵌入固件中。
- [`NvmExpressDxe`](https://github.com/acidanthera/audk) --- 来自`MdeModulePkg` 的 NVMe 驱动程序。从 Broadwell 一代开始的大多数固件都包含此驱动程序。对于 Haswell 以及更早的版本，如果安装了 NVMe SSD 驱动器，则将其嵌入固件中可能会更理想。
- [`OpenUsbKbDxe`](https://github.com/acidanthera/OpenCorePkg) --- USB 键盘驱动在自定义 USB 键盘驱动程序的基础上新增了对 `AppleKeyMapAggregator` 协议的支持。这是内置的 `KeySupport` 的等效替代方案。根据固件不同，效果可能会更好或者更糟。
- [`HfsPlus`](https://github.com/acidanthera/OcBinaryData) - Apple 固件中常见的具有 Bless 支持的专有 HFS 文件系统驱动程序。对于 `Sandy Bridge` 和更早的 CPU，由于这些 CPU 缺少 `RDRAND` 指令支持，应使用 `HfsPlusLegacy` 驱动程序。
- [`VBoxHfs`](https://github.com/acidanthera/OpenCorePkg) --- 带有 bless 支持的 HFS 文件系统驱动。是 Apple 固件中 `HfsPlus` 驱动的开源替代。虽然功能完善，但是启动速度比 `HFSPlus` 慢三倍，并且尚未经过安全审核。
- [`XhciDxe`](https://github.com/acidanthera/audk) --- 来自 `MdeModulePkg` 的 XHCI USB controller 驱动程序。从 Sandy Bridge 代开始的大多数固件中都包含此驱动程序。在较早的固件或旧系统可以用于支持外部 USB 3.0 PCI 卡。
- [`AudioDxe`](https://github.com/acidanthera/OpenCorePkg) --- UEFI 固件中的 HDA 音频驱动程序，适用于大多数 Intel 和其他一些模拟音频控制器。参考 [acidanthera/bugtracker#740](https://github.com/acidanthera/bugtracker/issues/740) 来了解 AudioDxe 的已知问题。
- [`ExFatDxe`](https://github.com/acidanthera/OcBinaryData) --- 用于 Bootcamp 支持的专有 ExFAT 文件系统驱动程序，通常可以在 Apple 固件中找到。 对于 `Sandy Bridge` 和更早的 CPU，由于缺少 `RDRAND` 指令支持，应使用 `ExFatDxeLegacy` 驱动程序。
- [`Ps2KeyboardDxe`](https://github.com/acidanthera/audk) --- 从 `MdeModulePkg` 提取出来的 PS/2 键盘驱动。OpenDuetPkg 和一些固件可能不包括这个驱动，但对于 PS/2 键盘来说该驱动是必须的。注：和 `OpenUsbKbDxe` 不同，该驱动不提供对 `AppleKeyMapAggregator` 的支持、因此需要启用 `KeySupport` 这个 Quirk。
- [`Ps2MouseDxe`](https://github.com/acidanthera/audk) --- 从 `MdeModulePkg` 提取出来的 PS/2 鼠标驱动。该固件，虽然只有非常老旧的笔记本的固件中可能没有不包含该驱动，但是笔记本依赖该驱动才能在引导界面使用触控板。
- [`PartitionDxe`](https://github.com/acidanthera/OcBinaryData) --- 一个专门的分区管理驱动程序，用于加载旧版 macOS 的 DMG 映像（如 macOS 10.9 的分区映像）。对于 `Sandy Bridge` 或者更早的 CPU，由于缺少 `RDRAND` 指令支持，应使用 `PartitionDxeLegacy` 驱动程序。
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

*注 1*：你可能需要将 `/System/Library/CoreServices/BridgeVersion.bin` 拷贝到 `/Volumes/VOLNAME/DIR`。
*注 2*：为了能够使用 `bless`，你可能需要 [禁用 System Integrity Protection](https://developer.apple.com/library/archive/documentation/Security/Conceptual/System_Integrity_Protection_Guide/ConfiguringSystemIntegrityProtection/ConfiguringSystemIntegrityProtection.html)。
*注 3*：为了能够正常启动，你可能需要 [禁用 Secure Boot](https://support.apple.com/HT208330)（如果有的话）。

一些已知的 UEFI 工具（内置工具已用 `*` 标出）：

- [`BootKicker`](https://github.com/acidanthera/OpenCorePkg)* --- 进入 Apple 的 BootPicker 菜单（仅 Mac 同款显卡才可以使用）。
- [`ChipTune`](https://github.com/acidanthera/OpenCorePkg)* --- 测试 BeepGen 协议，生成不同频率和长度的音频信号。
- [`CleanNvram`](https://github.com/acidanthera/OpenCorePkg)* --- 重置 NVRAM，以一个单独的工具呈现。
- [`FwProtect`](https://github.com/acidanthera/OpenCorePkg)* --- 解锁和回锁 NVRAM 保护，让其他工具在从 OpenCore 启动时能够获得完整的 NVRAM 访问权限。
- [`GopStop`](https://github.com/acidanthera/OpenCorePkg)* --- 用一个 [简单的场景](https://github.com/acidanthera/OpenCorePkg/tree/master/Application/GopStop) 测试 GraphicOutput 协议。
- [`HdaCodecDump`](https://github.com/acidanthera/OpenCorePkg)* --- 解析和转储高清晰度音频编解码器（Codec）信息（需要 `AudioDxe`）。
- [`KeyTester`](https://github.com/acidanthera/OpenCorePkg)* --- 在 `SimpleText` 模式下测试键盘输入。
- [`MemTest86`](https://www.memtest86.com) --- 内存测试工具。
- [`OpenCore Shell`](https://github.com/acidanthera/OpenCorePkg)* --- 由 OpenCore 配置的 [`UEFI Shell`](http://github.com/tianocore/edk2)，与绝大部分固件兼容。
- [`PavpProvision`](https://github.com/acidanthera/OpenCorePkg) --- 执行 EPID 配置（需要配置证书数据）。
- [`ResetSystem`](https://github.com/acidanthera/OpenCorePkg)* --- 用于执行系统重置的实用程序。以重置类型作为参数：`ColdReset`, `Firmware`, `WarmReset`, `Shutdown`。默认为 `ColdReset`。
- [`RtcRw`](https://github.com/acidanthera/OpenCorePkg)* --- 读取和写入 RTC (CMOS) 存储器的使用程序。
- [`VerifyMsrE2`](https://github.com/acidanthera/OpenCorePkg)* --- 检查 `CFG Lock`（MSR `0xE2` 写保护）在所有 CPU 核心之间的一致性。

## 11.4 OpenCanopy

OpenCanopy 是一个 OpenCore 的图形化界面接口，基于 [OpenCorePkg](https://github.com/acidanthera/OpenCorePkg) `OcBootManagementLib` 实现，提供与现有的文字模式类似的功能。当 `PickerMode` 设置为 `External` 时启用。

OpenCanopy 所需的图象资源位于 `Resources` 目录下，一些简单的资源（字体和图标）可以在 [OcBinaryData 仓库](https://github.com/acidanthera/OcBinaryData) 中获取。字体为 12pt 的 Helvetica，比例缩放。

OpenCanopy 为 `PickerAttributes` 提供了全面的支持，并提供了一套可配置的内置图标集。默认选择的图标由 `DefaultBackgroundColor` 变量决定，当该变量的值定义为浅灰时，则使用 `Old` 前缀的图标，定义为其他颜色时则使用没有前缀名的图标。

预定义的图标放在 `\EFI\OC\Resources\Image` 目录下。下面提供了所支持的图标的完整列表（`.icns` 格式）。可选图标如未提供，将使用最接近的可用的图标。外置设备的条目将使用 `Ext` 前缀的图标（如 `OldExtHardDrive.icns`）。

- `Cursor` --- 鼠标光标（必需）。
- `Selected` --- 选定的项目（必需）。
- `Selector` --- 选择项目（必需）。
- `HardDrive` --- 通用的 OS（必需）。
- `Apple` --- Apple OS。
- `AppleRecv` --- Apple Recovery OS。
- `AppleTM` --- Apple Time Machine。
- `Windows` --- Windows。
- `Other` --- 自定义条目（见 `Entries`）。
- `ResetNVRAM` --- 重置 NVRAM 工具或系统动作。
- `Shell` --- 具有 UEFI Shell 名称的条目（如 `OpenShell`）。
- `Tool` --- 其他工具。

预定义的标签放在 `/EFI/OC/Resources/Label` 目录下。每个标签都有 `.lbl` 或 `.l2x` 的后缀，以代表缩放级别。完整的标签列表如下所示。所有标签都是必需的。

- `EFIBoot` --- 通用的 OS。
- `Apple` --- Apple OS。
- `AppleRecv` --- Apple Recovery OS。
- `AppleTM` --- Apple Time Machine。
- `Windows` --- Windows。
- `Other` --- 自定义条目（见 `Entries`）。
- `ResetNVRAM` --- 重置 NVRAM 工具或系统动作。
- `Shell` --- 具有 UEFI Shell 名称的条目（如 `OpenShell`）。
- `Tool` --- 其他工具。

字体格式对应于 [AngelCode binary BMF](https://www.angelcode.com/products/bmfont)。虽然有很多工具可以生成字体文件，但目前还是建议使用 [dpFontBaker](https://github.com/danpla/dpfontbaker) 来生成位图字体（[用 CoreText 达到最佳效果](https://github.com/danpla/dpfontbaker/pull/1)），并使用 [fonverter](https://github.com/usr-sse2/fonverter) 将其导出为二进制格式。

*注*：OpenCanopy 是一个试验性质的功能、不应用于日常使用。你可以在 [acidanthera/bugtracker#759](https://github.com/acidanthera/bugtracker/issues/759) 获取相关的详细信息。

## 11.5 OpenRuntime

`OpenRuntime` 是一个 OpenCore 的插件，提供了对 `OC_FIRMWARE_RUNTIME` 协议的实现。该协议对 OpenCore 的部分功能提供了支持，而这部分功能由于需要 Runtime（如操作系统）中运行、因此无法内置在 OpenCore 中。该协议提供了包括但不限于如下功能：

- NVRAM 命名空间，允许隔离操作系统对所选变量的访问（如 `RequestBootVarRouting` 或 `ProtectSecureBoot`）。
- 只读和只写的 NVRAM 变量，增强了 OpenCore、Lilu 以及 Lilu 插件的安全性，比如 VirtualSMC，实现了 `AuthRestart` 支持。
- NVRAM 隔离，能够保护所有变量避免被不信任的操作系统写入（如 `DisableVariableWrite`）。
- UEFI Runtime Services 内存保护管理，以避开只读映射的问题（如 `EnableWriteUnprotector`）。

## 11.6 Properties

### `APFS`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置 APFS 分区驱动，具体配置内容参见下文 `APFS Properties` 部分。

### `Audio`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置音频后端支持，具体配置如下文所述。

音频支持为上游协议提供了一种与所选硬件和音频资源交互的方式。所有音频资源应该保存在 `\EFI\OC\Resources\Audio` 目录。目前唯一支持的音频文件格式是 WAVE PCM。虽然支持哪种音频流格式取决于驱动程序，但大多数常见的音频卡都支持 44100 或 48000Hz 的 16 位立体声。

音频文件的路径是由音频的类型、本地化语言和路径决定的。每个文件名看起来都类似于：`[audio type]_[audio localisation]_[audio path].wav`。对于没有本地化的文件，其文件名不包含语言代码，看起来类似于：`[audio type]_[audio path].wav`。

- OpenCore 音频文件的音频类型可以是 `OCEFIAudio`，macOS 引导程序的音频文件的音频类型可以是 `AXEFIAudio`。
- 音频本地化语言由两个字母的语言代码表示（如 `en`），中文、西班牙语和葡萄牙语除外。具体请看 [`APPLE_VOICE_OVER_LANGUAGE_CODE` 的定义](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h) 来了解所有支持的本地化列表。
- 音频路径是对应于文件标识符的基本文件名。macOS 引导程序的音频路径参考 [`APPLE_VOICE_OVER_AUDIO_FILE` 的定义](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h)。OpenCore 的音频路径参考 [`OC_VOICE_OVER_AUDIO_FILE` 的定义](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Protocol/OcAudio.h)。唯一例外的是 OpenCore 启动提示音文件：`OCEFIAudio_VoiceOver_Boot.wav`。

macOS 引导程序和 OpenCore 的音频本地化是分开的。macOS 引导程序是在 `systemLanguage.utf8` 文件中的 `preferences.efires` 归档中设置，并由操作系统控制。OpenCore 则是使用 `prev-lang:kbd` 变量的值来控制。当某一特定文件的音频本地化缺失时，将会使用英语（`en`）来代替。示例音频文件可以在 [OcBinaryData 仓库](https://github.com/acidanthera/OcBinaryData) 中找到。

### `ConnectDrivers`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 驱动程序加载后执行 UEFI 控制器连接操作。

此选项对于加载某些遵循 UEFI 驱动模型的 驱动程序（如文件系统驱动、音频输出驱动）很有用，因为这些驱动可能无法自行启动。此选项对会自动连接的驱动程序来说是不必要的，并且可能会稍微减慢启动速度。

*注*：某些固件（特别是 Apple 的）仅连接包含操作系统的驱动器以加快启动过程。启用此选项可以在拥有多个驱动器时查看所有引导选项。

### `Drivers`

**Type**: `plist array`
**Failsafe**: None
**Description**: 从 `OC/Drivers` 目录下加载选择的驱动。设计为填充 UEFI 驱动程序加载的文件名。

### `Input`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Input Properties 部分，应用为输入（键盘和鼠标）而设计的个性化设置。

### `Output`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Output Properties 部分，应用为输出（文本和图形）而设计的个性化设置。

### `ProtocolOverrides`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 强制执行从下面的 ProtocolOverrides Properties 部分所选协议的内置版本。

*注*：所有协议实例的安装都优先于驱动程序的加载。

### `Quirks`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Quirks Properties 部分，应用个性化的固件 Quirks。

### `ReservedMemory`

**Type**: `plist array`
**Description**: 设计为用 `plist dict` 值填充，用于描述对特定固件和硬件功能要求很高的内存区域，这些区域不应该被操作系统使用。比如被 Intel HD 3000 破坏的第二个 256MB 区域，或是一个有错误的 RAM 的区域。

## 11.7 APFS Properties

### `EnableJumpstart`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 从一个 APFS 容器中加载 APFS 驱动。

APFS 的 EFI 驱动内置在所有可以作为系统启动盘的 APFS 容器之中。这一选项将会根据基于 `ScanPolicy` 找到的 APFS 容器，从中加载 APFS 驱动。更多详情请查看 [苹果 APFS 文件系统参考手册](https://developer.apple.com/support/apple-file-system/Apple-File-System-Reference.pdf) 中的 `EFI Jummpstart` 章节。

### `GlobalConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 APFS 加载期间执行完整的设备连接。

代替通常情况下用于 APFS 驱动程序加载的分区句柄连接，每一个句柄都是递归连接的。这可能会比平时花费更多的时间，但是是某些固件访问 APFS 分区的唯一方法，比如在旧的惠普笔记本电脑上发现的那样。

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
**Description**: 特定音频控制器上的编解码器地址，用于音频支持。

一般来说，这里包含了内置模拟音频控制器（`HDEF`）上的第一个音频编解码器地址。音频编解码器地址（比如 `2`）可以在调试日志中找到（已用粗斜体标出）：

<code>OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(<redacted>,<strong><em>00000000</em></strong>) (4 outputs)</code>
<code>OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(<redacted>,<strong><em>00000000</em></strong>) (1 outputs)</code>
<code>OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(<redacted>,<strong><em>02000000</em></strong>) (7 outputs)</code>

作为一种替代方案，该值可以在 I/O 注册表的 `IOHDACodecDevice` class 中获得，包含在 `IOHDACodecAddress` 字段中。

### `AudioDevice`

**Type**: `plist string`
**Failsafe**: empty string
**Description**: 特定音频控制器的设备路径，用于音频支持。

一般来说，这里包含了内置模拟音频控制器（`HDEF`）的设备路径，比如 `PciRoot(0x0)/Pci(0x1b,0x0)`。认可的音频控制器列表可以在调试日志中找到（已用粗斜体标出）：

<code>OCAU: 1/3 <strong><em>PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)</em></strong>/VenMsg(<redacted>,00000000) (4 outputs)</code>
<code>OCAU: 2/3 <strong><em>PciRoot(0x0)/Pci(0x3,0x0)</em></strong>/VenMsg(<redacted>,00000000) (1 outputs)</code>
<code>OCAU: 3/3 <strong><em>PciRoot(0x0)/Pci(0x1B,0x0)</em></strong>/VenMsg(<redacted>,02000000) (7 outputs)</code>

作为一种替代方案，可以在 macOS 中通过 `gfxutil -f HDEF` 命令来获取。如果指定了空的设备路径，则会使用第一个可用的音频控制器。

### `AudioOut`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 特定编解码器的输出端口的索引，从 `0` 开始。

一般来说，这里包含了内置模拟音频控制器（`HDEF`）的绿色输出的索引。调试日志中输出节点的数量如下（已用粗斜体标出）：

<code>OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(<redacted>,00000000) (<strong><em>4 outputs</em></strong>)</code>
<code>OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(<redacted>,00000000) (<strong><em>1 outputs</em></strong>)</code>
<code>OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(<redacted>,02000000) (<strong><em>7 outputs</em></strong>)</code>

找到正确端口的最快办法就是暴力地尝试 `0` 到 `N - 1` 的值。

### `AudioSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 通过连接到固件音频驱动程序以激活音频支持。

启用此设置可将音频播放从内置协议路由到音频控制器（`AudioDevice`）上指定编解码器（`AudioCodec`）的专用音频端口（`AudioOut`）。

### `MinimumVolume`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 听到的最小音量水平，从 `0` 到 `100`。

当计算出的音量小于 `MinimumVolume` 时，屏幕阅读器将使用这个音量。当计算出的音量小于 `MinimumVolume`，则不播放 Mac 特有的开机启动声音。

### `PlayChime`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 开机时播放 Mac 特有的风铃的声音。

启用此设置可通过内置的音频支持来播放开机时播放的声音。音量大小由 `MinimumVolume` 和 `VolumeAmplifier` 的设置，以及 `SystemAudioVolume` NVRAM 变量来决定。

*注*：此设置与 `StartupMute` NVRAM 变量是分开的，以避免在固件能够播放启动铃声时发生冲突。

### `VolumeAmplifier`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 系统音量到原始音量的线性换算的乘法系数，从 `0` 到 `1000`。

从 `SystemAudioVolume` 读取的音量范围会因编解码器的不同而不同。为了将 `[0, 127]` 范围内的值转换为原始音量范围 `[0, 100]` 内的值，所读取的值按比例调整为 `VolumeAmplifier` 的百分数：

```
RawVolume = MIN{ [(SystemAudioVolume * VolumeAmplifier) / 100], 100 }
```

*注*：macOS 中使用的转换并不是线性的，但非常接近，因此我们忽略了这种细微差别。

## 11.9 Input Properties

### `KeyFiltering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用键盘输入的合理性检查。

显然，有些主板，如 GA Z77P-D3，可能会在 `EFI_INPUT_KEY` 中返回所有输入协议的未初始化数据。这个选项会舍弃那些既不是 ASCII 码，也不是 UEFI 规范中定义的键（见版本 2.8 的表 107 和 108）。

### `KeyForgetThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 两次按键之间的间隔时间，单位为毫秒。

`AppleKeyMapAggregator` 协议应该包含当前按下的键的固定长度的缓冲。但是大部分驱动程序仅将按键按下报告为中断、并且按住按键会导致在一定的时间间隔后再提交按下行为。一旦超时到期，我们就是用超时从缓冲区中删除一次按下的键，并且没有新提交。

此选项允许根据你的平台设置此超时。在大多数平台上有效的推荐值为 `5` 毫秒。作为参考，在 VMWare 上按住一个键大约每 2 毫秒就会重复一次，而在 APTIO V 上是 3 - 4 毫秒。因此，可以在较快的平台上设置稍低的值、在较慢的平台设置稍高的值，以提高响应速度。

*注*：某些平台可能需要更高或者更低的值。例如，当 OpenCanopy 检测到按键丢失的时候，尝试稍高的值（比如增加到 `10`），当检测到按键停滞时，尝试稍低的值。由于每个平台各不相同，因此检查从 `1` 到 `25` 的每个值可能会比较合理。

### `KeyMergeThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 按住按键被重置的间隔时间，单位为毫秒。

与 `KeyForgetThreshold` 类似，这一选项适用于按键提交的顺序。为了能够识别同时按下的按键，我们需要设置一个超时时间，在这个时间内可以假定这两个按键是同时按下的。

对于 VMWare，同时按下多个键的间隔是 2 毫秒。对于 APTIO V 平台为 1 毫秒。一个接一个地按下按键会导致 6 毫秒和 10 毫秒的延迟。此选项的建议值为 2 毫秒，但对于较快的平台可以选取较小的值，反之亦然。

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

*注*：目前 `V1`、`V2` 和 `AMI` 区别于 `Auto`，只对特定的协议进行过滤。这种情况在未来的版本中可能会改变。

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

设置较低的值可以提高界面和输入处理性能的响应能力。建议值为 `50000`（即 5 毫秒）或稍高一些。选择 ASUS Z87 主板时，请使用 `60000`，苹果主板请使用 `100000`。你也可以将此值保留为 `0`，由 OpenCore 自动计算。

## 11.10 Output Properties

### `TextRenderer`
**Type**: `plist string`
**Failsafe**: `BuiltinGraphics`
**Description**: 选择通过标准控制台输出的渲染器。

目前支持两种渲染器：`Builtin` 和 `System`。`System` 渲染器使用固件服务进行文本渲染。`Builtin` 渲染器则绕过固件服务，自行渲染文本。不同的渲染器支持的选项也不同。建议使用 `Builtin` 渲染器，因为它支持 HiDPI 模式，并能够使用全屏分辨率。

UEFI 固件一般用两种渲染模式来支持 `ConsoleControl`：`Graphics` 和 `Text`。有些固件不支持 `ConsoleControl` 和渲染模式。OpenCore 和 macOS 希望文本只在 `Graphics` 模式下显示，而图形可以在任何模式下绘制。由于 UEFI 规范并不要求这样做，因此具体的行为各不相同。

有效值为文本渲染器和渲染模式的组合：

- `BuiltinGraphics` --- 切换到 `Graphics` 模式，并使用 `Builtin` 渲染器和自定义 `ConsoleControl`。
- `SystemGraphics` --- 切换到 `Graphics` 模式，并使用 `System` 渲染器和自定义 `ConsoleControl`。
- `SystemText` --- 切换到 `Text` 模式，并使用 `System` 渲染器和自定义 `ConsoleControl`。
- `SystemGeneric` --- 使用 `System` 渲染器和系统 `ConsoleControl`，前提是它们能正常工作。

`BuiltinGraphics` 的用法通常是比较直接的。对于大多数平台，需要启用 `ProvideConsoleGop`，将 `Resolution` 设置为 `Max`。

`System` 协议的用法比较复杂。一般来说，首选设置 `SystemGraphics` 或 `SystemText`。启用 `ProvideConsoleGop`，将 `Resolution` 设置为 `Max`，启用 `ReplaceTabWithSpace` 几乎在所有平台上都很有用。`SanitiseClearScreen`、`IgnoreTextInGraphics` 和 `ClearScreenOnModeSwitch` 比较特殊，它们的用法取决于固件。

*注*：某些 Mac，比如 `MacPro5,1`，在使用较新的 GPU 时，可能会出现控制台输出中断的情况，因此可能只有 `BuiltinGraphics` 对它们有效。

### `ConsoleMode`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 按照 `WxH`（例如 `80x24`）格式的字符串所指定的方式设置控制台的输出模式。

设置为空字符串则不会改变控制台模式。设置为 `Max` 则会尝试最大的可用控制台模式。目前 `Builtin` 文本渲染器只支持一种控制台模式，所以该选项可以忽略。

*注*：在大多数固件上，这个字段最好留空。

### `Resolution`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 设置控制台的屏幕分辨率。

- 设置为 `WxH@Bpp`（如 `1920x1080@32`）或 `WxH`（如 `1920x1080`）格式的字符串，向 GOP 请求自定义分辨率。
- 设置为空字符串，不改变屏幕分辨率。
- 设置为 `Max`，尝试使用最大的可用屏幕分辨率。

在 HiDPI 屏幕上，`APPLE_VENDOR_VARIABLE_GUID` `UIScale` NVRAM 变量可能需要设置为 `02`，以便在 `Builtin` 文本渲染器、FileVault 2 UEFI 密码界面和启动界面 logo 启用 HiDPI 缩放。更多细节请参考 [Recommended Variables](https://oc.skk.moe/9-nvram.html#9-4-Recommended-Variables) 部分。

*注*：当控制台句柄没有 GOP 协议时，这些设置会失败。当固件不再提供时，可以将 `ProvideConsoleGop` 设置为 `true` 并添加。

### `ClearScreenOnModeSwitch`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件在从图形模式切换到文本模式时，只会清除部分屏幕、而会留下一部分之前绘制的图像。启用这一选项后，在切换到文本模式之前会用黑色填充整个图形屏幕。

*注*：这一选项只会在 `System` 渲染器上生效。

### `DirectGopRendering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为控制台使用内置的图形输出协议渲染器。

在某些固件上，这样做可能会提供更优的性能，甚至修复渲染问题，比如 `MacPro5,1`。但是，除非有明显的好处，否则还是建议不要使用这个选项，因为可能会导致滚动速度变慢。

### `IgnoreTextInGraphics`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 选择固件同时在图形和文本两种模式下在屏幕上输出文本。通常不会这样做，因为随机的文本可能会出现在图形图像上，并导致用户界面出错。将此选项设置为 `true` 时，会在控制台处于与 `Text` 不同的模式时，舍弃所有文本输出。

*注*：这一选项只会在 `System` 渲染器上生效。

### `ReplaceTabWithSpace`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件不会打印 tab 符号，甚至不打印 tab 后面的所有内容，导致很难或根本无法用 UEFI Shell 内置的文本编辑器来编辑属性列表和其他文档。这个选项会使控制台输出空格来替代 tab。

*注*：这一选项只会在 `System` 渲染器上生效。

### `ProvideConsoleGop`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 确保控制台句柄上有 GOP (Graphics Output Protocol)。

macOS bootloader 要求控制台句柄上必须有 GOP 或 UGA（适用于 10.4 EfiBoot），但 UEFI 规范并未涵盖图形协议的确切位置。此选项会确保 GOP 和 UGA（如果存在）在控制台句柄上可用。

*注*：这个选项也会替换掉控制台句柄上损坏的 GOP 协议，在使用较新的 GPU 的 `MacPro5,1` 时可能会出现这种情况。

### `ReconnectOnResChange`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 改变屏幕分辨率后重新连接控制台控制器。

当通过 GOP 改变屏幕分辨率时，某些固件需要重新连接产生控制台协议（简单的文本输出）的控制器，否则它们不会根据新的分辨率生成文本。

*注*：当 OpenCore 从 Shell 启动时，这个逻辑可能会导致某些主板黑屏，因此这个选项是非必须的。在 0.5.2 之前的版本中，这个选项是强制性的，不可配置。除非需要，否则请不要使用该选项。

### `SanitiseClearScreen`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件在使用较大的显示器（如 2K 或 4K）时，清除屏幕内容会导致屏幕分辨率重置为 failsafe 值（如 `1024x768`）。这个选项为这种情况提供了一个变通方法。

*注*：这一选项只会在 `System` 渲染器上生效。在所有已知的受影响的系统中，`ConsoleMode` 必须设置为空字符串才能正常工作。

### `UgaPassThrough`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 GOP 协议的顶部提供 UGA 协议实例。

有些固件不会去实现老旧的 UGA 协议，但是有些更老的 EFI 应用程序（如 10.4 的 Efiboot）可能需要用它来进行屏幕输出。

## 11.11 Protocols Properties

### `AppleAudio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置版本的 Apple 音频协议。

Apple 音频协议允许 macOS bootloader 和 OpenCore 播放声音和信号，用于屏幕阅读或可闻及的错误报告。支持的协议有生成「哔」声和 VoiceOver。VoiceOver 协议是带有 T2 芯片的机器特有的，不支持 macOS High Sierra (10.13) 之前的版本。旧版 macOS 版本使用的是 AppleHDA 协议，目前还没有实现。

每次只能有一组音频协议可用，所以如果为了在 Mac 系统上的 OpenCore 用户界面实现其中一些协议的音频播放，这一设置应该启用。

*注*：后端音频驱动需要在 `UEFI Audio` 部分进行配置，以便这些协议能够流式传输音频。

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

### `AppleFramebufferInfo`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Framebuffer Info 协议。这样可以覆盖虚拟机或者旧款 Mac 上的缓冲帧信息，从而提高与旧版 EfiBoot（如 macOS 10.4 中的 EfiBoot）的兼容性。

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
**Description**: 删除 `EFI_GLOBAL_VARIABLE_GUID` 中 `BootOrder` 变量的重复条目。

这个 Quirk 需要启用 `RequestBootVarRouting`，因此需要 `OpenRuntime.efi` 中实现的 `OC_FIRMWARE_RUNTIME` 协议。

通过 `RequestBootVarRouting` 的帮助，将 `Boot` 前缀变量重定向到一个单独的 GUID 命名空间，我们实现了这几个目标：

- 囚禁操作系统，让它只受 OpenCore 启动环境的控制，增强安全性。
- 操作系统不会打乱 OpenCore 的启动优先级，在系统更新和休眠唤醒等需要 OpenCore 参与的需要重启的情况下，保证了流畅性。
- 潜在的不兼容的启动项，如 macOS 项，不会被删除或被损坏。

然而，一些固件会在启动时通过检查可用磁盘上的文件来进行自己的启动选项扫描。通常这种扫描包括非标准位置，如 Windows bootloader 路径。一般来说这不成问题，但某些固件，特别是 APTIO V 的华硕固件会有 bug。对于它们来说，扫描的执行并不正确，固件的首选项可能会因为 `BootOrder` 条目重复而被意外损坏（每个选项会被添加两次），导致在不重置 NVRAM 的情况下无法启动。

要触发这个 bug，必须要有一些有效的启动选项（如 OpenCore），然后在启用 `RequestBootVarRouting` 的情况下安装 Windows。由于 Windows bootloader 选项不会被 Windows 安装程序创建，因此固件会尝试自己创建，于是破坏了它的启动选项列表。

这个 Quirk 会删除 `BootOrder` 变量中所有重复的内容，尝试解决 OpenCore 加载时出现的 bug。建议将此键值与 `BootProtect` 选项一起使用。

### `ExitBootServicesDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 在 `EXIT_BOOT_SERVICES` 事件后添加延迟，单位为毫秒。

这是一个非常丑陋的 Quirks，用于修复 `Still waiting for root device` 提示信息。在使用 FileVault 2 时，特别是华硕 Z87-Pro 等 APTIO IV 固件这种错误经常发生。似乎因为某种原因，FileVault 与 `EXIT_BOOT_SERVICES` 同时执行、导致 macOS 无法访问 SATA 控制器。未来应该会找到一个更好的方法。如果需要启用这一选项，设置 3-5 秒的延时就可以了。

### `IgnoreInvalidFlexRatio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件，即 APTIO IV，可能在 `MSR_FLEX_RATIO` (`0x194`) MSR 寄存器中含有无效值。这些值可能会导致 macOS 在 Intel 平台上启动失败。

*注*：虽然该选项不会对不受影响的固件造成损害，但在不需要的情况下不建议启用。

### `ReleaseUsbOwnership`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试从固件驱动程序中分离 USB 控制器所有权。尽管大多数固件都设法正确执行了该操作或者提供有一个选项，但某些固件没有，从而导致操作系统可能会在启动时冻结。除非需要，否则不建议启用这一选项。

### `RequestBootVarRouting`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 请求将所有带有 `Boot` 前缀的变量从 `EFI_GLOBAL_VARIABLE_GUID` 重定向到 `OC_VENDOR_VARIABLE_GUID`。

启用这个 Quirk 需要在 `OpenRuntime.efi` 中实现的 `OC_FIRMWARE_RUNTIME` 协议（原名 `FwRuntimeServices.efi`）。当固件删除不兼容的启动条目时，这一 Quirk 可以让默认的启动条目保存在引导菜单中。简单地说就是，如果你想使用「系统偏好设置」中的「[启动磁盘](https://support.apple.com/HT202796)」，就必须启用这一 Quirk。

### `TscSyncTimeout`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 尝试用指定的 Timeout 执行 TSC 同步。

这个 Quirk 的主要目的是在运行 XNU 调试内核时，在一些服务器和笔记本型号上实现早期引导 TSC 同步。对于调试内核，在任何 kext 可能导致其他解决方案出现问题之前，TSC 需要在各个内核之间保持同步。Timeout 以微秒为单位，取决于平台上存在的核心数量，推荐的起始值是 `500000`。

这是一个实验性的 Quirk，只能被用于上述问题。在其他情况下，这个 Quirk 可能会导致操作系统不稳定，所以并不推荐使用。在其他情况下，推荐的解决办法是安装一个内核驱动，如 [VoodooTSCSync](https://github.com/RehabMan/VoodooTSCSync)、[TSCAdjustReset](https://github.com/interferenc/TSCAdjustReset) 或 [CpuTscSync](https://github.com/lvs1974/CpuTscSync)（是 VoodooTSCSync 的一个更有针对性的变种，适用于较新的笔记本电脑）。

*注*：这个 Quirk 不能取代内核驱动的原因是它不能在 ACPI S3 模式（睡眠唤醒）下运行，而且 UEFI 固件提供的多核心支持非常有限，无法精确地更新 MSR 寄存器。

### `UnblockFsConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件通过「按驱动程序」模式下来阻止引导项加载。

*注*：如果惠普笔记本在 OpenCore 界面没有看到引导项时启用这一选项。

## 11.13 ReservedMemory Properties

### `Address`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 保留内存区域的起始地址，该区域应被分配为保留区，有效地将此类型的内存标记标记为操作系统不可访问。

这里写的地址必须是内存映射的一部分，具有 `EfiConventionalMemory` 类型，并且按页对齐（4KBs）。

### `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。该值取决于具体的实现定义。

### `Size`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 保留的内存区域的大小，必须按页对齐（4KBs）。

### `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非设置为 `true`，否则该区域不会被保留。
