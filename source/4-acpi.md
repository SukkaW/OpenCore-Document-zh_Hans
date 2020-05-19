---
title: 4. ACPI
description: 加载、屏蔽、修补 ACPI（DSDT/SSDT）表（待翻译）
type: docs
author_info: 由 Sukka 整理、由 Sukka、derbalkon 翻译。感谢黑果小兵提供的参考资料
last_updated: 2020-04-23
---

## 4.1 简介

ACPI（Advanced Configuration and Power Interface，高级配置和电源接口）是发现和配置计算机硬件的开放标准。
[ACPI 规格](https://uefi.org/specifications) 定义了实现用的标准表（如 `DSDT`、`SSDT`、`FACS`、`DMAR`）和各种方法（如 `_DSM` 和 `_PRW）。现代硬件几乎不需要更改即可保持 ACPI 兼容性，但是 OpenCore 仍然提供了修改 ACPI 的方法。

要反汇编和编译 ACPI 表，可以使用由 [ACPICA](https://www.acpica.org) 开发的 [iASL compiler](https://github.com/acpica/acpica)。你可以从 [Acidanthera/MaciASL](https://github.com/acidanthera/MaciASL/releases) 下载 iASL 的图形界面程序。

对 ACPI 的修补按照如下顺序执行：

- Patch
- Delete
- Add
- Quirks

Applying the changes globally resolves the problems of incorrect operating system detection, which is not possible before the operating system boots according to the ACPI specification, operating system chainloading, and harder ACPI debugging. For this reason it may be required to carefully use `\_OSI` method when writing the changes.

Applying the patches early makes it possible to write so called `proxy` patches, where the original method is patched in the original table and is implemented in the patched table.

## 4.2 属性列表

### 4.2.1 `Add`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 `OC/ACPI` 目录加载指定的 ACPI 表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.3 Add 属性](#4-3-Add-属性) 章节。

### 4.2.2 `Delete`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 ACPI 栈中删除选定的表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.4 Delete 属性](#4-4-Delete-属性) 章节。

### 4.2.3 `Patch`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 在添加或删除 ACPI 表之前执行的二进制修补。

设计为用 `plist dictionary` 值填充以描述每个块级项目。请参阅下面 [4.5 Patch 属性](#4-5-Patch-属性) 章节。

### 4.2.4 `Quirks`

**Type**: `plist dict`
**Description**: 应用下文 [4.6 Quirks 属性](#4-6-Quirks-属性) 章节中描述的 Quirks。

## 4.3 Add 属性

### 4.2.1 `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4.2.2 `Enabled`

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 除非此值为 `true`，否则此 ACPI 表不会被添加。

### 4.2.3 `Path`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 需要加载的 ACPI 表所在的路径。示例值如 `DSDT.aml`、`SubDir/SSDT-8.aml`、`SSDT-USBX.aml`。

所有 ACPI 表都从 `OC/ACPI` 目录加载，加载顺序遵循数组中的项目顺序。

**注**： 除具有 DSDT 表标识符（由解析得到的数据、而非由其文件名决定）的表外，所有表都将作为新表插入 ACPI 栈。而 DSDT 表与其余的表不同，将会执行 DSDT 表的替换。

## 4.4 Delete 属性

### 4.2.1 `All`

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 如果设置为 `true`，则所有符合条件的 ACPI 表都会被舍弃。 否则，只舍弃第一个匹配到的。

### 4.2.2 `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4.2.3 `Enabled`

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 除非此值为 `true`，否则此 ACPI 表不会被舍弃。

### 4.2.4 `OemTableId`

**Type**: `plist data, 8 bytes`
**Failsafe**: All zero
**Description**: 将表的 OEM ID 匹配为此处所填的值，全部为 0 时忽略。

### 4.2.5 `TableLength`

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 将表的大小匹配为此处所填的值，填 0 时忽略。

### 4.2.6 `TableSignature`

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero
**Description**: 将表的签名匹配为此处的值，全部为 0 时忽略。

**注**：当序列需要在多处替换的时候，务必注意不要指定表的签名，尤其是在进行不同类型的重命名操作的时候。

## 4.5 Patch 属性

### 4.5.1 Comment

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4.5.2 Count

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 补丁应用的次数。如果将此值设置为 0，补丁将会被应用于所有匹配。

### 4.5.3 Enabled

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 除非设置为 `true`，否则此处的 ACPI 补丁不会生效。

### 4.5.4 Find

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 需要寻找的 Data，长度必须和 `Replace` 相等。

### 4.5.5 Limit

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 要搜索的最大字节数。当此值为 0 时会遍历整个 ACPI 表。

### 4.5.6 Mask

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 查找比较期间使用的数据按位掩码。 通过忽略未屏蔽（设置为零）位来进行模糊搜索。可以设置为空数据以忽略，否则此值的长度必须和 `Replace` 的长度相等。

### 4.5.7 OemTableId

**Type**: `plist data, 8 bytes`
**Failsafe**: All zero
**Description**: 将表的 OEM ID 匹配为此处所填的值，全部为 0 时忽略。

### 4.5.8 Replace

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 一个或多个字节的替换数据。

### 4.5.9 ReplaceMark

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: 替换数据期间使用的数据按位掩码。 通过忽略未屏蔽（设置为零）位来进行模糊搜索。可以设置为空数据以忽略，否则此值的长度必须和 `Replace` 的长度相等。

### 4.5.10 Skip

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 完成替换之前要跳过的匹配数。

### 4.5.11 TableLength

**Type**: `plist integer`
**Failsafe**: 0
**Description**: 将表的大小匹配为此处所填的值，填 0 时忽略。

### 4.5.11 TableSignature

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero
**Description**: 将表的签名匹配为此处的值，全部为 0 时忽略。

大多数情况下，ACPI 补丁是有害而无益的：

- 避免用 ACPI 补丁重命名设备。这样做可能会使设备重命名失败，或者会对不相关的设备进行错误地重命名（如 `EC` 和 `EC0`）。为了保证 ACPI 的一致性，在 I/O 注册表级别重命名设备会更加安全，比如 [WhateverGreen](https://github.com/acidanthera/WhateverGreen) 的做法。
- 避免为了支持更高级的功能集而给 `_OSI` 打补丁，除非你非常需要。这样做通常会侵入 APTIO 固件，从而导致需要用打更多的补丁去填坑。现代的固件基本不需要，而真正需要的那些固件只要打一些更小的补丁就可以了。
- 尽量避免重命名 `_PRW` 或 `_DSM` 之类的魔改举动。

在某些情况下，打补丁确实是有意义的：

- 刷新 `HPET`（或其他设备）的 method header 来避免老硬件上的 `_OSI` 兼容性检查。可通过将 `A0 10 93 4F 53 46 4C 00` 替换为 `A4 0A 0F A3 A3 A3 A3 A3` 的办法，使带有 `if ((OSFL () == Zero)) { If (HPTE)  ...  Return (Zero)` 的 `_STA` method 达到强制返回 0xF 的目的。
- 在 SSDT 中实现自定义 method，比如笔记本电脑上功能键可以通过将 `_Q11` 替换为 `XQ11` 的方法进行仿冒。

TianoCore 源文件 [AcpiAml.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/IndustryStandard/AcpiAml.h) 可能会对于理解 ACPI 操作码有所帮助。

*Note*: Patches of different `Find` and `Replace` lengths are unsupported as they may corrupt ACPI tables and make you system unstable due to area relocation. If you need such changes you may utilities `proxy` patching or `NOP` the remaining area.

## 4.6 Quirks 属性

### 4.6.1 FadtEnableReset

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 在 FADT 表中提供寄存器复位标志，用于修复旧硬件的重启和关机。除非需要，否则不建议启用。

### 4.6.2 NormalizeHeaders

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 清理 ACPI 表头字段以解决 macOS ACPI 实现错误导致的引导崩溃
*参考*: 由 Alex James（theracermaster）在调试 AppleACPIPlatform 时发现。从 macOS Mojave (10.14) 开始，这个错误已经被修复。

### 4.6.3 RebaseRegions

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 尝试试探性地重定位 ACPI 内存区域。不建议启用这一选项，除非你需要自定义 DSDT。

ACPI 表通常由底层固件动态生成。在与位置无关的代码中，ACPI 表可能包含用于设备配置的 MMIO 区域的物理地址，通常按区域（例如 OperationRegion）分组。 更改固件设置或硬件配置，升级或修补固件不可避免地会导致动态生成的 ACPI 代码发生变化，这有时会导致上述 OperationRegion 结构中的地址发生变化。

因此，对 ACPI 表进行任何形式的修改都是非常危险的。最合理的方法是对 ACPI 进行尽可能少的更改，并尝试不替换任何表，尤其是 DSDT。

如果无法不得不替换 DSDT，则至少应尝试确保自定义 DSDT 基于最新的 DSDT 或避免对受影响区域的读写。如果没有其他帮助，可以尝试通过尝试修复 ACPI 地址来避免在 macOS 引导的 PCI Configuration Begin 阶段出现停顿的情况。

### 4.6.4 ResetHwSig

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 将 `FACS` 表中 `HardwareSignature` 的值重置为 0。

启用这一选项可以解决固件无法在重新启动过程中保持硬件签名导致的休眠唤醒问题。

### 4.6.5 ResetLogoStatus

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 将 `BGRT` 表中 `Displayed` 状态字段重置为 `false`.

这适用于提供 `BGRT` 表、但随后无法处理屏幕更新的固件。如果在开机时无法显示 OEM Windows 标志的硬件可以尝试开启开启。
