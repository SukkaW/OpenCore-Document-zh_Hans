---
title: 8. Misc
description: 关于 OpenCore 行为的其他配置
type: docs
author_info: 由 xMuu、Sukka、derbalkon、EricKwok、cike-567 整理、由 Sukka、derbalkon、EricKwok、cike-567 翻译。
last_updated: 2024-02-09
---

## 8.1 简介

本部分包含关于 OpenCore 操作系统加载行为的各种配置选项，以及不能被分类到其它章节的配置条目的说明。

OpenCore 大体上遵循 `bless` 模式，即 `Apple Boot Policy`。`bless` 模式的主要特点是允许在文件系统中嵌入启动选项（而且能通过专门的驱动程序访问），同时，相比于 UEFI 规范中的可移动媒体列表，它还支持更多的预定义启动路径。

只有当分区符合 `Scan policy` 时才能被启动（`Scan policy` 是一组限制条件，能够使其仅使用特定文件系统和特定设备类型的分区）。具体的扫描策略（`Scan policy`）将在下面的 `ScanPolicy` 属性中阐述。

扫描过程从获取 `Scan policy` 过滤过的分区开始。每个分区可能会产生多个主选项和备用选项。主选项描述的是安装在这个介质上的操作系统。备用选项描述的是介质上的操作系统的恢复项。备用选项可以在没有主选项的情况下存在，反之亦然。

- 替代选项可能在没有主选项的情况下存在，反之亦然。
- 请注意，这些选项描述的操作系统不一定都在同一个分区上。
- 每个主选项和备用选项都可以作为辅助选项（Auxiliary Option），也可以不作为辅助选项。
  - 具体细节参考下面的 `HideAuxiliary` 章节。

### 8.1.1 引导算法

用来确定启动选项的算法如下：

1. 通过 `Scan policy`（和驱动可用性）过滤，获取所有可用的分区句柄。
2. 从 `BootOrder` UEFI 变量中，获取所有可用的启动选项。
3. 对于每个找到的启动选项：
   - 检索该启动选项的设备路径。
   - 执行对设备路径的修复（如 NVMe 子类型修复）和扩展（例如： Boot Camp）。
   - 失败时，如果是 OpenCore 自定义条目设备路径，则预先构建相应的自定义条目并继承。
   - 通过定位到所产生的设备路径，来获取句柄（失败时忽略）。
   - 在分区句柄列表中找到设备句柄（缺失时忽略）。
   - 对磁盘设备路径（不指定引导程序）执行 `bless`（可能返回不止一个条目）。
   - 对文件设备路径直接检查其文件系统。
   - 如果在 `bootloader` 附近或相关位置（见下文）内有一个内容为 ASCII 编码的 `Disabled` 的 `.contentVisibility` 文件，并且当前的 InstanceIentifier 匹配可能存在的 Instance-List，则排除这些条目。
   - 如果有分区句柄列表，则在列表中将设备句柄标记为 *used*。
   - 将生成的条目注册为主要选项，并确定它们的类型。对于某些类型（例如：Apple HFS recovery）或者如果其 `.contentVisibility` 文件包含 “Auxiliary”（并且当前的 InstanceIentifier 匹配可能存在的 Instance-List），该选项将成为辅助选项。
4. 对于每个分区句柄：
   - 如果分区句柄被标记为 *unused*，则执行 `bless` 主选项列表检索。如果设置了 `BlessOverride` 列表，那么不仅能找到标准的 `bless` 路径，还能找到自定义的路径。
   - 在 OpenCore 启动分区中，通过 Header Check 排除所有 OpenCore Bootstrap 文件。
   - 将生成的条目注册为主选项，并确定他们的类型。某些类型的选项作为辅助选项（如 Apple HFS Recovery）。
   - 如果分区已经具有来 `Apple Recovery` 类型的主选项，则继续处理下一个句柄。
   - 通过 `bless` 恢复选项列表检索和预定义路径，来查找备用条目。
   - 将生成的条目注册为备用辅助选项，并确定它们的类型。
5. 把自定义条目和工具添加为主选项（以前预先构造的除外），不做有关 `Auxiliary` 的任何检查。
6. 把系统条目（如 `Reset NVRAM`）添加为主要的辅助选项。

 `.contentVisibility` 文件可以放置在 `bootloader` 附近（例如：boot.efi），或者放置在 boot 文件夹中（对于基于 DMG 文件夹的引导项）。从 macOS 内部看到的示例位置是：

    - /System/Volumes/Preboot/{GUID}/System/Library/CoreServices/.contentVisibility
    - /Volumes/{ESP}/EFI/BOOT/.contentVisibility
此外，`.contentVisibility` 文件还可以放置在与引导条目相关的实例特定文件夹（或 macOS）或绝对根文件夹中，例如：

    - /System/Volumes/Preboot/{GUID}/.contentVisibility
    - /System/Volumes/Preboot/.contentVisibility
    - /Volumes/{ESP}/.contentVisibility（不建议）
    
对于 macOS，专门支持这些根文件夹位置，因为非苹果文件在 macOS 更新中会被移除。将 `.contentVisibility` 文件放在非 macOS 根位置（例如上述最后一个位置）是支持的，但并不建议，因为它会隐藏驱动器上的所有条目。

当存在 `.contentVisibility` 文件时，它可以选择性地针对 OpenCore 的特定实例。其内容格式为 [(Instance-List)]:(Disabled|Auxiliary)。如果存在冒号（:），则前面的 Instance-List 是逗号分隔的 InstanceIdentifier 值列表（例如：OCA,OCB:Disabled）。当此列表存在时，指定的可见性仅应用于当前 OpenCore 实例的 InstanceIdentifier 存在于列表中的情况。当列表不存在时，指定的可见性将应用于所有 OpenCore 实例。

*注 1*：对于没有 InstanceIdentifier 值的任何 OpenCore 实例，来自具有 Instance-List 的 `.contentVisibility` 文件的指定可见性永远不会生效。

*注 2*：带有可见性列表的可见性将在较早版本的 OpenCore 中被视为无效，因此会被忽略，这在比较旧版和新版的行为时可能会有用。

*注 3*：避免在 `.contentVisibility` 文件中出现多余的空格：它们不会被视为空格，而是作为相邻标记的一部分。

OpenCore 启动选择器中的启动选项的显示顺序和启动过程，是通过扫描算法分别来确定的。

显示顺序如下：

- 备用选项跟随主选项，即，Apple Recovery 会尽可能地跟随相关的 macOS 选项。
- 选项会按照文件系统句柄固件的顺序列出，以便在整个启动过程中保持一个既定的顺序，不因加载操作系统的不同而变化。
- 自定义条目、工具和系统条目会被添加到所有选项之后。
- 辅助选项只有在进入「扩展模式」后才会显示（一般是按空格键）。

启动过程如下：

- 尝试通过 `BootNext` UEFI 变量查找第一个有效的主选项。
- 如果失败，则通过 `BootOrder` UEFI 变量查找第一个有效的主选项。
- 将该选项标记为默认启动选项。
- 是否通过启动选择器来启动选项，取决于 `ShowPicker` 选项的设置。
- 如果还出现问题，则显示启动选择器。

*注 1*：这个过程只有在启用了 `RequestBootVarRouting` 选项，或者固件不控制 UEFI 启动选项（如 `OpenDuetPkg` 或其他自定义 BDS）时，才会可靠地工作。如果不启用 `LauncherOption`，那么其他操作系统有可能会覆盖 OpenCore，如果你打算使用其他操作系统，请确保启用这个选项。

*注 2*：UEFI 变量引导选项的引导参数，如果存在的话则会被丢弃，因为它们包含的一些参数可能会对操作系统产生不利影响，这在启用安全引导时是不可取的。

*注 3*：某些操作系统（说的就是你，Windows）会在第一次启动时，或 NVRAM 重置后，创建他们的启动选项，并将其标记为最上面的选项。这种情况发生时，默认的启动条目选择将会更新，直到下一次重新手动配置。

> 译者注：全新安装 windows 会使用已有的 ESP 分区的，并在里面放入自己的 EFI 文件。升级 win11，会覆盖 ESP 分区的 EFI 文件夹里的 BOOT 文件夹。总之备份好 opencore。

## 8.2 属性列表

### 1. `Boot`

**Type**: `plist dict`
**Description**: 应用本章节 Boot 属性中的引导相关设置。

### 2. `BlessOverride`

**Type**: `plist array`
**Description**: 通过 Bless Model 添加自定义扫描路径。

设计为填充 `plist string` 条目，其中包含指向自定义引导程序的绝对 UEFI 路径，例如，用于 Debian 引导程序的 `\EFI\debian\grubx64.efi`。这允许引导选择器自动发现异常的引导路径。在设计上它们等效于预定义的 `Bless` 路径（如 `\System\Library\CoreServices\boot.efi` 和 `\EFI\Microsoft\Boot\bootmgfw.efi`），但与预定义的 `Bless` 路径不同，它们具有最高优先级。

### 3. `Debug`

**Type**: `plist dict`
**Description**: 应用本章节 Debug 属性中的调试相关设置。

### 4. `Entries`

**Type**: `plist array`
**Description**: 在开机引导菜单中添加引导项。

应填入 `plist dict` 类型的值来描述相应的加载条目。详见 Entry 属性部分。

### 5. `Security`

**Type**: `plist dict`
**Description**: 应用本章节 Security 属性中的安全相关设置。

### 6. `Serial`

**Type**: `plist dict`
**Description**: 执行串行端口初始化并配置 BaseSerialPortLib16550 要求的 `PCD` 值，以使串行端口正常运行。这些值在下面的 Serial 属性和 Serial Custom 属性部分列出和描述。

通过启用 Init，这部分可以确保在固件没有完成的情况下对串行端口进行初始化。为了使 OpenCore 向串行端口打印日志，必须设置 Misc->Debug 部分的 `Target` 第 `3` 位（即串行日志）。

当使用串口调试时，BaseSerialPortLib16550 默认只识别由主板提供的内部串口。如果启用了 `Override` 选项，将覆盖 BaseSerialPortLib16550.inf 中列出的 `PCD` 值，这样外部串口（例如来自 PCI 卡）也能正常工作。具体来说，在排除  macOS 的故障时，除了覆盖这些 `PCD` 值之外，还需要打开 `CustomPciSerialDevice` 内核 Quirks，以便 XNU 使用这些外部串口。

请参考 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 对每个键的解释。

### 7. `Tools`

**Type**: `plist array`
**Description**: 将工具条目添加到开机引导菜单。

应填入 `plist dict` 类型的值来描述相应的加载条目。详见 Entry 属性部分。

*注*：某些 UEFI 工具（例如 UEFI shell）可能非常危险，利用这些工具可以轻易地绕过安全启动链，所以 **千万不要** 出现在生产环境配置中，尤其是设置了 Vault 和安全启动保护的设备（译者注：即，工具仅作调试用）。具体的工具示例参见本文档的 UEFI 部分。

## 8.3 Boot 属性

### 1. `ConsoleAttributes`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 为控制台设置特定的属性。

根据 UEFI 规范，文本渲染器支持的颜色参数为前景色与背景色之和。黑色背景色和黑色前景色的值(`0`) 是预留的。以下是颜色名称一览：

- `0x00` — `EFI_BLACK`（黑色字体）
- `0x01` — `EFI_BLUE`（蓝色字体）
- `0x02` — `EFI_GREEN`（绿色字体）
- `0x03` — `EFI_CYAN`（青色字体）
- `0x04` — `EFI_RED`（红色字体）
- `0x05` — `EFI_MAGENTA`（紫色字体）
- `0x06` — `EFI_BROWN`（棕色字体）
- `0x07` — `EFI_LIGHTGRAY`（亮灰色字体）
- `0x08` — `EFI_DARKGRAY`（暗灰色字体）
- `0x09` — `EFI_LIGHTBLUE`（淡蓝色字体）
- `0x0A` — `EFI_LIGHTGREEN`（淡绿色字体）
- `0x0B` — `EFI_LIGHTCYAN`（淡青色字体）
- `0x0C` — `EFI_LIGHTRED`（淡红色字体）
- `0x0D` — `EFI_LIGHTMAGENTA`（淡紫色字体）
- `0x0E` — `EFI_YELLOW`（黄色字体）
- `0x0F` — `EFI_WHITE`（白色字体）
- `0x00` — `EFI_BACKGROUND_BLACK`（黑色背景）
- `0x10` — `EFI_BACKGROUND_BLUE`（蓝色背景）
- `0x20` — `EFI_BACKGROUND_GREEN`（绿色背景）
- `0x30` — `EFI_BACKGROUND_CYAN`（青色背景）
- `0x40` — `EFI_BACKGROUND_RED`（红色背景）
- `0x50` — `EFI_BACKGROUND_MAGENTA`（紫色背景）
- `0x60` — `EFI_BACKGROUND_BROWN`（棕色背景）
- `0x70` — `EFI_BACKGROUND_LIGHTGRAY`（亮灰色背景）

*注*：这个选项可能和 `TextRenderer` 的 `System` 参数有冲突，设置一个非黑的背景可以用来测试 GOP 是否正常运行。

### 2. `HibernateMode`

**Type**: `plist string`
**Failsafe**: `None`
**Description**: 休眠检测模式。 支持以下模式：

- `None` --- 忽略休眠状态
- `Auto` --- 从 RTC 或 NVRAM 中检测
- `RTC` --- 从 RTC 检测
- `NVRAM` --- 从 NVRAM 检测

*注*：如果固件自身能处理休眠（大多数 Mac 的 EFI 固件都可以），你应该在此处设置为 `None` 来让固件处理休眠状态并传递给 OpenCore。

### 3. `HibernateSkipsPicker`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 从 macOS 唤醒时不显示启动选择器。

限制条件：
- 只支持 `macOS` 的休眠唤醒，`Windows` 和 `Linux` 目前不在范围内。
- 只应在 `macOS` 中具有可靠休眠唤醒功能的系统上使用，否则用户可能无法直观地看到可能发生的启动循环。
- 强烈建议将该选项与 `PollAppleHotKeys` 搭配使用，允许在休眠唤醒出现问题时进入启动选择程序。
- 休眠唤醒的视觉指示目前超出范围。

### 4. `HideAuxiliary`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 默认情况下，隐藏开机引导项菜单中的辅助条目。

满足任一以下条件的引导项条目即会被视为「辅助项目」

- 该引导项是 macOS Recovery 分区
- 该引导项是 macOS Time Machine 分区
- 该引导项被标记为 Auxiliary
- 该引导项是系统提供的（例如：Reset NVRAM）

即使被隐藏，你仍然可以通过按空格键进入「扩展模式」查看所有条目（引导项菜单会被重新加载），隐藏辅助条目可能有助于提高多磁盘系统的引导性能，简单来说就是可能提高启动速度。

### 5. `InstanceIdentifier`

**Type**: `plist string`
**Failsafe**: `false`
**Description**: 当前 OpenCore 实例的可选标识符。

通常应该是一个简短的字母数字字符串。目前该值的用途是选择性地将 `.contentVisibility` 文件定位到特定的 OpenCore 实例。如[引导算法](https://oc.skk.moe/8-misc.html#8-1-1-引导算法)部分中所述。

### 6. `LauncherOption`

**Type**: `plist string`
**Failsafe**: `Empty`
**Description**: 在固件偏好设置中注册启动器选项，以保证 bootloader 的持久与一致性。

有效值有：
- `Disabled` --- 什么都不做。
- `Full` --- 在 bootloader 启动时，在 UEFI 变量存储中创建或更新最高优先级的启动项。要使用这个选项，必须同时开启 `RequestBootVarRouting`。
- `Short` --- 创建一个短的、非完整的启动项。此值对于某些固件很有用（例如：Insyde），或者其他无法处理完整设备路径的固件。
- `System` --- 不创建启动项，而是认为该项是 blessed 的。这种 variant 在依赖 `ForceBooterSignature` 属性和 OpenCore 启动器路径时非常有用。管理是通过 bless 工具进行的，不涉及 OpenCore。

在安装和升级第三方操作系统时 `\EFI\BOOT\BOOTx64.efi` 文件可能会被覆盖掉，该选项则保证了出现覆盖情况时 bootloader 的一致性。创建一个自定义启动项后，`\EFI\BOOT\BOOTx64.efi` 这个文件路径将不再用于引导 OpenCore。自定义的引导路径在 `LauncherPath` 选项中指定。

*注 1*：某些固件的 NVRAM 本身存在问题，可能会出现无启动项支持，或者其他各种不兼容的情况。虽然可能性不大，但使用此选项可能会导致启动失败。请在已知兼容的主板上使用，风险自行考虑。请查看 [acidanthera/bugtracker#1222](https://github.com/acidanthera/bugtracker/issues/1222) 来了解与 Haswell 及其他一些主板相关的已知问题。

*注 2*：虽然从 OpenCore 执行的 NVRAM 重置不会清除在 Bootstrap 模式中创建的启动选项，但在加载 OpenCore 之前重置 NVRAM 则会同时清除。在进行某些涉及重要实现的更新时（例如：OpenCore 0.6.4），须确保在禁用 Bootstrap 的情况下执行一次 NVRAM 重置，然后再重新启用。

*注 3*：英特尔 Visual BIOS 的某些版本（例如：英特尔 NUC）有一个不幸的错误，即如果添加了提及 USB 驱动器路径的任何启动选项，那么从那时起，当插入任何 USB 驱动器时，这将是唯一的启动选项。如果在该固件上从 USB 驱动器启动 OpenCore，并将 LauncherOption 设置为 `Full` 或 `Short`，那么这一点就适用，之后在插入任何其他 USB 时，只能看到 OpenCore 的启动项（这种高度非标准的 BIOS 行为也会影响其他软件）。避免这种情况的最佳方法是在任何版本的 OpenCore 上将LauncherOption 设置为 `Disabled` 或 `System`，该固件将从 USB 驱动器启动。

如果问题已经发生，最快的可靠修复方法是：
- 在 Intel Visual BIOS 中启用 system  UEFI Shell
- 在关闭电源的情况下，插入 OpenCore USB
- 开机并选择 system  UEFI Shell
- 由于 system Shell 不包括 bcfg，因此使用 system Shell 来启动 OpenCore 的 OpenShell（例如输入`FS2:\EFI\OC\Tools\OpenShell.efi` 命令，但你需要弄清楚 OpenCore 在哪个驱动器上，并相应地修改驱动器编号FS#:）。
- 在 OpenShell 中，使用 `bcfg boot dump` 显示 NVRAM 启动选项，然后使用 `bcfg boot rm #`（其中#是OpenCore启动条目的编号）来删除 OpenCore 条目。

如果你有一个为系统配置的 OpenCore，也可以直接从 OpenCore 启动菜单中启动 OpenShell。在这种情况下，如果 OpenCore 启用了 `RequestBootVarRouting`，就有必要在使用 bcfg 之前运行命令 `\EFI\OC\Tools\OpenControl.efi disable` （在禁用 OpenControl 之后，有必要在启动操作系统之前重启或运行 `OpenControl restore`）。如果你的机器上有一个工作版本的Linux，也可以在 Linux 中使用 efibootmgr 来删除违规的条目。Linux 必须不通过 OpenCore 启动，或者通过禁用 `RequestBootVarRouting` 的 OpenCore 启动，这样才能发挥作用。

### 7. `LauncherPath`

**Type**: `plist string`
**Failsafe**: `Default`
**Description**: `LauncherOption` 的启动引导路径。

`Default` 用于引导 `OpenCore.efi`。其他的路径（例如：`\EFI\Launcher.efi`）可用来提供自定义加载器，用于自行加载 `OpenCore.efi`。

### 8. `PickerAttributes`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 设置开机引导菜单的属性。

可以用属性掩码来设置引导菜单的不同属性，其中掩码包含 OpenCore 的预留值（`BIT0` 到 `BIT15`）和 OEM 特定值（`BIT16` 到 `BIT31`）。

目前 OpenCore 的预留值有：
- `0x0001` — `OC_ATTR_USE_VOLUME_ICON`，为启动项提供自定义图标：
  OpenCore 将尝试通过搜索加载卷宗图标，不存在时回退到默认图标：
  - APFS 卷宗图标的 `.VolumeIcon.icns` 文件，置于 `Preboot` 卷宗目录（`/System/Volumes/Preboot/{GUID}/`，当在 macOS 内的默认位置时）下（如果存在）。
  - APFS 卷宗图标的 `.VolumeIcon.icns` 文件，置于 `Preboot` 根目录(`/System/Volumes/Preboot/`，当在 macOS 内的默认位置时)下（其他情况）。
  - 其他文件系统的 `.VolumeIcon.icns` 文件，置于其卷宗根目录下。

*注 1*：Apple 启动器部分支持在 macOS 内的默认位置放置卷图标文件，将其放置在操作系统的数据卷根目录  `/System/Volumes/Data/`。这种方法是有缺陷的：当 `FileVault 2` 被启用时，文件既不能被 `OpenCanopy` 访问，也不能被 `Apple picker` 访问，而 `FileVault 2` 应该是默认选择。因此，`OpenCanopy` 不尝试支持苹果的方法。卷图标文件可以放在 `Preboot` 卷的根部，以便与 `OpenCanopy` 和 `Apple picker`兼容，或者使用 `Preboot` 每个卷的位置，如上所述，  `OpenCanopy` 是苹果方法的首选替代方案。

*注 2*：请注意，在任何驱动器上使用卷图标会覆盖该驱动器的正常 OpenCore 启动器行为，即根据驱动器是内部还是外部选择适当的图标。

- `0x0002` — `OC_ATTR_USE_DISK_LABEL_FILE`，对所有文件系统的引导程序旁边的 `.disk_label`  (`.disk_label_2x`)文件的引导条目使用自定义的预渲染标题。这些标签可以通过 disklabel 工具或 `bless --folder {FOLDER_PATH} --label {LABEL_TEXT}` 命令生成。当预渲染的标签被禁用或缺失时，如果存在的话，使用 bootloader 旁边的 `.contentDetails`（或 `.disk_label.contentDetails`）文件中的标签文本代替，否则将渲染条目名称本身。
- `0x0004` — `OC_ATTR_USE_GENERIC_LABEL_IMAGE`，为没有自定义条目的启动项提供预定义的标签图像。可能会缺少实际启动项的详细信息。
- `0x0008` — `OC_ATTR_HIDE_THEMED_ICONS`，优先选择特定图标集的图标，以配合主题风格，比如可以强制显示特定图标集内置的 Time Machine 图标。需要同时启用 `OC_ATTR_USE_VOLUME_ICON`。
- `0x0010` — `OC_ATTR_USE_POINTER_CONTROL`，在启动选择器中启用指针控制。例如，可以利用鼠标或触摸板来控制 UI 元素。
- `0x0020` - `OC_ATTR_SHOW_DEBUG_DISPLAY`，在启动选择器中显示额外的时间和调试信息。仅在 `Dubug` 和 `NOOPT` 版本的 Builtin picker 中生效。
- `0x0040` - `OC_ATTR_USE_MINIMAL_UI`，显示最小化 UI，不显示关机或重启的按钮。在 OpenCanopy 和 Builtin picker 中生效。
- `0x0080` - `OC_ATTR_USE_FLAVOUR_ICON`，提供弹性的启动项内容描述，可以在不同的图标集中选择最好的图标：
   
当启用的时候，OpenCanopy 中的启动项和 audio assist 项目音频以及 Builtin boot picker 可以被 content flavor 指定。要指定 content flavor，请参考以下规则：
- 对于一个 Tool 项目，将会从其 `Flavour` 中读取
- 对于一个自动发现项目，包括由 OpenLinuxBoot 驱动生成的引导入口协议条目，将会从 bootloader 同目录下的 `.contentFlavour` 文件中读取（如果有的话）
- 对于一个自定义项目，如果其 `Flavour` 为 `Auto`，则从 bootloader 同目录下的 `.contentFlavour` 文件中读取，否则由 `Flavour` 指定
- 如果读取到的 `Flavour` 项目为 `Auto` 或 `.contentFlavour` 文件不存在，则根据启动项类型来选择图标（例如：Windows 将会被自动设置为 Windows 图标）

`Flavour` 的值是一个由 `:` 分隔的名字，必须是可打印的 `7-bit ASCII`，最长限制在 64 字符内。此项目大约能填写五个名字，最前面的名字有最高的优先级，最后面的名字由最低的优先级。这样的结构允许用一个更具体的方式来描述一个启动项，根据音频-图标集的支持情况，灵活选择图标。如果找不到音频或图标文件，则启动器会自动尝试下一个 `flavour`，而如果所有的 `flavour` 都找不到文件，则启动器会根据启动项类型来自动选择图标。以下是一个 `flavour` 的例子：`BigSur:Apple, Windows10:Windows. OpenShell:UEFIShell:Shell.`
   
使用 `flavour` 意味着你可以容易地在图标集之中选择自己想要的图标，在图标集所有的图标中选择一个最合适的图标。比如，指定一个 `flavour` 图标 `Debian:Linux` 则将会尝试使用 `Debian.icns` 这个图标，如果没找到的话则尝试 `Linux.icns`，如果还没找到的话则会回退到 OS 的默认图标，也就是 `HardDrive.icns`。
   
一些需要注意的事情：
- 为了安全考虑，`Ext<Flavour>.icns` 和 `<Flavour>.icns` 都会被支持，并且当启动项是外接硬盘时仅有 `Ext<Flavour>.icns` 会被使用（就像默认的 ExtHardDrive.icns 那样）。
- 当 `.VolumeIcon.icns` 和 `.contentFlavour` 都存在时，以 `.VolumeIcon.icns` 为准。
- 为了使 tools 的图标和屏幕朗读工作正常（例如：UEFI Shell），在 `Flavour` 设置中指定的系统的默认启动项图标（见 Docs/Flavours.md）将仍然被应用，即使 `Flavour` 是禁用状态。在这个情况下非系统的图标将会被忽略。此外，UEFIShell 和 NVRAMReset 的 `flavours` 将会被特殊处理，以辨识它们的正确的屏幕朗读器、默认 builtin 标签等。
- 一个推荐的 `falvours` 列表在 `Docs/Flavours.md` 中

- `0x0100` - `OC_ATTR_USE_REVERSED_UI`，反转关机和重启按钮的位置，影响 OpenCanopy 和内置选择器。反向设置与旧版 macOS 相匹配，因为它是 OpenCore 中以前的默认设置，可能更适合一些自定义背景。仅当 `OC_ATTR_USE_MINIMAL_UI` 未设置时适用。
- `0x0200` - `OC_ATTR_REDUCE_MOTION`，减少 OpenCanopy 中的密码和菜单动画，仅保留传达信息而其他情况下未提供的动画。
  *注*：这些相同的动画，以及额外的动画，如果其信息由语音辅助提供，则在启用 PickerAudioAssist 时将自动禁用。

### 9. `PickerAudioAssist`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在开机引导菜单中启用屏幕朗读。

macOS Bootloader 屏幕朗读的偏好设置是存在 `isVOEnabled.int32` 文件的 `preferences.efires` 中、并受操作系统控制。这里仅提供一个等效的开关。切换 OpenCore 开机引导菜单和 macOS BootLoader FileVault 2 登录界面也可以使用快捷键 `Command+F5`。

*注*：屏幕朗读依赖可以正常工作的音频设备。详情请参考 UEFI Audio 属性部分。 

### 10. `PollAppleHotKeys`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在开机引导菜单中启用 `Modifier Hotkey`。

除了在 `PickerMode` 部分描述的、通常由 Apple BDS 处理的 `Action Hotkeys` 之外，还存在由操作系统引导程序（boot.efi）处理的修改键。这些键允许通过提供不同的启动模式来改变操作系统的行为。

在某些固件上，由于驱动程序不兼容，使用 `Modifier Hotkey` 可能会有问题。为了解决这个问题，这个选项允许在 OpenCore  启动选择器中以更宽松的方式注册某些热键。这种扩展包括支持在选择启动项目之前敲击组合键，以及在选择启动项目时可靠地检测 Shift 键，以解决在启动期间持续按住的热键在许多 PS/2 键盘上不能被可靠地检测的问题。

已知的 `Modifier Hotkey` 如下：
- `CMD+C+MINUS` --- 禁用主板兼容性检查。
- `CMD+K` --- 从 RELEASE 版本的内核启动，类似于 `kcsuffix=release` 参数。
- `CMD+R` --- 从恢复分区启动。
- `CMD+S` --- 启动至单用户模式。
- `CMD+S+MINUS` --- 禁用 KASLR slide，需要事先禁用 SIP。
- `CMD+V` --- 启用 `-v`。
- `Shift+Enter，Shift+Index` --- 启用安全模式，可与 `CTRL+Enter`、`CTRL+[数字]` 结合使用。

### 11. `ShowPicker`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否显示开机引导菜单。

### 12. `TakeoffDelay`

**Type**: `plist integer`, 32 bit
**Failsafe**: `0`
**Description**: 在处理引导项启动和处理 `Action Hotkey` 之前的延迟，以微秒为单位。

引入一个延迟可以提供额外的时间来保持正确的 `Action Hotkey` 序列，例如，启动到恢复模式。在大多数系统中，初始启动标志的出现是一个很好的指示，表明可以按住热键的时间。比这更早的时间，按键可能不会被注册。在一些平台上，由于键盘驱动程序的性质，要访问动作热键，还需要将该选项设置为至少 5000-10000 微秒。

如果配置了开机报时（见音频配置选项），那么以较慢的启动速度为代价，可以使用半秒到一秒的更长的延迟（500000-1000000）来创造类似于真正的 Mac 的行为，其中报时本身可以作为热键可以被按下的一个信号。在 OpenCore 中，由于必须首先加载和连接非本地驱动程序，因此开机鸣叫在开机顺序中不可避免地比在苹果硬件上晚。配置开机鸣叫并增加这个较长的额外延迟，对于那些开机时间快或显示器信号同步慢的系统可能导致在某些开机或重启时根本不显示开机标识的情况也很有用。

### 13. `Timeout`

**Type**: `plist integer`，32 bit
**Failsafe**: `0`
**Description**: 开机引导菜单中，启动默认启动项之前超时时间（以秒为单位）。 使用 `0` 禁用倒计时。

> 译者注：`0` 为关闭倒计时而非跳过倒计时，相当于 Clover 的 `-1`。

### 14. `PickerMode`

**Type**: `plist string`
**Failsafe**: `Builtin`
**Description**: 选择启动管理器的界面。

这里描述的是具有可选用户界面的底层启动管理器，支持以下值：

- `Builtin` --- 使用由 OpenCore 处理的启动管理器，简单的文本用户界面。
- `External` --- 如果可用，则使用外部启动管理器协议，否则使用 `Builtin` 模式。
- `Apple` --- 如果可用，则使用 Apple 启动管理器，否则使用 `Builtin` 模式。

`External` 模式一旦成功，就会完全禁用 OpenCore 中的除策略强制执行的所有其他启动管理器，而 `Apple` 模式下可以绕过策略的强制执行。请参阅 `OpenCanopy` 插件以了解自定义用户界面的实例。

OpenCore 内置的启动选择器包含了一系列在启动过程中选择的操作。支持的操作与 Apple BDS 类似，一般来说能够通过在启动过程中按住 `Action Hotkey` 来实现，目前有以下几种：

- `Default` --- 此项为默认选项，可以让 OpenCore 内置的启动选择器按照 [启动磁盘](https://support.apple.com/zh-cn/guide/mac-help/mchlp1034/mac) 偏好设置中指定的方式加载默认的启动项。
- `ShowPicker` --- 此项会强制显示启动选择器，通常可以在启动时按住 `OPT` 键来实现。将 `ShowPicker` 设置为 `true` 会使 `ShowPicker` 成为默认选项。
- `BootApple` --- 此项会启动到第一个找到的 Apple 操作系统，除非 Apple 已经默认选择了操作系统。按住 `X` 键来选择此选项。
- `BootAppleRecovery` --- 此项会启动到 Apple 操作系统的恢复系统。这里的系统要么是「与默认选中的操作系统相关的恢复系统」，要么是「第一个找到的非 Apple 的默认操作系统的恢复系统」，要么是「无恢复系统」。按住 `CMD+R` 组合键来选择此选项。

*注 1*：在非 Apple 固件上需要激活 `KeySupport`、`OpenUsbKbDxe` 或类似的驱动程序才能工作。然而，并非所有的键处理功能都能在几种类型的固件上实现。

*注 2*：除了 `OPT` 之外，OpenCore 还支持在 ShowPicker 被禁用时使用 `Escape` 和 `Zero` 键进入 OpenCore 启动选择器。`Escape` 的存在是为了支持与 Apple 启动选择器共存（包括 OpenCore Apple 启动选择器模式），并支持未能报告持有 `OPT` 键的固件，如某些 PS/2 键盘上。此外，提供 `Zero` 是为了支持 `Escape` 已经被分配给一些其他预启动固件功能的系统。在不需要 KeySupport 的系统中，从开机后按住这些键中的一个，直到选择器出现，应该总是能成功。如果为系统正确配置了 KeySupport 模式，即有足够长的 KeyForgetThreshold，那么在使用 KeySupport 模式时也应该适用。如果按住键不能成功地进入挑选器，可以尝试多次重复按键来代替。

*注 3*：对于 GOP 有问题的 Mac，如果 OpenCore 的 bless 状态丢失，可能很难重新设置。如果设置为 OpenCore 的工具，并启用 FullNvramAccess，可以使用 BootKicker 实用程序解决此问题。它会启动 Apple picker，允许选择下一个要启动的项目（使用 Enter 键），或者一直选择下一个项目，直到下一次更改。

### 15. `PickerVariant`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 选择启动管理器所使用的图标集。

图标集是一个相对于 `Resources/Image` 的目录路径，其中有图标和一个可选的清单。我们建议使用 `Vendor/Set` 格式的图标集，例如 `Acidanthera\GoldenGate`。
   
作为 [OcBinaryData](https://github.com/acidanthera/OcBinaryData) 资源库的一部分提供的样本资源提供了以下图标集：
- Acidanthera\GoldenGate - macOS 11风格的图标集。
- Acidanthera\Syrah - macOS 10.10风格的图标集。
- Acidanthera\Chardonnay - macOS 10.4风格的图标集。

为了方便起见，还有一些预定义的别名:
   - Auto — 根据 DefaultBackground 颜色，自动选择一组图标。Acidanthera\GoldenGate 为西拉黑，Acidanthera\Chardonnay 为浅灰色。
   - Default —Acidanthera\GoldenGate。

## 8.4 Debug 属性

### 1. `AppleDebug`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用将 `boot.efi` 调试日志保存到 OpenCore 日志。

*注*：此项仅适用于 10.15.4 和更新版本。

### 2. `ApplePanic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 macOS Kernel Panic 保存到 OpenCore 根分区。

保存的文件为 `panic-YYYY-MM-DD-HHMMSS.txt`。强烈建议使用 `keepsyms=1` 引导参数来查看 Panic 日志中的调试符号。如果没有，可以用 `kpdescribe.sh` 实用工具（OpenCore 绑定）来部分恢复堆栈跟踪。

开发者内核和调试内核会产生更有用的 Kernel Panic。调试的时候，可以考虑从 [developer.apple.com](https://developer.apple.com) 下载并安装 `KernelDebugKit`。如果要激活开发者内核，需要添加一个 `kcsuffix=development` 引导参数。使用 `uname -a` 命令来确保你当前加载的内核是一个开发者（或调试）内核。

如果没有使用 OpenCore 的 Kernel Panic 保存机制，仍然可以在 `/Library/Logs/DiagnosticReports` 目录下找到 Panic 日志。从 macOS Catalina 开始，Kernel Panic 会以 JSON 格式储存，所以在传递给 `kpdescribe.sh` 之前需要预处理：

```bash
cat Kernel.panic | grep macOSProcessedStackshotData |
  python3 -c 'import json,sys;print(json.load(sys.stdin)["macOSPanicString"])'
```

### 3. `DisableWatchDog`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件启动操作系统的速度可能不够快（尤其是调试模式下），看门狗定时器会因此中止引导过程。此选项用来关闭看门狗定时器。

### 4. `DisplayDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 屏幕上打印每行输出之间的延迟。

### 5. `DisplayLevel`

**Type**: `plist integer`，64 bit
**Failsafe**: `0`
**Description**: 与屏幕显示相关的 EDK II 调试级别的位掩码（总和）。除非 `Target` 启用了控制台在屏幕上输出日志，否则屏幕上的调试输出将不可见。

   支持以下级别（更多详细信息参见 [DebugLib.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/Library/DebugLib.h)）：

- `0x00000002` (bit `1`) --- `DEBUG_WARN` in `DEBUG`, `NOOPT`, `RELEASE`.
- `0x00000040` (bit `6`) --- `DEBUG_INFO` in `DEBUG`, `NOOPT`.
- `0x00400000` (bit `22`) --- `DEBUG_VERBOSE` in `custom builds`.
- `0x80000000` (bit `31`) --- `DEBUG_ERROR` in `DEBUG`, `NOOPT`, `RELEASE`.

### 6. `LogModules`

**Type**: `plist boolean`
**Failsafe**: `*`
**Description**: 按模块过滤日志条目。

该选项过滤特定模块在日志和屏幕上生成的日志。支持两种模式：
- `+` --- Positive filtering：仅显示选定的模块。
- `-` --- Negative filtering：排除所选模块。

当选择多个日志行标识时，应使用逗号 `，` 作为分隔符。例如：`+OCCPU，OCA，OCB` 这表示只打印 `OCCPU`、`OCA`、`OCB` 模块的日志。而 `-OCCPU，OCA，OCB` 表示这些模块被过滤掉（即不记录）。由于日志中可能存在没有有效前缀的行（即日志行不是由 OpenCore 的部分生成，而是由其他加载的驱动程序生成），因此特殊模块名称问号 (?) 可以包含在列表中以包含 (使用正过滤）或排除（使用负过滤）这些非标准行。当不指定 `+` 或 `-` 符号时，将使用正向过滤 (+)。`*` 表示所有模块都被记录下来。

*注 1*：库的首字母缩写词可以在下面的库部分找到。

*注 2*：在配置日志协议之前打印的消息不能从早期屏幕日志中过滤，但在从早期日志缓冲区中取消缓冲后，将根据其他日志目标的要求进行过滤。

*注 3*：为避免遗漏关键问题，不过滤警告和错误日志消息。

### 7. `SysReport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 EFI 分区中保存系统报告。

启用这一选项后，EFI 分区中将会新建一个 `SysReport` 目录。这一目录中将会保存包含 ACPI、SMBIOS 和音频编解码器的调试信息。保存音频编解码器信息需要加载音频后端驱动。

*注*：基于安全的考虑，`RELEASE` 构建的 OpenCore 将不会内置这一功能。如果需要使用这一功能请使用 `DEBUG` 构建版。

### 8. `Target`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 启用日志记录目标的位掩码（总和）。默认所有日志的输出都是隐藏的，所以当需要调试时，有必要设置这个选项。

支持以下日志记录目标：

- `0x01` (bit `0`) --- 启用日志记录，否则所有日志都会被丢弃
- `0x02` (bit `1`) --- 在屏幕上输出日志
- `0x04` (bit `2`) --- 启用把日志记录到 Data Hub
- `0x08` (bit `3`) --- 启用串行端口记录
- `0x10` (bit `4`) --- 启用 UEFI 变量记录
- `0x20` (bit `5`) --- 启用非易失性 UEFI 变量记录
- `0x40` (bit `6`) --- 启用在 ESP 分区生成日志文件
- `0x80` (bit `7`) --- 与 `0x40` 结合使用，使在 ESP 分区生成日志文件更快，但不安全（请参阅下面的警告 2）。

控制台日志会比其他日志少，根据 build 类型（`RELEASE`、`DEBUG` 或 `NOOPT`）的不同，读取到的日志量也会不同（从最少到最多）。

Data Hub 日志中不包括 Kernel 和 Kext 的日志。要获取 Data Hub 日志，请使用以下命令：

```bash
ioreg -lw0 -p IODeviceTree | grep boot-log | sort | sed 's/.*<\(.*\)>.*/\1/' | xxd -r -p
```

UEFI 变量日志中不包含某些信息，也没有性能数据。为了保持系统的完整性，日志大小被限制在 32KB。有些固件可能会提前截断它，或者在没有内存的情况下完全放弃。使用非易失性 `flag` 将会在每打印一行后把日志写入 NVRAM 闪存。如要获取 UEFI 变量日志，请在 macOS 中使用以下命令：

要获取 UEFI 变量日志，请在 macOS 中使用以下命令：

```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-log |
  awk '{gsub(/%0d%0a%00/,"");gsub(/%0d%0a/,"\n")}1'
```

{% note danger 警告 1 %}
某些固件似乎有 NVRAM 垃圾收集的缺陷。因此，它们可能无法在变量删除后始终释放空间。除非特别需要，否则不要在这类设备上启用非易失性 NVRAM 记录。
{% endnote %}
   
虽然 OpenCore 的引导日志已经包含了基本的版本信息（包括 build 类型和日期），但即使在禁用引导日志的情况下，这些数据也可以在 NVRAM 中的 `opencore-version` 变量中找到。

文件记录会在 EFI 卷宗的根目录下创建一个名为 `opencore-YYYY-MM-DD-HHMMSS.txt` 的文件，其中包含了日志的内容（大写字母部分会被替换为固件中的日期和时间）请注意，固件中的一些文件系统驱动程序不可靠，并且可能会通过 UEFI 写入文件时损坏数据。因此，OpenCore 会尝试用最安全同时也是最慢的方式来写入日志。当你在使用慢速存储驱动器时，请确保已将 `DisableWatchDog` 设置为 `true`。如果你在使用 SSD，应该尽量避免使用这一选项，大量的 I/O 操作会加速消耗 SSD 的寿命。

{% note danger 警告 2 %}
启用快速文件记录，需要完全兼容的固件 FAT32 驱动程序。在不合适的 FAT32 写入支持的驱动程序上（例如：APTIO IV，可能还有其他），这个设置可能会导致 ESP 文件系统出现损坏，甚至使 ESP 文件系统无法使用。因此，如果要测试这个选项，请重新创建 ESP 分区用于测试。在某些合适的固件上可以显着地提高记录速度，但在一些固件上可能几乎没有速度差异。
{% endnote %}

在解释日志时，请注意这些行的前缀是描述日志行的相关位置（模块）的标签，从而确定该行日志的归属。

以下是已知的前缀列表：

**Drivers and tools**:
- `BMF` — OpenCanopy, bitmap font
- `BS` — Bootstrap
- `GSTT` — GoptStop
- `HDA` — AudioDxe
- `KKT` — KeyTester
- `LNX` — OpenLinuxBoot
- `MMDD` — MmapDump
- `OCPAVP` — PavpProvision
- `OCRST` — ResetSystem
- `OCUI` — OpenCanopy
- `OC` — OpenCore main, also OcMainLib
- `OLB` — OpenLegacyBoot
- `VMOPT` — VerifyMemOpt

**Libraries**:
- `AAPL` — OcLogAggregatorLib, Apple EfiBoot logging
- `OCABC` — OcAfterBootCompatLib
- `OCAE` — OcAppleEventLib
- `OCAK` — OcAppleKernelLib
- `OCAU` — OcAudioLib
- `OCA` — OcAcpiLib
- `OCBP` — OcAppleBootPolicyLib
- `OCB` — OcBootManagementLib
- `OCLBT` — OcBlitLib
- `OCCL` — OcAppleChunkListLib
- `OCCPU` — OcCpuLib
- `OCC` — OcConsoleLib
- `OCDC` — OcDriverConnectionLib
- `OCDH` — OcDataHubLib
- `OCDI` — OcAppleDiskImageLib
- `OCDM` — OcDeviceMiscLib
- `OCFS` — OcFileLib
- `OCFV` — OcFirmwareVolumeLib
- `OCHS` — OcHashServicesLib
- `OCI4` — OcAppleImg4Lib
- `OCIC` — OcImageConversionLib
- `OCII` — OcInputLib
- `OCJS` — OcApfsLib
- `OCKM` — OcAppleKeyMapLib
- `OCL` — OcLogAggregatorLib
- `OCM` — OcMiscLib
- `OCMCO` — OcMachoLib
- `OCME` — OcHeciLib
- `OCMM` — OcMemoryLib
- `OCPE` — OcPeCoffLib, OcPeCoffExtLib
- `OCPI` — OcFileLib, partition info
- `OCPNG` — OcPngLib
- `OCRAM` — OcAppleRamDiskLib
- `OCRTC` — OcRtcLib
- `OCSB` — OcAppleSecureBootLib
- `OCSMB` — OcSmbiosLib
- `OCSMC` — OcSmcLib
- `OCST` — OcStorageLib
- `OCS` — OcSerializedLib
- `OCTPL` — OcTemplateLib
- `OCUC` — OcUnicodeCollationLib
- `OCUT` — OcAppleUserInterfaceThemeLib
- `OCVAR` — OcVariableLib
- `OCXML` — OcXmlLib

## 8.5 Security 属性

### 1. `AllowSetDefault`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许使用 `CTRL+Enter` 和 `CTRL+[数字]` 设置默认启动项。
   
*注 1*：当启用 `PollAppleHotKeys` 时，可与 `Shift+Enter` 或 `Shift+[数字]` 结合使用。

*注 2*：为了支持在预启动期间对修饰键无响应的系统（这包括 V1 和 V2 KeySupport 模式），OpenCore 还允许按住 `=/+` 键，以触发 `set default` 模式。
   
> 译者注：按住 `=/+` 键，也可以设置默认启动项。

### 2. `ApECID`

**Type**: `plist integer`, 64 bit
**Failsafe**: `0`
**Description**: Apple Enclave 标识符。

将此值设置为任何非零的 64 位整数，将允许使用个性化的 Apple 安全启动标识符。如果你想使用此设置，请确保使用加密的随机数生成器生成一个 64 位的随机数。还有一种方法是将 `SystemUUID` 的前 8 个字节用于 `ApECID`，没有 T2 芯片的 Mac 的 macOS 11 就是这样做的。

如果这个值设置妥当，并且 `SecureBootModel` 值有效且不是 `Disabled`，那么就可以实现 Apple 安全启动的 [完整安全性](https://support.apple.com/en-us/HT208198)。

要使用个性化的 Apple 安全启动，必须重新安装操作系统，或对其进行个性化定制。在操作系统被个性化定制之前，只能加载 macOS DMG 恢复镜像。DMG 恢复镜像可以随时用 `macrecovery` 实用工具下载，然后放到 `com.apple.recovery.boot` 里，如 [技巧和窍门](12-troubleshooting.html#12-5-技巧和窍门) 部分所述。请记住，[`DmgLoading`](8-misc.html#6-DmgLoading) 需要设置为 `Signed` 才能通过 Apple 安全启动来加载 DMG。

如果要对现有的操作系统进行个性化定制，请在加载 macOS DMG 恢复镜像之后使用 `bless` 命令。确保已挂载到系统卷分区，并执行以下命令：

```bash
bless --folder "/Volumes/Macintosh HD/System/Library/CoreServices" \
  --bootefi --personalize
```

macOS 11 为没有 T2 芯片的 Mac 引入了专用的 `x86legacy` 机型，对于 macOS 11.0 之前的版本，这个机型的 Apple 安全启动可能无法达到预期效果。如果要使用个性化的 Apple 安全启动重新安装操作系统，请记住，当前版本的 macOS 安装器（测试版本 10.15.6）通常会把 `/var/tmp` 分区的可用内存耗尽，因此在 macOS 安装器镜像下载后不久，就会出现 `Unable to verify macOS` 的错误信息。为了解决这个问题，需要在开始安装前，在 macOS Recovery 终端输入如下命令，为 macOS 个性化分配一个 2MB 的专用 RAM 磁盘：

```bash
disk=$(hdiutil attach -nomount ram://4096)
diskutil erasevolume HFS+ SecureBoot $disk
diskutil unmount $disk
mkdir /var/tmp/OSPersonalizationTemp
diskutil mount -mountpoint /var/tmp/OSPersonalizationTemp $disk
```

### 3. `AuthRestart`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用与 `VirtualSMC` 兼容的 authenticated restart。

`authenticated restart` 可以在重启 FileVault2 分区时不用再次输入密码。你可以使用下述指令执行一次：`sudo fdesetup authrestart`。macOS 在安装系统更新使用的也是 `authenticated restart`。

VirtualSMC 通过将磁盘加密密钥拆分保存在 NVRAM 和 RTC 中来执行 authenticated restart。虽然 OpenCore 在启动系统后立刻删除密钥，但是这仍然可能被视为安全隐患。因此这个选项是可选的。

### 4. `BlacklistAppleUpdate`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 忽略某些用于更新 Apple 外围固件的启动项（例如：`MultiUpdater.efi`）。

*注*：由于某些操作系统（如 macOS Big Sur）[无法利用](https://github.com/acidanthera/bugtracker/issues/1255) NVRAM 变量 `run-efi-updater` 禁用固件更新。

### 5. `DmgLoading`

**Type**: `plist string`
**Failsafe**: `Signed`
**Description**: 定义用于 macOS Recovery 的磁盘映像（Disk Image, DMG）加载策略。

有效值如下：
- `Disabled` --- 加载 DMG 磁盘映像的行为将会失败。大多数情况下 `Disabled` 策略仍会允许加载 macOS Recovery，因为通常会有 `boot.efi` 文件，它与 Apple 安全启动兼容。但是，手动下载存储在 `com.apple.recovery.boot` 目录中的 DMG 磁盘映像将无法被加载。
- `Signed` --- 仅加载 Apple 签名的 DMG 磁盘映像。由于 Apple 安全启动的设计，不管 Apple 安全启动是什么状态，`Signed` 策略都会允许加载任何 Apple 签名的 macOS Recovery，这可能并不总是令人满意。虽然使用已签名的 DMG 磁盘映像更可取，但验证磁盘映像签名可能会稍微减慢启动时间（最多1秒）。
- `Any` --- 任何 DMG 磁盘映像都会作为普通文件系统挂载。强烈不建议使用 `Any` 策略，当激活了 Apple 安全启动时会导致启动失败。

### 6. `EnablePassword`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 为敏感操作启用密码保护。

启动非默认操作系统（例如：macOS Recovery 或工具）、启动到非默认模式（例如：详细模式或安全模式）或重置 NVRAM 等，以上这些行为属于敏感操作，密码保护可以很好地保证这些操作都是由本人或授权人操作。目前，密码和盐（Salt）用 5000000 次 SHA-512 迭代来进行哈希运算。

*注*：此功能尚在开发阶段，不推荐日常使用。

### 7. `ExposeSensitiveData`

**Type**: `plist integer`
**Failsafe**: `0x6`
**Description**: 用于向操作系统暴露敏感数据的位掩码（总和）。

- `0x01` --- 将可打印的引导器路径作为 UEFI 变量暴露出来
- `0x02` --- 将 OpenCore 版本作为 UEFI 变量暴露出来
- `0x04` --- 将 OpenCore 版本暴露在启动选择菜单的标题位置
- `0x08` --- 将 OEM 信息作为一组 UEFI 变量暴露出来

根据加载顺序，暴露的启动器路径指向 OpenCore.efi 或其引导器。如要获得引导器路径，请在 macOS 中使用以下命令：
```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path
```

如要使用启动器路径加载启动器卷宗，请在 macOS 中使用以下命令：
```bash
u=$(nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path | sed 's/.*GPT,\([^,]*\),.*/\1/'); \
  if [ "$u" != "" ]; then sudo diskutil mount $u ; fi
```

如果要获取 OpenCore 版本信息，请在 macOS 中使用以下命令：
```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:opencore-version
```

如果 OpenCore 的版本没有公布，该变量将包含 UNK-000-0000-00-00 序列。
   
如要获取 OEM 信息，请在 macOS 中使用以下命令：
```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-product # SMBIOS Type1 ProductName
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-vendor # SMBIOS Type2 Manufacturer
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-board # SMBIOS Type2 ProductName
```

### 8. `HaltLevel`

**Type**: `plist integer`, 64 bit
**Failsafe**: `0x80000000` (`DEBUG_ERROR`)
**Description**: EDK II 调试级别的位掩码（总和），使 CPU 在获得 `HaltLevel` 消息后中止（停止执行）。可能的值与 `DisplayLevel` 值相匹配。

*注 1*：只有当 Misc->Debug 部分下的 Target 的 bit 0（即启用日志）被设置时，才会发生停顿。

*注 2*：只有在加载配置和配置了日志后才会发生停顿。如果有任何日志信息发生在早期日志的指定停顿级别（即在这之前），一旦配置好，它们被刷入日志时将会引起停顿。

### 9. `PasswordHash`

**Type**: `plist data` 64 bytes
**Failsafe**: all zero
**Description**: 密码使用的哈希值（Hash）。

### 10. `PasswordSalt`

**Type**: `plist data`
**Failsafe**: empty
**Description**: 密码使用的盐值（Salt）。

### 11. `Vault`

**Type**: `plist string`
**Failsafe**: `Secure`
**Description**: 启用 OpenCore 的 Vault 机制。

有效值：
- `Optional` --- 无要求，不设置 Vault，不安全。
- `Basic` --- 需要有 `vault.plist` 文件存放在 `OC` 目录下。这个值提供了基本的文件系统完整性验证，可以防止无意中的文件系统损坏。
- `Secure` --- 需要有 `vault.sig` 签名的 `vault.plist` 文件存放在 `OC` 目录下。这个值包括了 `Basic` 完整性检查，但也会尝试建立一个可信的引导链。

`vault.plist` 文件应该包含 OpenCore 使用的所有文件的 SHA-256 哈希值。强烈建议使用这个文件，以确保无意中的文件修改（包括文件系统损坏）不会被忽视。要自动创建这个文件，请使用 [`create_vault.sh`](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/CreateVault) 脚本。无论底层的文件系统如何，路径名和大小写必须在 `config.plist` 和 `vault.plist` 之间相匹配。

`vault.sig` 文件应该包含一个来自 `vault.plist` 的 SHA-256 哈希值的原始的 256 字节 RSA-2048 签名。这个签名是根据嵌入到 `OpenCore.efi` 中的公钥来验证的。
   
如要嵌入公钥，以下任一步骤均可：
- 在 `OpenCore.efi` 编译过程中，在 [`OpenCoreVault.c`](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c) 文件中提供公钥。
- 用二进制补丁的方式将 `OpenCore.efi` 中 `=BEGIN OC VAULT=` 和 `==END OC VAULT==` ASCII 码之间的 `0` 替换为公钥。

RSA 公钥的 520 字节格式可参阅 Chromium OS 文档。如要从 X.509 证书或 PEM 文件中转换公钥，请使用 [RsaTool](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/CreateVault)。

以下操作的完整指令：
- 创建 `vault.plist`
- 创建一个新的 RSA 密钥（总是要这样做，以避免加载旧配置）
- 将 RSA 密钥嵌入到 `OpenCore.efi`
- 创建 `vault.sig`

可以参照如下指令：
```bash
cd /Volumes/EFI/EFI/OC
/path/to/create_vault.sh .
/path/to/RsaTool -sign vault.plist vault.sig vault.pub
off=$(($(strings -a -t d OpenCore.efi | grep "=BEGIN OC VAULT=" | cut -f1 -d' ')+16))
dd of=OpenCore.efi if=vault.pub bs=1 seek=$off count=528 conv=notrunc
rm vault.pub
```

*注 1*：必须使用外部方法来验证 `OpenCore.efi` 和 `BOOTx64.efi` 的安全启动路径，尽管它们看似显而易见。为此，建议你至少使用自定义证书来启用 UEFI 的 SecureBoot，并使用自定义的密钥来签名 `OpenCore.efi` 和 `BOOTx64.efi` 。关于在现代固件上定制安全启动的更多细节，请参见 [Taming UEFI SecureBoot](https://habr.com/post/273497/)（俄文）。

*注 2*：当 `vault.plist` 存在，或者当公钥嵌入到 `OpenCore.efi` 中的时候，无论这个选项是什么，`vault.plist` 和 `vault.sig` 都会被使用。在这两种情况下，出现错误将中止启动过程。设置这个选项可以让 OpenCore 在配置不符合要求时警告用户，以达到预期的更高安全级别。

### 12. `ScanPolicy`

**Type**: `plist integer`，32 bit
**Failsafe**: `0xF0103`
**Description**: 定义操作系统检测策略。

通过设置该值来根据所选 `flag` 的位掩码（总和）防止从非信任源扫描（和启动）。由于不可能可靠地检测到每一个文件类型或设备类型，因此在开放环境中不能完全依赖此功能，需要采取额外的措施。

第三方驱动程序可能会根据提供的扫描策略引入额外的安全（和性能）措施。扫描策略暴露在 `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` GUID的 `scan-policy` 变量中，仅适用于 UEFI 启动服务。
- `0x00000001` (bit `0`) --- `OC_SCAN_FILE_SYSTEM_LOCK`，将扫描限制于仅扫描此策略定义的已知文件系统。文件系统驱动可能感知不到这个策略，为了避免挂载不必要的文件系统，最好不要加载它的驱动程序。此 bit 不影响 dmg 挂载，因为它可能有各种文件系统。已知文件系统的前缀为 `OC_SCAN_ALLOW_FS_`。
- `0x00000002` (bit `1`) --- `OC_SCAN_DEVICE_LOCK`，将扫描限制于仅扫描此策略定义的已知设备类型。由于协议隧道并不一定能被检测到，因此请注意，在某些系统上可能会出现 USB 硬盘被识别成 SATA 等情况。如有类似情况，请务必报告。已知设备类型的前缀为 `OC_SCAN_ALLOW_DEVICE_`。
- `0x00000100` (bit `8`) --- `OC_SCAN_ALLOW_FS_APFS`，允许扫描 APFS 文件系统。
- `0x00000200` (bit `9`) --- `OC_SCAN_ALLOW_FS_HFS`，允许扫描 HFS 文件系统。
- `0x00000400` (bit `10`) --- `OC_SCAN_ALLOW_FS_ESP`，允许扫描 EFI 系统分区文件系统。
- `0x00000800` (bit `11`) --- `OC_SCAN_ALLOW_FS_NTFS`，允许扫描 NTFS（MSFT Basic Data）文件系统。
- `0x00001000` (bit `12`) --- `OC_SCAN_ALLOW_FS_EXT`，允许扫描 EXT（Linux Root）文件系统。
- `0x00002000` (bit `13`) --- `OC_SCAN_ALLOW_FS_LINUX_DATA`，允许扫描 Linux 数据文件系统。
- `0x00004000` (bit `14`) --- `OC_SCAN_ALLOW_FS_XBOOTLDR`，允许扫描由 [Boot Loader Specification](https://systemd.io/BOOT_LOADER_SPECIFICATION/) 定义的扩展 Boot Loader 分区。
- `0x00010000` (bit `16`) --- `OC_SCAN_ALLOW_DEVICE_SATA`，允许扫描 SATA 设备。
- `0x00020000` (bit `17`) --- `OC_SCAN_ALLOW_DEVICE_SASEX`，允许扫描 SAS 和 Mac NVMe 设备。
- `0x00040000` (bit `18`) --- `OC_SCAN_ALLOW_DEVICE_SCSI`，允许扫描 SCSI 设备。
- `0x00080000` (bit `19`) --- `OC_SCAN_ALLOW_DEVICE_NVME`，允许扫描 NVMe 设备。
- `0x00100000` (bit `20`) --- `OC_SCAN_ALLOW_DEVICE_ATAPI`，允许扫描 CD/DVD 和旧的 SATA 设备。
- `0x00200000` (bit `21`) --- `OC_SCAN_ALLOW_DEVICE_USB`，允许扫描 USB 设备。
- `0x00400000` (bit `22`) --- `OC_SCAN_ALLOW_DEVICE_FIREWIRE`，允许扫描 FireWire 设备。
- `0x00800000` (bit `23`) --- `OC_SCAN_ALLOW_DEVICE_SDCARD`，允许扫描读卡器设备。
- `0x01000000` (bit `24`) --- `OC_SCAN_ALLOW_DEVICE_PCI`，允许扫描直接连接到 PCI 总线的设备(例如 VIRTIO)。

*注*：举例：根据以上描述，`0xF0103` 值允许扫描带有 APFS 文件系统的 SATA、SAS、SCSI 和 NVMe 设备，不扫描 USB、CD 和 FireWire 设备上的 APFS 文件系统，也不扫描任何带有 HFS 或 FAT32 文件系统的设备。该值表示如下组合：
- `OC_SCAN_FILE_SYSTEM_LOCK`
- `OC_SCAN_DEVICE_LOCK`
- `OC_SCAN_ALLOW_FS_APFS`
- `OC_SCAN_ALLOW_DEVICE_SATA`
- `OC_SCAN_ALLOW_DEVICE_SASEX`
- `OC_SCAN_ALLOW_DEVICE_SCSI`
- `OC_SCAN_ALLOW_DEVICE_NVME`

### 13. `SecureBootModel`

**Type**: `plist string`
**Failsafe**: `Default`
**Description**: Apple 安全启动的机型。

定义 Apple 安全启动的机型和策略。指定此值能够定义哪些操作系统可以启动。早于指定机型发布时间的操作系统将无法启动。有效值如下：
- `Default` --- 最近的可用型号，目前设置为 `j137`
- `Disabled` --- 无机型，禁用 Apple 安全启动
- `j137` --- iMacPro1,1 (December 2017). Minimum macOS 10.13.2 (17C2111)
- `j680` --- MacBookPro15,1 (July 2018). Minimum macOS 10.13.6 (17G2112)
- `j132` --- MacBookPro15,2 (July 2018). Minimum macOS 10.13.6 (17G2112)
- `j174` --- Macmini8,1 (October 2018). Minimum macOS 10.14 (18A2063)
- `j140k` --- MacBookAir8,1 (October 2018). Minimum macOS 10.14.1 (18B2084)
- `j780` --- MacBookPro15,3 (May 2019). Minimum macOS 10.14.5 (18F132)
- `j213` --- MacBookPro15,4 (July 2019). Minimum macOS 10.14.5 (18F2058)
- `j140a` --- MacBookAir8,2 (July 2019). Minimum macOS 10.14.5 (18F2058)
- `j152f` --- MacBookPro16,1 (November 2019). Minimum macOS 10.15.1 (19B2093)
- `j160` --- MacPro7,1 (December 2019). Minimum macOS 10.15.1 (19B88)
- `j230k` --- MacBookAir9,1 (March 2020). Minimum macOS 10.15.3 (19D2064)
- `j214k` --- MacBookPro16,2 (May 2020). Minimum macOS 10.15.4 (19E2269)
- `j223` --- MacBookPro16,3 (May 2020). Minimum macOS 10.15.4 (19E2265)
- `j215` --- MacBookPro16,4 (June 2020). Minimum macOS 10.15.5 (19F96)
- `j185` --- iMac20,1 (August 2020). Minimum macOS 10.15.6 (19G2005)
- `j185f` --- iMac20,2 (August 2020). Minimum macOS 10.15.6 (19G2005)
- `x86legacy` --- Macs and VMs without T2 chip. Minimum macOS 11.0.1 (20B29)

{% note danger 警告 %}
并非所有的苹果安全启动模式都支持所有的硬件配置。
{% endnote %}
   
Apple 安全启动最初出现于搭载 T2 芯片的机型上的 macOS 10.13。在macOS 12之前，`PlatformInfo` 和 `SecureBootModel` 是独立的，因此可以在有或没有 T2 的 SMBIOS 上启用 Apple 安全启动。从 macOS 12 开始， `SecureBootModel` 必须与 SMBIOS 的 Mac 模型匹配。默认模型是根据 SMBIOS 的板卡标识符得出的，可以通过通用部分自动设置，也可以通过 SMBIOS 部分手动设置。如果没有板卡标识符的覆盖，模型将从 OEM SMBIOS 启发式地导出。
   
将 `SecureBootModel` 设置为除 `Disabled` 以外的任意有效值，相当于实现了 Apple 安全启动的 [中等安全性](https://support.apple.com/en-us/HT208198)。如要实现「完整安全性」，还需要指定 `ApECID` 值。在虚拟机上使用 Apple 安全启动时，请检查 ForceSecureBootScheme。

启用 Apple 安全启动的要求很多，任何不正确的配置、错误的 macOS 安装或者不支持的安装设置都可能会增加启用难度，记住以下几点：

- 和配备 Apple T2 安全芯片的 Mac 电脑一样，你将无法安装任何未签名的内核驱动程序。还有一些内核驱动程序尽管已签名，但也无法安装，包括但不限于 NVIDIA Web Drivers。
- 驱动程序缓存的列表可能不同，因此需要改变 `Add` 或 `Force` 内核驱动程序列表。比如，在这种情况下 `IO80211Family` 不能被注入。
- 某些系统（例如 macOS 11）是封装保护的，更改受保护的系统卷可能会导致操作系统无法启动。除非禁用了 Apple 安全启动，否则不要禁用系统卷加密。
- 如果你的平台需要某些特定设置，但由于之前调试时没有触发明显问题而没有被启用，那么可能会导致启动失败。要格外小心 `IgnoreInvalidFlexRatio` 或 `HashServices`。
- 在 Apple 推出安全启动功能之前发布的操作系统（如 macOS 10.12 或更早的版本）在启用 UEFI 安全启动之前，仍然会启动。之所以如此，是因为从 Apple 安全启动的角度来看，它们都是不兼容的系统，会被认为应该由 BIOS 来处理，就像微软的 Windows 一样。
- 在较旧的 CPU 上（如 Sandy Bridge 之前），启用 Apple 安全启动可能会使加载速度略微变慢，最长可达 1 秒。
- 由于 `Default` 的值会随着时间的推移而变化，以支持最新的 macOS 主版本，因此不建议同时使用 `ApECID` 和 `Default` 值。
- 启用 Apple 安全启动时，HFS+ 文件系统的卷宗无法作为目标卷宗安装 macOS。没有其他备用 APFS 硬盘的情况下，HFS+ 文件系统的硬盘也同样无法安装。

有时，已安装的系统 `Preboot` 分区上的 Apple 安全启动清单是过时的，从而导致启动失败。如果你看到 `OCB: Apple Secure Boot prohibits this boot entry, enforcing!` 这样的信息，很可能就是出现了上述这种情况。想要解决这个问题，要么重新安装操作系统，要么把 `/usr/standalone/i386` 中的清单（扩展名为 `.im4m` 的文件，如 `boot.efi.j137.im4m`）复制到 `/Volumes/Preboot/<UUID>/System/Library/CoreServices`（`<UUID>` 为系统卷的标识符）。HFS+ 文件系统则须复制到系统卷上的 `/System/Library/CoreServices` 目录。

关于如何结合 UEFI 安全启动来配置 Apple 安全启动的细节，请参考本文档 [UEFI 安全启动](12-troubleshooting.html#12-2-UEFI-安全启动) 部分。

## 8.6 Serial 属性

### 1. `Custom`

**Type**: `plist dict`
**Description**: 更新 `BaseSerialPortLib16550` 中的串行端口属性。
   
本节列出了 `BaseSerialPortLib16550` 使用的 `PCD` 值。当选项 `Override` 被设置为 `false` 时，这个选项是可选的。
 
### 2. `Init`

**Type**: `plist boolean`
**Description**: 执行串口初始化。
   
该选项将在启用（任何）调试记录之前，在OpenCore内执行串行端口初始化。详情请参考调试部分。    
   
### 3. `Override`

**Type**: `plist boolean`
**Description**: 覆盖串行端口属性。如果此选项设置为 `false`，则不会覆盖来自自定义的任何串行端口属性。   
   
这个选项将覆盖下面串行自定义属性部分中列出的串行端口属性。

## 8.6.1 Serial Custom 属性   
   
### 1. `BaudRate`

**Type**: `plist integer`
**Failsafe**: `115200`
**Description**:  设置串口的波特率。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的 `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialBaudRate` 的值。
   
### 2. `ClockRate`

**Type**: `plist integer`
**Failsafe**: `1843200`
**Description**: 设置串口的时钟速率。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的 `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialClockRate` 的值。
   
### 3. `DetectCable`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用串行端口电缆检测。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的 `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialDetectCable` 的值。
   
### 4. `ExtendedTxFifoSize`

**Type**: `plist integer`
**Failsafe**: `64`
**Description**: 设置串口的扩展发送 FIFO 大小。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的 `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialExtendedTxFifoSize` 的值。
   
### 5. `FifoControl`

**Type**: `plist integer`
**Failsafe**: `0x07`
**Description**: 配置串口 FIFO 控制设置。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialFifoControl` 的值。
   
### 6. `LineControl`

**Type**: `plist integer`
**Failsafe**: `0x07`
**Description**: 配置串口线路控制设置。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  `gEfiMdeModulePkgTokenSpaceGuid.PcdSerialLineControl` 的值。
   
### 7. `PciDeviceInfo`

**Type**: `plist data`
**Failsafe**: `0xFF`
**Description**: 设置 PCI 串行设备信息。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialPciDeviceInfo 的值。
   
*注 1*：这个选项的最大允许大小是 `41` 字节。更多详细信息请参考 [acidanthera/bugtracker#1954](https://github.com/acidanthera/bugtracker/issues/1954#issuecomment-1084220743)。

*注 2*：这个选项可以通过运行 [FindSerialPort](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/FindSerialPort) 工具来设置。   
   
### 8. `RegisterAccessWidth`

**Type**: `plist integer`
**Failsafe**: `8`
**Description**: 设置串口寄存器存取宽度。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialRegisterAccessWidth 的值。
   
### 9. `RegisterBase`

**Type**: `plist integer`
**Failsafe**: `0x03F8`
**Description**: 设置串口寄存器的基地址。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialRegisterBase 的值。
   
### 10. `RegisterBase`

**Type**: `plist integer`
**Failsafe**: `1`
**Description**: 设置串口寄存器的步进，单位为字节。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialRegisterStride 的值。
   
### 11. `UseHardwareFlowControl`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用串口硬件流量控制。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialUseHardwareFlowControl 的值。
   
### 12. `UseMmio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 指示串行端口寄存器是否在 MMIO 空间中。

这个选项将覆盖 [MdeModulePkg.dec](https://github.com/acidanthera/audk/blob/master/MdeModulePkg/MdeModulePkg.dec) 中定义的  gEfiMdeModulePkgTokenSpaceGuid.PcdSerialUseMmio 的值。
    
## 8.7 Entry 属性

### 1. `Arguments`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 任意的ASCII字符串，用作该引导条目的启动参数（加载选项）。

### 2. `Auxiliary`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 设置为 `true` 时，当 `HideAuxiliary` 设置为 `true`，则该引导条目将不会显示在开机引导菜单中。按空格键进入 `扩展模式` 之后，才会显示隐藏的引导条目。

> 译者注：简单来说就是设置此启动项是否是辅助条目。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 设置为 `true`，该引导条目显示在开机引导菜单中。

### 5. `Flavour`

**Type**: `plist string`
**Failsafe**: Auto
**Description**: 为该启动项指定 `flavour`，详情请参阅文档中的 `OC_ATTR_USE_FLAVOUR_ICON` 标识。

### 6. `FullNvramAccess`

**Type**: `plist boolean`
**Failsafe**: false
**Description**:  在使用 `Tools` 的过程中禁用 OpenRuntime NVRAM 保护。

在 `Tools` 使用期间，这将禁用 `OpenRuntime.efi` 提供的所有 NVRAM 保护措施。通常情况下，应该避免这样做，但是如果一个 `Tools` 需要直接访问 NVRAM 而不需要 `RequestBootVarRouting` 的重定向，则可能需要这样做。

*注*：此选项仅对 `Tools` 有效，对于 `Entries` 该属性始终为 `false`。

### 7. `Name`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 引导条目在开机引导菜单中显示的名字。

### 8. `Path`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 引导入口。

- `Entries` 用于指定外部启动选项，因此会在 `Path` 中取设备路径。这些值不会被检查，所以要非常小心。例如：`PciRoot(0x0)/Pci(0x1,0x1)/.../\EFI\COOL.EFI`。
- `Tools` 用于指定内部引导选项，这些选项隶属于 `bootloader vault`，因此会取相对于 `OC/Tools` 目录的文件路径。例如：`OpenShell.efi`。

### 9. `RealPath`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启动时将完整的路径传递给工具。

这通常应该禁用，因为传递目录可能会使工具在没有检查文件完整性的情况下就意外地访问了文件，降低了安全性。需要启用该项的情况可能是工具需要外部文件来正常工作或者工具需要外部文件来更好地实现某些功能（例如 `memtest86` 的记录和配置功能，Shell 自动执行脚本的功能）。

*注*：此选项仅对 `Tools` 有效。对于 `Entries` 该属性始终为 `true`。

### 10. TextMode

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 以文本模式而非图形模式运行条目。

某些需要文本输出的旧工具需要用到此项。默认情况下所有工具都以图形模式启动。更多关于文本模式的内容，请参阅 [Output 属性](11-uefi.html#11-10-Output-属性) 部分。
