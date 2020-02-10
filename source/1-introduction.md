---
title: 1. 简介
description: Introduction（简体中文翻译填坑中）
type: docs
---

本文档提供关于 OpenCore 用户配置文件的信息，以使 macOS 操作系统正常工作。你应当视本文档为 OpenCore 预期行为的解释。如果在已经发布的 OpenCore 版本中找到与文档中的描述存在偏差的行为，应当视为 OpenCore 存在 Bug 或文档出现错误，应通过 Acidanthera Bugtracker 进行反馈。**本文档所有其他来源或翻译都是非官方的，并且可能存在错误**。

> 译者注：
> 1. 此处以及之后的「本文档」都指代 OpenCore 的官方文档（而非你现在访问的网站）。
> 2. 「Acidanthera Bugtracker」即 [acidanthera/bugtracker](https://github.com/acidanthera/bugtracker)。你应当使用英语进行反馈。

本文档仅作为规范结构、并非用于提供手把手的配置教程。提供这类材料（译者注：即「手把手的配置教程」）都容易收到其作者的喜好和品位、对本文档的误解、过时的理解等。如果您仍然在使用这些资料来源，例如 OpenCore Vanilla Guide，请务必在参考本文档后再作出每个决定、并判断其后果。无论使用哪种来源，你都必须全面了解每种专用工具。

> 译者注：[OpenCore Vanilla Guide](https://khronokernel-2.gitbook.io/opencore-vanilla-desktop-guide/)

在通过 Acidanthera Bugtracker 反馈任何问题之间，请确保你彻底理解了 OpenCore 的每个配置选项及其对应的概念。

## 1.1 通用术语

- `plist` - 使用 XML 编写的 ASCII 属性列表格式的子集，也被称为 `XML plist format version`。

1. 统一类型标识符（UTI）：`com.apple.property-list`。 Plist 文件由 plist 对象组成，它们是组合形成的一个层次结构。由于 plist 格式的定义尚不完善，因此所有的定义只有通过运行 `plutil -lint` 才能判断是否有效。外部参考： https://www.apple.com/DTDs/PropertyList-1.0.dtd 和 `man plutil`。

- `plist type` - plist collections (plist array, plist dictionary, plist key) and primitives (plist string, plist data, plist date, plist boolean, plist integer, plist real).
- `plist object` - definite realisation of plist type, which may be interpreted as value.
- `plist array` - array-like collection, conforms to array. Consists of zero or more plist objects.
- `plist dictionary` - map-like (associative array) collection, conforms to dict. Consists of zero or more plist keys.
- `plist key` - contains one plist object going by the name of plist key, conforms to key. Consists of printable 7-bit ASCII characters.
- `plist string` - printable 7-bit ASCII string, conforms to string.
- `plist data` - base64-encoded blob, conforms to data.
- `plist date` - ISO-8601 date, conforms to date, unsupported.
- `plist boolean` - logical state object, which is either true (1) or false (0), conforms to true and false.
- `plist integer` - possibly signed integer number in base 10, conforms to integer. Fits in 64-bit unsigned integer in two’s complement representation, unless a smaller signed or unsigned integral type is explicitly mentioned in specific plist object description.
- `plist real` - floating point number, conforms to real, unsupported.
- `plist metadata` - value cast to data by the implementation. Permits passing plist string, in which case the result is represented by a null-terminated sequence of bytes (aka C string), plist integer, in which case the result is represented by 32-bit little endian sequence of bytes in two’s complement representation, plist boolean, in which case the value is one byte: 01 for true and 00 for false, and plist data itself. All other types or larger integers invoke undefined behaviour.
