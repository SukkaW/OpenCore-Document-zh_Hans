---
title: 11. UEFI
description: UEFI 驱动以及加载顺序
type: docs
author_info: 由 xMuu、Sukka、derbalkon、cike-567 整理，由 Sukka、derbalkon、cike-567 翻译
last_updated: 2022-7-21
---

## 11.1 简介

[UEFI](https://uefi.org/specifications)（统一可扩展固件接口）是一种规范，用于定义操作系统和平台固件之间的软件接口。本部分允许加载其他 UEFI 模块 和/或 对板载固件进行调整。要检查固件内容，应用修改并执行升级，可以使用 [UEFITool](https://github.com/LongSoft/UEFITool/releases) 和其他实用程序。

## 11.2 驱动列表

根据固件不同、可能需要不同的驱动程序。加载不兼容的驱动程序可能会导致无法启动系统，甚至导致固件永久性损坏。OpenCore 目前对以下 UEFI 驱动提供支持。OpenCore 可能兼容其他 UEFI 驱动，但不能确定。

- [`AudioDxe`](https://github.com/acidanthera/OpenCorePkg)* --- UEFI 固件中的 HDA 音频驱动程序，适用于大多数 Intel 和其他一些模拟音频控制器。参考 [acidanthera/bugtracker#740](https://github.com/acidanthera/bugtracker/issues/740) 来了解 AudioDxe 的已知问题。
- [`btrfs_x64`](https://github.com/acidanthera/OcBinaryData) --- 开源 BTRFS 文件系统驱动程序，需要从一个文件系统启动 OpenLinuxBoot，该文件系统在 Linux 非常常用。
- [`BiosVideo`](https://github.com/acidanthera/OpenCorePkg)* --- 基于 VESA 和传统 BIOS 接口实现图形输出协议的 CSM 视频驱动程序。用于支持脆弱 GOP 的 UEFI 固件（例如，低分辨率）。需要重新连接图形连接。包含在 OpenDuet 中，开箱即用。
- [`CrScreenshotDxe`](https://github.com/acidanthera/OpenCorePkg)* --- 截图驱动。启用后，按下 <kbd>F10</kbd> 将能够截图并保存在 EFI 分区根目录下。该驱动基于 [Nikolaj Schlej](https://github.com/NikolajSchlej) 修改的 LongSoft 开发的 [`CrScreenshotDxe`](https://github.com/LongSoft/CrScreenshotDxe)。
- [`ExFatDxe`](https://github.com/acidanthera/OcBinaryData) --- 用于 Bootcamp 支持的专有 ExFAT 文件系统驱动程序，通常可以在 Apple 固件中找到。 对于 `Sandy Bridge` 和更早的 CPU，由于缺少 `RDRAND` 指令支持，应使用 `ExFatDxeLegacy` 驱动程序。
- [`ext4_x64`](https://github.com/acidanthera/OcBinaryData) --- 开源 EXT4 文件系统驱动程序，需要用 OpenLinuxBoot 从 Linux 最常用的文件系统启动。
- [`HfsPlus`](https://github.com/acidanthera/OcBinaryData) --- Apple 固件中常见的具有 Bless 支持的专有 HFS 文件系统驱动程序。对于 `Sandy Bridge` 和更早的 CPU，由于这些 CPU 缺少 `RDRAND` 指令支持，应使用 `HfsPlusLegacy` 驱动程序。
- [`HiiDatabase`](https://github.com/acidanthera/audk)* --- 来自 `MdeModulePkg` 的 HII 服务驱动。Ivy Bridge 及其以后的大多数固件中都已内置此驱动程序。某些带有 GUI 的应用程序（例如 UEFI Shell）可能需要此驱动程序才能正常工作。
- [`EnhancedFatDxe`](https://github.com/acidanthera/audk) --- 来自 `FatPkg` 的 FAT 文件系统驱动程序。这个驱动程序已经被嵌入到所有 UEFI 固件中，无法为 OpenCore 使用。众所周知，许多固件的 FAT 支持实现都有错误，导致在尝试写操作时损坏文件系统。如果在引导过程中需要写入 EFI 分区，则可能需要将此驱动程序嵌入固件中。
- [`NvmExpressDxe`](https://github.com/acidanthera/audk)* --- 来自`MdeModulePkg` 的 NVMe 驱动程序。从 Broadwell 开始的大多数固件都包含此驱动程序。对于 Haswell 以及更早的固件，如果安装了 NVMe SSD 驱动器，则将其嵌入固件中可能会更理想。
- [`OpenCanopy`](https://github.com/acidanthera/OpenCorePkg)* --- OpenCore 插件之一，用于实现图形引导界面。
- [`OpenRuntime`](https://github.com/acidanthera/OpenCorePkg)* --- 实现 `OC_FIRMWARE_RUNTIME` 协议的 OpenCore 插件。
- [`OpenLinuxBoot`](https://github.com/acidanthera/OpenCorePkg)* --- 实现 `OC_BOOT_ENTRY_PROTOCOL` 的 OpenCore 插件，允许直接检测和从 OpenCore 启动 Linux 发行版，无需通过 GRUB 进行链式加载。
- [`OpenNtfsDxe`](https://github.com/acidanthera/OpenCorePkg)* --- New Technologies File System (NTFS) read-only 驱动程序。`NTFS` 是基于 `Windows NT` 的 `Microsoft Windows` 版本的主要文件系统。
- [`OpenUsbKbDxe`](https://github.com/acidanthera/OpenCorePkg)* --- USB 键盘驱动，在自定义 USB 键盘驱动程序的基础上新增了对 `AppleKeyMapAggregator` 协议的支持。这是内置的 `KeySupport` 的等效替代方案。根据固件不同，效果可能会更好或者更糟。
- [`PartitionDxe`](https://github.com/acidanthera/OcBinaryData) --- 支持 Apple 分区方案的分区管理驱动程序。此驱动程序可用于支持加载较旧的 DMG 恢复，例如使用 Apple 分区方案的 macOS 10.9。OpenDuet 已经包含了这个驱动程序。
- [`Ps2KeyboardDxe`](https://github.com/acidanthera/audk)* --- 从 `MdeModulePkg` 提取出来的 PS/2 键盘驱动。OpenDuetPkg 和一些固件可能不包括这个驱动，但对于 PS/2 键盘来说该驱动是必须的。注意，和 `OpenUsbKbDxe` 不同，该驱动不提供对 `AppleKeyMapAggregator` 的支持、因此需要启用 `KeySupport` 这个 Quirk。
- [`Ps2MouseDxe`](https://github.com/acidanthera/audk)* --- 从 `MdeModulePkg` 提取出来的 PS/2 鼠标驱动。一些非常老旧的笔记本的固件中可能不包含该驱动，但是这些笔记本需要依赖该驱动才能在引导界面使用触控板。
- [`OpenHfsPlus`](https://github.com/acidanthera/OpenCorePkg)* --- 支持 Bles s的 HFS 文件系统驱动。这个驱动是闭源的 HfsPlus 驱动的替代品，该驱动通常在苹果固件中发现。虽然功能完善，但是启动速度比 `HFSPlus` 慢三倍，并且尚未经过安全审核。
- [`ResetNvramEntry`](https://github.com/acidanthera/OpenCorePkg)* --- 实现 `OC_BOOT_ENTRY_PROTOCOL` 的 OpenCore 插件，在启动选择器中添加了一个可配置的 `Reset NVRAM` 项。
- [`ToggleSipEntry`](https://github.com/acidanthera/OpenCorePkg)* --- 实现 `OC_BOOT_ENTRY_PROTOCO`L 的  OpenCore 插件，在启动选择器菜单中添加了一个可配置的 `Toggle SIP` 项目到启动选择器菜单中。(译者注：这个插件用于关闭SIP)
- [`UsbMouseDxe`](https://github.com/acidanthera/audk)* --- 从 `MdeModulePkg` 提取出来的 USB 鼠标驱动。一般只有虚拟机（如 OVMF）的固件中可能不包含该驱动，这些虚拟机需要依赖该驱动才能在引导界面使用鼠标。
- [`XhciDxe`](https://github.com/acidanthera/audk)* --- 来自 `MdeModulePkg` 的 XHCI USB controller 驱动程序。从 Sandy Bridge 开始的大多数固件中都包含此驱动程序。在较早的固件或旧系统可以用于支持外部 USB 3.0 PCI 卡。

标有 `*` 的驱动程序是 OpenCore 附带的。如果要从 UDK（EDK II）编译驱动程序，请使用编译 OpenCore 的相同命令，但要注意选择相应的软件包：

```bash
git clone https://github.com/acidanthera/audk UDK
cd UDK
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p FatPkg/FatPkg.dsc
build -a X64 -b RELEASE -t XCODE5 -p MdeModulePkg/MdeModulePkg.dsc
```

## 11.3 工具与应用程序

一些不依赖 OpenCore 的工具可以帮助调试固件和硬件。下面列出了一些已知的工具。虽然有些工具可以从 OpenCore 启动，但大部分工具都应该直接或从 `OpenCoreShell` 中单独运行。

要启动到 `OpenShell` 或任何其他工具，直接将 `OpenShell.efi` 保存在 FAT32 分区中的 `EFI/BOOT/BOOTX64.EFI` 下。此时分区方案是 `GPT` 还是 `MBR` 并不重要。

这种方法在 Mac 和其他计算机上都可以使用。还有一种只能在 Mac 上的 HFS+ 或 APFS 分区上使用的方法：

```bash
sudo bless --verbose --file /Volumes/VOLNAME/DIR/OpenShell.efi \
  --folder /Volumes/VOLNAME/DIR/ --setBoot
```

<center><em><strong>Listing 3</strong>: Bless 工具</em></center><br>

*注 1*：你可能需要将 `/System/Library/CoreServices/BridgeVersion.bin` 拷贝到 `/Volumes/VOLNAME/DIR`。

*注 2*：为了能够使用 `bless`，你可能需要 [禁用系统完整性保护](https://developer.apple.com/library/archive/documentation/Security/Conceptual/System_Integrity_Protection_Guide/ConfiguringSystemIntegrityProtection/ConfiguringSystemIntegrityProtection.html)。

*注 3*：为了能够正常启动，你可能需要 [禁用 Apple 安全启动](https://support.apple.com/HT208330)（如果有的话）。

一些已知的 UEFI 工具（内置工具已用 `*` 标出）：

- [`BootKicker`](https://github.com/acidanthera/OpenCorePkg)* --- 进入 Apple 的 BootPicker 菜单（仅 Mac 同款显卡才可以使用）。
- [`ChipTune`](https://github.com/acidanthera/OpenCorePkg)* --- 测试 BeepGen 协议，生成不同频率和长度的音频信号。
- [`CleanNvram`](https://github.com/acidanthera/OpenCorePkg)* --- 重置 NVRAM，以一个单独的工具呈现。
- [CsrUtil](https://github.com/acidanthera/OpenCorePkg)* --- 简单实现 Apple csrutil 的 SIP-related 相关功能。
- [`GopStop`](https://github.com/acidanthera/OpenCorePkg)* --- 用一个 [简单的场景](https://github.com/acidanthera/OpenCorePkg/tree/master/Application/GopStop) 测试 GraphicOutput 协议。
- [`KeyTester`](https://github.com/acidanthera/OpenCorePkg)* --- 在 `SimpleText` 模式下测试键盘输入。
- [`MemTest86`](https://www.memtest86.com) --- 内存测试工具。
- [`OpenControl`](https://github.com/acidanthera/OpenCorePkg)* --- 解锁和锁定 NVRAM 保护，以便其他工具在从 OpenCore 启动时能够获得完整的 NVRAM 访问权。
- [`OpenCore Shell`](https://github.com/acidanthera/OpenCorePkg)* --- 由 OpenCore 配置的 [`UEFI Shell`](http://github.com/tianocore/edk2)，与绝大部分固件兼容。
- [`PavpProvision`](https://github.com/acidanthera/OpenCorePkg) --- 执行 EPID 配置（需要配置证书数据）。
- [`ResetSystem`](https://github.com/acidanthera/OpenCorePkg)* --- 用于执行系统重置的实用程序。以重置类型作为参数：`ColdReset`, `Firmware`, `WarmReset`, `Shutdown`。默认为 `ColdReset`。
- [`RtcRw`](https://github.com/acidanthera/OpenCorePkg)* --- 读取和写入 RTC (CMOS) 存储器的使用程序。
- [`ControlMsrE2`](https://github.com/acidanthera/OpenCorePkg)* --- 检查 `CFG Lock`（`MSR 0xE2` 写保护）在所有 CPU 核心之间的一致性，并在选定的平台上改变此类隐藏选项。
- [`TpmInfo`](https://github.com/acidanthera/OpenCorePkg)* --- 检查平台上的 `Intel PTT`（Platform Trust Technology）能力，如果启用，允许使用 `fTPM 2.0`。该工具不检查 `fTPM 2.0` 是否真的被启用。

## 11.4 OpenCanopy

OpenCanopy 是一个 OpenCore 的图形化界面接口，基于 [OpenCorePkg](https://github.com/acidanthera/OpenCorePkg) `OcBootManagementLib` 实现，提供与现有的文字模式类似的功能。当 `PickerMode` 设置为 `External` 时启用。

OpenCanopy 所需的图象资源位于 `Resources` 目录下，一些简单的资源（字体和图标）可以在 [OcBinaryData 仓库](https://github.com/acidanthera/OcBinaryData) 中获取。可以在网络上找到自定义图标（例如： [这里](https://github.com/blackosx/OpenCanopyIcons) 和 [这里](https://applelife.ru/threads/kastomizacija-opencanopy.2945020/)）。

OpenCanopy 为 `PickerAttributes` 提供了全面的支持，并提供了一套可配置的内置图标集。默认选择的图标由 `DefaultBackgroundColor` 变量决定，当该变量的值定义为浅灰时，则使用 `Old` 前缀的图标，定义为其他颜色时则使用没有前缀名的图标。

预定义的图标放在 `\EFI\OC\Resources\Image` 目录下。下面提供了所支持的图标的完整列表（`.icns` 格式）。可选图标如未提供，将使用最接近的可用的图标。外置设备的条目将使用 `Ext` 前缀的图标（如 `OldExtHardDrive.icns`）。

*注*：以下标注的所有尺寸均为 1x 缩放级别的标准尺寸，其他缩放级别的尺寸须作相应调整。

- `Cursor` --- 鼠标光标（必需，最大尺寸 144x144）。
- `Selected` --- 选定的项目（必需，144x144）。
- `Selector` --- 选择项目（必需，最大尺寸 144x40）。
- `Left` --- 向左滚动（必需，最大尺寸 40x40）。
- `Right` --- 向右滚动（必需，最大尺寸 40x40）。
- `HardDrive` --- 通用的 OS（必需，128x128）。
- `Background` --- 居中的背景图片。
- `Apple` --- Apple OS (128x128)。
- `AppleRecv` --- Apple Recovery OS (128x128)。
- `AppleTM` --- Apple Time Machine (128x128)。
- `Windows` --- Windows (128x128)。
- `Other` --- 自定义条目（见 `Entries`，128x128）。
- `ResetNVRAM` --- 重置 NVRAM 工具或系统动作（128x128）。
- `Shell` --- 具有 UEFI Shell 名称的条目（如 `OpenShell`，128x128）。
- `Tool` --- 其他工具（128x128）。

预定义的标签放在 `\EFI\OC\Resources\Label` 目录下。每个标签都有 `.lbl` 或 `.l2x` 的后缀，以代表缩放级别。完整的标签列表如下所示。所有标签都是必需的。

- `EFIBoot` --- 通用的 OS。
- `Apple` --- Apple OS。
- `AppleRecv` --- Apple Recovery OS。
- `AppleTM` --- Apple Time Machine。
- `Windows` --- Windows。
- `Other` --- 自定义条目（见 `Entries`）。
- `ResetNVRAM` --- 重置 NVRAM 工具或系统动作。
- `SIPDisabled` --- 切换 SIP 工具，禁用 SIP。
- `SIPEnabled` --- 切换 SIP 工具，启用 SIP。
- `Shell` --- 具有 UEFI Shell 名称的条目（如 `OpenShell`）。
- `Tool` --- 其他工具。

*注*：所有标签的高度必须为 12px，宽度不限。

可以通过附带的实用程序来生成标签和图标：`disklabel` 和 `icnspack`。字体为 12pt 的 Helvetica 乘以比例因子。

字体格式对应于 [AngelCode binary BMF](https://www.angelcode.com/products/bmfont)。虽然有很多工具可以生成字体文件，但目前还是建议使用 [dpFontBaker](https://github.com/danpla/dpfontbaker) 来生成位图字体（[用 CoreText 达到最佳效果](https://github.com/danpla/dpfontbaker/pull/1)），并使用 [fonverter](https://github.com/usr-sse2/fonverter) 将其导出为二进制格式。

## 11.5 OpenRuntime

`OpenRuntime` 是一个 OpenCore 的插件，提供了对 `OC_FIRMWARE_RUNTIME` 协议的实现。该协议对 OpenCore 的部分功能提供了支持，而这部分功能由于需要 Runtime（如操作系统）中运行、因此无法内置在 OpenCore 中。该协议提供了包括但不限于如下功能：

- NVRAM 命名空间，允许隔离操作系统对所选变量的访问（如 `RequestBootVarRouting` 或 `ProtectSecureBoot`）。
- 只读和只写的 NVRAM 变量，增强了 OpenCore、Lilu 以及 Lilu 插件的安全性，比如 VirtualSMC，实现了 `AuthRestart` 支持。
- NVRAM 隔离，能够保护所有变量避免被不信任的操作系统写入（如 `DisableVariableWrite`）。
- UEFI Runtime Services 内存保护管理，以避开只读映射的问题（如 `EnableWriteUnprotector`）。

## 11.6 OpenLinuxBoot

OpenLinuxBoot 是一个实现 `OC_BOOT_ENTRY_PROTOCOL` 的 OpenCore 插件。它的目的是自动检测和启动大多数 Linux 发行版，而不需要额外的配置。

使用方法如下：

- 将 `OpenLinuxBoot.efi` 和典型的（见下文）`ext4_x64.efi` 添加到 `config.plist` 的 `Drivers` 部分。
- 确保 `RequestBootVarRouting` 和 `LauncherOption` 在 `config.plist` 中被启用；同时建议启用 `HideAuxiliary`，以隐藏旧的 Linux 内核，除非需要（它们被添加为辅助项，因此可以通过在 OpenCore 启动菜单按下空格键来显示）。
- 如果之前没有安装 Linux，则按正常程序安装，OpenLinuxBoot 不参与这一阶段。
- 重新启动到 OpenCore：已安装的 Linux 发行版应该会出现，并在选择时直接从 OpenCore 启动，它无需通过 GRUB 进行链式加载。

如果 OpenCore 已经手动设置为引导 Linux，例如通过 `BlessOverride` 或 `Entries`，则可以删除这些设置，以解决 Linux 发行版在引导菜单中显示两次。

我们建议用默认的引导程序来安装 Linux，尽管在通过 OpenLinuxBoot 启动的时候不会主动使用它。这是因为 OpenLinuxBoot 必须检测要使用的正确的内核选项，并通过查找默认引导程序留下的文件来实现。如果没有安装引导程序（或者找不到这些选项），启动仍然是可能的，但在 OpenLinuxBoot 试图启动发行版之前，必须手动指定正确的引导选项。

OpenLinuxBoot 通常需要固件中没有的文件系统驱动，比如 `EXT4` 和 `BTRFS` 驱动。这些驱动可以从外部来源获得。在基本情况下测试的驱动程序可以从 [OcBinaryData](https://github.com/acidanthera/OcBinaryData) 下载。请注意，这些驱动没有经过所有场景的可靠性测试，也没有经过防篡改测试，因此它们可能存在潜在的安全或数据丢失风险。

大多数 Linux 发行版需要 [`ext4_x64`](https://github.com/acidanthera/OcBinaryData) 驱动，少数可能需要 [`btrfs_x64`](https://github.com/acidanthera/OcBinaryData) 驱动，少数可能不需要额外的文件系统驱动：这取决于所安装的发行版启动分区的文件系统，以及系统的固件已经支持哪些文件系统。目前不支持 `LVM`，这是因为人们认为目前没有独立的 `UEFI LVM` 文件系统驱动。

请注意 `SyncRuntimePermissions` Quirk，由于 2017 年后发布的一些固件的错误，可能需要设置它以避免 Linux 内核的早期启动失败（通常以黑屏停止）。当存在并且没有被这个 Quirk 缓解时，这将影响通过 OpenCore 的启动，无论是否有 OpenLinuxBoot。

安装 OpenLinuxBoot 后，建议将启动（或尝试启动）特定发行版时 OpenCore 调试日志中显示的选项与使用 shell 命令 `cat /proc/cmdline` 启动同一发行版时看到的选项进行比较。一般来说（为了运行中的发行版的安全）这些选项应该匹配，如果不匹配，建议使用下面的驱动参数（特别是 `LINUX_BOOT_ADD_RO`，`LINUX_BOOT_ADD_RW`，`autoopts:{PARTUUID}` 和 `autoopts`）来修改所需的选项。但是请注意，以下差异是正常的，不需要修复。
  - 如果默认的引导程序是 GRUB，那么 OpenLinuxBoot 生成的选项将不包含 `BOOT_IMAGE=...`，而 GRUB 的选项则不包含 `initrd=...`。
  - OpenLinuxBoot 使用 `PARTUUID` 而不是文件系统的 `UUID` 来识别 `initrd` 的位置，这是设计上的问题，因为 UEFI 文件系统驱动不提供 Linux 文件系统的 `UUID` 值。
  - 不太重要的图形交接选项（比如下面 autoopts 中讨论的 Ubuntu 例子）不会完全匹配，这并不重要，只要发行版能够成功启动。

如果使用具有安全启动功能的 OpenLinuxBoot，用户可能希望使用 OpenCore 实用程序中包含的 `shim-to-cert.tool`，它可以用来提取直接启动发行版内核所需的公钥，就像使用 OpenCore 与 OpenLinuxBoot 时那样，而不是通过 `GRUB shim`。对于非 GRUB 发行版，所需的公钥必须通过用户研究找到。

### 11.6.1 Configuration

在大多数情况下，默认的参数值应该可以很好地工作，但如果需要，可以在 `UEFI/Drivers/Arguments` 中为驱动指定以下选项：

- `flags - Default`：所有的标志都被设置了，除了以下情况：
  - `LINUX_BOOT_ADD_RW`
  - `LINUX_BOOT_LOG_VERBOSE`
  - `LINUX_BOOT_ADD_DEBUG_INFO`

  可用的 `flags` 有：
    - `0x00000001 (bit 0) — LINUX_BOOT_SCAN_ESP`，允许扫描EFI系统分区的条目。
    - `0x00000002 (bit 1) — LINUX_BOOT_SCAN_XBOOTLDR`，允许扫描扩展启动加载器分区的条目。
    - `0x00000004 (bit 2) — LINUX_BOOT_SCAN_LINUX_ROOT`，允许扫描Linux根文件系统的条目。
    - `0x00000008 (bit 3) — LINUX_BOOT_SCAN_LINUX_DATA`，允许扫描Linux数据文件系统的条目。
    - `0x00000080 (bit 7) — LINUX_BOOT_SCAN_OTHER`，允许扫描没有被上述任何一个匹配的文件系统上的条目。

  以下说明适用于上述所有选项。

  *注 1*：苹果文件系统 `APFS` 和 `HFS` 从不被扫描。
  
  *注 2*：无论上述标志如何，在它被 OpenLinuxBoot 或任何其他 `OC_BOOT_ENTRY_PROTOCOL` 驱动程序看到之前。文件系统必须首先被 `Misc/Security/ScanPolicy` 所允许。
  
  *注 3*：建议在 OpenLinuxBoot flags 和 `Misc/Security/ScanPolicy` 中启用扫描 `LINUX_ROOT` 和 `LINUX_DATA`，以确保检测到所有有效的 Linux 安装，因为 Linux 启动文件系统往往被标记为 `LINUX_DATA`。

    - `0x00000100 (bit 8) - LINUX_BOOT_ALLOW_AUTODETECT`, 如果设置允许在没有找到加载器/条目文件时，自动检测和链接 `vmlinuz*` 和 `init* ramdisk` 文件。
    - `0x00000200 (bit 9) - LINUX_BOOT_USE_LATEST`，当 OpenLinuxBoot 生成的 Linux 条目被设为 OpenCore 的默认启动条目时，在安装新版本时自动切换到最新内核。

  设置此选项后，内部菜单条目 `id` 将在同一 Linux 安装的内核版本之间共享。Linux 启动选项总是按最高的内核版本排序，所以这意味着在设置了这个选项后，同一安装的最新内核 版本总是显示为默认版本。

  *注*：推荐在所有系统上使用该选项。

    - `0x00000400 (bit 10) - LINUX_BOOT_ADD_RO`，这个选项只适用于自动检测的 Linux（即不适用 BLSpec 或 Fedora 风格的发行版，它们有 `/loader/entries/*.conf` 文件）。一些发行版在加载时运行文件系统检查，要求根文件系统最初通过 `ro kernel`选项被挂载为只读， 这就要求在自动检测的选项中加入这个选项。在自动检测的发行版上设置这个选项； 在不需要这个选项的发行版上， 应该是无害的，但会稍微减慢启动时间（由于要求重新挂载为读写）。当有多个发行版，并且只需要为特定的发行版指定这个选项时，使用 `autoopts:{PARTUUID}+=ro` 来手动添加需要的选项，而不是使用这个标志。
    - `0x00000800 (bit 11) - LINUX_BOOT_ADD_RW`，和 `LINUX_BOOT_ADD_RO` 一样， 这个选项只适用于自动检测的
 Linux。大多数发行版不需要这个选项（它们通常要求在检测到的启动选项中加入`ro` 或 `nothing`），但在一些
 Arch-derived 发行版上需要，例如：EndeavourOS。 当有多个发行版，并且只需要为特定的发行版指定这个选项时，使用  `autoopts:{PARTUUID}+=rw`  在需要的地方手动添加这个选项，而不是使用这个标志。如果这个选项和 `LINUX_BOOT_ADD_RO` 都被指定，那么只有这个选项被应用， `LINUX_BOOT_ADD_RO` 被忽略。
    - `0x00002000 (bit 13) - LINUX_BOOT_ALLOW_CONF_AUTO_ROOT`，在某些 BootLoaderSpecByDefault 与 ostree 相结合的情况下， `/loader/entries/*.conf` 文件没有指定所需的 `root=...kernel` 选项（它是由 GRUB 加入的）。如果这个位被设置，并且检测到这种情况，那么就自动添加这个选项。 (例如：Endless OS)。
    - `0x00004000 (bit 14) - LINUX_BOOT_LOG_VERBOSE`，添加额外的调试日志信息，关于扫描 Linux 启动项时遇到的文件和添加的自动检测选项。
    - `0x00008000 (bit 15) - LINUX_BOOT_ADD_DEBUG_INFO`，在每个生成的条目名称中添加一个人类可读的文件系统类型，然后是分区的唯一分区 `uuid` 的前八个字符。当一个系统上有多个 Linux 安装时，可以帮助调试由驱动生成的条目的来源。

  Flag 值可以用以 `0x` 开头的十六进制或十进制来指定，例如 `flags=0x80` 或 `flags=128`。也可以指定添加或删除的 flag，使用 `flags+=0xC000` 来添加所有调试选项或 `flags-=0x400` 来删除 `LINUX_BOOT_ADD_RO` 选项。

- autoopts:{PARTUUID}[+]="{options}" - Default: 未设置。

允许手动指定内核选项，仅在自动检测模式下用于给定的分区。将 `{PARTUUID}` 替换为内核所在的特定分区 `UUID`（在正常布局中，包含 `/boot` 的分区），例如： `autoopts:11223344-5566-7788-99aabbccddeeff00+="vt.handoff=7"`。如果用 `+=` 指定，那么这些选项是在任何自动检测的选项之外使用的，如果用 `=` 指定，则用它们代替。仅用于自动检测的 Linux（这里指定的值永远不会用于从 `/loader/entries/*.conf` 文件）。
  
*注*： 这里要指定的 PARTUUID 值通常与 Linux 内核启动选项中 `root=PARTUUID=...` 的 `PARTUUID` 相同（使用 `cat/proc/cmdline` 查看）。另外，对于更高级的情况，可以使用 `Linux mount` 命令检查发行版的分区是如何挂载的，然后通过检查 `ls -l /dev/disk/by-partuuid` 的输出来找出相关挂载分区的 `partuuid`。

- autoopts[+]="{options}" - Default: 没有指定。

允许手动指定在自动检测模式下使用的内核选项。另一种格式 `autoopts:{PARTUUID}` 更适用于有多个发行版的情况，但不需要 `PARTUUID` 的 `autoopts` 可能对只有一个发行版更方便。如果用 `+=` 指定，那么这些选项将在自动检测的选项之外使用，如果用 `=` 指定，它们将被替代使用。只用于自动检测的 Linux（这里指定的值永远不会用于从 `/loader/entries/*.conf` 文件创建的条目）。
作为使用范例，可以在 Ubuntu 和相关发行版上使用 `+=` 格式添加 `vt.handoff` 选项，比如 `autopts+="vt.handoff=7"`  或 `autopts+="vt.handoff=3"`（通过发行版的默认引导程序启动时检查 `cat /proc/cmdline` ），以便在自动检测的 GRUB 默认值中添加 `vt.handoff` 选项，并避免在发行版闪屏前显示闪光的文本。

### 11.6.2 其他信息

OpenLinuxBoot 可以检测到根据 [`Boot Loader Specification`](https://systemd.io/BOOT_LOADER_SPECIFICATION/) 或密切相关的 [`systemd BootLoaderSpecByDefault`](https://fedoraproject.org/wiki/Changes/BootLoaderSpecByDefault) 创建的 `loader/entries/*.conf` 文件。 前者是针对 `systemd-boot` 的，被 Arch Linux 使用，后者适用于大多数与 Fedora 相关的发行版，包括 Fedora 本身、 RHEL 和衍生版。

如果上述文件不存在，OpenLinuxBoot 可以自动检测并直接启动 `{boot}/vmlinuz*` 内核文件。它自动将这些文件（基于文件名中的内核版本）链接到它们相关的 `{boot}/init*ramdisk` 文件。 这适用于大多数与 Debian 有关的发行版，包括 Debian 本身，Ubuntu 和衍生版。

当在 `/boot` 作为根文件系统的一部分进行自动检测时， OpenLinuxBoot会在 `/etc/default/grub` 中寻找内核启动选项，在 `/etc/os-release` 中寻找发行版的名称。当在一个独立的启动分区中自动检测时（即当 `/boot` 有自己的挂载点）， OpenLinuxBoot 不能自动检测内核参数，除了 `initrd=...`， 所有的内核参数都必须用 `autoopts=...` 或 `autoopts:{partuuid}=...` 指定（这些选项的 `+=` 变体不能工作，因为它们只是增加了额外的参数）。

BootLoaderSpecByDefault（但不是纯粹的 Boot Loader Specification）可以扩展 `*.conf` 文件中的 GRUB 变量，这在某些发行版中被实际使用 ，如 CentOS。 为了正确处理这种情况 ，当检测到这种情况时，OpenLinuxBoot 会从 `{boot}/grub2/grubenv` 中提取所有变量，以及从 `{boot}/grub2/grub.cfg` 中提取任何无条件设置的变量，然后在 `*.conf` 文件条目中展开这些变量。
 
目前唯一支持的启动 Linux 内核的方法是依靠它们被 `EFISTUB` 编译。 这几乎适用于所有现代发行版，尤其是那些使用
`systemd` 的发行版。 请注意，大多数现代发行版都使用 `systemd` 作为其系统管理器，尽管大多数都不使用 `systemd-boot` 作为其引导程序。

`systemd-boot` 用户（可能几乎全是 Arch Linux 用户） 应该注意， OpenLinuxBoot 不支持 `systemd-boot` 特有的 [`Boot Loader Interface`](https://systemd.io/BOOT_LOADER_INTERFACE/)；因此必须使用 `efibootmgr` 而不是 `bootctl` 来与启动菜单进行任何低级的 Linux 命令行交互。

## 11.7 其他引导进入协议驱动程序

除了 OpenLinuxBoot 插件外， 还提供了以下 `OC_BOOT_ENTRY_PROTOCOL` 插件，以在 OpenCore 启动选择器中添加可选的、可配置的启动项。

### 11.7.1 ResetNvramEntry

增加了一个菜单项，可以重置 NVRAM 并立即重新启动。另外还增加了对热键 `CMD+OPT+P+R` 的支持，以执行同样的操作。请注意，在某些固件和驱动程序的组合中，必须配置 `TakeoffDelay` 选项，以便可靠地检测这个和其他内置热键。

*注 1*：众所周知，一些联想笔记本电脑有一个固件错误，这使得它们在执行 NVRAM 重置后无法启动。详情请参考
 [acidanthera/bugtracker#995](https://github.com/acidanthera/bugtracker/issues/995)。
 
*注 2*：如果 `LauncherOption` 被设置为 `Full` 或 `Short`，那么 OpenCore 的启动项将受到保护。重置 NVRAM 通常会清除任何未通过 `BlessOverride` 指定的其他启动选项，例如将 Linux 安装到自定义位置且不使用 OpenLinuxBoot 驱动程序，或用户指定的 UEFI 启动菜单条目。为了获得不删除其他启动选项的重置 NVRAM 功能，可以使用 `--preserve-boot` 选项（不过请看指定的警告）。

以下配置选项可以在该驱动程序的 `Arguments` 属性指定：
- `--preserve-boot`，Boolean flag，如果存在则启用。
如果启用，在 NVRAM 重置期间，BIOS 启动项不会被清除。 这个选项应该谨慎使用，因为一些启动问题可以通过清除这些条目来解决。
- `--apple` ，Boolean flag，如果存在则启用。
仅在苹果固件上， 这将执行一个系统 NVRAM 重置。这可能会导致额外的、理想的操作，如 NVRAM 垃圾收集。这可以通过设置 ResetNVRam NVRAM 变量来实现。在可用的情况下，这与在本机启动时按 `CMD+OPT+P+R` 的效果相同，不过要注意的是，如果从菜单项中访问，将只听到一个启动鸣叫。

*注 1*：由于使用系统 NVRAM 重置， 该选项与 `--preserve-boot` 选项不兼容，将覆盖它，因此所有的 BIOS 启动项将被删除。

*注 2*：由于使用系统 NVRAM 重置，OpenCore 启动选项无法保留，必须在本地启动选择器中重新选择 OpenCore 或重新注入。

*注 3*：在非苹果硬件上，该选项仍将设置该变量，但该变量将不会被固件识别，也不会发生 NVRAM 重置。

### 11.7.2 ToggleSipEntry

在 OpenCore 启动选取器中提供一个启动条目，用于启用和禁用系统完整性保护（SIP）。

当 macOS 运行时，SIP 涉及多个配置的软件保护系统，然而所有关于启用这些保护系统的信息都存储在单一的 Apple NVRAM 变量 `csr-active-config` 中。只要这个变量在 macOS 启动前被设置，SIP 就会被完全配置好，所以使用这个启动选项（或以任何其他方式，在 macOS 启动前）设置这个变量，其最终结果与在 macOS Recovery 中使用 `csrutil` 命令配置 SIP 完全相同。

`csr-active-config` 将在 `0` 和用户指定的或默认的禁用值之间切换，表示启用。默认值是 `0x27F`（见下文）。任何其他所
需的值都可以在该驱动的 `Arguments` 部分中指定一个数字。 这可以指定为十六进制，以 `0x` 开头，也可以指定为十进制。

注1：建议不要在禁用 SIP 的情况下运行 macOS。使用这个启动选项可以在真正需要的时候更容易快速禁用 SIP 保护，之后应该重新启用。
注2：用这个启动项禁用 SIP 的默认值是 `0x27F`。作为比较，`csrutil disable` 在 macOS Big Sur 和 Monterey 上没有其他参数，它设置了 `0x7F`，在 Catalina 上设置了 `0x77`。 OpenCore 的默认值 `0x27F` 是 Big Sur 和 Monterey 值的一个变体， 选择方法如下：

- `CSR_ALLOW_UNAPPROVED_KEXTS（0x200）` 被包含在默认值中，因为在你需要禁用 SIP 的情况下，它通常是有用的，能够在系统偏好中安装无符号的 `kexts` 而无需手动批准。
- `CSR_ALLOW_UNAUTHENTICATED_ROOT（0x800）` 不包括在默认值中，因为使用它时很容易无意中破坏操作系统的密封性，阻止增量的 OTA 更新。
- 如果在 `csr-active-config` 中指定了后来的操作系统不支持的位（例如在 Catalina 上指定 `0x7F`），那么 `csrutil status` 将报告 SIP 有一个非标准的值，然而保护功能将是一样的。（译者注：就是 SIP 没有被关闭）

## 11.8 AudioDxe

UEFI固件中的高清晰度音频（HDA）支持驱动程序，适用于大多数英特尔和其他一些模拟音频控制器。
注意： AudioDxe 是一个阶段性的驱动程序，参考[acidanthera/bugtracker#740](https://github.com/acidanthera/bugtracker/issues/740)了解已知问题。

### 11.8.1 Configuration

大多数 UEFI 音频配置是通过 UEFI 音频属性部分处理的，但除此之外，还有一些为了让 `AudioDxe` 正确驱动某些设备，可能需要以下配置选项。所有的选项都被指定为文本字符串，如果需要一个以上的选项，用空格隔开，在 UEFI 驱动的 `Arguments` 属性中。

- `--gpio-setup`，如果没有提供参数，默认值为 `0`（禁用 GPIO 设置）或者默认值为 `7`（启用所有 GPIO 设置阶段）。

  可用的值如下，可以通过添加来组合：
    - `0x00000001 (bit 0) - GPIO_SETUP_STAGE_DATA`，在指定的引脚上设置 GPIO 引脚数据高电平。例如在 `MacBookPro10,2` 和 `MacPro5,1` 上需要。
    - `0x00000002 (bit 1) - GPIO_SETUP_STAGE_DIRECTION`，设置 GPIO 数据方向为指定引脚上的输出。例如在 `MacPro5,1` 上需要。
    - `0x00000004 (bit 2) - GPIO_SETUP_STAGE_ENABLE`，启用指定的 GPIO 引脚。例如在 `MacPro5,1` 上需要。

  如果音频似乎在正确的编解码器上 "播放"，例如根据调试日志，但在任何通道上都听不到声音，建议在 AudioDxe 驱动参数中使用 `--gpio-setup`（不包含值）。如果没有指定值，所有的阶段都将被启用（相当于指定 `7`）。如果这能产生声音，就有可能尝试更少的 bit，例如 `--gpio-setup=1`，`--gpio-setup=3`，以发现哪些阶段是实际需要的。

  注意： 这个选项的值 `7`（启用所有标志），例如 `MacPro5,1` 所要求的那样，与大多数系统兼容，但已知在少数其他系统上会引起声音问题（在新的声音开始之前不允许完成以前的声音），因此这个选项默认不启用。

- `--gpio-pins`，默认：`0`，自动检测。
  指定哪些 GPIO 引脚应该由 `--gpio-setup` 来操作。 这是一个位掩码，可能的值从 `0x0` 到 `0xFF`。可用的最大值取决于正在使用的编解码器的音频输出功能组上的可用引脚数量，例如，如果有两个 GPIO 引脚，它就是 `0x3`（最低的两个位），如果有三个引脚，就是 `0x7` ，等等。

  当 `--gpio-setup` 被启用时（即非零），那么 `0` 是 `--gpio-pins` 的特殊值，意味着引脚掩码将根据指定编解码器上报告的 GPIO 引脚数量自动生成（见 AudioCodec）。例如，如果编解码器的音频输出功能组报告了 `4` 个 GPIO 引脚，将使用 `0xF` 的掩码。

  使用中的值可以在调试日志中看到，比如一行：`HDA: GPIO setup on pins 0x0F - Success`。

  驱动程序参数的值可以用以 `0x` 开头的十六进制或十进制来指定，例如 `--gpio-pins=0x12` 或 `--gpio-pins=18`。

- `--restore-nosnoop`，Boolean flag，如果存在则启用。
  AudioDxe 清除了 `Intel HDA No Snoop Enable（NSNPEN）bit`。在某些系统上，这个改变必须在退出时被逆转，以避免在Windows 或 Linux 中破坏声音。如果是这样， 这个标志应该被添加到 AudioDxe 驱动参数中。 默认情况下不启用，因为恢复这个 `flag` 会使声音在其他一些系统的 macOS 中无法工作。

## 11.9 属性列表

### 1. `APFS`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置 APFS 分区驱动，具体配置内容参见下文 APFS 属性部分。

### 2. `AppleInput`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置以下 AppleInput 属性部分中描述的 Apple 事件协议的重新实现。

### 3. `Audio`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 配置音频后端支持，具体配置如下文所述。

除非另有说明（例如 ResetTrafficClass），否则本节中的设置仅用于 UEFI 音频支持（例如 OpenCore 生成的引导蜂鸣音和音频辅助），与操作系统音频支持所需的任何配置（例如 AppleALC ）无关。

音频支持为上游协议提供了一种与所选硬件和音频资源交互的方式。所有音频资源应该保存在 `\EFI\OC\Resources\Audio` 目录。目前支持的音频文件格式为 `MP3` 和 `WAVE PCM`。虽然支持哪种音频流格式取决于驱动程序，但大多数常见的音频卡都支持 4410 或 48000H 的 16 位立体声。

音频文件的路径是由音频的类型、本地化语言和路径决定的。每个文件名看起来都类似于：`[audio type]_[audio localisation]_[audio path].[audio ext]`。对于没有本地化的文件，其文件名不包含语言代码，看起来类似于：`[audio type]_[audio path].[audio ext]`。其中音频扩展名为 `mp3` 或 `wav`。

- OpenCore 音频文件的音频类型可以是 `OCEFIAudio`，macOS 引导程序的音频文件的音频类型可以是 `AXEFIAudio`。
- 音频本地化语言由两个字母的语言代码表示（如 `en`），中文、西班牙语和葡萄牙语除外。具体请看 [`APPLE_VOICE_OVER_LANGUAGE_CODE`](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h) 的定义来了解所有支持的本地化列表。
- 音频路径是对应于文件标识符的基本文件名。macOS 引导程序的音频路径参考 [`APPLE_VOICE_OVER_AUDIO_FILE`](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleVoiceOver.h) 的定义。OpenCore 的音频路径参考 [`OC_VOICE_OVER_AUDIO_FILE`](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Acidanthera/Protocol/OcAudio.h) 的定义。唯一例外的是 OpenCore 启动提示音文件：`OCEFIAudio_VoiceOver_Boot.mp3`。

macOS 引导程序和 OpenCore 的音频本地化是分开的。macOS 引导程序是在 `systemLanguage.utf8` 文件中的 `preferences.efires` 归档中设置，并由操作系统控制。OpenCore 则是使用 `prev-lang:kbd` 变量的值来控制。当某一特定文件的音频本地化缺失时，将会使用英语（`en`）来代替。示例音频文件可以在 [OcBinaryData 仓库](https://github.com/acidanthera/OcBinaryData) 中找到。

### 4. `ConnectDrivers`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 驱动程序加载后执行 UEFI 控制器连接操作。

此选项对于加载某些遵循 UEFI 驱动模型的 驱动程序（如文件系统驱动、音频输出驱动）很有用，因为这些驱动可能无法自行启动。此选项对会自动连接的驱动程序来说是不必要的，并且可能会稍微减慢启动速度。

*注*：某些固件（特别是 Apple 的）仅连接包含操作系统的驱动器以加快启动过程。启用此选项可以在拥有多个驱动器时查看所有引导选项。

### 5. `Drivers`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 `OC/Drivers` 目录下加载选择的驱动。设计为填充 UEFI 驱动程序加载的文件名。

要用 plist dict 值来填充，描述每个驱动程序。请参阅下面的 Drivers Properties 部分。

### 6. `Input`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Input 属性部分，应用为输入（键盘和鼠标）而设计的个性化设置。

### 7. `Output`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Output 属性部分，应用为输出（文本和图形）而设计的个性化设置。

### 8. `ProtocolOverrides`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 强制执行从下面的 ProtocolOverrides 属性部分所选协议的内置版本。

*注*：所有协议实例的安装都优先于驱动程序的加载。

### 9. `Quirks`

**Type**: `plist dict`
**Failsafe**: None
**Description**: 从下面的 Quirks 属性部分，应用个性化的固件 Quirks。

### 10. `ReservedMemory`

**Type**: `plist array`
**Description**: 设计为用 `plist dict` 值填充，用于描述对特定固件和硬件功能要求很高的内存区域，这些区域不应该被操作系统使用。比如被 Intel HD 3000 破坏的第二个 256MB 区域，或是一个有错误的 RAM 的区域。详情请参考下面的 ReservedMemory Properties 部分。

## 11.10 APFS 属性

### 1. `EnableJumpstart`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 从一个 APFS 容器中加载 APFS 驱动。

APFS 的 EFI 驱动内置在所有可以作为系统启动盘的 APFS 容器之中。这一选项将会根据基于 `ScanPolicy` 找到的 APFS 容器，从中加载 APFS 驱动。更多详情请查看 [苹果 APFS 文件系统参考手册](https://developer.apple.com/support/apple-file-system/Apple-File-System-Reference.pdf) 中的 `EFI Jummpstart` 部分。

### 2. `GlobalConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 APFS 加载期间执行完整的设备连接。

代替通常情况下用于 APFS 驱动程序加载的分区句柄连接，每一个句柄都是递归连接的。这可能会比平时花费更多的时间，但是是某些固件访问 APFS 分区的唯一方法，比如在旧的惠普笔记本电脑上的 APFS 分区。

### 3. `HideVerbose`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 是否隐藏 APFS 驱动的 verbose 信息。

APFS 驱动的 verbose 信息有助于 debug。

### 4. `JumpstartHotPlug`

**Type**: `plist boolean`
**Failsafe**: `False`
**Description**: 允许从进入 OpenCore 引导菜单后插入的可移除硬盘上的 APFS 容器中加载 APFS 驱动。

这一选项不仅提供了进入 OpenCore 以后再插入 U 盘的支持，而且还允许了在 OpenCore 引导菜单下 APFS U 盘的热插拔。如果不需要则禁用。

### 5. `MinDate`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 允许加载的最老 APFS 驱动的发布日期。

APFS 驱动日期将 APFS 驱动与发布日期联系起来。苹果公司最终会放弃对旧的 macOS 版本的支持，这些版本的 APFS 驱动程序可能含有漏洞，如果在支持结束后使用这些驱动程序，就会被用来破坏计算机。这个选项允许将 APFS 驱动程序限制在当前的macOS版本。

- `0` ---  需要 OpenCore 中 APFS 的默认支持发布日期。默认的发布日期会随着时间的推移而增加，因此建议采用这种设置。目前设置为 2021/01/01。
- `-1` --- 允许加载任何发布日期（强烈不推荐）。
- 其他数值 --- 使用自定义的最小 APFS 发布日期，例如：`2020/04/01的20200401`。你可以从 OpenCore 的启动日志和 [OcApfsLib](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Acidanthera/Library/OcApfsLib.h) 中找到 APFS 发布日期。

### 6. `MinVersion`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 允许加载的最老 APFS 驱动的版本号。

APFS 驱动版本将 APFS 驱动与 macOS 版本联系起来。苹果公司最终会放弃对旧的 macOS 版本的支持，而这些版本的 APFS 驱动可能含有漏洞，如果在支持结束后使用这些驱动，就会被用来破坏计算机。 这个选项允许将 APFS 驱动程序限制在当前的 macOS 版本。

- `0` --- 需要 OpenCore 中 APFS 的默认支持版本。默认版本会随着时间的推移而增加，因此推荐使用这一设置。目前设置为允许 macOS Big Sur 和更新的版本（1600000000000000）。
- `-1` --- 允许加载任何版本（强烈不推荐）。
- 其他数值 --- 使用自定义的最小APFS版本，例如：macOS Catalina 10.15.4 的 `1412101001000000`。你可以从 OpenCore 的启动日志和 [OcApfsLib](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Acidanthera/Library/OcApfsLib.h) 中找到 APFS 驱动的版本号。

## 11.11 AppleInput 属性

### 1. `AppleEvent`

**Type**: `plist string`
**Failsafe**: `Auto` 
**Description**: 确定是使用 OpenCore 内置协议还是 OEM  Apple Event 协议。

该选项决定是否使用 OEM  Apple Event 协议（如有），或者是否使用 OpenCore 的反向工程和更新的重新实现。一般来说，OpenCore 的重新实现应该是首选，因为它包含了一些更新，如明显改善的精细鼠标光标移动和可配置的按键的间隔时间。

- Auto --- 如果有可用的、已连接的和最近的，则使用 OEM  Apple Event 实现，否则使用 OpenCore 的重新实现。在非苹果硬件上，这将使用 OpenCore 的内置实现。在某些 Mac 上，如经典的 Mac Pro，这将倾向于使用苹果的实现，但在比这更老和更新的 Mac 机型上，该选项通常会使用 OpenCore 的重新实现。在较老的 Mac 上，这是因为可用的实现太老了，无法使用，而在较新的 Mac 上，这是因为苹果公司增加了优化功能，除非需要，否则不会连接 Apple Event 协议，例如，除了明确启动苹果启动选择器的时候。由于其结果有些不可预测，通常不推荐使用这个选项。
- Builtin --- 始终使用 OpenCore 对 Apple Event 协议的最新重新实现。由于 OpenCore 对协议的重新实现进行了改进（更好的精细鼠标控制、可配置的按键延迟），因此即使在苹果硬件上也建议使用此设置。
- OEM --- 假设苹果的协议在驱动程序连接时可用。在所有苹果硬件上，如果有足够新的苹果 OEM 版本的协议可用，无论是否由苹果的固件自动连接，这个选项将可靠地访问苹果的实现。在所有其他系统上，这个选项将导致没有键盘或鼠标支持。由于上述原因，在大多数情况下，建议优先使用内置选项。

### 2. `CustomDelays`

**Type**: `plist boolean`
**Failsafe**: `false` 
**Description**: 在使用 Apple Event 协议的 OpenCore 重新实现时，启用自定义的按键间隔时间。在使用 OEM 苹果实现时没有影响（见 AppleEvent 设置）。

- true --- 使用 `KeyInitialDelay` 和 `KeySubsequentDelay` 的值。
- false --- 使用 Apple 的默认值 500ms(50) 和 50ms(5)。

### 3. `KeyInitialDelay`

**Type**: `plist integer`
**Failsafe**: `50` (第一个键重复前 `500ms`)
**Description**: 在 OpenCore 对 Apple Event 协议的重新实现中，配置键盘按键重复之前的初始延迟，单位为 `10ms`。

苹果 OEM 的默认值是 50（500ms）。

*注 1*：在不使用 `KeySupport` 的系统上，此设置可自由用于配置按键重复行为。

*注 2*：在使用 `KeySupport` 的系统上，但不显示 `two long delays` 行为（见 `*注 3*`）或总是显示一个坚实的 `set default` 指标（见 `KeyForgetThreshold`），那么这个设置也可以自由地用于配置按键的重复初始延迟行为，只是它永远不应该被设置为小于 `KeyForgetThreshold`，以避免不受控制的按键重复。

*注 3*：在一些使用 KeySupport 的系统上，你可能会发现在正常速度键重复开始之前，在正常速度的按键响应之前，你会看到一个额外的慢速响应。如果是这样，你可能希望根据 `KeySubsequentDelay` 的 `*注 3*` 来配置 `KeyInitialDelay` 和 `KeySubsequentDelay`。

> 译者注：两次按键之间必然会有间隔时间，不稳定的间隔时间，会导致按键错误，所以 `KeySubsequentDelay` 用于配置按键重复间隔。为了准确的计算间隔时间，需要一个延迟来保证按键已经结束，而不是按键时间稍长则被认为按了两次。`KeyInitialDelay` 就是用于此。

### 4. `KeySubsequentDelay`

**Type**: `plist integer`
**Failsafe**: `5` (随后的按键重复间隔 `50ms`)
**Description**: 在 OpenCore 对 Apple Event 协议的重新实现中，配置键盘按键重复之间的间隔，单位为 `10ms`。

Apple OEM 的默认值是 5（50ms）。`0` 是这个选项的无效值（将发出调试日志警告，使用 `1` 代替）。

*注 1*：在不使用 `KeySupport` 的系统上，此设置可自由用于配置按键重复行为。

*注 2*： 在使用 `KeySupport` 的系统上，但不显示  `two long delays` 行为（见 `*注 3*`）或总是显示一个坚实的 `set default` 指标（见 `KeyForgetThreshold`）（这应该适用于大多数使用 `AMI KeySupport` 模式的系统），那么这个设置可以自由地用于配置按键重复的后续延迟行为，但它永远不应该被设置为小于 `KeyForgetThreshold`，以避免不受控制的按键重复。

*注 3*：在一些使用 `KeySupport` 的系统上，特别是在非 `AMI` 模式下的 `KeySupport`，你可能会发现，在配置了 `KeyForgetThreshold` 后，当按住一个按键时，在开始正常速度的按键响应之前，你会得到一个额外的慢速按键响应。在出现这种情况的系统上， 这是使用 `KeySupport` 来模拟原始键盘数据的一个不可避免的缺陷， `UEFI` 没有提供这种数据。 虽然这个 `two long delays` 的问题对整体可用性的影响很小，但你可能希望解决这个问题，可以通过以下方法来解决：

- 将 `CustomDelays` 设置为 `true`
- 将按键初始延迟设置为 `0`
- 将 `KeySubsequentDelay` 设置为至少是你的 `KeyForgetThreshold` 设置的值。

上述程序的工作原理如下。
- 将 `KeyInitialDelay` 设置为 `0` 会取消 Apple Event 的初始重复延迟（当使用 OpenCore 内置的 Apple Event 实现并启用 `CustomDelays` 时），因此你将看到的唯一长延迟是由这些机器上的 BIOS 按键支持引入的不可配置的、不可避免的初始长延迟。
- 按键平滑参数 `KeyForgetThreshold` 有效地充当了一个按键可以被保持的最短时间，因此一个小于这个参数的按键间隔将保证每一次按键都有至少一次额外的时间间隔，无论按键在物理上被敲击的速度如何。
- 如果你在设置 `KeySubsequentDelay` 等于你的系统的 `KeyForgetThreshold` 值后，仍然经常或偶尔得到双键响应，那么再增加一到两倍 `KeySubsequentDelay`，直到这种影响消失。

### 5. `GraphicsInputMirroring`

**Type**: `plist boolean`
**Failsafe**: `false` 
**Description**: Apple的 Apple Event 阻止图形应用程序中的键盘输入出现在基本控制台输入流中。

由于默认设置为 `false`， OpenCore 的 Apple Event 内置实现复制了这一行为。

在非苹果硬件上， 这可能会阻止键盘输入在图形的应用程序中工作，如使用非苹果按键输入方法的 Windows BitLocker。

所有硬件上的推荐设置是 `true` 的。

*注*： Apple Event 的默认行为是为了防止在退出基于图形的 UEFI 应用程序后出现不需要的排队按键。这个问题已经在 OpenCore 中单独处理。

- `true` --- 允许键盘输入到达不使用 Apple 输入协议的图形模式应用程序。
- `false` --- 在图形模式下，防止按键输入映射到非 Apple 协议。

### 6. `PointerPollMin`

**Type**: `plist integer`
**Failsafe**: `0` 
**Description**: 配置最小指针轮询周期，单位为 `ms`。

这是 OpenCore 内置的 Apple Event 驱动程序轮询指针设备（如鼠标、触控板）的运动事件的最短时间。默认为 `10` 毫秒。设置为 `0` 将使这一默认值保持不变。

*注*： OEM Apple 的实现使用 2ms 的轮询率。

### 7. `PointerPollMax`

**Type**: `plist integer`
**Failsafe**: `0` 
**Description**: 配置最大指针轮询周期，单位为 `ms`。

这是 OpenCore 内置的 Apple Event 驱动程序轮询指针设备（如鼠标、触控板）的运动事件的最长时间。只要设备没有及时响应，该周期就会增加到这个值。目前的默认值为 80ms。 设置为 `0` 将使这一默认值保持不变。

戴尔笔记本电脑中经常发现的某些触控板驱动程序在没有物理运动发生时，反应可能非常缓慢。 这可能会影响 OpenCanopy 和 FileVault 2 用户界面的响应能力和加载时间。增加轮询周期可以减少影响。

*注*： OEM Apple 的实现使用 2ms 的轮询率。

### 8. `PointerPollMask`

**Type**: `plist integer，32 bit`
**Failsafe**: `-1` 
**Description**: 配置轮询指针的索引。

选择要轮询 Apple Event 运动事件的指针设备。 `-1` 意味着所有设备。一个比特之和用于确定特定的设备。例如，要启用设备 `0`、`2`、`3`，其值将是 `1+4+8`（相应的 `2` 的幂）。 总共支持 `32` 个可配置的设备。

即使没有相应的物理设备，某些指针设备也可以存在于固件中。 这些设备通常是占位符、聚合设备或代理。从这些设备中收集信息可能导致用户界面中的运动活动不准确，甚至导致性能问题。 对于有这种问题的笔记本电脑设置，建议禁用这种指针设备。

系统中可用的指针设备的数量可以在日志中找到。更多细节请参考日志的 Found N pointer devices 部分。

注意：在使用 OEM Apple 实现时没有效果（见 Apple Event 设置）。

### 9. `PointerSpeedDiv`

**Type**: `plist integer`
**Failsafe**: `1` 
**Description**: 在 Apple Event 协议的 OpenCore 重新实现中配置指针速度除数。在使用 OEM Apple 实现时没有影响（见 Apple Event 设置）。

配置指针移动的除数。 OEM Apple 的默认值是 `1`，`0` 是这个选项的无效值。

*注*：这个选项的推荐值是 `1`， 这个选项的推荐值是 `1`。这个值可以根据用户的偏好，结合 `PointerSpeedMul` 进行修改，以实现自定义的鼠标移动比例。

### 10. `PointerSpeedMul`

**Type**: `plist integer`
**Failsafe**: `1` 
**Description**: 在 Apple Event 协议的 OpenCore 重新实现中配置指针速度乘数。在使用 OEM Apple 实现时没有影响（见 Apple Event 设置）。

配置指针移动的乘数。 OEM Apple 的默认值是 `1`。

*注*：这个选项的推荐值是 `1`， 这个选项的推荐值是 `1`。这个值可以根据用户的偏好，结合 `PointerSpeedDiv` 进行修改，以实现自定义的鼠标移动比例。

## 11.12 Audio 属性

### 1. `AudioCodec`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 特定音频控制器上的编解码器地址，用于音频支持。

一般来说，这里包含了内置模拟音频控制器（`HDEF`）上的第一个音频编解码器地址。音频编解码器地址（例：`2`）可以在调试日志中找到（已用粗斜体标出）：

<code>OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(&lt;redacted&gt;,<strong><em>00000000</em></strong>) (4 outputs)</code>
<code>OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(&lt;redacted&gt;,<strong><em>00000000</em></strong>) (1 outputs)</code>
<code>OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(&lt;redacted&gt;,<strong><em>02000000</em></strong>) (7 outputs)</code>

除此之外，该值还可以在 I/O 注册表的 `IOHDACodecDevice` class 中获得，包含在 `IOHDACodecAddress` 字段中。

### 2. `AudioDevice`

**Type**: `plist string`
**Failsafe**: empty
**Description**: 特定音频控制器的设备路径，用于音频支持。

一般来说，这里包含了内置模拟音频控制器（`HDEF`）的设备路径，比如 `PciRoot(0x0)/Pci(0x1b,0x0)`。认可的音频控制器列表可以在调试日志中找到（已用粗斜体标出）：

<code>OCAU: 1/3 <strong><em>PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)</em></strong>/VenMsg(&lt;redacted&gt;,00000000) (4 outputs)</code>
<code>OCAU: 2/3 <strong><em>PciRoot(0x0)/Pci(0x3,0x0)</em></strong>/VenMsg(&lt;redacted&gt;,00000000) (1 outputs)</code>
<code>OCAU: 3/3 <strong><em>PciRoot(0x0)/Pci(0x1B,0x0)</em></strong>/VenMsg(&lt;redacted&gt;,02000000) (7 outputs)</code>

如果使用 AudioDxe，可用的控制器设备路径也会以这样的格式输出：

<code>HDA: Connecting controller - PciRoot(0x0)/Pci(0x1B,0x0)</code>

除此之外，该值还可以在 macOS 中通过 `gfxutil -f HDEF` 命令来获取。

指定一个空的设备路径会导致使用第一个可用的编解码器和音频控制器。在这种情况下，AudioCodec 的值被忽略。这可能是一个方便的初始选项，以尝试让 UEFI 音频工作。当这个默认值不起作用时，就需要进行上述的手动设置。
  
### 3. `AudioOutMask`

**Type**: `plist integer`
**Failsafe**: `-1`
**Description**:位字段，指示用于 UEFI 声音的输出通道。

音频掩码为 `1` < 音频输出（等同于 `2^` 音频输出）。例如，对于音频输出 `0`，比特掩码是 `1`，对于输出 `3` 是 `8`，对于输出 `0` 和 `3` 是 `9`。
  
每个 HDA 编解码器的可用输出节点的数量（N）显示在调试日志中（如下），音频输出 `0` 到 `N-1` 可以选择。

<code>OCAU: 1/3 PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x1)/VenMsg(&lt;redacted&gt;,00000000) (4 outputs)</code>
<code>OCAU: 2/3 PciRoot(0x0)/Pci(0x3,0x0)/VenMsg(&lt;redacted&gt;,00000000) (1 outputs)</code>
<code>OCAU: 3/3 PciRoot(0x0)/Pci(0x1B,0x0)/VenMsg(&lt;redacted&gt;,02000000) (7 outputs)</code>
  
当使用 AudioDxe 时，每个输出通道的额外信息会在驱动程序绑定时被记录下来， 包括每个输出的比特掩码。所需输出的比特掩码值应该加在一起，以获得 AudioOutMas 值：
  
<code>HDA: | Port widget @ 0x9 is an output (pin defaults 0x2B4020) (bitmask 1)</code>
<code>HDA: | Port widget @ 0xA is an output (pin defaults 0x90100112) (bitmask 2)</code>
<code>HDA: | Port widget @ 0xB is an output (pin defaults 0x90100110) (bitmask 4)</code>
<code>HDA: | Port widget @ 0x10 is an output (pin defaults 0x4BE030) (bitmask 8)</code>
 
关于可用输出通道的进一步信息可以通过使用命令从 Linux 编解码器转储中找到：
  
<code>cat /proc/asound/card{n}/codec#{m}</code>
  
使用 AudioOutMask，可以向多个的通道播放声音（例如，主扬声器加低音扬声器； 耳机加扬声器），只要所有选择的输出都支持正在使用的声音文件格式；如果任何一个不支持，那么就不会有声音播放，并且会有警告记录。
  
当编解码器上所有可用的输出通道都支持可用的声音文件格式时，`-1` 的值将同时向所有通道播放声音。如果这不起作用，通常最快的方法是逐一尝试每个可用的输出通道，将 AudioOutMask 设置为 `1`、 `2`、 `4` 等，直到 `2ˆN-1`，以便找出哪个通道能产生声音。

### 4. `AudioSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 通过连接到固件音频驱动程序以激活音频支持。

启用此设置可将音频播放从内置协议路由到音频控制器（`AudioDevice`）上指定编解码器（`AudioCodec`）的专用音频端口（`AudioOut`）。

### 5. `DisconnectHda`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在加载驱动程序之前，断开 HDA 控制器的连接。

在某些系统上可能需要（例如苹果硬件、 VMware Fusion guest），以允许 UEFI 声音驱动（例如 AudioDxe）控制音频硬件。

*注*：除了这个选项外，大多数苹果硬件还需要 `--gpio-setup` 驱动参数， 这在 AudioDxe 部分有涉及。

### 6. `MaximumGain`

**Type**: `plist integer`
**Failsafe**: `-15`
**Description**: 用于 UEFI 音频的最大增益，以分贝（dB）为单位，相对于放大器的参考电平 `0dB`（见注1）。
  
当从 `SystemAudioVolumeDB NVRAM` 变量中读取的系统放大器增益高于此值时，所有的 UEFI 音频将使用此增益设置。 这是为了避免在系统音量设置得很高，或者 `SystemAudioVolumeDB NVRAM` 的值被错误地配置时，UEFI 音频过于响亮。
  
*注 1*：分贝（dB）是指与某个参考水平相比的增益（正值；音量增加）或衰减（负值；音量减少）。例如，当你听到喷气式飞机的声级表示为 `120` 分贝时，参考水平是普通人可以听到的声级。然而，在声学和计算机音频中，任何参考电平都可以被指定。英特尔 HDA 和 macOS 原生使用分贝来指定音量级别。在大多数英特尔 HDA 硬件上，`0` 分贝的参考电平是硬件的最大声量，因此所有更低的音量是负数。在典型的声音硬件上，最安静的音量大约是 `-55dB` 到 `-60dB`。

*注 2*：与 macOS 处理分贝值的方式一致， 该值被转换为有符号的字节；因此，不允许使用 `-128 dB` 到 `+127 dB` 以外的值（这些值远远超出物理上合理的音量水平）。

*注 3*： 数字音频输出，在操作系统中没有音量滑块，忽略这个和所有其他增益设置，只有静音设置是相关的。
  
### 7. `MinimumAssistGain`

**Type**: `plist integer`
**Failsafe**: `-30`
**Description**: 用于选择器音频辅助的最小增益（dB）， 单位为分贝（dB）。
  
如果从 `SystemAudioVolumeDB NVRAM` 变量中读取的系统放大器增益低于此值，屏幕阅读器将使用此放大器增益。
  
*注 1*：除了这个设置外，由于音频辅助必须能听到才能发挥其功能，所以即使操作系统的声音被静音或 `StartupMute NVRAM` 变量被设置，音频辅助也不会被静音。
  
*注 2*：关于分贝音量级别的解释，请参见 `MaximumGain` 部分。  
  
 ### 8. `MinimumAudibleGain`

**Type**: `plist integer`
**Failsafe**: `-128`
**Description**: 尝试播放任何声音的最小增益，单位是分贝（dB）。
  
如果 `SystemAudioVolumeDB NVRAM` 变量中的系统放大器增益水平低于此值，则不会播放开机提示音。
  
*注 1*： 这个设置是为了节省由于在听不见的音量水平上进行音频设置而造成的不必要的停顿，因为无论如何都不会听到声音。是否有听不见的音量水平取决于硬件。在一些硬件上（包括 Apple），音频值与硬件匹配得很好，最低的音量水平是非常安静但可以听到的，而在其他一些硬件组合上，音量范围的最低部分可能根本听不到。

*注 2*：关于分贝音量级别的解释，请参见 `MaximumGain`。 

### 9. `PlayChime`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 开机时播放 Mac 特有的风铃的声音。

启用此设置可通过内置的音频支持来播放开机时播放的声音。音量大小由 `MinimumVolume` 和 `VolumeAmplifier` 的设置，以及 `SystemAudioVolume` NVRAM 变量来决定。可用的值有：

- `Auto` --- 当 `StartupMute` NVRAM 变量不存在或设置为 `00` 时，启用开机声音。
- `Enabled` --- 无条件启用开机声音。
- `Disabled` --- 无条件禁用开机声音。

*注 1*：`Enable` 是可以与 `StartupMute` NVRAM 变量分开使用的，以此来避免在固件能够播放启动铃声时发生冲突。

*注 2*：无论如何设置，如果系统音频被静音，即 `SystemAudioVolume` NVRAM 变量设置了 `0x80` 位，则不会播放启动铃声。
  
### 10. `ResetTrafficClass`

**Type**: `plist boolean`
**Failsafe**: `0`
**Description**: 将 HDA Traffic Class Select 寄存器设置为 `TC0`。

只有当 TCSEL 寄存器配置为 `use TC0 traffic class` 时，AppleHDA.kext 才能正常工作。有关此寄存器的更多详细信息，请参阅 Intel I/O Controller Hub 9（ICH9）Family Datasheet（或任何其他 ICH Datasheet）。

*注*：此选项独立于 `AudioSupport`。如果使用 AppleALC，则首选使用 `AppleALC alctsel` 属性。  
  
### 11. `SetupDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 音频编解码器重新配置的延迟，单位为微秒。

某些编解码器在重新配置后需要特定延迟（由供应商提供，例如音量设置），此选项可对其进行配置。一般来说，必要的延迟时间可能长达 0.5 秒。

## 11.13 Drivers 属性
  
### 1. `Comment`

**Type**: `plist integer`
**Failsafe**: Empty
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。 
  
### 2. `Path`

**Type**: `plist integer`
**Failsafe**: Empty
**Description**: 从 `OC/Drivers` 目录中作为 UEFI 驱动加载的文件的路径。
  
### 3. `Path`

**Type**: `plist integer`
**Failsafe**: `false`
**Description**:  如果设置为 `false` 的，这个驱动条目将被忽略（译者注：即不启用这个驱动）。
  
### 4. `Arguments`

**Type**: `plist integer`
**Failsafe**: Empty
**Description**:  一些OpenCore插件接受可选的额外参数，可以在这里指定为一个字符串（译者注：即驱动参数）。

## 11.14 Input 属性

### 1. `KeyFiltering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用键盘输入的合理性检查。

显然，有些主板，如 GA Z77P-D3，可能会在 `EFI_INPUT_KEY` 中返回所有输入协议的未初始化数据。这个选项会舍弃那些既不是 ASCII 码，也不是 UEFI 规范中定义的键（见版本 2.8 的表 107 和 108）。

### 2. `KeyForgetThreshold`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 两次按键之间的间隔时间，单位为 `10ms`。如果两次按键的时间间隔，小于这个值，那么视为保持长按。只适用于使用 `KeySupport` 的系统。

`AppleKeyMapAggregator` 协议应该包含当前按下的键的固定长度的缓冲。但是大部分驱动程序仅将按键按下报告为中断、并且按住按键会导致在一定的时间间隔后再提交按下行为。一旦超时到期，我们就是用超时从缓冲区中删除一次按下的键，并且没有新提交。

此选项允许根据你的平台设置此超时。在大多数平台上有效的推荐值为 5 毫秒。作为参考，在 VMWare 上按住一个键大约每 2 毫秒就会重复一次，而在 APTIO V 上是 3-4 毫秒。因此，可以在较快的平台上设置稍低的值、在较慢的平台设置稍高的值，以提高响应速度。

在同一平台上，一个接一个地按下按键会导致至少 60 和 100 毫秒的延迟。理想情况下，`KeyForgetThreshold` 应该保持低于这个值，以避免合并真正的按键。
  
调整 `KeyForgetThreshold` 的值对于在启用了 `KeySupport` 的系统上实现准确和灵敏的键盘输入是必要的，建议按照下面的说明为你的系统正确地调整它。  
  
*注 1*：要调整 `KeyForgetThreshold`，你可以使用 OpenCanopy 或内置启动选择器中的 `set default` 指示符。如果`KeyForgetThreshold` 太低，那么当按住 `CTRL` 或 `=/+` 时， `set default` 指示符将继续闪烁。你应该配置能避免这种闪烁的最低值。在一些系统上（例如 Aptio IV 和可能使用 AMI KeySupport 模式的其他系统），你可以找到一个最小的`KeyForgetThreshold` 值，在这个值上， `set default` 指示符会亮起并保持不变，而且没有闪烁，如果是这样，就使用这个值。在大多数其他使用 `KeySupport` 的系统上，你会发现，当第一次按住 `CTRL` 或 `=/+` 键时， `set default` 指示符会闪烁一次，然后再经过一个非常短暂的间隔，就会亮起并保持亮起。在这样的系统上，你应该选择最低的 `KeyForgetThreshold` 值，在这个值上，你只看到最初的一次闪烁，然后就没有后续的闪烁了。(在这种情况下，这是使用 `KeySupport` 模拟原始键盘数据的系统上不可避免的缺陷，UEFI 不提供这种数据）。
  
*注 2*：`KeyForgetThreshold` 最多不需要超过 9 或 10。如果它被设置为一个远高于此的值，将导致明显的键盘输入无反应。因此，为了整体的按键响应，强烈建议配置一个相对较低的值，在这个值上， `set default` 指示符会闪烁一次，然后不再闪烁，而不是使用一个高得多的值（即明显大于 10），你可能能找到但不应该使用这个值，在这个值上， `set default` 指示符根本不闪烁。  

### 3. `KeySupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用内部键盘输入转换为 AppleKeyMapAggregator 协议。

这一选项基于 `AppleGenericInput`（`AptioInputFix`），激活内部键盘拦截器驱动程序以填充 `AppleKeyMapAggregator` 数据库以实现输入功能。如果使用了单独的驱动程序（例如：`AppleUsbKbDxe`），则永远不要开启这一选项。此外，这个选项不是必需的，也不应该在 Apple 固件中启用。

### 4. `KeySupportMode`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 将内部键盘的输入转换设置为 `AppleKeyMapAggregator` 协议模式。

- `Auto` --- 从下述选项中自动选择
- `V1` --- UEFI 传统输入协议 `EFI_SIMPLE_TEXT_INPUT_PROTOCOL`.
- `V2` --- UEFI 现代标准输入协议 `EFI_SIMPLE_TEXT_INPUT_EX_PROTOCOL`.
- `AMI` --- APTIO 输入协议 `AMI_EFIKEYCODE_PROTOCOL`.

*注*：目前 `V1`、`V2` 和 `AMI` 区别于 `Auto`，只对特定的协议进行过滤。这种情况在未来的版本中可能会改变。

### 5. `KeySwap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用后将交换 `Command` 和 `Option`。

此选项对于 `Option` 键位于 `Command` 右侧的键盘来说会很有用。

### 6. `PointerSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用内部指针驱动器。

该选项通过选择 OEM 协议实现标准 UEFI 指针协议 `EFI_SIMPLE_POINTER_PROTOCOL`。该选项在 Z87 华硕主板可能有用（该主板的 `EFI_SIMPLE_POINTER_PROTOCOL` 存在问题）。

### 7. `PointerSupportMode`

**Type**: `plist string`
**Failsafe**: empty
**Description**: 设置用于内部指针驱动程序的 OEM 协议。

目前只支持 `ASUS` 值，使用的是 Z87 和 Z97 主板上的特殊协议。更多详情请参考 [`LongSoft/UefiTool#116`](https://github.com/LongSoft/UEFITool/pull/116)。如果启用了 `PointerSupport`，此处值不能为空。

### 8. `TimerResolution`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 固件始终刷新的频率（单位 `100` 纳秒）

这个选项允许用 `100` 纳秒为单位的指定值来更新固件架构的定时器周期。设置一个较低的值通常可以提高接口和输入处理的性能和响应性。  
  
建议值为 `50000`（即 5 毫秒）或稍高一些。选择 ASUS Z87 主板时，请使用 `60000`，苹果主板请使用 `100000`。你也可以将此值设置为 0，不改变固件始终刷新的频率。

## 11.15 Output 属性

### 1. `TextRenderer`

**Type**: `plist string`
**Failsafe**: `BuiltinGraphics`
**Description**: 选择通过标准控制台输出的渲染器。

目前支持两种渲染器：`Builtin` 和 `System`。`System` 渲染器使用固件服务进行文本渲染。`Builtin` 渲染器则绕过固件服务，自行渲染文本。不同的渲染器支持的选项也不同。建议使用 `Builtin` 渲染器，因为它支持 HiDPI 模式，并能够使用全屏分辨率。

UEFI 固件一般用两种渲染模式来支持 `ConsoleControl`：`Graphics` 和 `Text`。有些固件不支持 `ConsoleControl` 和渲染模式。OpenCore 和 macOS 希望文本只在 `Graphics` 模式下显示，而图形可以在任何模式下绘制。由于 UEFI 规范并不要求这样做，因此具体的行为各不相同。

有效值为文本渲染器和渲染模式的组合：
  - `BuiltinGraphics` --- 切换到 `Graphics` 模式，并使用 `Builtin` 渲染器和自定义 `ConsoleControl`。
  - `BuiltinText` --- 切换到 `Text` 模式，并使用 `Builtin` 渲染器和自定义 `ConsoleControl`。
  - `SystemGraphics` --- 切换到 `Graphics` 模式，并使用 `System` 渲染器和自定义 `ConsoleControl`。
  - `SystemText` --- 切换到 `Text` 模式，并使用 `System` 渲染器和自定义 `ConsoleControl`。
  - `SystemGeneric` --- 使用 `System` 渲染器和系统 `ConsoleControl`，前提是它们能正常工作。

`BuiltinGraphics` 的用法通常是比较直接的。对于大多数平台，需要启用 `ProvideConsoleGop`，将 `Resolution` 设置为 `Max`。某些非常老旧且问题很多的笔记本只能在 `Text` 模式下绘图，对它们来说，`BuiltinText` 是 `BuiltinGraphics` 的替代选择。

`System` 协议的用法比较复杂。一般来说，首选设置 `SystemGraphics` 或 `SystemText`。启用 `ProvideConsoleGop`，将 `Resolution` 设置为 `Max`，启用 `ReplaceTabWithSpace` 几乎在所有平台上都很有用。`SanitiseClearScreen`、`IgnoreTextInGraphics` 和 `ClearScreenOnModeSwitch` 比较特殊，它们的用法取决于固件。

*注*：某些 Mac，例如 `MacPro5,1`，在使用较新的 GPU 时，可能会出现控制台不兼容输出的情况（例如：中断），因此可能只有 `BuiltinGraphics` 对它们有效。NVIDIA GPU可能需要额外的[固件升级](https://github.com/acidanthera/bugtracker/issues/1280)。

### 2. `ConsoleMode`

**Type**: `plist string`
**Failsafe**: Empty （保持当前的控制台模式）
**Description**: 按照 `WxH`（例如：`80x24`）格式的字符串所指定的方式设置控制台的输出模式。

设置为 `Max` 则会尝试最大的可用控制台模式。目前 `Builtin` 文本渲染器只支持一种控制台模式，所以该选项可以忽略。

*注*：在大多数固件上，这个字段最好留空。

### 3. `Resolution`

**Type**: `plist string`
**Failsafe**: Empty （保持当前屏幕分辨率）
**Description**: 设置控制台的屏幕分辨率。

- 设置为 `WxH@Bpp`（如 `1920x1080@32`）或 `WxH`（例如：`1920x1080`）格式的字符串，向 GOP 请求自定义分辨率（如果有的话）。
- 设置为 `Max`，尝试使用最大的可用屏幕分辨率。

在 HiDPI 屏幕上，`APPLE_VENDOR_VARIABLE_GUID` `UIScale` NVRAM 变量可能需要设置为 `02`，以便在 `Builtin` 文本渲染器、FileVault 2 UEFI 密码界面和启动界面 logo 启用 HiDPI 缩放。更多细节请参考 [建议变量](9-nvram.html#9-4-建议变量) 部分。

*注*：当控制台句柄没有 GOP 协议时，这些设置会失败。当固件不再提供时，可以将 `ProvideConsoleGop` 设置为 `true` 添加 GOP 协议。

### 4. `ForceResolution`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 当默认情况下无法获得所需分辨率时，强制设置 `Resolution` 中所填写的分辨率，多用于老的 Intel GMA 和第一代 Intel HD Graphics (Ironlake/Arrandale)。将  `Resolution` 设置为  `Max` 时，将尝试从所连接的显示器的 EDID 中提取最大的可用分辨率。

*注*：该选项依赖 [`OC_FORCE_RESOLUTION_PROTOCOL`](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Acidanthera/Protocol/OcForceResolution.h) 协议。目前只有 `OpenDuetPkg` 支持该协议，而 `OpenDuetPkg` 的实现目前仅支持 Intel iGPU。

### 5. `ClearScreenOnModeSwitch`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件在从图形模式切换到文本模式时，只会清除部分屏幕、而会留下一部分之前绘制的图像。启用这一选项后，在切换到文本模式之前会用黑色填充整个图形屏幕。

*注*：这一选项只会在 `System` 渲染器上生效。

### 6. `DirectGopRendering`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为控制台使用内置的图形输出协议渲染器。

在某些固件上，这样做可能会提供更优的性能，甚至修复渲染问题，例如：`MacPro5,1`。但是，除非有明显的好处，否则还是建议不要使用这个选项，因为可能会导致滚动速度变慢。

这个渲染器完全支持 `AppleEg2Info` 协议，将为所有 EFI 应用程序提供屏幕旋转。为了提供与 `EfiBoot` 的无缝旋转兼容性，还应该使用内置的 `AppleFramebufferInfo`，也就是说，在 Mac EFI 上可能需要覆盖它。  

### 7. `GopPassThrough`

**Type**: `plist string`
**Failsafe**: `Disabled`
**Description**: 在 `UGA` 协议实例的基础上提供 `GOP` 协议实例。

该选项通过一个基于 `UGA` 的代理为没有实现 `GOP` 协议的固件提供 `GOP` 协议。

该选项的支持值如下：
  - Enabled --- 为所有 `UGA` 协议提供 `GOP`。
  - Apple --- 为支持 `AppleFramebufferInfo` 的协议提供 `GOP`。
  - Disabled --- 不提供 `GOP`。  
  
*注*：该选项需要启用 `ProvideConsoleGop`。  
  
### 8. `IgnoreTextInGraphics`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些类型的固件在图形和文本模式下都在屏幕上输出文本。通常不会这样做，因为随机文本可能会出现在图形图像上并导致 UI 损坏。将此选项设置为 `true` 时，会在控制台处于与 `Text` 不同的模式时，舍弃所有文本输出。

*注*：这一选项只会在 `System` 渲染器上生效。

### 9. `ReplaceTabWithSpace`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件不会打印 `tab` 符号，甚至不打印 `tab` 后面的所有内容，导致很难或根本无法用 UEFI Shell 内置的文本编辑器来编辑属性列表和其他文档。这个选项会使控制台输出空格来替代 `tab`。

*注*：这一选项只会在 `System` 渲染器上生效。

### 10. `ProvideConsoleGop`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 确保控制台句柄上有 GOP (Graphics Output Protocol)。

macOS bootloader 要求控制台句柄上必须有 GOP 或 UGA（适用于 10.4 `EfiBoot`），但 UEFI 规范并未涵盖图形协议的确切位置。此选项会确保 GOP 和 UGA（如果存在）在控制台句柄上可用。

*注*：这个选项也会替换掉控制台句柄上损坏的 GOP 协议，在使用较新的 GPU 的 `MacPro5,1` 时可能会出现这种情况。

### 11. `ReconnectGraphicsOnConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在驱动连接过程中重新连接所有的图形驱动。  
  
在某些固件上，可能希望使用一个替代的图形驱动程序，例如 `BiosVideo.efi`。在传统机器上提供更好的屏幕分辨率选项，或者使用支持 `ForceResolution` 的驱动程序。这个选项试图在连接新加载的驱动程序之前断开所有当前连接的图形驱动程序。 
  
*注*：这个选项需要启用 `ConnectDrivers`。  
  
### 12. `ReconnectOnResChange`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 改变屏幕分辨率后重新连接控制台控制器。

当通过 GOP 改变屏幕分辨率时，某些固件需要重新连接产生控制台协议（简单的文本输出）的控制器，否则它们不会根据新的分辨率生成文本。

*注*：当 OpenCore 从 Shell 启动时，这个逻辑可能会导致某些主板黑屏，因此这个选项是非必须的。在 0.5.2 之前的版本中，这个选项是强制性的，不可配置。除非需要，否则请不要使用该选项。

### 13. `SanitiseClearScreen`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 有些固件在使用较大的显示器（例如：2K 或 4K）时，清除屏幕内容会导致屏幕分辨率重置为 `failsafe` 值（例如：`1024x768`）。这个选项为这种情况提供了一个变通方法。

*注*：这一选项只会在 `System` 渲染器上生效。在所有已知的受影响的系统中，`ConsoleMode` 必须设置为空字符串才能正常工作。

### 14. `UIScale`

**Type**: `plist integer，8 bit`
**Failsafe**: `-1`
**Description**:  用户界面的缩放系数。  
  
对应于4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14：UIScale变量。  
  - 1 --- 1倍缩放，对应于普通显示器。
  - 2 --- 2x缩放，对应于HiDPI显示器。
  - -1 --- 保持当前变量不变。
  - 0 -- 根据当前分辨率自动选择缩放比例。

*注 1*：自动比例系数检测是在总像素面积的基础上进行的，在小型 HiDPI 显示器上可能会失败，在这种情况下，可以使用NVRAM 部分手动管理该值。

*注 2*：当从手动指定的 NVRAM 变量切换到该首选项时，可能需要对 NVRAM 进行重置。  
  
### 15. `UgaPassThrough`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 GOP 协议实例的基础上提供 UGA 协议实例。

有些固件不会去实现老旧的 UGA 协议，但是有些更老的 EFI 应用程序（ 例如 10.4 的 EfiBoot）可能需要用它来进行屏幕输出。

## 11.16 ProtocolOverrides 属性

### 1. `AppleAudio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple 音频协议。

Apple 音频协议允许 macOS bootloader 和 OpenCore 播放声音和信号，用于屏幕阅读或声音错误报告。支持的协议有生成「哔」声和 VoiceOver。VoiceOver 协议是带有 T2 芯片的机器特有的，不支持 macOS High Sierra (10.13) 之前的版本。旧版 macOS 版本使用的是 AppleHDA 协议，目前还没有实现。

每次只能有一组音频协议可用，所以如果为了在 Mac 系统上的 OpenCore 用户界面实现其中一些协议的音频播放，这一设置应该启用。

*注*：后端音频驱动需要在 `UEFI Audio` 部分进行配置，以便这些协议能够流式传输音频。

### 2. `AppleBootPolicy`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple Boot Policy 协议，可用于确保 VM 或旧版 Mac 设备上的 APFS 兼容性。

*注*：某些 Mac 设备（例如：`MacPro5,1`）虽然兼容 APFS，但是其 Apple Boot Policy 协议包含了恢复分区检测问题，因此也建议启用这一选项。

### 3. `AppleDebugLog`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple 调试日志输出协议。

### 4. `AppleEg2Info`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 `Apple EFI Graphics 2` 协议。

*注 1*：该协议允许更新的 `EfiBoot` 版本（至少 10.15）向 macOS 公开屏幕旋转。有关如何设置屏幕旋转角度，请参阅 `ForceDisplayRotationInfo` 变量说明。

*注 2*：在没有 `ForceDisplayRotationInEFI` 原生支持的系统上，必须设置 `DirectGopRendering=true`。  
  
### 5. `AppleFramebufferInfo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 重新安装内置的 Apple Framebuffer Info 协议。这样可以覆盖虚拟机或者旧款 Mac 上的缓冲帧信息，从而提高与旧版 EfiBoot（例如 macOS 10.4 中的 `EfiBoot`）的兼容性。

*注*：这个属性的当前实现导致它只有在 GOP 可用时才是有效的（否则它总是相当于false）。
  
### 6. `AppleImageConversion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple Image Conservation 协议。

### 7. `AppleImg4Verification`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple IMG4 验证协议。该协议用于验证 Apple 安全启动所使用的 `im4m` 清单文件。

### 8. `AppleKeyMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple Key Map 协议。

### 9. `AppleRtcRam`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple RTC RAM 协议。

*注*：内置的 Apple RTC RAM 协议可能会过滤掉 RTC 内存地址的潜在 I/O。地址列表可以在 `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:rtc-blacklist` 中以数组的方式指定。

### 10. `AppleSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple 安全启动协议。

### 11. `AppleSmcIo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 SMC I/O 协议。

这一协议代替了传统的 `VirtualSmc.efi`，并与所有 SMC Kext 驱动兼容。如果你在用 FakeSMC，可能需要手动往 NVRAM 中添加键值对。

### 12. `AppleUserInterfaceTheme`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Apple User Interface Theme 协议。

### 13. `DataHub`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Data Hub 协议。如果已经安装了协议，这将删除所有先前的属性。

*注*：如果协议已经安装，这将丢弃之前的所有条目，因此必须在配置文件中指定系统安全运行所需的所有属性。  
  
### 14. `DeviceProperties`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置的版本替换 Device Property 协议。 这一选项可用于确保在 VM 或旧版 Mac 设备上的兼容性。

*注*：如果协议已经安装，这将丢弃之前的所有条目，因此必须在配置文件中指定系统安全运行所需的所有属性。  
  
### 15. `FirmwareVolume`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 强制包装固件卷协议或安装新版本以支持 FileVault 2 的自定义光标图像。建议启用这一选项以确保 FileVault 2 在除 VM 和传统 Mac 设备之外的兼容性。

*注*：包括 VMWare 在内的多个虚拟机在 HiDPI 模式下光标会损坏，因此建议为所有虚拟机启用这一选项。

### 16. `HashServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置版本替换 Hash Services 协议。为了在 SHA-1 哈希协议不完整的固件上确保 FileVault 2 的兼容性，这一 Quirk 应设置为 `true`。对于大多数固件来说，你可以通过将 `UIScale` 设置为 `02` 查看是否会出现禁行图标，来诊断你的固件是否需要这一 Quirk。一般来说，APTIO V（Haswell 和更早的平台）之前的平台都会受到影响。

### 17. `OSInfo`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置版本替换 OS Info 协议。该协议通常用于通过固件或其他应用程序从 macOS 引导加载程序接收通知。

### 18. `UnicodeCollation`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用内置版本替换 Unicode Collation 服务。建议启用这一选项以确保 UEFI Shell 的兼容性。一些较旧的固件破坏了 Unicode 排序规则，启用后可以修复这些系统上 UEFI Shell 的兼容性 (通常为用于 IvyBridge 或更旧的设备)

## 11.17 Quirks 属性

### 1. `ActivateHpetSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 激活 HPET 支持。
  
像 ICH6 这样的旧板子在固件首选项中可能并不总是有 HPET 设置，这个选项试图强制启用它。  
  
### 2. `EnableVectorAcceleration`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用 `SHA-512` 和 `SHA-384` 哈希算法的 `AVX` 矢量加速。    
  
*注*：这个选项可能会在某些笔记本电脑的固件上引起问题，包括联想。  
  
 ### 3. `EnableVmx`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用英特尔虚拟机扩展。
  
*注*：需要在某些 Mac 硬件上允许 Windows 中进行虚拟化。在大多数固件上 OpenCore 启动之前，VMX 被 BIOS 启用或禁用并锁定。在可能的情况下，使用 BIOS 来启用虚拟化。  
 
### 4. `DisableSecurityPolicy`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 禁用平台安全策略。

*注*：此设置可禁用固件的各种安全功能，因此也会同时破坏安全启动策略。如果打算使用 UEFI 安全启动，请勿启用此项。

### 5. `ExitBootServicesDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 在 `EXIT_BOOT_SERVICES` 事件后添加延迟，单位为毫秒。

这是一个非常粗略的解决办法，可以规避某些 APTIO IV 固件（ASUS Z87-Pro）上的 `Still waiting for root device` 提示信息。特别是在使用 FileVault 2 时。似乎因为某种原因，FileVault 与 `EXIT_BOOT_SERVICES` 同时执行、导致 macOS 无法访问 SATA 控制器。需要一个更好的方法，Acidanthera 愿意接受建议。如果需要启用这一选项，设置 3-5 秒的延时就可以了。

### 6. `ForceOcWriteFlash`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 启用所有 OpenCore 管理的 NVRAM 系统变量向闪存的写入。  
  
*注*：这个值在大多数的固件上应该是禁用的，但是为了考虑到可能有易失性变量存储溢出或类似问题的固件，所以留下了可配置的值。没有启用这个 Quirk 时，在联想 Thinkpad T430 和 T530 上可以观察到跨多个操作系统的启动问题。出于安全原因，与安全启动和休眠有关的 Apple 变量不在此列。此外，一些 OpenCore 变量由于不同的原因被豁免，例如由于一个可用的用户选项，启动日志，以及由于时间问题，TSC 频率。在切换该选项时，可能需要对 NVRAM 进行重置，以确保完整的功能。  
  
### 7. `ForgeUefiSupport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 `EFI 1.x` 固件上提供部分 `UEFI 2.x` 支持。

*注*：此设置允许在带有旧 `EFI 1.x` 固件（例如：MacPro5,1）的硬件上运行为 `UEFI 2.x` 固件（如NVIDIA GOP Option ROM）编写的一些软件。

### 8. `IgnoreInvalidFlexRatio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些类型的固件（例如：APTIO IV）可能在 `MSR_FLEX_RATIO（0x194）MSR` 寄存器中包含无效的值。这些值可能导致英特尔平台上的 macOS 启动失败。  

注意：虽然该选项预计不会损害未受影响的固件，但只有在特别需要时才建议使用该选项。  
  
### 9. `ReleaseUsbOwnership`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试从固件驱动程序中分离 USB 控制器所有权。尽管大多数固件都设法正确执行了该操作或者提供有一个选项，但某些固件没有，从而导致操作系统可能会在启动时冻结。除非需要，否则不建议启用这一选项。

### 10. `ReloadOptionRoms`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 查询 PCI 设备并重新加载其可选 ROM（如果可用）。  
  
例如，该选项允许在通过 ForgeUefiSupport 升级固件版本后，在旧版 Mac 上重新加载 NVIDIA GOP Option ROM。  
  
### 11. `RequestBootVarRouting`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 请求将所有带有 `Boot` 前缀的变量从 `EFI_GLOBAL_VARIABLE_GUID` 重定向到 `OC_VENDOR_VARIABLE_GUID`。

启用这个 Quirk 需要用到在 `OpenRuntime.efi` 中实现的 `OC_FIRMWARE_RUNTIME` 协议。当固件删除不兼容的启动条目时，这一 Quirk 可以让默认的启动条目保存在引导菜单中。简单地说就是，如果你想使用「系统偏好设置」中的「[启动磁盘](https://support.apple.com/HT202796)」，就必须启用这一 Quirk。

借助 `RequestBootVarRouting` 将 `Boot` 前缀变量重定向至单独的 GUID 命名空间，可实现以下效果：

- 囚禁操作系统，使其只受 OpenCore 引导环境的控制，从而提高了安全性。
- 如遇到中途需要通过 OpenCore 来重启的情况，操作系统不会搞乱 OpenCore 的引导优先级，保证了系统更新和休眠唤醒的流畅性。
- macOS 等潜在的不兼容的启动项，现在不会被意外删除或损坏了。

### 12. `ResizeGpuBars`

**Type**: `plist integer`
**Failsafe**: `-1`
**Description**: 配置 GPU PCI BAR 的大小。  
  
这个 Quirk 按照规定设置 GPU PCI BAR 的大小，或者选择低于 ResizeGpuBars 值的最大可用值。指定的值遵循 PCI Resizable BAR 的规则。使用 0 代表 1MB，1 代表 2M，2 代表 4MB，以此类推，直到 19 代表 512GB。
  
Resizable BAR 技术允许通过将可配置的内存区域 BAR 映射到 CPU 地址空间（例如，将 VRAM 映射到 RAM），而不是固定的内存区域，来简化 PCI 设备的编程。这项技术是必要的，因为人们不能在默认情况下映射最大的内存区域，原因是要向后兼容不支持 64 位 BAR 的旧硬件。因此，过去十年的设备默认使用 256MB 的 BAR（剩下的 4 位被其他数据使用），但通常允许将它们的大小调整为更小和更大的 2 次方（例如，从 1MB 到 VRAM 大小）。  
  
针对 x86 平台的操作系统通常不控制 PCI 地址空间，让 UEFI 固件决定 BAR 地址和大小。这种非法的做法导致 Resizable BAR 技术直到 2020 年都没有被使用，尽管它在 2008 年被标准化，并在不久后被广泛用于硬件。

现代 UEFI 固件允许使用 Resizable BAR 技术，但通常将可配置的选项限制为故障安全默认值（OFF）和最大可用值（ON）。这个 Quirk 允许为测试和开发目的微调这个值。  
  
考虑一个有 2 个 BAR 的 GPU。
- BAR0 支持从 256MB 到 8GB 的大小。它的值是 4GB。
- BAR1 支持从 2MB 到 256MB 的大小。它的值是 256MB。  
  
*例 1*：将 ResizeGpuBars 设置为 1GB 将改变 BAR0 为 1GB，BAR1 保持不变。

*例 2*: 将 ResizeGpuBars 设置为 1MB 将改变 BAR0 为 256MB，BAR0 为 2MB。

*例 3*：将 ResizeGpuBars 设置为 16GB 将改变 BAR0 为 8GB，BAR1 保持不变。 

*注 1*：这个 Quirk 不应该被用来解决 macOS 对超过 1GB 的 BAR 的限制。应该使用 ResizeAppleGpuBars 来代替。

*注 2*：虽然这个 Quirk 可以增加 GPU PCI BAR 的大小，但这在大多数固件上是行不通的，因为这个 Quirk 不会重新定位内存中的 BAR，而且它们可能会重叠。我们欢迎大家为改进这一功能做出贡献。  
  
### 13. `TscSyncTimeout`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 尝试用指定的 Timeout 执行 TSC 同步。

这个 Quirk 的主要目的是在运行 XNU 调试内核时，在一些服务器和笔记本型号上实现早期引导 TSC 同步。对于调试内核，在任何 Kext 可能导致其他解决方案出现问题之前，TSC 需要在各个内核之间保持同步。Timeout 以微秒为单位，取决于平台上存在的核心数量，推荐的起始值是 `500000`。

这是一个实验性的 Quirk，只能被用于上述问题。在其他情况下，这个 Quirk 可能会导致操作系统不稳定，所以并不推荐使用。在其他情况下，推荐的解决办法是安装一个内核驱动，如 [VoodooTSCSync](https://github.com/RehabMan/VoodooTSCSync)、[TSCAdjustReset](https://github.com/interferenc/TSCAdjustReset) 或 [CpuTscSync](https://github.com/lvs1974/CpuTscSync)（是 VoodooTSCSync 的一个更有针对性的变种，适用于较新的笔记本电脑）。

*注*：这个 Quirk 不能取代内核驱动的原因是它不能在 ACPI `S3` 模式（睡眠唤醒）下运行，而且 UEFI 固件提供的多核心支持非常有限，无法精确地更新 `MSR` 寄存器。

### 14. `UnblockFsConnect`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件通过「按驱动程序」模式下来阻止引导项加载，导致文件系统协议无法安装。

*注*：如果惠普笔记本在 OpenCore 界面没有看到引导项，启用这一选项。

## 11.13 ReservedMemory 属性

### 1. `Address`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 保留内存区域的起始地址，该区域应被分配为保留区，有效地将此类型的内存标记标记为操作系统不可访问。

这里写的地址必须是内存映射的一部分，具有 `EfiConventionalMemory` 类型，并且按页对齐（`4KB`）。

*注*：禁用 CSM 后，某些固件可能不会为 `S3`（睡眠）和 `S4`（休眠）分配内存区域，因此导致唤醒失败。你可以分别比较禁用和启用 CSM 的内存映射，从低层内存中找到这些区域，并保留该区域来修复这个问题。详见 `Sample.plist`。

### 2. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 3. `Size`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 保留的内存区域的大小，必须按页对齐（`4KB`）。

### 4. `Type`

**Type**: `plist string`
**Failsafe**: `Reserved`
**Description**: 内存区域类型，与 UEFI 规范的内存描述符类型的匹配映射如下：
  - `Reserved` — `EfiReservedMemoryType`
  - `LoaderCode` — `EfiLoaderCode`
  - `LoaderData` — `EfiLoaderData`
  - `BootServiceCode` — `EfiBootServicesCode`
  - `BootServiceData` — `EfiBootServicesData`
  - `RuntimeCode` — `EfiRuntimeServicesCode`
  - `RuntimeData` — `EfiRuntimeServicesData`
  - `Available` — `EfiConventionalMemory`
  - `Persistent` — `EfiPersistentMemory`
  - `UnusableMemory` — `EfiUnusableMemory`
  - `ACPIReclaimMemory` — `EfiACPIReclaimMemory`
  - `ACPIMemoryNVS` — `EfiACPIMemoryNVS`
  - `MemoryMappedIO` — `EfiMemoryMappedIO`
  - `MemoryMappedIOPortSpace` — `EfiMemoryMappedIOPortSpace`
  - `PalCode` — `EfiPalCode`

### 5. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非设置为 `true`，否则该区域不会被保留。
