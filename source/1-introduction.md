---
title: 1. 简介
description: Introduction
type: docs
author_info: 由 Sukka 、cike-567 整理，由 Sukka、derbalkon 、cike-567 翻译
last_updated: 2022-07-12
---

本文档提供关于 OpenCore 用户配置文件的信息，以使 macOS 操作系统正常工作。你应当视本文档为 OpenCore 预期行为的解释。如果在已经发布的 OpenCore 版本中找到与文档中的描述存在偏差的行为，应当视为 OpenCore 存在 Bug 或文档出现错误，应通过 [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker) 进行反馈。

> OpenCore 记录重大勘误的文档可在 [这里](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Errata/Errata.pdf) 查看。

本文档仅作为规范结构、并非用于提供手把手的配置教程。本文档的目标受众是程序员、工程师、对 macOS 内部和 UEFI 有足够了解的人。因此本文档只提供英文版本，**任何通过其他来源分发的文档和文档翻译都是非官方的，并且可能存在错误。**

> 译者注：
>
> 1. 此处以及之后的「本文档」都指代 OpenCore 的官方文档（而非你现在访问的网站）。
> 2. 你应当使用英语在 Acidanthera Bugtracker 进行反馈。

对于大部分用户来说，第三方提供的教程、工具可能更易于使用、受众更广。但是这类材料（译者注：即由第三方提供的，如「手把手的配置教程」）都容易受到其作者的喜好和品位、对本文档的误解、过时的理解等因素的影响。如果您正在使用这些资料来源，例如 [OpenCore Install Guide](https://dortania.github.io/OpenCore-Install-Guide)（及其 [父页面](https://dortania.github.io/getting-started)）或者「OpenCore 非官方简体中文翻译」，请务必在参考本文档后再作出每个决定、并判断其后果。

在通过 Acidanthera Bugtracker 反馈任何问题之前，请确保你彻底理解了 OpenCore 的每个配置选项及其对应的概念。

*注*：感谢 Andrey1970, Goldfish64, dakanji, PMheart 和 [众多贡献者](https://github.com/acidanthera/OpenCorePkg/commits/master/Docs) 的宝贵贡献，多亏了这些人的付出和努力，本文档才得以诞生。

## 1.1 通用术语

- `plist` --- 是一种用 XML 编写的、储存 ASCII 属性列表格式的集合文件，又称 XML 1.0 版。 统一类型标识符（UTI）： `com.apple.property-list`。 plist 由多个 `plist object` 组成，这些对象组合在一起形成一种具有层次的结构。 由于 plist 格式的定义不明确，因此本文中的所有定义只有在运行 `plutil -lint` 有效后才能被应用。外部参考： [https://www.apple.com/DTDs/PropertyList-1.0.dtd](https://www.apple.com/DTDs/PropertyList-1.0.dtd), `man plutil`。
- `plist type` --- 指 plist 集合（`plist array`, `plist dictionary`, `plist key`）和基本类型（`plist string`, `plist data`, `plist date`, `plist boolean`, `plist integer`,  `plist real`）。
- `plist object` --- 是用来定义 `plist type` 的实现形式，可以理解为值。
- `plist array` --- 类数组集合，参数为 `array`。包含零个或多个  `plist object`。
- `plist dictionary` --- 类地图（关联数组）集合，参数为 `dict` 。包含零个或多个 `plist key`。
- `plist key` --- 包含一个以 `plist key` 名称命名的 `plist object`，参数为 `key`。由 7 位 ASCII 集的可打印字符组成。
- `plist string` --- 7 位 ASCII 集的可打印字符串，参数为 `string`。
- `plist data` --- base64 编码的对象，参数为 `data`。
- `plist date` --- ISO-8601 日期表示法，参数为 `date`，不支持。
- `plist boolean` --- 逻辑声明对象，其值为 true (1) 或 false (0)，参数为 `true` 和 `false`。
- `plist integer` --- 带符号的 10 进制，参数为 `integer`。适用于以二进制补码表示的 64 位无符号整数，除非在特定的 `plist object` 描述中明确提及一个更小的、有或无符号的整数类型。
- `plist real` --- 浮点数，参数为 `real`，不支持。
- `plist multidata` --- 实现将 value 强制转换为 data。 允许传递 `plist string`，此时的结果用空结果字节序列（即 C 字符串）表示；允许传递 `plist integer`，此时的结果用二进制补码形式的 32 位小尾数字节序列表示；允许传递 `plist boolean`， 此时的值为一个字节：`01` 表示 `true`，`00` 表示 `false`；允许传递 `plist data` 本身。其他类型或更大的整数会导致未定义、非预期的行为。
