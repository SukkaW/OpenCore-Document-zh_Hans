---
title: 2. 配置
description: Introduction（待翻译）
type: docs
author_info: 由 Sukka 整理
---

## 2.1 配置术语

- `OC config` --- OpenCore Configuration file in plist format named config.plist. It has to provide extensible way to configure OpenCore and is structured to be separated into multiple named sections situated in the root plist dictionary. These sections are permitted to have plist array or plist dictionary types and are described in corresponding sections of this document.
- `valid key` --- plist key object of OC config described in this document or its future revisions. Besides explicitly described valid keys, keys starting with # symbol (e.g. #Hello) are also considered valid keys and behave as comments, effectively discarding their value, which is still required to be a valid plist object. All other plist keys are not valid, and their presence yields to undefined behaviour.
- `valid value` --- valid plist object of OC config described in this document that matches all the additional requirements in specific plist object description if any.
- `invalid value` --- valid plist object of OC config described in this document that is of other plist type, does not conform to additional requirements found in specific plist object description (e.g. value range), or missing from the corresponding collection. Invalid value is read with or without an error message as any possible value of this plist object in an undetermined manner (i.e. the values may not be same across the reboots). Whilst reading an invalid value is equivalent to reading certain defined valid value, applying incompatible value to the host system may yield to undefined behaviour.
- `optional value` --- valid value of OC config described in this document that reads in a certain defined manner provided in specific plist object description (instead of invalid value) when not present in OC config. All other cases of invalid value do still apply. Unless explicitly marked as optional value, any other value is required to be present and reads to invalid value if missing.
- `fatal behaviour` --- behaviour leading to boot termination. Implementation must stop the boot process from going any further until next host system boot. It is allowed but not required to perform cold reboot or show any warning message.
- `undefined behaviour` --- behaviour not prescribed by this document. Implementation is allowed to take any measures including but not limited to fatal behaviour, assuming any states or values, or ignoring, unless these measures negatively affect system security in general.

## 2.2 配置处理

OC config is guaranteed to be processed at least once if it was found. Depending on OpenCore bootstrapping mechanism multiple OC config files may lead to reading any of them. No OC Config may be present on disk, in which case all the values read follow the rules of invalid value and optional value.

OC config has size, nesting, and key amount limitations. OC config size does not exceed 16 MBs. OC config has no more than 8 nesting levels. OC config has up to 16384 XML nodes (i.e. one plist dictionary item is counted as a pair of nodes) within each plist object. Reading malformed OC config file leads to undefined behaviour. Examples of malformed OC config cover at least the following cases:

- files non-conformant to plist DTD
- files with unsupported or non-conformant plist objects found in this document
- files violating size, nesting, and key amount limitations

It is recommended but not required to abort loading malformed OC config and continue as if no OC config was present. For forward compatibility it is recommended but not required for the implementation to warn about the use of invalid values. Recommended practice of interpreting invalid values is to conform to the following convention where applicable:

| Type | Value |
|:---|:---|
| plist string | Empty string (`<string></string>`) |
| plist data | Empty data (`<data></data>`) |
| plist integer | 0 (`<integer>0</integer>`) |
| plist boolean | False (`<false/>`) |
| plist tristate | False (`<false/>`) |

## 2.3 配置结构

OC config is separated into following sections, which are described in separate sections of this document. By default it is tried to not enable anything and optionally provide kill switches with Enable property for plist dict entries. In general the configuration is written idiomatically to group similar actions in subsections:

- Add provides support for data addition.
- Block provides support for data removal or ignorance.
- Patch provides support for data modification.
- Quirks provides support for specific hacks.

Root configuration entries consist of the following:

- ACPI
- Booter
- DeviceProperties
- Kernel
- Misc
- NVRAM
- PlatformInfo
- UEFI

> Note: Currently most properties try to have defined values even if not specified in the configuration for safety reasons. This behaviour should not be relied upon, and all fields must be properly specified in the configuration.
