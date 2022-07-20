---
title: 10. PlatformInfo
description: SMBIOS 机型信息配置
type: docs
author_info: 由 xMuu、Sukka、derbalkon、cike-567 整理，由 Sukka、derbalkon、cike-567 翻译
last_updated: 2022-07-20
---

机型信息由手动生成或填充的字段组成，以便与 macOS 服务兼容。配置的基础部分可以从 [`AppleModels`](https://github.com/acidanthera/OpenCorePkg/blob/master/AppleModels) 获得，这是一个可以从 [YAML](https://yaml.org/spec/1.2.2/) 格式的数据库中生成一组接口的工具包。这些字段将会被写入三个位置：

- [SMBIOS](https://www.dmtf.org/standards/smbios)
- [DataHub](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Intel/Protocol/DataHub.h)
- NVRAM

大多数字段会在 SMBIOS 中指定覆盖内容，字段的名称符合 EDK2 [SmBios.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/IndustryStandard/SmBios.h) 头文件。但是，有些重要的字段会驻留在 Data Hub 和 NVRAM 中。有些值可以在多个字段 和/或 目标中找到，因此有两种方法可以控制它们的更新过程：手动指定所有值（默认方法）；半自动，仅（自动地）指定所选值用于之后的系统配置。

可以使用 [dmidecode](http://www.nongnu.org/dmidecode) 工具来检查 SMBIOS 内容。你可以从 [Acidanthera/dmidecode](https://github.com/acidanthera/dmidecode/releases) 下载 Acidanthera 制作的增强版。

## 10.1 属性列表

### 1. `Automatic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 基于 `Generic` 属性而不是 `DataHub`、`NVRAM` 和 `SMBIOS` 属性生成机型信息。

考虑到 `Generic` 部分的数据十分灵活，启用这个选项会很有用：

- 当启用这个选项时，`SMBIOS`、`DataHub` 和 `PlatformNVRAM` 中的数据将不会被使用。
- 当禁用这个选项时，`Generic` 部分的数据将不会被使用。

{% note danger 警告 %}
强烈不建议把此项设置为 `false`。只有在需要对 SMBIOS 进行小规模修正的情况下，才有理由不使用 `Automatic`，否则可能会导致 debug 困难。
{% endnote %}

### 2. `CustomMemory`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 使用在 `Memory` 部分所填写的自定义内存配置。该选项将完全取代 SMBIOS 中任何现有的内存配置，只有当 `UpdateSMBIOS` 设置为 `true` 时才生效。

### 3. `UpdateDataHub`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新 Data Hub 字段。根据 `Automatic` 的值，这些字段会从 `Generic` 或 `DataHub` 中读取。

*注*：几乎所有系统（包括 Apple 硬件）的 EFI 固件都实施了 Data Hub 协议，这意味着现有的 Data Hub 条目不能被覆盖。新条目会被添加到 Data Hub 的末尾，而 macOS 会忽略旧条目。这可以通过使用 `ProtocolOverrides` 部分替换 Data Hub 协议来解决。详情请参考 DataHub 协议的 `override` 描述。


### 4. `UpdateNVRAM`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否更新 NVRAM 中关于机型信息的相关字段。

根据 `Automatic` 的值，这些字段会从 `Generic` 或 `PlatformNVRAM` 中读取。所有其他字段都将在 `NVRAM` 部分中指定。

如果将此值设置为 `false`，则可以使用 `nvram` 部分更新上述变量；反之若将此值设置为 `true`，而同时 `nvram` 部分存在任何字段，会产生未定义行为。

### 5. `UpdateSMBIOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新 SMBIOS 字段。根据 `Automatic` 的值，这些字段会从 `Generic` 或 `SMBIOS` 中读取。

### 6. `UpdateSMBIOSMode`

**Type**: `plist string`
**Failsafe**: `Create`
**Description**: 更新 SMBIOS 字段的方式有：

- `TryOverwrite` --- 如果新的数据大小 小于等于 按页对齐的原始数据，且对解锁 legacy region 没有影响，则选择 `Overwrite` 方式；否则选择 `Create` 方式。在某些硬件上可能会有问题。
- `Create` --- 在 AllocateMaxAddress 将表替换为新分配的 EfiReservedMemoryType，没有回退机制。
- `Overwrite` --- 如果数据大小合适则覆盖现有的 gEfiSmbiosTableGuid 和 gEfiSmbiosTable3Guid，否则将以不明状态中止。
- `Custom` --- 把第一个 SMBIOS 表（`gEfiSmbios(3)TableGuid`）写入 `gOcCustomSmbios(3)TableGuid`，以此来解决固件在 ExitBootServices 覆盖 SMBIOS 内容的问题；否则等同于 `Create`。需要 AppleSmbios.kext 和 AppleACPIPlatform.kext 打补丁来读取另一个 GUID: `"EB9D2D31"` - `"EB9D2D35"` (in ASCII)， 这一步由 `CustomSMBIOSGuid` Quirk 自动完成。

*注*： 使用 `Custom` 有一个副作用（译者注：我怎么感觉是好事）使得 SMBIOS 设置只对 macOS 生效，避免了与现有的 Windows 激活和依赖机型的 OEM 设置的相关问题。不过，苹果在 Windows 下的特定工具（译者注：如 BootCamp for Windows）可能会受到影响。

### 7. `UseRawUuidEncoding`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 对 SMBIOS 的 UUID 使用原始编码。

基本上每个 UUID `AABBCCDD-EEFF-GGHH-IIJJ-KKLLMMNNOOPP` 都是 16 字节的十六进制数字，编码方式有两种：

- `Big Endian` --- 按原样书写所有字节，顺序不作任何变化（`{AA BB CC DD EE FF GG HH II JJ KK LL MM NN OO PP}`）。这种方法也被称为 [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122) 编码，或 `Raw` 编码。
- `Little Endian` --- 将字节解释为数字，并使用小字节序（Little Endian）编码格式（`{DD CC BB AA FF EE HH GG II JJ KK LL MM NN OO PP}`）。

SMBIOS 规范没有明确规定 UUID 的编码格式，直到 SMBIOS 2.6 才说明应使用 `Little Endian` 编码，这就导致了固件实现和系统软件的双重混乱，因为在此之前不同的厂商使用不同的编码格式。
- Apple 普遍使用 `Big Endian` 编码格式，唯一例外的是 macOS 的 SMBIOS UUID。
- `dmidecode` 对 SMBIOS 2.5.x 或更低的版本使用 `Big Endian` 编码格式。对 2.6 或更高的版本使用 `Little Endian` 编码格式。这三种格式 Acidanthera [dmidecode](https://github.com/acidanthera/dmidecode) 均可打印。
- Windows 普遍使用 `Little Endian` 编码格式，但它只影响数值的观感。

OpenCore 在生成修改过的 DMI 表时，总是设置最新的 SMBIOS 版本（目前是 3.2）。如果启用了 `UseRawUuidEncoding`，则使用 `Big Endian` 编码格式来存储 `SystemUUID` 数据，否则使用 `Little Endian` 编码格式。

*注*：由于 DataHub 和 NVRAM 中使用的 UUID 是由 Apple 添加的，未经过标准化，所以这个选项并不会影响它们。与 SMBIOS 不同，它们总是以 `Big Endian` 编码格式存储。

### 8. `Generic`

**Type**: `plist dictonary`
**Description**: 在 `Automatic` 模式下更新所有字段。

*注*：当 `Automatic` 为 `false` 时将自动忽略此部分，但不可将此部分删除。

### 9. `DataHub`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 在非 `Automatic` 模式下更新 Data Hub 字段。

*注*：当 `Automatic` 为 `true` 时将自动忽略此部分，此部分也可以删除。

### 10. `Memory`

**Type**: `plist dictionary`
**Optional**: When `CustomMemory` is `false`
**Description**: 用于设置自定义的内存配置。

*注*：当 `CustomMemory` 为 `false` 时将自动忽略此部分，此部分也可以删除。

### 11. `PlatformNVRAM`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 在非 `Automatic` 模式下更新 platform NVRAM 字段。

*注*：当 `Automatic` 为 `true` 时将自动忽略此部分，此部分也可以删除。

### 12. `SMBIOS`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 在非 `Automatic` 模式下更新 SMBIOS 字段。

*注*：当 `Automatic` 为 `true` 时将自动忽略此部分，此部分也可以删除。

## 10.2 Generic 属性

### 1. `SpoofVendor`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 SMBIOS 中的 Vendor 字段设置为 `Acidanthera`。

由于在 `SystemManufacturer` 中阐述的原因，在 SMBIOS 的 Vendor 字段中使用 `Apple` 是危险的。但是，某些固件可能无法提供有效值，可能会导致某些软件的破坏。

### 2. `AdviseFeatures`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 用支持的 bit 更新 `FirmwareFeatures`

向 `FirmwareFeatures` 中添加如下 bit：

- `FW_FEATURE_SUPPORTS_CSM_LEGACY_MODE` (`0x1`) - 如果没有此 bit，且 EFI 分区不是硬盘中的第一个分区，那么则无法重新启动到硬盘里的 Windows 系统。
- `FW_FEATURE_SUPPORTS_UEFI_WINDOWS_BOOT` (`0x20000000`) - 如果没有此 bit，且 EFI 分区是硬盘中的第一个分区，那么则无法重新启动到硬盘里的 Windows 系统。
- `FW_FEATURE_SUPPORTS_APFS` (`0x00080000`) - 如果没有此 bit，就不可能在 APFS 磁盘上安装 macOS。
- `FW_FEATURE_SUPPORTS_LARGE_BASESYSTEM` (`0x800000000`) - 如果没有此 bit，就无法安装large BaseSystem 镜像的 macOS，例如 macOS 12。

*注*：在大多数较新的固件上，这些 bit 已经设置好，当 "升级" 新固件时，可能需要该选项。

### 3. `MaxBIOSVersion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 `BIOSVersion` 设置为 `9999.999.999.999.999`，建议使用 `Automatic` 选项的旧款 Mac 这样设置, 在运行非官方支持的 macOS 版本时可避免 BIOS 升级。

### 4. `SystemMemoryStatus`

**Type**: `plist string`
**Failsafe**: `Auto`
**Description**: 用来表示内存是否可以更换和升级，此值也控制着「关于本机」中「内存」选项卡的可见性。

有效值如下：

- `Auto` --- 使用原始的 `PlatformFeature` 值。
- `Upgradable` --- 在 `PlatformFeature` 中明确取消设置 `PT_FEATURE_HAS_SOLDERED_SYSTEM_MEMORY (0x2)`。
- `Soldered` --- 在 `PlatformFeature` 中明确设置的 `PT_FEATURE_HAS_SOLDERED_SYSTEM_MEMORY (0x2)`。

*注*：在某些型号的 Mac 上，SPMemoryReporter.spreporter 会自动忽略 `PT_FEATURE_HAS_SOLDERED_SYSTEM_MEMORY`，并认为其内存是不可升级的，如 `MacBookPro10,x` 和所有的 `MacBookAir`。

### 5. `ProcessorType`

**Type**: `plist integer`
**Failsafe**: `0` (Automatic)
**Description**: 请参考下文 SMBIOS 章节中的 `ProcessorType`。

### 6. `SystemProductName`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified or not installed）
**Description**: 请参考下文 SMBIOS 章节中的 `SystemProductName`。

### 7. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified or not installed）
**Description**: 请参考下文 SMBIOS 章节中的 `SystemSerialNumber`。

指定特殊字符串值 OEM，以从 NVRAM（SSN 变量）或 SMBIOS 中提取当前值，并在各节中使用它。贯穿各部分。这个功能只能在与 Mac 兼容的固件上使用。

### 8. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: Empty（OEM specified or not installed）
**Description**: 请参考下文 SMBIOS 章节中的 `SystemUUID`。

指定特殊的字符串值 OEM，从 NVRAM（system-id 变量）或 SMBIOS 中提取当前值，并在各节中使用。并在整个章节中使用它。由于不是每个固件实现都有有效的（和唯一的）值，这个功能不适用于某些设置。由于不是每个固件实现都有有效的（和唯一的）值，所以这个功能不适用于某些设置，并且可能提供意想不到的结果。我们强烈建议明确指定 UUID。请参考 UseRawUuidEncoding 来决定如何解析 SMBIOS 值。

### 9. `MLB`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified or not installed）
**Description**: 请参考下文 SMBIOS 章节中的 `BoardSerialNumber`。

指定特殊字符串值 OEM，以从 NVRAM（MLB 变量）或 SMBIOS 中提取当前值，并在各节中使用它。贯穿各部分。这个功能只能在与 Mac 兼容的固件上使用。

### 10. `ROM`

**Type**: `plist data`, 6 bytes
**Failsafe**: Empty（OEM specified or not installed）
**Description**: 参考 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`。

指定特殊字符串值 OEM，以从 NVRAM（ROM 变量）或 SMBIOS 中提取当前值，并在各节中使用它。贯穿各部分。这个功能只能在与 Mac 兼容的固件上使用。

## 10.3 DataHub 属性

### 1. `PlatformName`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `name`。在 Mac 上找到的值为 ASCII 码形式的 `platform`。

### 2. `SystemProductName`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `Model`。在 Mac 上找到的值等于 Unicode 形式的 SMBIOS `SystemProductName`。

### 3. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `SystemSerialNumber`。在 Mac 上找到的值等于 Unicode 形式的 SMBIOS `SystemSerialNumber`。

### 4. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `system-id`。在 Mac 上找到的值等于 SMBIOS `SystemUUID`（字节顺序调换）。

### 5. `BoardProduct`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `board-id`。在 Mac 上找到的值等于 ASCII 码形式的 SMBIOS `BoardProduct`。

### 6. `BoardRevision`

**Type**: `plist data`, 1 byte
**Failsafe**: `0`
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `board-rev`。在 Mac 上找到的值似乎与 Internal Board Revision 相对应（例如 `01`）。

### 7. `StartupPowerEvents`

**Type**: `plist integer`, 64-bit
**Failsafe**: `0`
**Description**: 在 `gEfiMiscSubClassGuid Sets` 中设置 `StartupPowerEvents`。在 Mac 上找到的值是 Power Management State 位掩码，通常为 0。

`X86PlatformPlugin.kext` 能读取的已知 bit 有：
- `0x00000001` --- Shutdown cause was a `PWROK` event (Same as `GEN_PMCON_2` bit 0)
- `0x00000002` --- Shutdown cause was a `SYS_PWROK` event (Same as `GEN_PMCON_2` bit 1)
- `0x00000004` --- Shutdown cause was a `THRMTRIP#`event (Same as `GEN_PMCON_2` bit 3)
- `0x00000008` --- Rebooted due to a `SYS_RESET#` event (Same as `GEN_PMCON_2` bit 4)
- `0x00000010` --- Power Failure (Same as `GEN_PMCON_3` bit 1 `PWR_FLR`)
- `0x00000020` --- Loss of RTC Well Power (Same as `GEN_PMCON_3` bit 2 `RTC_PWR_STS`)
- `0x00000040` --- General Reset Status (Same as `GEN_PMCON_3` bit 9 `GEN_RST_STS`)
- `0xffffff80` --- SUS Well Power Loss (Same as `GEN_PMCON_3` bit 14)
- `0x00010000` --- Wake cause was a ME Wake event (Same as PRSTS bit 0, `ME_WAKE_STS`)
- `0x00020000` --- Cold Reboot was ME Induced event (Same as `PRSTS` bit 1 `ME_HRST_COLD_STS`)
- `0x00040000` --- Warm Reboot was ME Induced event (Same as `PRSTS` bit 2 `ME_HRST_WARM_STS`)
- `0x00080000` --- Shutdown was ME Induced event (Same as `PRSTS` bit 3 `ME_HOST_PWRDN`)
- `0x00100000` --- Global reset ME Wachdog Timer event (Same as `PRSTS` bit 6)
- `0x00200000` --- Global reset PowerManagment Wachdog Timer event (Same as `PRSTS` bit 15)

### 8. `InitialTSC`

**Type**: `plist integer`, 64-bit
**Failsafe**: `0`
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `InitialTSC`。设置初始 TSC 值，通常为 `0`。

### 9. `FSBFrequency`

**Type**: `plist integer`, 64-bit
**Failsafe**: `0` (Automatic)
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `FSBFrequency`。

设置 CPU FSB 频率。此值等于 CPU 主频除以最高总线比率，以 Hz 为单位。请参考 `MSR_NEHALEM_PLATFORM_INFO(CEh) MSR` 值来确定 Intel CPU 的最高总线比率。

*注*：此值虽然不是用于 Skylake 或更新的平台，但也可设置。

### 10. `ARTFrequency`

**Type**: `plist integer`, 64-bit
**Failsafe**: `0` (Automatic)
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `ARTFrequency`。

此值包含 CPU ART 频率，即晶体时钟频率。为 Skylake 或更新的平台独有，以 `Hz` 为单位。Client Intel segment 通常为 `24MHz`，Server Intel segment 通常为 `25MHz`，Intel Atom CPUs 通常为 `19.2MHz`。macOS 10.15 及以下均默认为 `24MHz`。

*注*：由于 Intel Skylake X 平台特有 EMI-reduction 电路，其 ART 频率可能会比 `24` 或 `25MHz` 有所损失（大约 0.25%）。参考 [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker/issues/448#issuecomment-524914166)。

### 11. `DevicePathsSupported`

**Type**: `plist integer`, 32-bit
**Failsafe**: `0`（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `DevicePathsSupported`。必须设置为 `1` 才能确保 AppleACPIPlatform.kext 将 SATA 设备路径添加到 `Boot####` 和 `efi-boot-device-data` 变量。所有新款 Mac 都设置为 `1`。

### 12. `SmcRevision`

**Type**: `plist data`, 6 bytes
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `REV`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `REV` key。

### 13. `SmcBranch`

**Type**: `plist data`, 8 bytes
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `RBr`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `RBr` key。

### 14. `SmcPlatform`

**Type**: `plist data`, 8 bytes
**Failsafe**: Empty（Not installed）
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `RPlt`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `RPlt` key。

## 10.4 Memory 属性

### 1. `DataWidth`

**Type**: `plist integer`, 16-bit
**Failsafe**: `0xFFFF` (unknown)
**SMBIOS**: Memory Device (Type 17) — Data Width
**Description**: 指定内存的数据宽度，以位为单位。`DataWidth` 为 `0` 且 `TotalWidth` 为 `8` 时，表示改设备仅用于提供 `8` 个纠错位。

### 2. `Devices`

**Type**: `plist array`
**Failsafe**: Empty
**Description**: 指定要添加的自定义内存设备。

用 `plist dictionary` 来描述每个内存设备，具体参见下面的 Memory Devices 属性部分。这里应该填写所有的内存插槽，包括没有插内存的插槽。

### 3. `ErrorCorrection`

**Type**: `plist integer`, 8-bit
**Failsafe**: `0x03`
**SMBIOS**: Physical Memory Array (Type 16) — Memory Error Correction
**Description**: 指定内存支持的主要硬件纠错或检测方法。

- `0x01` — Other
- `0x02` — Unknown
- `0x03` — None
- `0x04` — Parity
- `0x05` — Single-bit ECC
- `0x06` — Multi-bit ECC
- `0x07` — CRC

### 4. FormFactor

**Type**: `plist integer`, 8-bit
**Failsafe**: `0x02`
**SMBIOS**: Memory Device (Type 17) — Form Factor
**Description**: 指定内存的规格。在 Mac 上通常是 DIMM 或 SODIMM。下面列举的是一些常见的规格。

当 `CustomMemory` 设置为 `false` 时，该值会根据所设置的 Mac 机型自动设置。

当 `Automatic` 为 `true` 时，如果有的话，设置相应的 Mac 模型的初始值。否则，设置 OcMacInfoLib 的值。当 `Automatic` 为 `false` 时，设置用户指定的值（如果有）。否则，设置固件的初始值。如果没有提供，将设置 Failsafe 的值。

- `0x01` — Other
- `0x02` — Unknown
- `0x09` — DIMM
- `0x0D` — SODIMM
- `0x0F` — FB-DIMM

### 5. `MaxCapacity`

**Type**: `plist integer`, 64-bit
**Failsafe**: `0`
**SMBIOS**: Physical Memory Array (Type 16) — Maximum Capacity
**Description**: 指定系统支持的最大内存量，以字节为单位。

### 6. `TotalWidth`

**Type**: `plist integer`, 16-bit
**Failsafe**: `0xFFFF` (unknown)
**SMBIOS**: Memory Device (Type 17) — Total Width
**Description**: 指定内存的总宽度，以位为单位，包括任何检查或纠错位。如果没有纠错位，则这个值应该等于 `DataWidth`。

### 7. `Type`

**Type**: `plist integer`, 8-bit
**Failsafe**: `0x02`
**SMBIOS**: Memory Device (Type 17) — Memory Type
**Description**: 指定内存类型。常用的类型如下：

- `0x01` — Other
- `0x02` — Unknown
- `0x0F` — SDRAM
- `0x12` — DDR
- `0x13` — DDR2
- `0x14` — DDR2 FB-DIMM
- `0x18` — DDR3
- `0x1A` — DDR4
- `0x1B` — LPDDR
- `0x1C` — LPDDR2
- `0x1D` — LPDDR3
- `0x1E` — LPDDR4

### 8. `TypeDetail`

**Type**: `plist integer`, 16-bit
**Failsafe**: `0x4`
**SMBIOS**: Memory Device (Type 17) — Type Detail
**Description**: 指定附加的内存类型信息。

- `Bit 0` — Reserved, set to 0
- `Bit 1` — Other
- `Bit 2` — Unknown
- `Bit 7` — Synchronous
- `Bit 13` — Registered (buffered)
- `Bit 14` — Unbuffered (unregistered)

## 10.4.1 Memory Device 属性

### 1. `AssetTag`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Asset Tag
**Description**: 指定该内存的资产标签。

### 2. `BankLocator`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Bank Locator
**Description**: 指定内存设备所在的物理标签库。

### 3. `DeviceLocator`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Device Locator
**Description**: 指定内存设备所在的物理标签插槽或主板上的位置。

### 4. `Manufacturer`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Manufacturer
**Description**: 指定该内存设备的制造商。

对于空插槽，必须设置为 `NO DIMM`，以便 macOS 系统分析器正确显示某些 Mac 型号上的内存插槽。某些 Mac 型号（例如MacPro7,1）对内存布局提出了额外要求。
  - 安装的内存的数量必须是以下之一。`4`, `6`, `8`, `10`, `12`。使用其他的值都会在系统分析器中引起错误。
  - 内存插槽的数量必须等于 `12`。使用其他的值都会在系统分析器中引起错误。
  - 内存必须安装在对应的内存插槽中，这在[支持页面](https://support.apple.com/zh-cn/HT210103)上有说明。SMBIOS 内存设备被映射到以下插槽：`8`、`7`、`10`、`9`、`12`、`11`、`5`、`6`、`3`、`4`、`1`、`2`。

### 5. `PartNumber`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Part Number
**Description**: 指定该内存设备的部件号。

### 6. `SerialNumber`

**Type**: `plist string`
**Failsafe**: `Unknown`
**SMBIOS**: Memory Device (Type 17) — Serial Number
**Description**: 指定该内存设备的序列号。

### 7. `Size`

**Type**: `plist integer`, 32-bit
**Failsafe**: `0`
**SMBIOS**: Memory Device (Type 17) — Size
**Description**: 指定内存设备的大小，以兆字节为单位。`0` 表示该插槽未插入内存。

### 8. `Speed`

**Type**: `plist integer`, 16-bit
**Failsafe**: `0`
**SMBIOS**: Memory Device (Type 17) — Speed
**Description**: 指定设备的最大速度，单位为每秒百万传输量（MT/s）。`0` 表示未知速度。

## 10.5 PlatformNVRAM 属性

### 1. `BID`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`。

### 2. `ROM`

**Type**: `plist data`, 6 bytes
**Failsafe**: Empty（Not installed）
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM` 和 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`。

### 3. `MLB`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB` 和 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`。

### 4. `FirmwareFeatures`

**Type**: `plist data`, 8 bytes
**Failsafe**: Empty（Not installed）
**Description**: 此变量与 `FirmwareFeaturesMask` 配对使用。指定 NVRAM 变量：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`

### 5. `FirmwareFeaturesMask`

**Type**: `plist data`, 8 bytes
**Failsafe**: Empty（Not installed）
**Description**: 此变量与 `FirmwareFeatures` 配对使用。指定 NVRAM 变量：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`

### 6. `SystemUUID`

**Type**: `plist string`
**Failsafe**: Empty（Not installed）
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:system-id` 的值，仅用于启动服务。在 Mac 上找到的值等于 SMBIOS `SystemUUID`。

## 10.6 SMBIOS 属性

### 1. `BIOSVendor`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: BIOS Information (Type 0) --- Vendor
**Description**: BIOS 供应商。`SystemManufacturer` 的所有规则都适用。

### 2. `BIOSVersion`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: BIOS Information (Type 0) --- BIOS Version
**Description**: 固件版本。此值更新时会同时影响更新推送配置文件以及 macOS 版本的兼容性。在较旧的固件中看起来类似于 `MM71.88Z.0234.B00.1809171422`，并且在 [BiosId.h](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Guid/BiosId.h) 中有所描述。在较新的固件中看起来类似于 `236.0.0.0.0` 或 `220.230.16.0.0 (iBridge: 16.16.2542.0.0,0)`。 iBridge 版本是从 `BridgeOSVersion` 变量中读取的，并且只在具有 T2 芯片的 Mac 上有显示。

> ```bash
> Apple ROM Version
>  BIOS ID:      MBP151.88Z.F000.B00.1811142212
>  Model:        MBP151
>  EFI Version:  220.230.16.0.0
>  Built by:     root@quinoa
>  Date:         Wed Nov 14 22:12:53 2018
>  Revision:     220.230.16 (B&I)
>  ROM Version:  F000_B00
>  Build Type:   Official Build, RELEASE
>  Compiler:     Apple LLVM version 10.0.0 (clang-1000.2.42)
>  UUID:         E5D1475B-29FF-32BA-8552-682622BA42E1
>  UUID:         151B0907-10F9-3271-87CD-4BF5DBECACF5
> ```

### 3. `BIOSReleaseDate`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: BIOS Information (Type 0) --- BIOS Release Date
**Description**: 固件发布日期。与 `BIOSVersion` 类似，看起来像是 `12/08/2017` 这种格式。

### 4. `SystemManufacturer`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- Manufacturer
**Description**: 特定主板的 OEM 制造商。除非特别需要，否则最好不要设定，也不要包含 `Apple Inc.` 字样，这样做会混淆操作系统中的大量服务，例如固件更新、eficheck 以及 Acidanthera 开发的内核扩展（如 Lilu 及其插件）。此外还可能导致某些操作系统（如 Linux）无法引导。

### 5. `SystemProductName`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- Product Name
**Description**: 用于标记设备为操作系统所支持的首选 Mac 型号。在任何配置中都应指定该值，以便之后自动生成 SMBIOS 表的相关值和相关配置参数。如果 `SystemProductName` 与目标操作系统不兼容，可用引导参数 `-no_compat_check` 来作为替代。

*注*：如果 `SystemProductName` 未知，并且相关字段也未指定，则默认值会被设定为 `MacPro6,1`。目前已知产品的列表详见 `AppleModels`。

### 6. `SystemVersion`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- Version
**Description**: 产品迭代版本号。看起来类似于 `1.1`。

### 7. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- Serial Number
**Description**: 按照格式定义的产品序列号。已知的序列号的格式在 [macserial](https://github.com/acidanthera/OpenCorePkg/blob/master/Utilities/macserial/FORMAT.md) 中可以找到。

### 8. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- UUID
**Description**: UUID 被设计为在时间和空间上都是唯一的标识符，其生成是随机与去中心化的。

### 9. `SystemSKUNumber`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- SKU Number
**Description**: Mac 主板 ID (`board-id`)。在旧型号的机器中看起来类似于 `Mac-7BA5B2D9E42DDD94` 或 `Mac-F221BEC8`。有时它可以留空的。

### 10. `SystemFamily`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Information (Type 1) --- Family
**Description**: 机型名称，看起来类似于 `iMac Pro`。

### 11. `BoardManufacturer`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Manufacturer
**Description**: 主板制造商。`SystemManufacturer` 的所有规则都适用。

### 12. `BoardProduct`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Product
**Description**: Mac 主板 ID (`board-id`)。在旧型号机器中看起来类似于 `Mac-7BA5B2D9E42DDD94` 或 `Mac-F221BEC8`。

### 13. `BoardVersion`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Version
**Description**: 主板版本号。有各种各样，可能与 `SystemProductName` 或 `SystemProductVersion` 匹配。

### 14. `BoardSerialNumber`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Serial Number
**Description**: 主板序列号，有对应的格式，具体格式见 [macserial](https://github.com/acidanthera/OpenCorePkg/blob/master/Utilities/macserial/FORMAT.md) 的描述。

### 15. `BoardAssetTag`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Asset Tag
**Description**: 资产标签号。有各种各样，可以是空的或填 `Type2 - Board Asset Tag`。

### 16. `BoardType`

**Type**: `plist integer`
**Failsafe**: `0` Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Board Type
**Description**:  `0xA` (Motherboard (includes processor, memory, and I/O)) 或 `0xB` (Processor/Memory Module)，详见 Table 15 --- Baseboard: Board Type。

> 译者注：此处提及的 Table 请参见 [DMTF Specifications](https://www.dmtf.org/standards/smbios) 中的相关文档。

### 17. `BoardLocationInChassis`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Location in Chassis
**Description**: 各种各样，可以留空或填 `Part Component`。

### 18. `ChassisManufacturer`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Manufacturer
**Description**: 主板制造商。`SystemManufacturer` 的所有规则都适用。

### 19. `ChassisType`

**Type**: `plist integer`
**Failsafe**: `0` （OEM specified）
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Type
**Description**: 机箱类型，详见 Table 17 --- System Enclosure or Chassis Types。

> 译者注：此处所提及的 Table 请参见 [DMTF Specifications](https://www.dmtf.org/standards/smbios) 中的相关文档。

### 20. `ChassisVersion`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: 应与 `BoardProduct` 匹配。

### 21. `ChassisSerialNumber`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: 应与 `SystemSerialNumber` 匹配。

### 22. `ChassisAssetTag`

**Type**: `plist string`
**Failsafe**: Empty（OEM specified）
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Asset Tag Number
**Description**: 机箱类型名称。有各种各样，可以留空或填 `MacBook-Aluminum`。

### 23. `PlatformFeature`

**Type**: `plist integer`, 32-bit
**Failsafe**: `0xFFFFFFFF`（在苹果硬件上指定的 OEM，否则不提供表）
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE133` - `PlatformFeature`
**Description**: 平台功能位掩码（较旧的 Mac 上缺失该位掩码），详情请参考 [AppleFeatures.h](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/IndustryStandard/AppleFeatures.h)。

### 24. `SmcVersion`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero（在苹果硬件上指定的 OEM，否则不提供表）
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE134` - `Version`
**Description**: ASCII 字符串，包含 SMC 版本号（大写）。配备 Apple T2 安全芯片的 Mac 没有这一字段。

### 25. `FirmwareFeatures`

**Type**: `plist data`, 8 bytes
**Failsafe**: `0`（在苹果硬件上指定的 OEM，否则不提供表，否则为 `0`）
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeatures` and `ExtendedFirmwareFeatures`
**Description**: 64 位固件功能位掩码。详情请参考 [AppleFeatures.h](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/IndustryStandard/AppleFeatures.h)。低 32 位与 `FirmwareFeatures` 匹配，高 64 位与 `ExtendedFirmwareFeatures` 匹配。

### 26.`FirmwareFeaturesMask`

**Type**: `plist data`, 8 bytes
**Failsafe**: `0`（在苹果硬件上指定的 OEM，否则不提供表，否则为 `0`）
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeaturesMask` and `ExtendedFirmwareFeaturesMask`
**Description**: 扩展固件功能位掩码。详情请参考 [AppleFeatures.h](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/IndustryStandard/AppleFeatures.h)。低 32 位与 `FirmwareFeatures` 匹配，高 64 位与 `ExtendedFirmwareFeatures` 匹配。

### 27. `ProcessorType`

**Type**: `plist integer`, 16-bit
**Failsafe**: `0` (Automatic)
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE131` - `ProcessorType`
**Description**: 由处理器的主要和次要类型组成。

自动生成的值（Automatic）是根据当前的 CPU 规格提供的最准确的值，如果有问题请务必到 [bugtracker](https://github.com/acidanthera/bugtracker/issues) 创建一个 Issue，并附上 `sysctl machdep.cpu` 和 [`dmidecode`](https://github.com/acidanthera/dmidecode) 的输出结果。所有可用值及其限制条件（该值只在核心数匹配的情况下才适用）都可以在 Apple SMBIOS 定义 [头文件](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/IndustryStandard/AppleSmBios.h) 里找到。
