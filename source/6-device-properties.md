---
title: 6. DeviceProperties
description: DeviceProperties（待翻译）
type: docs
author_info: 由 Sukka 整理
---

## 6.1 简介

Device configuration is provided to macOS with a dedicated buffer, called `EfiDevicePropertyDatabase`. This buffer is a serialised map of DevicePaths to a map of property names and their values.

Property data can be debugged with [gfxutil](https://github.com/acidanthera/gfxutil). To obtain current property data use the following command in macOS:

```bash
ioreg -lw0 -p IODeviceTree -n efi -r -x | grep device-properties |
  sed 's/.*<//;s/>.*//' > /tmp/device-properties.hex &&
  gfxutil /tmp/device-properties.hex /tmp/device-properties.plist &&
  cat /tmp/device-properties.plist
```

## 6.2 属性列表

### 6.2.1 Add

**Type**: plist dict
**Description**: Sets device properties from a map (plist dict) of deivce paths to a map (plist dict) of variable names and their values in plist metadata format. Device paths must be provided in canonic string format (e.g. `PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x0)`). Properties will only be set if not present and not blocked.
**Note**: Currently properties may only be (formerly) added by the original driver, so unless a separate driver was installed, there is no reason to block the variables.

### 6.2.2 Block

**Type**: plist dict
**Description**: Removes device properties from a map (plist dict) of deivce paths to an array (plist array) of variable names in plist string format.

## 6.3 常见属性

一些常见的属性包括：

- device-id
  User-specified device identifier used for I/O Kit matching. Has 4 byte data type.
- vendor-id
  User-specified vendor identifier used for I/O Kit matching. Has 4 byte data type.
- AAPL,ig-platform-id
  Intel GPU framebuffer identifier used for framebuffer selection on Ivy Bridge and newer. Has 4 byte data type.
- AAPL,snb-platform-id
  Intel GPU framebuffer identifier used for framebuffer selection on Sandy Bridge. Has 4 byte data type.
- layout-id
  Audio layout used for AppleHDA layout selection. Has 4 byte data type.