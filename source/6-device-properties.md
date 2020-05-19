---
title: 6. DeviceProperties
description: PCI 设备属性注入
type: docs
author_info: 由 Sukka 整理、由 Sukka、derbalkon 翻译。
last_updated: 2020-04-29
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
  用户指定的设备标识符，用于 I/O 套件匹配。数据类型为 4 byte data.
- `vendor-id`
  用户指定的供应商标识符，用于 I/O 套件匹配。数据类型为 4 byte data.
- `AAPL,ig-platform-id`
  Intel GPU 缓冲帧标识符，用于在 Ivy Bridge 上选择缓冲帧区域。数据类型为 4 byte data。
- `AAPL,snb-platform-id`
  Intel GPU 缓冲帧标识符，用于在 Sandy Bridge 上选择缓冲帧区域。数据类型为 4 byte data。
- `layout-id`
  AppleHDA 的音频布局，4 byte data。
