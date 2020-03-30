---
title: 10. PlatformInfo
description: SMBIOS 机型信息配置
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka、derbalkon 翻译
last_updated: 2020-03-30
---

机型信息由手动生成、填充以与 macOS 服务兼容的几个标识字段组成。配置的基础部分可以从 [`MacInfoPkg`](https://github.com/acidanthera/MacInfoPkg)、一个可以从 [YAML](https://yaml.org/spec/1.2/spec.html) 格式的数据库中生成一组接口的工具包中获得。这些字段将会被写入三个位置：

- [SMBIOS](https://www.dmtf.org/standards/smbios)
- [DataHub](https://github.com/acidanthera/EfiPkg/blob/master/Include/Protocol/DataHub.h)
- NVRAM

大多数字段在 SMBIOS 中指定覆盖，并且这些字段的名称符合 EDK2 [SmBios.h](https://github.com/acidanthera/audk/blob/master/MdePkg/Include/IndustryStandard/SmBios.h) 头文件。但是，在 Data Hub 和 NVRAM 中有几个重要的字段。有些值可以在多个字段 和/或 目标中找到，因此有两种方法可以控制它们的更新过程：手动指定所有值（默认方法）；半自动。

可以使用 [dmidecode](http://www.nongnu.org/dmidecode) 工具来检查 SMBIOS 内容。你可以从 [Acidanthera/dmidecode](https://github.com/acidanthera/dmidecode/releases) 下载 Acidanthera 制作的增强版。

## 10.1 Properties

### 1. `Automatic`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 基于 `Generic` 属性而不是 `DataHub`、`NVRAM` 和 `SMBIOS` 属性生成机型信息。

当 `Generic` 属性足够灵活的时候，这一选项将会变得非常有用。启用这一选项后，`DataHub`、`NVRAM` 和 `SMBIOS` 的数据不会再被使用。

### 2. `UpdateDataHub`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新 Data Hub 字段。根据 `Automatic` 的值，这些字段会从 `Generic` 或 `DataHub` 中读取。

### 3. `UpdateNVRAM`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 是否更新 NVRAM 中关于机型信息的相关字段。

根据 `Automatic` 的值，这些字段会从 `Generic` 或 `PlatformNVRAM` 中读取。所有其他字段都将在 ` NVRAM` 部分中指定。

如果将此值设置为 `false`，则可以使用 `nvram` 部分更新上述变量；反之若将此值设置为 `true`，而同时 `nvram` 部分存在任何字段，会产生意料之外的行为。

### 4. `UpdateSMBIOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 更新 SMBIOS 字段。根据 `Automatic` 的值，这些字段会从 `Generic` 或 `SMBIOS` 中读取。

### 5. `UpdateSMBIOSMode`

**Type**: `plist string`
**Failsafe**: `Create`
**Description**: 更新 SMBIOS 字段的方式有：

- `TryOverwrite` --- 如果新的数据大小 小于等于 按页对齐的原始数据，且对解锁 legacy region 没有影响，则选择 `Overwrite` 方式；否则选择 `Create` 方式。在某些硬件上可能会有问题。 
- `Create` --- 在 AllocateMaxAddress 将表替换为新分配的 EfiReservedMemoryType，没有回退机制。
- `Overwrite` --- 如果数据大小合适则覆盖现有的 gEfiSmbiosTableGuid 和 gEfiSmbiosTable3Guid，否则将以不明状态中止。
- `Custom` --- 把第一个 SMBIOS 表（`gEfiSmbiosTableGuid`）写入 `gOcCustomSmbiosTableGuid`，以此来解决固件在 ExitBootServices 覆盖 SMBIOS 内容的问题；否则等同于 `Create`。需要 AppleSmbios.kext 和 AppleACPIPlatform.kext 打补丁来读取另一个 GUID: `"EB9D2D31"` - `"EB9D2D35"` (in ASCII)， 这一步由 `CustomSMBIOSGuid` quirk 自动完成。

### 6. `Generic`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `false` 时可不填
**Description**: 更新所有字段。当 `Automatic` 激活时此处为只读。

### 7. `DataHub`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 更新 Data Hub 字段。当 `Automatic` 未激活时此处为只读。

### 8. `PlatformNVRAM`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 更新 platform NVRAM 字段。当 `Automatic` 未激活时此处为只读。

### 9. `SMBIOS`

**Type**: `plist dictonary`
**Optional**: `Automatic` 为 `true` 时可不填
**Description**: 更新 SMBIOS 字段。当 `Automatic` 未激活时此处为只读。


## 10.2 Generic Properties

### 1. `SpoofVendor`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 SMBIOS 中的 vendor 字段设置为 `Acidanthera`。

由于在 `SystemManufacturer` 相关介绍中介绍的原因，在 SMBIOS 的 vendor 字段中使用 `Apple` 是危险的。但是，某些固件可能无法提供有效值，可能会导致某些软件的破坏。

### 2. `AdviseWindows`
**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 在 `FirmwareFeatures` 中强制提供 Windows 支持。

向 `FirmwareFeatures` 中添加如下比特：

- `FW_FEATURE_SUPPORTS_CSM_LEGACY_MODE` (`0x1`) - 如果没有此比特，且 EFI 分区不是硬盘中的第一个分区，那么则无法重新启动到硬盘里的 Windows 系统。
- `FW_FEATURE_SUPPORTS_UEFI_WINDOWS_BOOT` (`0x20000000`) - 如果没有此比特，且 EFI 分区是硬盘中的第一个分区，那么则无法重新启动到硬盘里的 Windows 系统。

### 3. `SystemProductName`

**Type**: `plist string`
**Failsafe**: `MacPro6,1`
**Description**: 请参考下文 SMBIOS 章节中的 `SystemProductName`。

### 4. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: `OPENCORE_SN1`
**Description**: 请参考下文 SMBIOS 章节中的 `SystemSerialNumber`。

### 5. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: OEM specified
**Description**: 请参考下文 SMBIOS 章节中的 `SystemUUID`。

### 6. `MLB`

**Type**: `plist string`
**Failsafe**: `OPENCORE_MLB_SN11`
**Description**: 请参考下文 SMBIOS 章节中的 `BoardSerialNumber`。

### 7. `ROM`

**Type**: `plist data`, 6 bytes
**Failsafe**: all zero
**Description**: 参考 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`。


## 10.3 DataHub Properties

### 1. `PlatformName`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `name`。在 Mac 上找到的值为 ASCII 码形式的 `platform`。

### 2. `SystemProductName`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `Model`。在 Mac 上找到的值等于 Unicode 形式的 SMBIOS `SystemProductName`。

### 3. `SystemSerialNumber`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `SystemSerialNumber`。在 Mac 上找到的值等于 Unicode 形式的 SMBIOS `SystemSerialNumber`。

### 4. `SystemUUID`
**Type**: `plist string`, GUID
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `system-id`。在 Mac 上找到的值等于 SMBIOS `SystemUUID`。

### 5. `BoardProduct`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `board-id`。在 Mac 上找到的值等于 ASCII 码形式的 SMBIOS `BoardProduct`。

### 6. `BoardRevision`
**Type**: `plist data`, 1 byte
**Failsafe**: `0`
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `board-rev`。在 Mac 上找到的值似乎与 internal board revision 相对应（e.g. `01`）。

### 7. `StartupPowerEvents`
**Type**: `plist integer`, 64-bit
**Failsafe**: `0`
**Description**: 在 `gEfiMiscSubClassGuid Sets` 中设置 `StartupPowerEvents`。在 Mac 上找到的值是 power management state 位掩码，通常为 0。`X86PlatformPlugin.kext` 能读取的已知 bit 有：

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
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `InitialTSC`。设置初始 TSC 值，通常为 0。

### 9. `FSBFrequency`
**Type**: `plist integer`, 64-bit
**Failsafe**: Automatic
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `FSBFrequency`。

设置 CPU FSB 频率。此值等于 CPU 主频除以最高总线比率，以 Hz 为单位。请参考 `MSR_NEHALEM_PLATFORM_INFO`(`CEh`) MSR 值来确定 Intel CPU 的最高总线比率。

*注*：此值虽然不是用于 Skylake 或更新的平台，但也可设置。

### 10. `ARTFrequency`
**Type**: `plist integer`, 64-bit
**Failsafe**: Automatic
**Description**: 在 `gEfiProcessorSubClassGuid` 中设置 `ARTFrequency`。

此值包含 CPU ART 频率，即晶体时钟频率。为 Skylake 或更新的平台独有，以 Hz 为单位。Client Intel segment 通常为 24 MHz，Server Intel segment 通常为 25 MHz，Intel Atom CPUs 通常为 19.2 MHz。macOS 10.15 及以下均默认为 24 MHz。

*注*：由于 Intel Skylake X 平台特有 EMI-reduction 电路，其 ART 频率可能会比 24 或 25 MHz 有所损失（大约 0.25%）。参考 [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker/issues/448#issuecomment-524914166)。

### 11. `DevicePathsSupported`
**Type**: `plist integer`, 32-bit
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `DevicePathsSupported`。必须设置为 `1` 才能确保 AppleACPIPlatform.kext 将 SATA 设备路径添加到 `Boot####` 和 `efi-boot-device-data` 变量。所有新款 Mac 都设置为 `1`。

### 12. `SmcRevision`
**Type**: `plist data`, 6 bytes
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `REV`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `REV` key。

### 13. `SmcBranch`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `RBr`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `RBr` key。

### 14. `SmcPlatform`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: 在 `gEfiMiscSubClassGuid` 中设置 `RPlt`。自定义属性由 `VirtualSMC` 或 `FakeSMC` 读取，用于生成 SMC `RPlt` key。


## 10.4 PlatformNVRAM Properties

### 1. `BID`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`。

### 2. `ROM`
**Type**: `plist data`, 6 bytes
**Failsafe**: Not installed
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM` 和 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`。

### 3. `MLB`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: 指定 NVRAM 变量 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB` 和 `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`。

### 4. `FirmwareFeatures`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: 此变量与 `FirmwareFeaturesMask` 配对使用。指定 NVRAM 变量：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`

### 5. `FirmwareFeaturesMask`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: 此变量与 `FirmwareFeatures` 配对使用。指定 NVRAM 变量：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`


## 10.5 SMBIOS Properties

### 1. `BIOSVendor`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: BIOS Information (Type 0) --- Vendor
**Description**: BIOS 供应商。`SystemManufacturer` 的所有规则都适用。

### 2. `BIOSVersion`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: BIOS Information (Type 0) --- BIOS Version
**Description**: 固件版本。此值更新时会同时影响更新推送配置文件以及 macOS 版本的兼容性。在较旧的固件中看起来类似于 `MM71.88Z.0234.B00.1809171422`，并且在 [BiosId.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/Guid/BiosId.h) 中有所描述。在较新的固件中看起来类似于 `236.0.0.0.0` 或 `220.230.16.0.0 (iBridge: 16.16.2542.0.0,0)`。 iBridge 版本是从 `BridgeOSVersion` 变量中读取的，并且只在具有 T2 芯片的 Mac 上有显示。

> ```
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
**Failsafe**: OEM specified
**SMBIOS**: BIOS Information (Type 0) --- BIOS Release Date
**Description**: 固件发布日期。与 `BIOSVersion` 类似，看起来像是 `12/08/2017` 这种格式。

### 4. `SystemManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Manufacturer
**Description**: 特定主板的 OEM 制造商。除非特别需要，否则最好不要设定，也不要包含 `Apple Inc.` 字样，这样做会混淆操作系统中的大量服务，例如固件更新、eficheck 以及 Acidanthera 开发的内核扩展（如 Lilu 及其插件）。此外还可能导致某些操作系统（如 Linux）无法引导。

### 5. `SystemProductName`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1), Product Name
**Description**: 选择偏好的 Mac 机型来把设备标记为系统支持的机型。在任何配置中都应指定该值，以便之后自动生成 SMBIOS 表的相关值和相关配置参数。如果 `SystemProductName` 与目标操作系统不兼容，可用引导参数 `-no_compat_check` 来覆盖。

*注*：如果 `SystemProductName` 位置，并且相关字段也未指定，默认值会被设定为 `MacPro6,1`。目前已知产品的列表详见 `MacInfoPkg`。

### 6. `SystemVersion`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Version
**Description**: 产品迭代版本号。可能与 `1.1` 类似。

### 7. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Serial Number
**Description**: 按照格式定义的产品序列号。已知的序列号的格式在 [macserial](https://github.com/acidanthera/MacInfoPkg/blob/master/macserial/FORMAT.md) 中。

### 8. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- UUID
**Description**: UUID 被设计为在时间和空间上都是唯一的标识符，其生成是随机与去中心化的。

### 9. `SystemSKUNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- SKU Number
**Description**: Mac 主板 ID (`board-id`)。在旧型号的机器中看起来类似于 `Mac-7BA5B2D9E42DDD94` 或 `Mac-F221BEC8`。有时可以直接留空。

### 10. `SystemFamily`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Family
**Description**: 系列名称，看起来类似于 `iMac Pro`。

### 11. `BoardManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Manufacturer
**Description**: 主板制造商。`SystemManufacturer` 的所有规则都适用。

### 12. `BoardProduct`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Product
**Description**: Mac 主板 ID (`board-id`)。在旧型号机器中看起来类似于 `Mac-7BA5B2D9E42DDD94` 或 `Mac-F221BEC8`。

### 13. `BoardVersion`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Version
**Description**: 主板版本号。有各种各样，可能与 `SystemProductName` 或 `SystemProductVersion` 匹配。

### 14. `BoardSerialNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Serial Number
**Description**: 主板序列号，有对应的格式，具体格式见 [macserial](https://github.com/acidanthera/MacInfoPkg/blob/master/macserial/FORMAT.md) 的描述。

### 15. `BoardAssetTag`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Asset Tag
**Description**: 资产标签号。有各种各样，可以留空或填 `Type2 - Board Asset Tag`。

### 16. `BoardType`
**Type**: `plist integer`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Board Type
**Description**:  `0xA` (Motherboard (includes processor, memory, and I/O) 或 `0xB` (Processor/Memory Module)，详见 Table 15 -- Baseboard: Board Type for more details。

### 17. `BoardLocationInChassis`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Location in Chassis
**Description**: 各种各样，可以留空或填 `Part Component`。

### 18. `ChassisManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Manufacturer
**Description**: 主板制造商。`SystemManufacturer` 的所有规则都适用。

### 19. `ChassisType`
**Type**: `plist integer`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Type
**Description**: 机箱类型，详见 Table 17 --- System Enclosure or Chassis Types。

### 20. `ChassisVersion`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: 应和 `BoardProduct` 符合。

### 21. `ChassisSerialNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: 应和 `SystemSerialNumber` 符合。

### 22. `ChassisAssetTag`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Asset Tag Number
**Description**: 机箱类型名称。有各种各样，可以留空或填 `MacBook-Aluminum`。

### 23. `PlatformFeature`
**Type**: `plist integer`, 32-bit
**Failsafe**: `0xFFFFFFFF`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE133` - `PlatformFeature`
**Description**: 平台功能位掩码，详见 [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)。填写 `0xFFFFFFFF` 值时不提供此表。

### 24. `SmcVersion`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE134` - `Version`
**Description**: ASCII 字符串，包含 SMC 版本号（大写）。在基于 T2 芯片的 Mac 设备上缺少这一字段。当此值设置为零时，这一选项会被忽略。

### 25. `FirmwareFeatures`
**Type**: `plist data`, 8 bytes
**Failsafe**: `0`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeatures` and `ExtendedFirmwareFeatures`
**Description**: 64 位固件功能位掩码。详见 [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)。低 32 位与 `FirmwareFeatures` 匹配，高 64 位与 `ExtendedFirmwareFeatures` 匹配。

### 26.`FirmwareFeaturesMask`
**Type**: `plist data`, 8 bytes
**Failsafe**: `0`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeaturesMask` and `ExtendedFirmwareFeaturesMask`
**Description**: 扩展固件功能位掩码。详见 [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)。低 32 位与 `FirmwareFeatures` 匹配，高 64 位与 `ExtendedFirmwareFeatures` 匹配。

### 27. `ProcessorType`

**Type**: `plist integer`, 16-bit
**Failsafe**: Automatic
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE131` - `ProcessorType`
**Description**: 由处理器的主要和次要类型组成。

### 28. `MemoryFormFactor`

**Type**: `plist integer`, 8-bit
**Failsafe**: OEM specified
**SMBIOS**: Memory Device (Type 17) --- Form Factor
**Description**: Memory Form Factor。在 Mac 上应为 DIMM 或 SODIMM。
