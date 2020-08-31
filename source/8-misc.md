---
title: 8. Misc
description: 关于 OpenCore 行为的其他配置
type: docs
author_info: 由 xMuu、Sukka、derbalkon 整理、由 Sukka、derbalkon 翻译。
last_updated: 2020-08-30
---

## 8.1 简介

本部分包含关于 OpenCore 行为的其他配置，以及不能被分类到其它章节的配置条目的说明。

OpenCore 尽可能地遵循 `bless` 模式，即 `Apple Boot Policy`。`bless` 模式的主要特点是允许在文件系统中嵌入启动选项（而且能通过专门的驱动程序访问），同时，相比于 UEFI 规范中的可移动媒体列表，它还支持更多的预定义启动路径。

只有当分区符合 `Scan policy` 时才能被启动（`Scan policy` 是一组限制条件，能够使其仅使用特定文件系统和特定设备类型的分区）。具体的扫描策略（`Scan policy`）将在下面的 `ScanPolicy` 属性中阐述。

扫描过程从获取 `Scan policy` 过滤过的分区开始。每个分区可能会产生多个主选项和备用选项。主选项描述的是安装在这个介质上的操作系统。备用选项描述的是介质上的操作系统的恢复项。备用选项可以在没有主选项的情况下存在，反之亦然。请注意，这些选项描述的操作系统不一定都在同一个分区上。每个主选项和备用选项都可以作为辅助选项（Auxiliary Option），也可以不作为辅助选项，具体细节参考下面的 `HideAuxiliary` 章节。用来确定启动选项的算法如下：

1. 通过 `Scan policy`（和驱动可用性）过滤，获取所有可用的分区句柄。
2. 从 `BootOrder` UEFI 变量中，获取所有可用的启动选项。
3. 对于每个找到的启动选项：
  - 检索该启动选项的设备路径。
  - 执行对设备路径的修复（如 NVMe 子类型修复）和扩展（如 Boot Camp）。
  - 通过定位到所产生的设备路径，来获取句柄（失败时忽略）。
  - 在分区句柄列表中找到设备句柄（缺失时忽略）。
  - 对磁盘设备路径（不指定引导程序）执行 `bless`（可能返回不止一个条目）。
  - 对文件设备路径直接检查其文件系统。
  - 在 OpenCore 启动分区中，通过 Header Check 排除所有 OpenCore Bootstrap 文件。
  - 如果有分区句柄列表，则在列表中将设备句柄标记为 *used*。
  - 将生成的条目注册为主选项，并确定他们的类型。某些类型的选项作为辅助选项（如 Apple HFS Recovery）。

4. 对于每个分区句柄：
  - 如果分区句柄被标记为 *unused*，则执行 `bless` 主选项列表检索。如果设置了 `BlessOverride` 列表，那么不仅能找到标准的 `bless` 路径，还能找到自定义的路径。
  - 在 OpenCore 启动分区中，通过 Header Check 排除所有 OpenCore Bootstrap 文件。
  - 将生成的条目注册为主选项，并确定他们的类型。某些类型的选项作为辅助选项（如 Apple HFS Recovery）。
  - 如果分区已经具有来 `Apple Recovery` 类型的主选项，则继续处理下一个句柄。
  - 通过 `bless` 恢复选项列表检索和预定义路径，来查找备用条目。
  - 将生成的条目注册为备用辅助选项，并确定它们的类型。

5. 把自定义条目和工具添加为主选项，不做有关 `Auxiliary` 的任何检查。
6. 把系统条目（如 `Reset NVRAM`）添加为主要的辅助选项。

启动选择器中的启动选项的显示顺序和启动过程，是通过扫描算法分别来确定的。显示顺序如下：

- 备用选项跟随主选项，即，Apple Recovery 会尽可能地跟随相关的 macOS 选项。
- 选项会按照文件系统句柄固件的顺序列出，以便在整个启动过程中保持一个既定的顺序，不因加载操作系统的不同而变化。
- 自定义条目、工具和系统条目会被添加到所有选项之后。
- 辅助选项只有在进入「高级模式」后才会显示（一般是按 `空格` 键）。

启动过程如下：

- 尝试通过 `BootNext` UEFI 变量查找第一个有效的主选项。
- 如果失败，则通过 `BootOrder` UEFI 变量继续查找。
- 将该选项标记为默认启动选项。
- 是否通过启动选择器来启动选项，取决于 `ShowPicker` 选项的设置。
- 如果还失败，则显示启动选择器。

*注 1*：这个过程只有在启用了 `RequestBootVarRouting` 选项，或者固件不控制 UEFI 启动选项（如 `OpenDuetPkg` 或其他自定义 BDS）时，才会可靠地工作。如果不启用 `BootProtect`，那么其他操作系统有可能会覆盖 OpenCore，如果你打算使用 OpenCore，请确保启用这个选项。

*注 2*：UEFI 变量引导选项的引导参数，如果存在的话则会被丢弃，因为它们包含的一些参数可能会对操作系统产生不利影响，一旦启用了安全引导，这种影响是我们不希望看到的。

*注 3*：某些操作系统（说的就是你，Windows）会在第一次启动时，或 NVRAM 重置后，创建他们的启动选项，并将其标记为最上面的选项。这种情况发生时，默认的启动条目选择将会更新，直到下一次重新手动配置。

## 8.2 属性列表

### 1. `Boot`

**Type**: `plist dict`
**Description**: 应用本章节 Boot 属性中的引导相关设置。

### 2. `BlessOverride`

**Type**: `plist array`
**Description**: 通过 Bless Model 添加自定义扫描路径。

设计为填充 `plist string` 条目，其中包含指向自定义引导程序的绝对 UEFI 路径，例如，用于 Debian 引导程序的 `\EFI\debian\grubx64.efi`。这允许引导选择器自动发现异常的引导路径。在设计上它们等效于预定义的 Bless 路径（如 `\System\Library\CoreServices\boot.efi` 和 `\EFI\Microsoft\Boot\bootmgfw.efi`），但与预定义的 Bless 路径不同，它们具有最高优先级。

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

### 6. `Tools`

**Type**: `plist array`
**Description**: 将工具条目添加到开机引导菜单。

应填入 `plist dict` 类型的值来描述相应的加载条目。详见 Entry 属性部分。

*注*：选择工具（比如 UEFI shell）是很危险的事情，利用这些工具可以轻易地绕过安全启动链，所以 **千万不要** 出现在生产环境配置中，尤其是设置了 Vault 和安全启动保护的设备（译者注：即，工具仅作调试用）。具体的工具示例参见本文档的 UEFI 章节。

## 8.3 Boot 属性

### 1. `ConsoleAttributes`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 为控制台设置特定的属性。

根据 UEFI 规范，文本渲染器支持的颜色参数为前景色与背景色之和。黑色背景色和黑色前景色 (`0`) 的值是预留的。以下是颜色名称一览：

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

*注*：这个选项可能和 TextRenderer 的 `System` 参数有冲突，设置一个非黑的背景可以用来测试 GOP 是否正常运行。

### 2. `HibernateMode`

**Type**: `plist string`
**Failsafe**: `None`
**Description**: 休眠检测模式。 支持以下模式：

- `None` --- 禁用休眠
- `Auto` --- 从 RTC 或 NVRAM 中检测
- `RTC` --- 从 RTC 检测
- `NVRAM` --- 从 NVRAM 检测

### 3. `HideAuxiliary`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 默认情况下，隐藏开机引导项菜单中的辅助条目。

满足任一以下条件的引导项条目即会被视为「辅助项目」

- 该引导项是 macOS Recovery 分区
- 该引导项是 macOS Time Machine 分区
- 该引导项被标记为 `Auxiliary`
- 该引导项是一个系统（如 `Reset NVRAM`）

即使被隐藏，你仍然可以通过 `空格` 进入「扩展模式」查看所有条目（引导项菜单会被重新加载）：

一般来说，隐藏辅助条目有助于加快启动速度。

### 4. `PickerAttributes`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 设置开机引导菜单的属性。

不同的选项可以用属性掩码的方式来设置，其中掩码包含 OpenCore 的预留值（`BIT0` ~ `BIT15`）和 OEM 特定值（`BIT16` ~ `BIT31`）。

目前 OpenCore 提供的值包括：

- `0x0001` — `OC_ATTR_USE_VOLUME_ICON`，提供引导项自定义图标：
  
  对于 `Tools`，OpenCore 会尝试优先加载以下自定义图标，自定义图标不存在时则回退到默认图标：
  - `ResetNVRAM` — `Resources\Image\ResetNVRAM.icns` — 图标目录下的 `ResetNVRAM.icns`。
  - `Tools\<TOOL_RELATIVE_PATH>.icns` — `Tools` 文件附近的对应图标，扩展名为 `.icns`。
  
  对于自定义的启动条目 `Entries`，OpenCore 会尝试优先加载以下自定义图标，自定义图标不存在时则回退到卷宗或默认图标：
  - `<ENTRY_PATH>.icns` — 对应启动项文件附近的图标，扩展名为 `.icns`。
  
  对于其他条目，OpenCore 会尝试优先加载卷宗图标，并回退到默认图标：
  - `.VolumeIcon.icns` 文件，位于 APFS `Preboot` 根目录下。
  - `.VolumeIcon.icns` 文件，位于其他文件系统的卷宗的根目录下。

  卷宗图标可以在访达中设置。注意，启用此功能可能会导致 外部可移除硬盘的图标 和 内部不可移除硬盘的图标 无法区分。

- `0x0002` — `OC_ATTR_USE_DISK_LABEL_FILE`，提供引导项自定义渲染的标题：
  - `.disk_label` (`.disk_label_2x`) 文件与 bootloader 相关，适用于所有文件系统。
  - `<TOOL_NAME.lbl` (`<TOOL_NAME.l2x`) 文件与工具相关，适用于 `Tools`。

  可用 `disklabel` 实用工具或 `bless` 命令来生成预置标签。当禁用或者缺少文本标签 (`.contentDetails` 或 `.disk_label.contentDetails`) 时将以它来代替渲染。

- `0x0004` — `OC_ATTR_USE_GENERIC_LABEL_IMAGE`，为没有自定义条目的启动项提供预定义的标签图像。可能会缺少实际启动项的详细信息。
- `0x0008` — `OC_ATTR_USE_ALTERNATE_ICONS`，如果支持，则将备用图标集作为当前使用的图标集。举个例子，可以在使用自定义背景颜色的时候使用旧的式样的图标（译者注：即 `Old` 前缀的图标）。

### 5. `PickerAudioAssist`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在开机引导菜单中启用 屏幕朗读。

macOS Bootloader 屏幕朗读 的偏好设置是存在 `isVOEnabled.int32` 文件的 `preferences.efires` 中、并受操作系统控制。这里仅提供一个等效的开关。切换 OpenCore 开机引导菜单和 macOS BootLoader FileVault 2 登录界面也可以使用快捷键 `Command` + `F5`。

*注*：屏幕朗读 依赖可以正常工作的音频设备。

### 6. `PollAppleHotKeys`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在开机引导菜单中启用 `Modifier Hotkey`。

除了 `Action Hotkey`（在 `PickerMode` 一节中有所描述，由 Apple BDS 处理），还有由操作系统 bootloader（即 `boot.efi`）处理的 `Modifier Hotkey`。这些键可以通过提供不同的启动模式来改变操作系统的行为。

在某些固件上，由于驱动程序不兼容，使用 `Modifier Hotkey` 可能会有问题。为了解决问题，这个选项允许你在启动选择器中以更宽松的方式注册选择的热键，比如：在按住 `Shift` 和其他按键的同时支持敲击按键，而不是只按 `Shift`，这在许多 PS/2 键盘上是无法识别的。已知的 `Modifier Hotkey` 包括：

- `CMD+C+MINUS` --- 禁用主板兼容性检查。
- `CMD+K` --- 从 RELEASE 版本的内核启动，类似于 `kcsuffix=release` 参数。
- `CMD+R` --- 从恢复分区启动。
- `CMD+S` --- 启动至单用户模式。
- `CMD+S+MINUS` --- 禁用 KASLR slide，需要事先禁用 SIP。
- `CMD+V` --- 启用 `-v`。
- `Shift` --- 启用安全模式。

### 7. `ShowPicker`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否显示开机引导菜单。

### 8. `TakeoffDelay`

**Type**: `plist integer`, 32 bit
**Failsafe**: `0`
**Description**: 在 处理引导项启动 和 处理 `Action Hotkey` 之前的延迟，以微秒为单位。

引入这一延迟有助于为你争取时间去完成按住 `Action Hotkey` 的操作，比如启动到恢复模式。在某些平台上，可能需要把此项设置为至少 `5000-10000` 来使 `Action Hotkey` 生效，具体取决于键盘驱动程序的性质。

### 9. `Timeout`

**Type**: `plist integer`, 32 bit
**Failsafe**: `0`
**Description**: 开机引导菜单中，启动默认启动项之前超时时间（以秒为单位）。 使用 `0` 禁用倒计时。

> 译者注：`0` 为关闭倒计时而非跳过倒计时，相当于 Clover 的 `-1`。

### 10. `PickerMode`

**Type**: `plist string`
**Failsafe**: `Builtin`
**Description**: 选择启动管理器的界面。

这里描述的是具有可选用户界面的底层启动管理器，支持以下值：

- `Builtin` --- 使用由 OpenCore 处理的启动管理器，简单的文本用户界面。
- `External` --- 如果可用，则使用外部启动管理器协议，否则使用 `Builtin` 模式。
- `Apple` --- 如果可用，则使用 Apple 启动管理器，否则使用 `Builtin` 模式。

`External` 模式一旦成功，就会完全禁用 OpenCore 中的除策略强制执行的所有其他启动管理器，而 `Apple` 模式下可以绕过策略的强制执行。请参阅 `ueficanopy` 插件以了解自定义用户界面的实例。

OpenCore 内置的启动选择器包含了一系列在启动过程中选择的操作。支持的操作与 Apple BDS 类似，一般来说能够通过在启动过程中按住 `Action Hotkey` 来实现，目前有以下几种：

- `Default` --- 此项为默认选项，可以让 OpenCore 内置的启动选择器按照 [启动磁盘](https://support.apple.com/HT202796) 偏好设置中指定的方式加载默认的启动项。
- `ShowPicker` --- 此项会强制显示启动选择器，通常可以在启动时按住 `OPT` 键来实现。将 `ShowPicker` 设置为 `true` 会使 `ShowPicker` 成为默认选项。
- `ResetNvram` --- 此项会擦除 UEFI 变量，通常是在启动时按住 `CMD+OPT+P+R` 组合键来实现。另一种擦除 UEFI 变量的方法是在选择器中选择 `Reset NVRAM`，要使用这种方式需要将 `AllowNvramReset` 设置为 `true`。
- `BootApple` --- 此项会启动到第一个找到的 Apple 操作系统，除非 Apple 已经默认选择了操作系统。按住 `X` 来选择此选项。
- `BootAppleRecovery` --- 此项会启动到 Apple 操作系统的恢复系统。这里的系统要么是「与默认选中的操作系统相关的恢复系统」，要么是「第一个找到的非 Apple 的默认操作系统的恢复系统」，要么是「无恢复系统」。按住 `CMD+R` 组合键来选择此选项。

*注 1*：需要激活 `KeySupport`、`OpenUsbKbDxe` 或类似的驱动程序才能工作。无法获得全部按键功能的固件有很多。

*注 2*：当禁用 `ShowPicker` 时，除了 `OPT` 键之外，OpenCore 还支持 `Escape` 键来显示启动选项。这个键不仅适用于 `Apple` 启动选择器模式，也适用于 PS/2 键盘的固件，因为这种键盘无法提交按住 `OPT` 键的请求，需要连续点按 `Escape` 键来进入启动选择菜单。

*注 3*：有些 Mac 的 GOP 很棘手，可能很难进入 Apple 启动选择器。还有一些 Mac，`BootKicker` 不能从 OpenCore 运行。可以通过直接 bless `BootKicker` 实用工具来解决这个问题，不需要加载 OpenCore。

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
cat Kernel.panic | grep macOSProcessedStackshotData | python -c 'import json,sys;print(json.load(sys.stdin)["macOSPanicString"])'
```

### 3. `DisableWatchDog`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 某些固件可能无法成功快速启动操作系统，尤其是在调试模式下，这会导致看门狗定时器中止引导过程。此选项关闭看门狗定时器，用于排错。

### 4. `DisplayDelay`

**Type**: `plist integer`
**Failsafe**: `0`
**Description**: 屏幕上打印每行输出之间的延迟。

### 5. `DisplayLevel`

**Type**: `plist integer`, 64 bit
**Failsafe**: `0`
**Description**: 与屏幕显示相关的 EDK II 调试级别的位掩码（总和）。除非 `Target` 启用了控制台在屏幕上输出日志，否则屏幕上的调试输出将不可见。支持以下级别（更多信息参见 [DebugLib.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/Library/DebugLib.h)）：

- `0x00000002` (bit `1`) --- `DEBUG_WARN` in `DEBUG`, `NOOPT`, `RELEASE`.
- `0x00000040` (bit `6`) --- `DEBUG_INFO` in `DEBUG`, `NOOPT`.
- `0x00400000` (bit `22`) --- `DEBUG_VERBOSE` in custom builds.
- `0x80000000` (bit `31`) --- `DEBUG_ERROR` in `DEBUG`, `NOOPT`, `RELEASE`.

### 6. `SerialInit`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 执行串行端口初始化。

该选项会在任何调试日志启用之前，初始化 OpenCore 的串行端口设置。串行端口配置是在编译时，在 `gEfiMdeModulePkgTokenSpaceGuid` GUID 中通过 PCD 来定义的。`MdeModulePkg.dec` 中的默认值如下：

- `PcdSerialBaudRate` --- 波特率：115200。
- `PcdSerialLineControl` --- 线路控制参数：无奇偶校验，`8` 位数据位，`1` 位停止位。

具体细节见 `Debugging` 部分。

### 7. `SysReport`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 EFI 分区中保存系统报告。

启用这一选项后，EFI 分区中将会新建一个 `SysReport` 目录。这一目录中将会保存 ACPI 和 SMBIOS 的调试信息。

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

控制台日志会比其他日志少，根据 build 类型（`RELEASE`、`DEBUG` 或 `NOOPT`）的不同，读取到的日志量也会不同（从最少到最多）。

Data Hub 日志中不包括 Kernel 和 Kext 的日志。要获取 Data Hub 日志，请使用 ioreg：

```bash
ioreg -lw0 -p IODeviceTree | grep boot-log | sort | sed 's/.*<\(.*\)>.*/\1/' | xxd -r -p
```

UEFI 变量日志中不包含某些信息，也没有性能数据。为了安全起见，日志大小被限制在 32 KB。有些固件可能会提前截断它，或者在它无内存时完全删除它。使用非易失性 flag 将会在每打印一行后把日志写入 NVRAM 闪存。如要获取 UEFI 变量日志，请在 macOS 中使用以下命令：

```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-log | awk '{gsub(/%0d%0a%00/,"");gsub(/%0d%0a/,"\n")}1'
```

<blockquote class="message doku-blockquote is-danger">
  <div class="message-header">警告</div>
  <div class="message-body">
    <p>有些固件的 NVRAM 垃圾收集据说存在问题，它们可能无法做到在每次变量删除后都释放空间。在这类设备上，没有额外需要的话，请不要使用非易失性 NVRAM 日志。</p>
  </div>
</blockquote>

虽然 OpenCore 的引导日志已经包含了基本的版本信息（包括 build 类型和日期），但即使在禁用引导日志的情况下，这些数据也可以在 NVRAM 中的 `opencore-version` 变量中找到。

文件记录会在 EFI 卷宗的根目录下创建一个名为 `opencore-YYYY-MM-DD-HHMMSS.txt` 的文件，其中包含了日志的内容（大写字母部分会被替换为固件中的日期和时间）请注意，固件中的一些文件系统驱动程序不可靠，并且可能会通过 UEFI 写入文件时损坏数据。因此，OpenCore 会尝试用最安全同时也是最慢的方式来写入日志。当你在使用慢速存储驱动器时，请确保已将 `DisableWatchDog` 设置为 `true`。如果你在使用 SSD，应该尽量避免使用这一选项，大量的 I/O 操作会很快耗尽 SSD 的寿命。

注意，每一行日志都包含有一个描述日志类型的前缀，从而确定该行日志的归属。以下是已知的前缀列表：

**Drivers and tools**:

- `BMF` — OpenCanopy, bitmap font
- `BS` — Bootstrap
- `GSTT` — GoptStop
- `HDA` — AudioDxe
- `KKT` — KeyTester
- `MMDD` — MmapDump
- `OCPAVP` — PavpProvision
- `OCRST` — ResetSystem
- `OCUI` — OpenCanopy
- `OC` — OpenCore main
- `VMOPT` — VerifyMemOpt

**Libraries**:

- `AAPL` — OcDebugLogLib, Apple EfiBoot logging
- `OCABC` — OcAfterBootCompatLib
- `OCAE` — OcAppleEventLib
- `OCAK` — OcAppleKernelLib
- `OCAU` — OcAudioLib
- `OCAV` — OcAppleImageVerificationLib
- `OCA` — OcAcpiLib
- `OCBP` — OcAppleBootPolicyLib
- `OCB` — OcBootManagementLib
- `OCCL` — OcAppleChunkListLib
- `OCCPU` — OcCpuLib
- `OCC` — OcConsoleLib
- `OCDH` — OcDataHubLib
- `OCDI` — OcAppleDiskImageLib
- `OCFSQ` — OcFileLib, UnblockFs quirk
- `OCFS` — OcFileLib
- `OCFV` — OcFirmwareVolumeLib
- `OCHS` — OcHashServicesLib
- `OCI4` — OcAppleImg4Lib
- `OCIC` — OcImageConversionLib
- `OCII` — OcInputLib
- `OCJS` — OcApfsLib
- `OCKM` — OcAppleKeyMapLib
- `OCL` — OcDebugLogLib
- `OCMCO` — OcMachoLib
- `OCME` — OcHeciLib
- `OCMM` — OcMemoryLib
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
- `OCXML` — OcXmlLib

## 8.5 Security 属性

### 1. `AllowNvramReset`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用这一选项后将允许使用 `CMD+OPT+P+R` 快捷键重置 NVRAM，同时 `NVRAM Reset` 条目也会出现在开机引导菜单中。

*注 1*：据说部分联想笔记本存在固件 bug，执行 NVRAM 重置后无法启动。更多细节请参见 [acidanthera/bugtracker#995](https://github.com/acidanthera/bugtracker/issues/995)。

*注 2*：重置 NVRAM 后，未经过 bless 工具备份过的开机项（如 Linux）会被全部删除。

> 译者注：BootCamp Windows 因为符合 bless 模型而不受影响。

### 2. `AllowSetDefault`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许使用 `CTRL+Enter` 和 `CTRL+[数字]` 设置默认启动项。

### 3. `ApECID`

**Type**: `plist integer`, 64 bit
**Failsafe**: `0`
**Description**: Apple Enclave 标识符。

将此值设置为任何非零的 64 位整数，将允许使用个性化的 Apple 安全启动标识符。如果你想使用此设置，请确保使用加密的随机数生成器生成一个 64 位的随机数。如果这个值设置妥当，并且 `SecureBootModel` 值有效且不是 `Disabled`，那么就可以实现 Apple 安全启动的 [完整安全性](https://support.apple.com/HT208330)。

*注 1*：该值设置为非零的时候，必须重新安装操作系统，或使用 macOS DMG 恢复镜像 `bless –personalize` 完成安装。只有通过 macOS 恢复功能（macOS Recovery）或使用 `asr`（Apple Software Restore）创建的个性化映像，才能在 `ApECID` 值非零的情况下安装操作系统。

*注 2*：由于 macOS 安装器存在 bug，目前这个选项不太可靠，因此不建议使用。

### 4. `AuthRestart`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 启用与 `VirtualSMC` 兼容的 authenticated restart。

`authenticated restart` 可以在重启 FileVault2 分区时不用再次输入密码。你可以使用下述指令执行一次 `authenticated restart`：`sudo fdesetup authrestart`。macOS 在安装系统更新使用的也是 `authenticated restart`。

VirtualSMC 通过将磁盘加密密钥拆分保存在 NVRAM 和 RTC 中来执行 authenticated restart。虽然 OpenCore 在启动系统后立刻删除密钥，但是这仍然可能被视为安全隐患。

### 5. `BootProtect`

**Type**: `plist string`
**Failsafe**: `None`
**Description**: 该选项试图保证 Bootloader 的持久性、一致性。

可以使用的值有：

- `None`: 什么都不做
- `Bootstrap`: 在启动引导程序时，在 UEFI 变量存储中创建或更新最高优先级 `\EFI\OC\Bootstrap\Bootstrap.efi` 引导选项 (`Boot9696`)。要使用这个选项，必须同时开启 `RequestBootVarRouting`。

在安装和升级第三方操作系统时 `\EFI\BOOT\BOOTx64.efi` 文件可能会被覆盖掉，该选项则保证了出现覆盖情况时 Bootloader 的一致性。在 `Bootstrap` 模式下创建一个自定义启动项后，`\EFI\BOOT\BOOTx64.efi` 这个文件路径将不再用于引导 OpenCore。

*注 1*：某些固件的 NVRAM 本身存在问题，可能会出现无启动项支持，或者其他各种不兼容的情况。虽然可能性不大，但使用此选项可能会导致启动失败。请在已知兼容的主板上使用，风险自行考虑。

*注 2*：请注意，虽然从 OpenCore 执行的 NVRAM 重置不会清除在 `Bootstrap` 模式中创建的启动选项，但是如果在加载 OpenCore 之前重置 NVRAM，则会同时清除 `Bootstrap` 创建的启动选项。

### 6. `DmgLoading`

**Type**: `plist string`
**Failsafe**: `Signed`
**Description**: 定义用于 macOS 恢复功能的磁盘映像（DMG）加载策略。

有效值如下：

- `Disabled` --- 加载 DMG 磁盘映像的行为将会失败。大多数情况下 `Disabled` 策略仍会允许加载 macOS Recovery，因为通常会有 `boot.efi` 文件，它与 Apple 安全启动兼容。但是，手动下载存储在 `com.apple.recovery.boot` 目录中的 DMG 磁盘映像将无法被加载。
- `Signed` --- 仅加载 Apple 签名的 DMG 磁盘映像。由于 Apple 安全启动的设计，不管 Apple 安全启动是什么状态，`Signed` 策略都会允许加载任何 Apple 签名的 macOS Recovery，这可能不是我们所希望的那样。
- `Any` --- 任何 DMG 磁盘映像都会作为普通文件系统挂载。强烈不建议使用 `Any` 策略，当激活了 Apple 安全启动时会导致启动失败。

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

如要获取 OpenCore 版本信息，请在 macOS 中使用以下命令：

```bash
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:opencore-version
```

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

### 9. `Vault`

**Type**: `plist string`
**Failsafe**: `Secure`
**Description**: 启用 OpenCore 的 Vault 机制。

有效值：

- `Optional` --- 无要求，不设置 Vault，不安全。
- `Basic` --- 需要有 `vault.plist` 文件存放在 `OC` 目录下。这个值提供了基本的文件系统完整性验证，可以防止无意中的文件系统损坏。
- `Secure` --- 需要有 `vault.sig` 签名的 `vault.plist` 文件存放在 `OC` 目录下。这个值包括了 `Basic` 完整性检查，但也会尝试建立一个可信的引导链。

`vault.plist` 文件应该包含 OpenCore 使用的所有文件的 SHA-256 哈希值。强烈建议使用这个文件，以确保无意中的文件修改（包括文件系统损坏）不会被忽视。要自动创建这个文件，请使用 [`create_vault.sh`](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/CreateVault) 脚本。无论底层的文件系统如何，路径名和大小写必须在 `config.plist` 和 `vault.plist` 之间相匹配。

`vault.sig` 文件应该包含一个来自 `vault.plist` SHA-256 哈希值的原始的 256 字节 RSA-2048 签名。这个签名是根据嵌入到 `OpenCore.efi` 中的公钥来验证的。如要嵌入公钥，以下任一步骤均可：

- 在 `OpenCore.efi` 编译过程中，在 [`OpenCoreVault.c`](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c) 文件中提供公钥。
- 用二进制补丁的方式将 `OpenCore.efi` 中 `=BEGIN OC VAULT=` 和 `==END OC VAULT==` ASCII 码之间的 0 替换为公钥。

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

*注 2*：当 `vault.plist` 存在，或者当公钥嵌入到 `OpenCore.efi` 中的时候，无论这个选项是什么，`vault.plist` 和 `vault.sig` 都会被使用。设置这个选项仅仅会确保配置的合理性，否则启动过程会中止。

### 10. `ScanPolicy`

**Type**: `plist integer`, 32 bit
**Failsafe**: `0xF0103`
**Description**: 定义操作系统检测策略。

通过设置该值来根据所选 flag 的位掩码（总和）防止从非信任源扫描（和启动）。由于不可能可靠地检测到每一个文件类型或设备类型，因此在开放环境中不能完全依赖此功能，需要采取额外的措施。

第三方驱动程序可能会根据提供的扫描策略引入额外的安全（和性能）措施。扫描策略暴露在 `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` GUID的 `scan-policy` 变量中，仅适用于 UEFI 启动服务。

- `0x00000001` (bit `0`) --- `OC_SCAN_FILE_SYSTEM_LOCK`，将扫描限制于仅扫描此策略定义的已知文件系统。文件系统驱动可能感知不到这个策略，为了避免挂载不必要的文件系统，最好不要加载它的驱动程序。此 bit 不影响 dmg 挂载，因为它可能有各种文件系统。已知文件系统的前缀为 `OC_SCAN_ALLOW_FS_`。
- `0x00000002` (bit `1`) --- `OC_SCAN_DEVICE_LOCK`，将扫描限制于仅扫描此策略定义的已知设备类型。由于协议隧道并不一定能被检测到，因此请注意，在某些系统上可能会出现 USB 硬盘被识别成 SATA 等情况。如有类似情况，请务必报告。已知设备类型的前缀为 `OC_SCAN_ALLOW_DEVICE_`。
- `0x00000100` (bit `8`) --- `OC_SCAN_ALLOW_FS_APFS`，允许扫描 APFS 文件系统。
- `0x00000200` (bit `9`) --- `OC_SCAN_ALLOW_FS_HFS`，允许扫描 HFS 文件系统。
- `0x00000400` (bit `10`) --- `OC_SCAN_ALLOW_FS_ESP`，允许扫描 EFI 系统分区文件系统。
- `0x00000800` (bit `11`) --- `OC_SCAN_ALLOW_FS_NTFS`，允许扫描 NTFS（MSFT Basic Data）文件系统。
- `0x00001000` (bit `12`) --- `OC_SCAN_ALLOW_FS_EXT`，允许扫描 EXT（Linux Root）文件系统。
- `0x00010000` (bit `16`) --- `OC_SCAN_ALLOW_DEVICE_SATA`，允许扫描 SATA 设备。
- `0x00020000` (bit `17`) --- `OC_SCAN_ALLOW_DEVICE_SASEX`，允许扫描 SAS 和 Mac NVMe 设备。
- `0x00040000` (bit `18`) --- `OC_SCAN_ALLOW_DEVICE_SCSI`，允许扫描 SCSI 设备。
- `0x00080000` (bit `19`) --- `OC_SCAN_ALLOW_DEVICE_NVME`，允许扫描 NVMe 设备。
- `0x00100000` (bit `20`) --- `OC_SCAN_ALLOW_DEVICE_ATAPI`，允许扫描 CD/DVD 设备。
- `0x00200000` (bit `21`) --- `OC_SCAN_ALLOW_DEVICE_USB`，允许扫描 USB 设备。
- `0x00400000` (bit `22`) --- `OC_SCAN_ALLOW_DEVICE_FIREWIRE`，允许扫描 FireWire 设备。
- `0x00800000` (bit `23`) --- `OC_SCAN_ALLOW_DEVICE_SDCARD`，允许扫描读卡器设备。

*注*：举例：根据以上描述，`0xF0103` 值允许扫描带有 APFS 文件系统的 SATA、SAS、SCSI 和 NVMe 设备，不扫描 USB、CD 和 FireWire 设备上的 APFS 文件系统，也不扫描任何带有 HFS 或 FAT32 文件系统的设备。该值表示如下组合：

- `OC_SCAN_FILE_SYSTEM_LOCK`
- `OC_SCAN_DEVICE_LOCK`
- `OC_SCAN_ALLOW_FS_APFS`
- `OC_SCAN_ALLOW_DEVICE_SATA`
- `OC_SCAN_ALLOW_DEVICE_SASEX`
- `OC_SCAN_ALLOW_DEVICE_SCSI`
- `OC_SCAN_ALLOW_DEVICE_NVME`

### 11. `SecureBootModel`

**Type**: `plist string`
**Failsafe**: `Default`
**Description**: Apple 安全启动的机型。

定义 Apple 安全启动的机型和策略。指定此值能够定义哪些操作系统可以启动。早于指定机型发布时间的操作系统将无法启动。有效值如下：

- `Default` --- 最近的可用型号，目前设置为 `j137`
- `Disabled` --- 无机型，禁用 Apple 安全启动
- `j137` --- iMacPro1,1 (December 2017) minimum macOS 10.13.2 (17C2111)
- `j680` --- MacBookPro15,1 (July 2018) minimum macOS 10.13.6 (17G2112)
- `j132` --- MacBookPro15,2 (July 2018) minimum macOS 10.13.6 (17G2112)
- `j174` --- Macmini8,1 (October 2018) minimum macOS 10.14 (18A2063)
- `j140k` --- MacBookAir8,1 (October 2018) minimum macOS 10.14.1 (18B2084)
- `j780` --- MacBookPro15,3 (May 2019) minimum macOS 10.14.5 (18F132)
- `j213` --- MacBookPro15,4 (July 2019) minimum macOS 10.14.5 (18F2058)
- `j140a` --- MacBookAir8,2 (July 2019) minimum macOS 10.14.5 (18F2058)
- `j152f` --- MacBookPro16,1 (November 2019) minimum macOS 10.15.1 (19B2093)
- `j160` --- MacPro7,1 (December 2019) minimum macOS 10.15.1 (19B88)
- `j230k` --- MacBookAir9,1 (March 2020) minimum macOS 10.15.3 (19D2064)
- `j214k` --- MacBookPro16,2 (May 2020) minimum macOS 10.15.4 (19E2269)
- `j223` --- MacBookPro16,3 (May 2020) minimum macOS 10.15.4 (19E2265)
- `j215` --- MacBookPro16,4 (June 2020) minimum macOS 10.15.5 (19F96)
- `j185` --- iMac20,1 (August 2020) minimum macOS 10.15.6 (19G2005)
- `j185f` --- iMac20,2 (August 2020) minimum macOS 10.15.6 (19G2005)

`PlatformInfo` 和 `SecureBootModel` 是相互独立的，因此可以在任何 SMBIOS 上启用 Apple 安全启动。将 `SecureBootModel` 设置为除 `Disabled` 以外的任意有效值，相当于实现了 Apple 安全启动的 [中等安全性](https://support.apple.com/HT208330)。如要实现「完整安全性」，还需要指定 `ApECID` 值。

启用 Apple 安全启动的要求很多，任何不正确的配置、错误的 macOS 安装或者不支持的安装设置都可能会增加启用难度，记住以下几点：

- 和配备 Apple T2 安全芯片的 Mac 电脑一样，你将无法安装任何未签名的内核驱动程序。还有一些内核驱动程序尽管已签名，但也无法安装，包括但不限于 NVIDIA Web Drivers。
- 驱动程序缓存的列表可能不同，因此需要改变 `Add` 或 `Force` 内核驱动程序列表。比如，在这种情况下 `IO80211Family` 不能被注入。
- 如果你的平台需要某些特定设置，但由于之前调试时没有触发明显问题而没有被启用，那么可能会导致启动失败。要格外小心 `IgnoreInvalidFlexRatio` 或 `HashServices`。
- 在 Apple 推出安全启动功能之前发布的操作系统（如 macOS 10.12 或更早的版本）仍然会正常启动，除非启用了 UEFI 安全启动。之所以如此，是因为从 Apple 安全启动的角度来看，它们都是不兼容的系统，会被认为应该由 BIOS 来处理，就像微软的 Windows 一样。
- 在较旧的 CPU 上（如 Sandy Bridge 之前），启用 Apple 安全启动可能会使加载速度略微变慢，最长可达 1 秒。
- 由于 `Default` 的值会随着时间的推移而变化，以支持最新的 macOS 主版本，因此不建议同时使用 `ApECID` 和 `Default` 值。

关于如何结合 UEFI 安全启动来配置 Apple 安全启动的细节，请参考本文档 [UEFI 安全启动](12-troubleshooting.html#12-2-UEFI-安全启动) 部分。

## 8.6 Entry 属性

### 1. `Arguments`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 对该引导条目使用的引导参数。

### 2. `Auxiliary`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 当 `HideAuxiliary` 被启用时，这一值为 `true` 的引导条目将不会显示在开机引导菜单中。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非设置为 `true`，否则该引导条目不会显示在开机引导菜单中。

### 5. `Name`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 引导条目在开机引导菜单中显示的名字。

### 6. `Path`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 引导入口。

- `Entries` 用于指定外部启动选项，因此会在 `Path` 中取设备路径。这些值不会被检查，所以要非常小心。例如：`PciRoot(0x0)/Pci(0x1,0x1)/.../\EFI\COOL.EFI`。
- `Tools` 用于指定内部引导选项，这些选项隶属于 bootloader vault，因此会取相对于 `OC/Tools` 目录的文件路径。例如：`OpenShell.efi`。
