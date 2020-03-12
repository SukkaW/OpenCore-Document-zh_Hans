---
title: 4. ACPI
description: 加载、屏蔽、修补 ACPI（DSDT/SSDT）表（待翻译）
type: docs
author_info: 由 Sukka 整理、由 Sukka 翻译。感谢黑果小兵提供的参考资料
last_updated: 2020-03-12
---

## 4.1 简介

ACPI（Advanced Configuration and Power Interface，高级配置和电源接口）是发现和配置计算机硬件的开放标准。
[ACPI 规格](https://uefi.org/specifications) 定义了实现用的标准表（如 `DSDT`、`SSDT`、`FACS`、`DMAR`）和各种方法（如 `_DSM` 和 `_PRW）。现代硬件几乎不需要更改即可保持 ACPI 兼容性，但是 OpenCore 仍然提供了修改 ACPI 的方法。

要反汇编和编译 ACPI 表，可以使用由 [ACPICA](https://www.acpica.org) 开发的 [iASL compiler](https://github.com/acpica/acpica)。你可以从 [Acidanthera/MaciASL](https://github.com/acidanthera/MaciASL/releases) 下载 iASL 的图形界面程序。

## 4.2 属性列表

### 4.2.1 `Add`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 `OC/ACPI` 目录加载指定的 ACPI 表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.3 Add 属性](#4-3-Add-属性) 章节。

### 4.2.2 `Block`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 ACPI 栈中删除选定的表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.4 Block 属性](#4-4-Block-属性) 章节。

### 4.2.3 `Patch`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 在添加或删除 ACPI 表之前执行的二进制修补。

设计为用 `plist dictionary` 值填充以描述每个块级项目。请参阅下面 [4.5 Patch 属性](#4-5-Patch-属性) 章节。

### 4.2.4 `Quirks`

**Type**: `plist dict`
**Description**: 应用下文 [4.6 Quirks 属性](#4-5-Quirks-属性) 章节中描述的 Quirks。

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

## 4.4 Block 属性

### 4.2.1 `All`

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 如果设置为 true，则所有符合条件的 ACPI 表都会被舍弃。 否则，只舍弃第一个匹配到的。

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
**Description**: Match table OEM ID to be equal to this value unless all zero.

### 4.2.5 `TableLength`

**Type**: `plist integer`
**Failsafe**: 0
**Description**: Match table size to be equal to this value unless 0.

### 4.2.6 `TableSignature`

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero
**Description**: Match table signature to be equal to this value unless all zero.

**注**： Make sure not to specify table signature when the sequence needs to be replaced in multiple places. Especially when performing different kinds of renames.

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
**Description**: This ACPI patch will not be used unless set to true.

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
**Description**: Match table OEM ID to be equal to this value unless all zero.

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
**Description**: Match table size to be equal to this value unless 0.

### 4.5.11 TableSignature

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero
**Description**: Match table signature to be equal to this value unless all zero.

In the majority of the cases ACPI patches are not useful and harmful:

- Avoid renaming devices with ACPI patches. This may fail or perform improper renaming of unrelated devices (e.g. `EC` and `EC0`), be unnecessary, or even fail to rename devices in select tables. For ACPI consistency it is much safer to rename devices at I/O Registry level, as done by [WhateverGreen](https://github.com/acidanthera/WhateverGreen).
- Avoid patching `_OSI` to support a higher level of feature sets unless absolutely required. Commonly this enables a number of hacks on APTIO firmwares, which result in the need to add more patches. Modern firmwares generally do not need it at all, and those that do are fine with much smaller patches.
- Try to avoid hacky changes like renaming `_PRW` or `_DSM` whenever possible.

Several cases, where patching actually does make sense, include:

- Refreshing `HPET` (or another device) method header to avoid compatibility checks by `_OSI` on legacy hardware. `_STA` method with `if ((OSFL () == Zero)) { If (HPTE)  ...  Return (Zero)` content may be forced to always return 0xF by replacing `A0 10 93 4F 53 46 4C 00` with `A4 0A 0F A3 A3 A3 A3 A3`.
- To provide custom method implementation with in an SSDT, for instance, to report functional key presses on a laptop, the original method can be replaced with a dummy name by patching `_Q11` with `XQ11`.

Tianocore [AcpiAml.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/IndustryStandard/AcpiAml.h) source file may help understanding ACPI opcodes.

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
**Description**: Reset `FACS` table `HardwareSignature` value to 0.

启用这一选项可以解决固件无法在重新启动过程中保持硬件签名导致的休眠唤醒问题。

### 4.6.5 ResetLogoStatus

**Type**: `plist boolean`
**Failsafe**: false
**Description**: 将 `BGRT` 表中 `Displayed` 状态字段重置为 `false`.

这适用于提供 `BGRT` 表、但随后无法处理屏幕更新的固件。如果在开机时无法显示 OEM Windows 标志的硬件可以尝试开启开启。
