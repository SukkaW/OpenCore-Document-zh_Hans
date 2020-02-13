---
title: 2. 配置
description: Introduction（待翻译）
type: docs
author_info: 由 Sukka 整理，由 Sukka 翻译
---

## 2.1 配置术语

- `OC config` --- OpenCore 的配置文件，格式为 plist，文件名为 `config.plist`。OpenCore 的配置文件具有可扩展性，并被设计为具有多个命名空间的结构。每个命名空间下允许具有 plist array 或 plist dictionary，在本文档相应部分中对其进行了描述
- `valid key` --- 现在以及未来本文档中描述的 OC Config 中的 plist key object。除了明确描述的 valid keys 以外，以 `#` 符号开头的 key（如 `#Hello`）也将被视为 valid key，并被表示为注释。虽然表示为注释的值会被丢弃，但是它们仍然是 valid key。其他的 plist key 都是无效、不合法的，它们的存在可能会导致未定义、非预期的行为。
- `valid value` --- valid plist object of OC config described in this document that matches all the additional requirements in specific plist object description if any.
- `invalid value` --- valid plist object of OC config described in this document that is of other plist type, does not conform to additional requirements found in specific plist object description (e.g. value range), or missing from the corresponding collection. Invalid value is read with or without an error message as any possible value of this plist object in an undetermined manner (i.e. the values may not be same across the reboots). Whilst reading an invalid value is equivalent to reading certain defined valid value, applying incompatible value to the host system may yield to undefined behaviour.
- `optional value` --- valid value of OC config described in this document that reads in a certain defined manner provided in specific plist object description (instead of invalid value) when not present in OC config. All other cases of invalid value do still apply. Unless explicitly marked as optional value, any other value is required to be present and reads to invalid value if missing.
- `fatal behaviour` --- behaviour leading to boot termination. Implementation must stop the boot process from going any further until next host system boot. It is allowed but not required to perform cold reboot or show any warning message.
- `undefined behaviour` --- behaviour not prescribed by this document. Implementation is allowed to take any measures including but not limited to fatal behaviour, assuming any states or values, or ignoring, unless these measures negatively affect system security in general.

## 2.2 配置处理

如果 OpenCore 发现了 OC Config，则至少会被读取并处理一次。跟你局 OpenCore 的引导机制的不同，对于多个 OC Config 文件，OpenCore 可能会读取其中任何一个或数个。如果硬盘中没有 OC Config，OpenCore 将会使用可选值和无效值的规则。

OC Config 有大小、嵌套、键数量的限制。OC Config 的大小不得超过 16 MB，嵌套层数不得超过 8 层，没个 plist object 中最多有 16384 个节点（一个 plist dictionary 将被计为一对节点）。不符合上述规则的 OC Config 文件将可能导致未定义、非预期的行为。常见的 OC Config 错误格式包括

- 不符合 plist DTD
- 存在本文档中没有记载的 plist object
- 违反文件大小、嵌套层级和密钥数量的限制

我们建议（但非强制）遇到格式错误的 OC Config 时不停止加载、然后继续进行就好像 OC Config 不存在一样。为了是先前向兼容性，建议（但非强制）要求实现对采用无效值的行为进行警告。采用无效值的建议做法是在使用的情况下遵守以下规则：

| Type | Value |
|:---|:---|
| plist string | Empty string (`<string></string>`) |
| plist data | Empty data (`<data></data>`) |
| plist integer | 0 (`<integer>0</integer>`) |
| plist boolean | False (`<false/>`) |
| plist tristate | False (`<false/>`) |

## 2.3 配置结构

OC Config 包括以下几个独立部分，将在本文档中分别进行介绍。默认情况下配置文件将尽可能不启用任何功能以及禁用某些功能。总的来说，这些配置的一般由如下的操作构成：

- Add：为数据提供 添加 操作支持
- Block：为数据提供 删除/忽视 操作支持
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

> 译者注：对上述部分的介绍位于文档的第 4 至 11 章节。你可以在本网站左侧边栏中的目录中找到这些章节的入口。

**注意**：出于安全原因，目前大多数属性都有默认值（译者注：后续文档中以 `FailSafe` 字段呈现）。如果在配置项中未指定任何值，默认值将会生效。你不应该依赖默认值的功能，必须在配置中正确指定所有字段。