---
title: 10. PlatformInfo
description: SMBIOS 机型信息配置（待翻译）
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka 翻译
last_updated: 2020-03-12
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
**Description**: Update SMBIOS fields approach:

- `TryOverwrite` --- `Overwrite` if new size is <= than the page-aligned original and there are no issues with legacy region unlock. `Create` otherwise. Has issues with some firmwares.
- `Create` --- Replace the tables with newly allocated EfiReservedMemoryType at AllocateMaxAddress without any fallbacks.
- `Overwrite` --- Overwrite existing gEfiSmbiosTableGuid and gEfiSmbiosTable3Guid data if it fits new size. Abort with unspecified state otherwise.
- `Custom` --- Write first SMBIOS table (`gEfiSmbiosTableGuid`) to `gOcCustomSmbiosTableGuid` to workaround firmwares overwriting SMBIOS contents at ExitBootServices. Otherwise equivalent to `Create`. Requires patching AppleSmbios.kext and AppleACPIPlatform.kext to read from another GUID: `"EB9D2D31"` - `"EB9D2D35"` (in ASCII), done automatically by `CustomSMBIOSGuid` quirk.

### 6. `Generic`

**Type**: `plist dictonary`
**Optional**: When `Automatic` is `false`
**Description**: Update all fields. This section is read only when `Automatic` is active.

### 7. `DataHub`

**Type**: `plist dictonary`
**Optional**: When `Automatic` is `true`
**Description**: Update Data Hub fields. This section is read only when `Automatic` is not active.

### 8. `PlatformNVRAM`

**Type**: `plist dictonary`
**Optional**: When `Automatic` is `true`
**Description**: Update platform NVRAM fields. This section is read only when `Automatic` is not active.

### 9. `SMBIOS`

**Type**: `plist dictonary`
**Optional**: When `Automatic` is `true`
**Description**: Update SMBIOS fields. This section is read only when `Automatic` is not active.


## 10.2 Generic Properties

### 1. `SpoofVendor`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 将 SMBIOS 中的 vendor 字段设置为 `Acidanthera`.

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
**Description**: 请参考下文 SMBIOS 章节中的 中的 `SystemProductName`.

### 4. `SystemSerialNumber`

**Type**: `plist string`
**Failsafe**: `OPENCORE_SN1`
**Description**: 请参考下文 SMBIOS 章节中的 中的 `SystemSerialNumber`.

### 5. `SystemUUID`

**Type**: `plist string`, GUID
**Failsafe**: OEM specified
**Description**: 请参考下文 SMBIOS 章节中的 中的 `SystemUUID`.

### 6. `MLB`

**Type**: `plist string`
**Failsafe**: `OPENCORE_MLB_SN11`
**Description**: 请参考下文 SMBIOS 章节中的 中的 `BoardSerialNumber`.

### 7. `ROM`

**Type**: `plist data`, 6 bytes
**Failsafe**: all zero
**Description**: Refer to `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`.


## 10.3 DataHub Properties

### 1. `PlatformName`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Sets `name` in
`gEfiMiscSubClassGuid`. Value found on Macs is `platform` in ASCII.

### 2. `SystemProductName`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Sets `Model` in `gEfiMiscSubClassGuid`. Value found on Macs is equal to SMBIOS `SystemProductName` in Unicode.

### 3. `SystemSerialNumber`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Sets `SystemSerialNumber` in `gEfiMiscSubClassGuid`. Value found on Macs is equal to SMBIOS `SystemSerialNumber` in Unicode.

### 4. `SystemUUID`
**Type**: `plist string`, GUID
**Failsafe**: Not installed
**Description**: Sets `system-id` in `gEfiMiscSubClassGuid`. Value found on Macs is equal to SMBIOS `SystemUUID`.

### 5. `BoardProduct`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Sets `board-id` in `gEfiMiscSubClassGuid`. Value found on Macs is equal to SMBIOS `BoardProduct` in ASCII.

### 6. `BoardRevision`
**Type**: `plist data`, 1 byte
**Failsafe**: `0`
**Description**: Sets `board-rev` in `gEfiMiscSubClassGuid`. Value found on Macs seems to correspond to internal board revision (e.g. `01`).

### 7. `StartupPowerEvents`
**Type**: `plist integer`, 64-bit
**Failsafe**: `0`
**Description**: Sets `StartupPowerEvents` in `gEfiMiscSubClassGuid`. Value found on Macs is power management state bitmask, normally 0. Known bits read by `X86PlatformPlugin.kext`:

- `0x00000001` --- Shutdown cause was a `PWROK` event (Same as `GEN_PMCON_2` bit 0)
- `0x00000002` --- Shutdown cause was a `SYS_PWROK` event (Same as `GEN_PMCON_2` bit 1)
- `0x00000004` --- Shutdown cause was a `THRMTRIP#`event (Same as `GEN_PMCON_2` bit 3)
- `0x00000008` --- Rebooted due to a SYS_RESET# event (Same as `GEN_PMCON_2` bit 4)
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
**Description**: Sets `InitialTSC` in
`gEfiProcessorSubClassGuid`. Sets initial TSC value, normally 0.

### 9. `FSBFrequency`
**Type**: `plist integer`, 64-bit
**Failsafe**: Automatic
**Description**: Sets `FSBFrequency` in `gEfiProcessorSubClassGuid`.

Sets CPU FSB frequency. This value equals to CPU nominal frequency divided by CPU maximum bus ratio and is specified in Hz. Refer to `MSR_NEHALEM_PLATFORM_INFO`(`CEh`) MSR value to determine maximum bus ratio on modern Intel CPUs.

*注*：This value is not used on Skylake and newer but is still provided to follow suit.

### 10. `ARTFrequency`
**Type**: `plist integer`, 64-bit
**Failsafe**: Automatic
**Description**: Sets `ARTFrequency` in `gEfiProcessorSubClassGuid`.

This value contains CPU ART frequency, also known as crystal clock frequency. Its existence is exclusive to Skylake generation and newer. The value is specified in Hz, and is normally 24 MHz for client Intel segment, 25 MHz for server Intel segment, and 19.2 MHz for Intel Atom CPUs. macOS till 10.15 inclusive assumes 24 MHz by default.

*注*：On Intel Skylake X ART frequency may be a little less (approx. 0.25%) than 24 or 25 MHz due to special EMI-reduction circuit as described in [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker/issues/448#issuecomment-524914166).

### 11. `DevicePathsSupported`
**Type**: `plist integer`, 32-bit
**Failsafe**: Not installed
**Description**: Sets `DevicePathsSupported` in `gEfiMiscSubClassGuid`. Must be set to `1` for AppleACPIPlatform.kext to append SATA device paths to `Boot####` and `efi-boot-device-data` variables. Set to `1` on all modern Macs.

### 12. `SmcRevision`
**Type**: `plist data`, 6 bytes
**Failsafe**: Not installed
**Description**: Sets `REV` in `gEfiMiscSubClassGuid`. Custom property read by `VirtualSMC` or `FakeSMC` to generate SMC `REV` key.

### 13. `SmcBranch`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: Sets `RBr` in
`gEfiMiscSubClassGuid`. Custom property read by `VirtualSMC` or `FakeSMC` to generate SMC `RBr` key.

### 14. `SmcPlatform`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: Sets `RPlt` in `gEfiMiscSubClassGuid`. Custom property read by `VirtualSMC` or `FakeSMC` to generate SMC `RPlt` key.


## 10.4 PlatformNVRAM Properties

### 1. `BID`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Specifies the value of NVRAM variable `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`.

### 2. `ROM`
**Type**: `plist data`, 6 bytes
**Failsafe**: Not installed
**Description**: Specifies the values of NVRAM variables `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM` and `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`.

### 3. `MLB`
**Type**: `plist string`
**Failsafe**: Not installed
**Description**: Specifies the values of NVRAM variables `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB` and `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`.

### 4. `FirmwareFeatures`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: This variable comes in pair with `FirmwareFeaturesMask`.Specifies the values of NVRAM variables:

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`

### 5. `FirmwareFeaturesMask`
**Type**: `plist data`, 8 bytes
**Failsafe**: Not installed
**Description**: This variable comes in pair with `FirmwareFeatures`. Specifies the values of NVRAM variables:

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`
 

## 10.5 SMBIOS Properties

### 1. `BIOSVendor`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: BIOS Information (Type 0) --- Vendor
**Description**: BIOS Vendor. `SystemManufacturer` 的所有规则都适用。

### 2. `BIOSVersion`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: BIOS Information (Type 0) --- BIOS Version
**Description**: Firmware version. This value gets updated and takes part in update delivery configuration and macOS version compatibility. This value could look like `MM71.88Z.0234.B00.1809171422` in older firmwares, and is described in [BiosId.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/Guid/BiosId.h). In newer firmwares it should look like `236.0.0.0.0` or `220.230.16.0.0 (iBridge: 16.16.2542.0.0,0)`. iBridge version is read from `BridgeOSVersion` variable, and is only present on macs with T2.

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
**Description**: Firmware release date. Similar to `BIOSVersion`. May look like `12/08/2017`.

### 4. `SystemManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Manufacturer
**Description**: OEM manufacturer of the particular board. Shall not be specified unless strictly required. Should *not* contain `Apple Inc.`, as this confuses numerous services present in the operating system, such as firmware updates, eficheck, as well as kernel extensions developed in Acidanthera, such as Lilu and its plugins. In addition it will also make some operating systems like Linux unbootable.

### 5. `SystemProductName`

**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1), Product Name
**Description**: Preferred Mac model used to mark the device as supported by the operating system. This value must be specified by any configuration for later automatic generation of the related values in this and other SMBIOS tables and related configuration parameters. If `SystemProductName` is not compatible with the target operating system, `-no_compat_check` boot argument may be used as an override.

*注*：If `SystemProductName` is unknown, and related fields are unspecified, default values should be assumed as being set to `MacPro6,1` data. The list of known products can be found in `MacInfoPkg`.

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
**Description**: UUID 被设计为在时间和空间上都是唯一的标识符。It requires no central registration process.

### 9. `SystemSKUNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- SKU Number
**Description**: Mac Board ID (`board-id`). May look like `Mac-7BA5B2D9E42DDD94` or `Mac-F221BEC8` in older models. Sometimes it can be just empty.

### 10. `SystemFamily`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Information (Type 1) --- Family
**Description**: Family name. May look like `iMac Pro`.

### 11. `BoardManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Manufacturer
**Description**: Board manufacturer. All rules of `SystemManufacturer` do apply.

### 12. `BoardProduct`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Product
**Description**: Mac Board ID (`board-id`). May look like `Mac-7BA5B2D9E42DDD94` or `Mac-F221BEC8` in older models.

### 13. `BoardVersion`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) - Version
**Description**: Board version number. Varies, may match `SystemProductName` or `SystemProductVersion`.

### 14. `BoardSerialNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Serial Number
**Description**: Board serial number in defined format. Known formats are described in [macserial](https://github.com/acidanthera/MacInfoPkg/blob/master/macserial/FORMAT.md).

### 15. `BoardAssetTag`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Asset Tag
**Description**: Asset tag number. Varies, may be empty or `Type2 - Board Asset Tag`.

### 16. `BoardType`
**Type**: `plist integer`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Board Type
**Description**: Either `0xA` (Motherboard (includes processor, memory, and I/O) or `0xB` (Processor/Memory Module), refer to Table 15 -- Baseboard: Board Type for more details.

### 17. `BoardLocationInChassis`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: Baseboard (or Module) Information (Type 2) --- Location in Chassis
**Description**: Varies, may be empty or `Part Component`.

### 18. `ChassisManufacturer`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Manufacturer
**Description**: Board manufacturer. All rules of `SystemManufacturer` do apply.

### 19. `ChassisType`
**Type**: `plist integer`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Type
**Description**: Chassis type, refer to Table 17 --- System Enclosure or Chassis Types for more details.

### 20. `ChassisVersion`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: Should match `BoardProduct`.

### 21. `ChassisSerialNumber`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Version
**Description**: 应和 `SystemSerialNumber` 符合。

### 22. `ChassisAssetTag`
**Type**: `plist string`
**Failsafe**: OEM specified
**SMBIOS**: System Enclosure or Chassis (Type 3) --- Asset Tag Number
**Description**: Chassis type name. Varies, could be empty or `MacBook-Aluminum`.

### 23. `PlatformFeature`
**Type**: `plist integer`, 32-bit
**Failsafe**: `0xFFFFFFFF`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE133` - `PlatformFeature`
**Description**: Platform features bitmask. Refer to [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h) for more details. Use `0xFFFFFFFF` value to not provide this table.

### 24. `SmcVersion`

**Type**: `plist data`, 16 bytes
**Failsafe**: All zero
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE134` - `Version`
**Description**: ASCII 字符串，包含 SMC 版本号（大写）。在基于 T2 芯片的 Mac 设备上缺少这一字段。当此值设置为零时，这一选项会被忽略。

### 25. `FirmwareFeatures`
**Type**: `plist data`, 8 bytes
**Failsafe**: `0`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeatures` and `ExtendedFirmwareFeatures`
**Description**: 64-bit firmware features bitmask. Refer to [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h) for more details. Lower 32 bits match `FirmwareFeatures`. Upper 64 bits match `ExtendedFirmwareFeatures`.

### 26.`FirmwareFeaturesMask`
**Type**: `plist data`, 8 bytes
**Failsafe**: `0`
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE128` - `FirmwareFeaturesMask` and `ExtendedFirmwareFeaturesMask`
**Description**: Supported bits of extended firmware features bitmask. Refer to [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h) for more details. Lower 32 bits match `FirmwareFeaturesMask`. Upper 64 bits match `ExtendedFirmwareFeaturesMask`.

### 27. `ProcessorType`

**Type**: `plist integer`, 16-bit
**Failsafe**: Automatic
**SMBIOS**: `APPLE_SMBIOS_TABLE_TYPE131` - `ProcessorType`
**Description**: Combined of Processor Major and Minor types.

### 28. `MemoryFormFactor`

**Type**: `plist integer`, 8-bit
**Failsafe**: OEM specified
**SMBIOS**: Memory Device (Type 17) --- Form Factor
**Description**: Memory form factor. On Macs it should be DIMM or SODIMM.
