---
title: 4. ACPI
description: ACPI（待翻译）
type: docs
author_info: 由 Sukka 整理、由 Sukka 翻译
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

**Note**: 除具有 DSDT 表标识符（由解析得到的数据、而非由其文件名决定）的表外，所有表都将作为新表插入 ACPI 栈。而 DSDT 表与其余的表不同，将会执行 DSDT 表的替换。

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
**Description**:  Match table signature to be equal to this value unless all zero.

**Note**: Make sure not to specify table signature when the sequence needs to be replaced in multiple places. Especially when performing different kinds of renames.

## 4.5 Patch 属性

### 4.5.1 Comment

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### 4.5.2 Count

**Type**: `plist integer`
**Failsafe**: 0
**Description**: Number of patch occurrences to apply. 0 applies the patch to all occurrences found.

### 4.5.3 Enabled

**Type**: `plist boolean`
**Failsafe**: false
**Description**: This ACPI patch will not be used unless set to true.

### 4.5.4 Find

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data to find. Must equal to `Replace` in size.

### 4.5.5 Limit

**Type**: `plist integer`
**Failsafe**: 0
**Description**: Maximum number of bytes to search for. Can be set to 0 to look through the whole ACPI table.

### 4.5.6 Mask

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data bitwise mask used during find comparison. Allows fuzzy search by ignoring not masked (set to zero) bits. Can be set to empty data to be ignored. Must equal to Replace in size otherwise.

### 4.5.7 OemTableId

**Type**: `plist data, 8 bytes`
**Failsafe**: All zero
**Description**: Match table OEM ID to be equal to this value unless all zero.

### 4.5.8 Replace

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Replacement data of one or more bytes.

### 4.5.9 ReplaceMark

**Type**: `plist data`
**Failsafe**: Empty data
**Description**: Data bitwise mask used during replacement. Allows fuzzy replacement by updating masked (set to non-zero) bits. Can be set to empty data to be ignored. Must equal to Replace in size otherwise.

### 4.5.10 Skip

**Type**: `plist integer`
**Failsafe**: 0
**Description**: Number of found occurrences to be skipped before replacement is done.

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

Tianocore [AcpiAml.h](https://github.com/tianocore/edk2/blob/UDK2018/MdePkg/Include/IndustryStandard/AcpiAml.h) source file may help understanding ACPI opcodes.

## 4.6 Quirks 属性

### 4.6.1 FadtEnableReset

**Type**: `plist boolean`
**Failsafe**: false
**Description**: Provide reset register and flag in FADT table to enable reboot and shutdown on legacy hardware. Not recommended unless required.

### 4.6.2 NormalizeHeaders

**Type**: `plist boolean`
**Failsafe**: false
**Description**: : Cleanup ACPI header fields to workaround macOS ACPI implementation bug causing boot crashes.
*Reference*: Debugging AppleACPIPlatform on 10.13 by Alex James aka theracermaster. The issue is fixed in macOS Mojave (10.14).

### 4.6.3 RebaseRegions

**Type**: `plist boolean`
**Failsafe**: false
**Description**: Attempt to heuristically relocate ACPI memory regions. Not recommended.

ACPI tables are often generated dynamically by underlying firmware implementation. Among the positionindependent code, ACPI tables may contain physical addresses of MMIO areas used for device configuration, usually grouped in regions (e.g. OperationRegion). Changing firmware settings or hardware configuration, upgrading or patching the firmware inevitably leads to changes in dynamically generated ACPI code, which sometimes lead to the shift of the addresses in aforementioned OperationRegion constructions.

For this reason it is very dangerous to apply any kind of modifications to ACPI tables. The most reasonable approach is to make as few as possible changes to ACPI and try to not replace any tables, especially DSDT.

When this is not possible, then at least attempt to ensure that custom DSDT is based on the most recent DSDT or remove writes and reads for the affected areas. When nothing else helps this option could be tried to avoid stalls at PCI Configuration Begin phase of macOS booting by attempting to fix the ACPI addresses. It does not do magic, and only works with most common cases.
Do not use unless absolutely required.

### 4.6.4 ResetHwSig

**Type**: `plist boolean`
**Failsafe**: false
**Description**: Reset `FACS` table `HardwareSignature` value to 0.

This works around firmwares that fail to maintain hardware signature across the reboots and cause issues with
waking from hibernation.

### 4.6.5 ResetLogoStatusesetHwSig

**Type**: `plist boolean`
**Failsafe**: false
**Description**: Reset `BGRT` table `Displayed` status field to `false`.

This works around firmwares that provide `BGRT` table but fail to handle screen updates afterwards.
