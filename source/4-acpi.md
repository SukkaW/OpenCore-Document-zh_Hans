---
title: 4. ACPI
description: 加载、屏蔽、修补 ACPI（DSDT/SSDT）表
type: docs
author_info: 由 Sukka、cike-567 整理、由 Sukka、derbalkon、EricKwok、cike-567 翻译。感谢黑果小兵提供的参考资料
last_updated: 2022-08-04
---

## 4.1 简介

ACPI（Advanced Configuration and Power Interface，高级配置和电源接口）是发现和配置计算机硬件的开放标准。
[ACPI 规格](https://uefi.org/specifications) 定义了实现用的标准表（例如 `DSDT`、`SSDT`、`FACS`、`DMAR`）和各种方法（例如 `_DSM` 和 `_PRW`）。现代硬件几乎不需要更改即可保持 ACPI 兼容性，但是 OpenCore 仍然提供了修改 ACPI 的方法。

要反汇编和编译 ACPI 表，可以使用由 [ACPICA](https://www.acpica.org) 开发的 [iASL compiler](https://github.com/acpica/acpica)。你可以从 [Acidanthera/MaciASL](https://github.com/acidanthera/MaciASL/releases) 下载 iASL 的图形界面程序。

ACPI 更改适用于全局（适用于每个操作系统），对 ACPI 的修补按照如下顺序执行：

- Delete
- Quirks
- Patch
- Add

为了解决操作系统检测的问题，所有对 ACPI 的更改会在所有操作系统上生效。但是在某些场景下（ACPI 编写不规范、操作系统链式引导启动、ACPI 调试）会出现问题。因此在修补 ACPI 时，需要使用 `\_OSI` 方法。

在系统引导前加载补丁使得编写「代理」补丁成为可能 —— 「代理」补丁即通过重命名的方法修补 DSDT 中的原始行为，然后通过 SSDT 注入同名的行为进行替代。

OpenCore、WhateverGreen、VirtualSmc、VoodooPS2 的 GitHub 仓库中都包含了部分 SSDT 和其他 ACPI 修补的方法。在 AppleLife 的 [Laboratory](https://applelife.ru/forums/xakintosh.67) 版块、[DSDT](https://applelife.ru/forums/dsdt.129) 版块提供了不少教程和样例（例如 [笔记本电池修补教程](https://applelife.ru/posts/498967)）。[Dortania](https://dortania.github.io) 也编写了许多 [ACPI 有关的教程](https://dortania.github.io/Getting-Started-With-ACPI)。[daliansky](https://github.com/daliansky) 的 ACPI 补丁集 [OC-little](https://github.com/daliansky/OC-little)（[5T33Z0 等人对 daliansky 的 ACPI 补丁集 OC-little 的英文翻译](https://github.com/5T33Z0/OC-Little-Translated)）。请注意，来自第三方的建议解决方案可能已经过时，或者可能包含错误。

> 译者注：对于中国黑苹果玩家，强烈推荐 [OC-little](https://github.com/daliansky/OC-little) 项目，提供了众多 SSDT 范例和相关指导；笔记本用户电池修补请参考 [这篇教程](https://xstar-dev.github.io/hackintosh_advanced/Guide_For_Battery_Hotpatch.html)。

## 4.2 属性列表

### 1. `Add`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 `OC/ACPI` 目录加载指定的 ACPI 表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.3 Add 属性](#4-3-Add-属性) 部分。

### 2. `Delete`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 从 ACPI 栈中删除选定的表。

设计为用 `plist dict` 值填充以描述每个块级项目。请参阅下面 [4.4 Delete 属性](#4-4-Delete-属性) 部分。

### 3. `Patch`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 在添加或删除 ACPI 表之前执行的二进制修补。

设计为用 `plist dictionary` 值填充以描述每个块级项目。请参阅下面 [4.5 Patch 属性](#4-5-Patch-属性) 部分。

### 4. `Quirks`

**Type**: `plist dict`
**Description**: 应用下文 [4.6 Quirks 属性](#4-6-Quirks-属性) 部分中描述的 Quirks。

## 4.3 Add 属性

### 1. `Comment`

**Type**: `plist string`
**Failsafe**: Empty string
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 2. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 除非此值为 `true`，否则此 ACPI 表不会被添加。

### 3. `Path`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 需要加载的 ACPI 表所在的路径。示例值如 `DSDT.aml`、`SubDir/SSDT-8.aml`、`SSDT-USBX.aml`。

所有 ACPI 表都从 `OC/ACPI` 目录加载，加载顺序遵循数组中的项目顺序。

*注*： 除具有 DSDT 表标识符（由解析得到的数据、而非由其文件名决定）的表外，所有表都将作为新表插入 ACPI 栈。而 DSDT 表与其余的表不同，将会执行 DSDT 表的替换。

## 4.4 Delete 属性

### 1. `All`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 如果设置为 `true`，则所有符合条件的 ACPI 表都会被舍弃。 否则，只舍弃第一个匹配到的。

### 2. `Comment`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 3. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 设置为 `true` 可以舍弃这个 ACPI 表。

### 4. `OemTableId`

**Type**: `plist data, 8 bytes`
**Failsafe**: All zero（匹配任何表的 OEM ID）
**Description**: 将表的 OEM ID 匹配为此处所填的值。

### 5. `TableLength`

**Type**: `plist integer`
**Failsafe**: `0`（匹配任何表的大小）
**Description**: 将表的大小匹配为此处所填的值。

### 6. `TableSignature`

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero（匹配任何表的签名）
**Description**: 将表的签名匹配为此处的值。

*注*：当序列需要在多处替换的时候，务必注意不要指定表的签名，尤其是在进行不同类型的重命名操作的时候。

## 4.5 Patch 属性

### 1. `Base`

**Type**: `plist string`
**Failsafe**: Empty（Ignored）
**Description**: 为重命名补丁指定一个 ACPI 路径，让 OC 通过取得该路径的偏移量来查找（或替换）重命名补丁。留空时忽略。

只有正确的**绝对路径**被支持（例如：`\_SB.PCI0.LPCB.HPET`）。目前支持的 Object 类型有：`Device`、`Field`、`Method`。

*注*：应谨慎使用，并非所有 OEM 的 ACPI 表都能被正确处理。如果遇到问题，可使用 Utilities 中的 ACPIe 工具来进行调错。使用 `DEBUG=1` 参数来编译 ACPIe 将会使该工具输出有助于调试的 ACPI 路径查找过程。

### 2. `BaseSkip`

**Type**: `plist integer`
**Failsafe**: `0` (不跳过任何事件)
**Description**: 在应用查找和替换之前跳过找到的 `Base` 事件数。

### 3. `Comment`

**Type**: `plist string`
**Failsafe**: Empty
**Description**: 用于为条目提供人类可读参考的任意 ASCII 字符串（译者注：即注释）。

### 4. `Count`

**Type**: `plist integer`
**Failsafe**: `0` (将补丁应用于找到的所有事件)
**Description**: 要修补的事件数。

### 5. `Enabled`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 设置为 `true` 以应用此 ACPI 补丁。

### 6. `Find`

**Type**: `plist data`
**Failsafe**: Empty
**Description**: 需要寻找的 Data，如果设置，长度必须和 `Replace` 相等。

注意：可以留空；当指定 `Base` 时，在这种情况下，`Base` 查询后会立即发生替换。

### 7. `Limit`

**Type**: `plist integer`
**Failsafe**: `0`（遍历整个 ACPI 表）
**Description**: 要搜索的最大字节数。

### 8. `Mask`

**Type**: `plist data`
**Failsafe**: Empty (Ignored)
**Description**: 查找比较期间使用的数据按位掩码。 通过忽略未屏蔽（设置为 `0`）位来进行模糊搜索。如果设置，此值的长度必须和 `Replace` 的长度相等。

### 9. `OemTableId`

**Type**: `plist data, 8 bytes`
**Failsafe**: All zero（匹配任何表的 OEM ID）
**Description**: 将表的 OEM ID 匹配为此处所填的值。

### 10. `Replace`

**Type**: `plist data`
**Failsafe**: Empty
**Description**: 一个或多个字节的替换数据。

### 11. `ReplaceMark`

**Type**: `plist data`
**Failsafe**: Empty (Ignored)
**Description**: 替换数据期间使用的数据按位掩码。 通过忽略未屏蔽（设置为 `0`）位来进行模糊搜索。如果设置，此值的长度必须和 `Replace` 的长度相等。

### 12. `Skip`

**Type**: `plist integer`
**Failsafe**: `0` (不跳过任何事件)
**Description**: 在应用替换之前要跳过的找到的事件数。

### 13. `TableLength`

**Type**: `plist integer`
**Failsafe**: `0` （匹配任何表格的大小）
**Description**: 将表的大小匹配为此处所填的值。

### 14. `TableSignature`

**Type**: `plist data, 4 bytes`
**Failsafe**: All zero (匹配任何表格签名)
**Description**: 将表的签名匹配为此处的值。

大多数情况下，ACPI 补丁是有害而无益的：

- 避免用 ACPI 补丁重命名设备。这样做可能会使设备重命名失败，或者会对不相关的设备进行错误地重命名（如 `EC` 和 `EC0`）。为了保证 ACPI 的一致性，在 I/O 注册表级别重命名设备会更加安全，就像 [WhateverGreen](https://github.com/acidanthera/WhateverGreen) 做的那样。
- 尽量避免为了支持更高级的功能集而给 `_OSI` 打补丁。虽然这可以在 APTIO 固件上实现一些变通，但它通常会导致需要用打更多的补丁去填坑。现代的固件基本不需要这些，而在真正需要的固件上，只要打一些小补丁就可以了。然而，笔记本厂商通常依靠这种方法来确定是否有现代 I2C 输入支持、散热调节功能，或用来添加其他自定义功能。
- 避免为了启用亮度调节键而给 `EC` 事件 `_Qxx` 打补丁。传统的方法通常需要在 DSDT 和 SSDT 上进行大量的修改，而且新系统上的 debug kext 并不稳定。请改用 [BrightnessKeys](https://github.com/acidanthera/BrightnessKeys) 中内置的亮度调节键检测功能来代替。
- 尽量避免重命名 `_PRW` 或 `_DSM` 之类的魔改举动。

在某些情况下，打补丁是很有用的：

- 刷新 `HPET`（或其他设备）的 method header 来避免老硬件上的 `_OSI` 兼容性检查。可通过将 `A0 10 93 4F 53 46 4C 00` 替换为 `A4 0A 0F A3 A3 A3 A3 A3` 的办法，使带有 `if ((OSFL () == Zero)) { If (HPTE)  ...  Return (Zero)` 的 `_STA` method 达到强制返回 0xF 的目的。
- 在 SSDT 中实现自定义 method，比如在某些计算机上注入关机修复，通过将 `_PTS` 替换为 `ZPTS`，把原来的 method 替换为一个假的名字，并添加一个 callback 回调到原 method 中。

TianoCore 源文件 [AcpiAml.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/IndustryStandard/AcpiAml.h) 可能会对于理解 ACPI 操作码有所帮助。

*注*：`Find` 和 `Replace` 的长度 **必须完全一样**，否则 ACPI 表可能会被破坏、导致系统不稳定。必要时请使用「代理」补丁的方法、或使用 `NOP` 填充剩余区域

## 4.6 Quirks 属性

### 1. `FadtEnableReset`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 FADT 表中提供寄存器复位标志，用于修复旧硬件的重启和关机。除非需要，否则不建议启用。

只有在传统硬件和少数笔记本上需要。这一 Quirk 也可以修复电源快捷键（译者注：<kbd>Command</kbd> + 电源键）。不建议启用，除非不启用就无法关机和重启。

### 2. `NormalizeHeaders`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 清理 ACPI 表头字段以解决 macOS ACPI 实现错误导致的引导崩溃。*参考*：由 Alex James（theracermaster）在[调试 AppleACPIPlatform](https://alextjam.es/debugging-appleacpiplatform/) 时发现。在 macOS Mojave (10.14) 中，这个错误已经被修复。

### 3. `RebaseRegions`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 尝试试探性地重定位 ACPI 内存区域。不建议启用这一选项，除非你需要自定义 DSDT。

ACPI 表通常由底层固件动态生成。在与位置无关的代码中，ACPI 表可能包含用于设备配置的 MMIO 区域的物理地址，通常按区域（例如：OperationRegion）分组。 更改固件设置或硬件配置，升级或修补固件不可避免地会导致动态生成的 ACPI 代码发生变化，这有时会导致上述 OperationRegion 结构中的地址发生变化。

因此，对 ACPI 表进行任何形式的修改都是非常危险的。最好的方法是对 ACPI 进行尽可能少的更改，避免替换任何表，尤其是 DSDT。如果无法不得不替换 DSDT，则至少应尝试确保自定义 DSDT 基于最新的 DSDT 或避免对受影响区域的读写。

如果没有其他帮助，可以尝试通过尝试修复 ACPI 地址来避免在 macOS 引导的 PCI Configuration Begin 阶段出现停顿的情况。然而，这不是一个灵丹妙药，只在最典型的情况下有效。除非绝对需要，否则不要使用，因为它在某些平台上可能产生相反的效果，导致启动失败。

### 4. `ResetHwSig`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `FACS` 表中 `HardwareSignature` 的值重置为 `0`。

启用这一选项可以解决固件无法在重新启动过程中保持硬件签名导致的休眠唤醒问题。

### 5. `ResetLogoStatus`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `BGRT` 表中 `Displayed` 状态字段重置为 `false`。

这适用于提供 `BGRT` 表、但随后无法处理屏幕更新的固件。如果在开机时无法显示 OEM Windows 标志可以尝试开启。

### 6. `SyncTableIds`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将表的标识符与 SLIC 表进行同步。

这可以解决打了补丁的表与 SLIC 表不兼容导致的旧版 Windows 系统中的许可问题。
