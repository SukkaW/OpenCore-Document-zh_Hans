---
title: 6. DeviceProperties
description: PCI 设备属性注入
type: docs
author_info: 由 Sukka、derbalkon 整理、由 Sukka、derbalkon 翻译。
last_updated: 2020-08-11
---

## 6.1 简介

设备相关配置通过专用的缓存区（`EfiDevicePathPropertyDatabase`）提供给 macOS，这个缓冲区是设备路径到属性名称与值的键值对的序列化映射。

属性相关数据可以使用 [gfxutil](https://github.com/acidanthera/gfxutil) 进行调试。在 macOS 下获取当前属性数据请使用 `ioreg`：

```bash
ioreg -lw0 -p IODeviceTree -n efi -r -x | grep device-properties |
  sed 's/.*<//;s/>.*//' > /tmp/device-properties.hex &&
  gfxutil /tmp/device-properties.hex /tmp/device-properties.plist &&
  cat /tmp/device-properties.plist
```

设备属性属于 macOS IO Registry 中的 `IODeviceTree`(`gIODT`) 层面，这个层面有很多与平台初始化相关的构建阶段（Construction Stage）。尽管早期的构建阶段是由 XNU 内核用 `IODeviceTreeAlloc` Method 来执行的，绝大部分仍然是由 Platform Expert 来构建、用 `AppleACPIPlatformExpert.kext` 来实现的。

AppleACPIPlatformExpert 包含了两个阶段的 `IODeviceTree` 构建，通过调用`AppleACPIPlatformExpert::mergeDeviceProperties` 来实现：

1. 在 ACPI 表初始化过程中，通过调用 `AppleACPIPlatformExpert::createDTNubs` 递归扫描 ACPI 命名空间。
2. 在 IOService 注册（`IOServices::registerService`）回调过程中，作为 `AppleACPIPlatformExpert::platformAdjustService` 函数和它私有的、针对 PCI 设备的 Worker Method `AppleACPIPlatformExpert::platformAdjustPCIDevice` 的一部分。

各阶段的应用取决于 ACPI 表中存在的设备。第一阶段适用于很早、但只适用于存在于 ACPI 表中的设备。第二阶段适用于所有晚于 PCI 配置的设备，如果设备没有出现在 ACPI 中，则会重复第一阶段。

所有的内核驱动可以在不探测设备的情况下检查 `IODeviceTree` 层面（例如 Lilu 和它的插件 `WhateverGreen` 等），因此确保 ACPI 表中的设备存在是尤其重要的。如果不这样做，则可能会因为注入的设备属性被忽略而导致**各种不稳定的行为**，原因是它们没有在第一阶段被构建出来。参见 `SSDT-IMEI.dsl` 和 `SSDT-BRG0.dsl` 的例子。

## 6.2 属性列表

### 6.2.1 Add

**Type**: `plist dict`
**Description**: 将设备属性从设备路径的映射（plist dict）设置为变量名称和值的映射（plist dict），其中变量名称和值的格式为 plist metadata。设备路径必须以 canonic string 格式提供（例如： `PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x0)`）。添加的属性只有在不存在且未被屏蔽的情况下才会被设置。
**注**：目前，属性只能通过原始驱动程序添加。因此除非安装了单独的驱动程序，否则没有理由 Delete 变量。

### 6.2.2 Delete

**Type**: `plist dict`
**Description**: 从设备路径的映射（`plist dict`）到 plist 字符串格式的变量名数组（数据类型 `plist array`）中删除设备属性。

> 译者注：这里的设置等同于 Clover 里的 ACPI 重命名 `_DSM → XDSM => TgtBridge`

## 6.3 常见属性

一些常见的属性包括：

- `device-id`
  用户指定的设备标识符，用于 I/O 套件匹配。数据类型为 4 byte data。
- `vendor-id`
  用户指定的供应商标识符，用于 I/O 套件匹配。数据类型为 4 byte data。
- `AAPL,ig-platform-id`
  Intel GPU 缓冲帧标识符，用于在 Ivy Bridge 上选择缓冲帧区域。数据类型为 4 byte data。
- `AAPL,snb-platform-id`
  Intel GPU 缓冲帧标识符，用于在 Sandy Bridge 上选择缓冲帧区域。数据类型为 4 byte data。
- `layout-id`
  AppleHDA 的音频布局，4 byte data。
