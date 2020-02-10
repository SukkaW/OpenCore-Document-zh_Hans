---
title: 4. ACPI
description: ACPI（待整理）
type: docs
---

## 4.1 简介

ACPI (Advanced Configuration and Power Interface) is an open standard to
discover and configure computer hardware.
[ACPI specification](https://uefi.org/specifications) defines the
standard tables (e.g. `DSDT`, `SSDT`, `FACS`, `DMAR`) and various methods (e.g. `_DSM`, `_PRW`) for implementation. Modern hardware needs little changes to maintain ACPI compatibility, yet some of those are provided as a part of OpenCore.

To compile and disassemble ACPI tables [iASL compiler](https://github.com/acpica/acpica) can be used developed by [ACPICA](https://www.acpica.org). GUI front-end to iASL compiler can be downloaded from [Acidanthera/MaciASL](https://github.com/acidanthera/MaciASL/releases).

## 4.2 属性列表

### 4.2.1 `Add`

**Type**: plist array
**Failsafe**: Empty
**Description**: Load selected tables from `OC/ACPI` directory

Designed to be filled with `plist dict` values, describing each block entry. See `Add Properties` section below.

### 4.2.2 `Block`

**Type**: plist array
**Failsafe**: Empty
**Description**: Remove selected tables from ACPI stack.

Designed to be filled with `plist dict` values, describing each block entry. See `Block Properties` section below.

### 4.2.3 `Patch`

**Type**: plist array
**Failsafe**: Empty
**Description**: Perform binary patches in ACPI tables before table addition or removal.

Designed to be filled with `plist\ dictionary` values describing each patch entry. See `Patch Properties` section below.

### 4.2.4 `Quirks`

**Type**: plist dict
**Description**: Apply individual ACPI quirks described in Quirks Properties section below.

## 4.3 属性 Add

### 4.2.1 `Comment`

**Type**: plist string
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### 4.2.2 `Enabled`

**Type**: plist boolean
**Failsafe**: false
**Description**: This ACPI table will not be added unless set to true.

### 4.2.3 `Path`

**Type**: plist string
**Failsafe**: Empty string
**Description**: File paths meant to be loaded as ACPI tables. Example values include `DSDT.aml`, `SubDir/SSDT-8.aml`, `SSDT-USBX.aml`, etc.

ACPI table load order follows the item order in the array. All ACPI tables load from OC/ACPI directory.

**Note**: All tables but tables with DSDT table identifier (determined by parsing data not by filename) insert new tables into ACPI stack. DSDT, unlike the rest, performs replacement of DSDT table.

## 4.4 属性 Block

### 4.2.1 `All`

**Type**: plist boolean
**Failsafe**: false
**Description**: If set to true, all ACPI tables matching the condition will be dropped. Otherwise only first matched table

### 4.2.2 `Comment`

**Type**: plist string
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### 4.2.3 `Enabled`

**Type**: plist boolean
**Failsafe**: false
**Description**: This ACPI table will not be removed unless set to `true`.

### 4.2.4 `OemTableId`

**Type**: plist data, 8 bytes
**Failsafe**: All zero
**Description**: Match table OEM ID to be equal to this value unless all zero.

### 4.2.5 `TableLength`

**Type**: plist integer
**Failsafe**: 0
**Description**: Match table size to be equal to this value unless 0.

### 4.2.6 `TableSignature`

**Type**: plist data, 4 bytes
**Failsafe**: All zero
**Description**:  Match table signature to be equal to this value unless all zero.

*Note*: Make sure not to specify table signature when the sequence needs to be replaced in multiple places. Especially when performing different kinds of renames.

## 4.5 属性 Patch

### 4.5.1 Comment

**Type**: plist string
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### 4.5.2 Count

**Type**: plist integer
**Failsafe**: 0
**Description**: Number of patch occurrences to apply. 0 applies the patch to all occurrences found.

### 4.5.3 Enabled

**Type**: plist boolean
**Failsafe**: false
**Description**: This ACPI patch will not be used unless set to true.

### 4.5.4 Find

**Type**: plist data
**Failsafe**: Empty data
**Description**: Data to find. Must equal to `Replace` in size.

### 4.5.5 Limit

**Type**: plist integer
**Failsafe**: 0
**Description**: Maximum number of bytes to search for. Can be set to 0 to look through the whole ACPI table.

### 4.5.6 Mask

**Type**: plist data
**Failsafe**: Empty data
**Description**: Data bitwise mask used during find comparison. Allows fuzzy search by ignoring not masked (set to zero) bits. Can be set to empty data to be ignored. Must equal to Replace in size otherwise.

### 4.5.7 OemTableId

**Type**: plist data, 8 bytes
**Failsafe**: All zero
**Description**: Match table OEM ID to be equal to this value unless all zero.

### 4.5.8 Replace

**Type**: plist data
**Failsafe**: Empty data
**Description**: Replacement data of one or more bytes.

### 4.5.9 ReplaceMark

**Type**: plist data
**Failsafe**: Empty data
**Description**: Data bitwise mask used during replacement. Allows fuzzy replacement by updating masked (set to non-zero) bits. Can be set to empty data to be ignored. Must equal to Replace in size otherwise.

### 4.5.10 Skip

**Type**: plist integer
**Failsafe**: 0
**Description**: Number of found occurrences to be skipped before replacement is done.

### 4.5.11 TableLength

**Type**: plist integer
**Failsafe**: 0
**Description**: Match table size to be equal to this value unless 0.

### 4.5.11 TableSignature

**Type**: plist data, 4 bytes
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

## 4.6 Quirks Properties

### 4.6.1 FadtEnableReset

**Type**: plist boolean
**Failsafe**: false
**Description**: Provide reset register and flag in FADT table to enable reboot and shutdown on legacy hardware. Not recommended unless required.

### 4.6.2 NormalizeHeaders

**Type**: plist boolean
**Failsafe**: false
**Description**: : Cleanup ACPI header fields to workaround macOS ACPI implementation bug causing boot crashes.
*Reference*: Debugging AppleACPIPlatform on 10.13 by Alex James aka theracermaster. The issue is fixed in macOS Mojave (10.14).

### 4.6.3 RebaseRegions

**Type**: plist boolean
**Failsafe**: false
**Description**: Attempt to heuristically relocate ACPI memory regions. Not recommended.

ACPI tables are often generated dynamically by underlying firmware implementation. Among the positionindependent code, ACPI tables may contain physical addresses of MMIO areas used for device configuration, usually grouped in regions (e.g. OperationRegion). Changing firmware settings or hardware configuration, upgrading or patching the firmware inevitably leads to changes in dynamically generated ACPI code, which sometimes lead to the shift of the addresses in aforementioned OperationRegion constructions.

For this reason it is very dangerous to apply any kind of modifications to ACPI tables. The most reasonable approach is to make as few as possible changes to ACPI and try to not replace any tables, especially DSDT.

When this is not possible, then at least attempt to ensure that custom DSDT is based on the most recent DSDT or remove writes and reads for the affected areas. When nothing else helps this option could be tried to avoid stalls at PCI Configuration Begin phase of macOS booting by attempting to fix the ACPI addresses. It does not do magic, and only works with most common cases.
Do not use unless absolutely required.

### 4.6.4 ResetHwSig

**Type**: plist boolean
**Failsafe**: false
**Description**: Reset `FACS` table `HardwareSignature` value to 0.

This works around firmwares that fail to maintain hardware signature across the reboots and cause issues with
waking from hibernation.

### 4.6.5 ResetLogoStatusesetHwSig

**Type**: plist boolean
**Failsafe**: false
**Description**: Reset `BGRT` table `Displayed` status field to `false`.

This works around firmwares that provide `BGRT` table but fail to handle screen updates afterwards.
