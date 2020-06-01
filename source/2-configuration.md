---
title: 2. 配置
description: Configuration
type: docs
author_info: 由 Sukka 整理，由 Sukka、derbalkon 翻译
last_updated: 2020-06-01
---

## 2.1 配置术语

- `OC config` --- OpenCore 的配置文件，格式为 plist，文件名为 `config.plist`。OpenCore 的配置文件具有可扩展性，并被设计为具有多个命名空间的结构。每个命名空间下允许具有 plist array 或 plist dictionary，在本文档相应部分中对其进行了描述
- `valid key` --- OC Config 中的 plist key object。除了明确描述的 valid key 以外，以 `#` 符号开头的值（如 `#Hello`）也将被视为 valid key，并被表示为注释。虽然表示为注释的值会被丢弃，但是它们仍然是 valid key。其他的 plist key 都是无效、不合法的，它们的存在可能会导致未定义、非预期的行为。
- `valid value` --- 有效、合法的 `plist object`，并能匹配一些特定的 `plist object` 描述中所有附加条件（若有）。
- `invalid value` --- 指 `plist object` 本身是有效、合法的，但属于其他 `plist type`、与特定 `plist object` 描述中附加条件不符（例如 value range）或者在对应集合中缺如。`invalid value` 会被不确定的方式读取为这个 `plist obejct` 的任何可能值（即，重启前后的值可能会不同），可能报错也可能不报错。尽管读取 `invalid value` 相当于读取某些已定义的 `valid value`，但是将不兼容的值应用于主机系统可能会产生未定义、非预期的行为。
- `optional value` --- 可缺少，或以特定 `plist object` 描述提供的特定方式（区别于 `invalid value`）读取的有效值。而其他情况下（译者注：未提供读取方式）的 `invalid value` 仍然会被应用。value 除非被明确标记为 `optional value`，否则必须存在，如果缺少则会被读取为 `invalid value`。
- `fatal behaviour` --- 导致引导终止的行为。对 `fatal behaviour` 的实现，要求必须停止引导过程，直到下一次主机系统引导为止。允许，但不强制要求执行冷重启或显示任何警告消息。
- `undefined behaviour` --- 本文档中未定义的行为，通常是因为某一选项的特定配置、或某些值被忽略导致的。在这种情况下，其实现可能会采取包括 `fatal behaviour`，而这些行为一般都会对系统安全性产生负面影响。

> 译者注：以上术语的相关描述仅限于本文档所指的 OC Config。

## 2.2 配置处理

如果 OpenCore 发现了 OC Config，则至少会读取并处理一次。根据 OpenCore 的引导机制的不同，如果存在多个 OC Config 文件，OpenCore 可能会读取其中任何一个或数个。如果硬盘中没有 OC Config，OpenCore 将会使用可选值和无效值的规则。

OC Config 有大小、嵌套和键值数量的限制。OC Config 的大小不得超过 16 MB，嵌套层数不得超过 8 层，每个 plist object 中最多有 16384 个节点（一个 plist dictionary 将被计为一对节点）。不符合上述规则的 OC Config 文件将可能导致未定义、非预期的行为。常见的 OC Config 错误格式包括：

- 不符合 plist DTD
- 存在本文档中没有记载的 plist object
- 违反文件大小、嵌套层级和键值数量的限制

我们建议（但非强制）遇到格式错误的 OC Config 时不停止加载、然后继续进行就好像 OC Config 不存在一样。为了是先前向兼容性，建议（但非强制）要求实现对采用无效值的行为进行警告。采用无效值的建议做法是在使用的情况下遵守以下规则：

| Type | Value |
|:---|:---|
| plist string | Empty string (`<string></string>`) |
| plist data | Empty data (`<data></data>`) |
| plist integer | 0 (`<integer>0</integer>`) |
| plist boolean | False (`<false/>`) |
| plist tristate | False (`<false/>`) |

## 2.3 配置结构

OC Config 包括以下几个独立部分，将在本文档中分别进行介绍。默认情况下配置文件将尽可能不启用任何功能以及禁用某些功能。总的来说，这些配置一般由如下的操作构成：

- Add：为数据提供 添加 操作支持。已经存在的值不会被覆盖，必要时请使用 Delete。
- Delete：为数据提供 删除 操作支持
- Patch：为数据提供 补丁 操作支持
- Quirks：提供特定的黑科技支持

配置文件分为以下几个独立部分：

- ACPI
- Booter
- DeviceProperties
- Kernel
- Misc
- NVRAM
- PlatformInfo
- UEFI

> 译者注：对上述部分的介绍位于文档的第 4 至 11 章节。可以在本网站左侧边栏中的目录中找到这些章节的入口。

你可以使用 `ConfigValidity` 实用工具校验配置文件是否存在语法错误。请注意，`ConfigValidity` 的版本必须和 OpenCore 的版本一致，而且不一定能够检测出所有的错误。

**注意**：为了保险起见，目前大多数属性都有默认值（译者注：后续文档中以 `FailSafe` 字段呈现）。如果在配置项中未指定任何值，默认值将会生效。不要依赖默认值，务必在配置中正确指定所有字段。
