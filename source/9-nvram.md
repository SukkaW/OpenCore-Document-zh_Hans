---
title: 9. NVRAM
description: NVRAM 注入（如引导标识符和 SIP）（待翻译）
type: docs
author_info: 由 xMuu 整理
---

## 9.1 Introduction

Has `plist dict` type and allows to set volatile UEFI variables commonly referred as NVRAM variables. Refer to `man nvram` for more details. macOS extensively uses NVRAM variables for OS --- Bootloader --- Firmware intercommunication, and thus supplying several NVRAM is required for proper macOS functioning.

Each NVRAM variable consists of its name, value, attributes (refer to UEFI specification), and its [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier), representing which `section' NVRAM variable belongs to. macOS uses several GUIDs, including but not limited to:

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14` (`APPLE_VENDOR_VARIABLE_GUID`)
- `7C436110-AB2A-4BBB-A880-FE41995C9F82` (`APPLE_BOOT_VARIABLE_GUID`)
- `8BE4DF61-93CA-11D2-AA0D-00E098032B8C` (`EFI_GLOBAL_VARIABLE_GUID`)
- `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` (`OC_VENDOR_VARIABLE_GUID`)


*注*：Some of the variables may be added by [PlatformNVRAM]() or [Generic]() subsections of [PlatformInfo]() section. Please ensure that variables of this section never collide with them, as behaviour is undefined otherwise.

For proper macOS functioning it is often required to use `OC_FIRMWARE_RUNTIME` protocol implementation currently offered as a part of `FwRuntimeServices` driver. While it brings any benefits, there are certain limitations which arise depending on the use.


- Not all tools may be aware of protected namespaces. When `RequestBootVarRouting` is used `Boot`-prefixed variable access is restricted and protected in a separate namespace. To access the original variables tools have to be aware of `OC_FIRMWARE_RUNTIME` logic.
- Assigned NVRAM variables are not always allowed to exceed 512 bytes. This is true for `Boot`-prefixed variables when `RequestBootVarFallback` is used, and for overwriting volatile variables with non-volatile on UEFI 2.8 non-conformant firmwares.


## 9.2 Properties

### 1. `Add`
 **Type**: `plist dict`
 **Description**: Sets NVRAM variables from a map (`plist dict`) of GUIDs to a map (`plist dict`) of variable names and their values in `plist metadata` format. GUIDs must be provided in canonic string format in upper or lower case (e.g. `8BE4DF61-93CA-11D2-AA0D-00E098032B8C`).

 Created variables get `EFI_VARIABLE_BOOTSERVICE_ACCESS` and `EFI_VARIABLE_RUNTIME_ACCESS` attributes set. Variables will only be set if not present and not blocked. To overwrite a variable add it to `Block` section. This approach enables to provide default values till the operating system takes the lead.

 *注*：If `plist key` does not conform to GUID format, behaviour is undefined.

### 2. `Block`
 **Type**: `plist dict`
 **Description**: Removes NVRAM variables from a map (`plist dict`) of GUIDs to an array (`plist array`) of variable names in `plist string` format.

### 3. `LegacyEnable`
 **Type**: `plist boolean`
 **Failsafe**: `false`
 **Description**: Enables loading of NVRAM variable file named `nvram.plist` from EFI volume root.

 This file must have root `plist dictionary` type and contain two fields:

  - `Version` --- `plist integer`, file version, must be set to 1.
  - `Add` --- `plist dictionary`, equivalent to `Add` from `config.plist`.
 
 Variable loading happens prior to `Block` (and `Add`) phases. Unless `LegacyOverwrite` is enabled, it will not overwrite any existing variable. Variables allowed to be set must be specified in `LegacySchema`. Third-party scripts may be used to create `nvram.plist` file. An example of such script can be found in `Utilities`. The use of third-party scripts may require `ExposeSensitiveData` set to `0x3` to provide `boot-path` variable with OpenCore EFI partition UUID.

 **WARNING**: This feature is very dangerous as it passes unprotected data to your firmware variable services. Use it only when no hardware NVRAM implementation is provided by the firmware or it is incompatible.

### 4. `LegacyOverwrite`
 **Type**: `plist boolean`
 **Failsafe**: `false`
 **Description**: Permits overwriting firmware variables from `nvram.plist`.

 *注*：Only variables accessible from the operating system will be overwritten.

### 5. `LegacySchema`
 **Type**: `plist dict`
 **Description**: Allows setting select NVRAM variables from a map (`plist dict`) of GUIDs to an array (`plist array`) of variable names in `plist string` format.

 You can use `*` value to accept all variables for select GUID.

 **WARNING**: Choose variables very carefully, as nvram.plist is not vaulted. For instance, do not put `boot-args` or `csr-active-config`, as this can bypass SIP.

### 6. `WriteFlash`
 **Type**: `plist boolean`
 **Failsafe**: `false`
 **Description**: Enables writing to flash memory for all added variables.

 *注*：This value is recommended to be enabled on most firmwares, but is left configurable for firmwares that may have issues with NVRAM variable storage garbage collection or alike.



To read NVRAM variable value from macOS one could use `nvram` by concatenating variable GUID and name separated by `:` symbol. For example, `nvram 7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args`.

A continuously updated variable list can be found in a corresponding document: [NVRAM Variables](https://docs.google.com/spreadsheets/d/1HTCBwfOBkXsHiK7os3b2CUc6k68axdJYdGl-TyXqLu0).

## 9.3 Mandatory Variables

*Warning*: These variables may be added by [PlatformNVRAM]() or [Generic]() subsections of [PlatformInfo]() section. Using `PlatformInfo` is the recommend way of setting these variables.

The following variables are mandatory for macOS functioning:

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
 32-bit `FirmwareFeatures`. Present on all Macs to avoid extra parsing of SMBIOS tables
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
 32-bit `FirmwareFeaturesMask`. Present on all Macs to avoid extra parsing of SMBIOS tables.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`
 `BoardSerialNumber`. Present on newer Macs (2013+ at least) to avoid extra parsing of SMBIOS tables, especially in boot.efi.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`
 Primary network adapter MAC address or replacement value. Present on newer Macs (2013+ at least) to avoid accessing special memory region, especially in boot.efi.


## 9.4 Recommended Variables

The following variables are recommended for faster startup or other improvements:

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:csr-active-config`
 32-bit System Integrity Protection bitmask. Declared in XNU source code in [csr.h](https://opensource.apple.com/source/xnu/xnu-4570.71.2/bsd/sys/csr.h.auto.html).
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`
 Combined `FirmwareFeatures` and `ExtendedFirmwareFeatures`. Present on newer Macs to avoid extra parsing of SMBIOS tables
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`
 Combined `FirmwareFeaturesMask` and `ExtendedFirmwareFeaturesMask`. Present on newer Macs to avoid extra parsing of SMBIOS tables.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`
 Hardware `BoardProduct` (e.g. `Mac-35C1E88140C3E6CF`). Not present on real Macs, but used to avoid extra parsing of SMBIOS tables, especially in boot.efi.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB`
 Hardware `BoardSerialNumber`. Override for MLB. Present on newer Macs (2013+ at least).
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM`
 Hardware ROM. Override for ROM. Present on newer Macs (2013+ at least).
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:prev-lang:kbd`
 ASCII string defining default keyboard layout. Format is `lang-COUNTRY:keyboard`, e.g. `ru-RU:252` for Russian locale and ABC keyboard. Also accepts short forms: `ru:252` or `ru:0` (U.S. keyboard, compatible with 10.9). Full decoded keyboard list from `AppleKeyboardLayouts-L.dat` can be found [here](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/AppleKeyboardLayouts). Using non-latin keyboard on 10.14 will not enable ABC keyboard, unlike previous and subsequent macOS versions, and is thus not recommended in case you need 10.14.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:security-mode`
 ASCII string defining FireWire security mode. Legacy, can be found in IOFireWireFamily source code in [IOFireWireController.cpp](https://opensource.apple.com/source/IOFireWireFamily/IOFireWireFamily-473/IOFireWireFamily.kmodproj/IOFireWireController.cpp.auto.html). It is recommended not to set this variable, which may speedup system startup. Setting to `full` is equivalent to not setting the variable and `none` disables FireWire security.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:UIScale`
 One-byte data defining boot.efi user interface scaling. Should be **01** for normal screens and **02** for HiDPI screens.


## 9.5 Other Variables

The following variables may be useful for certain configurations or troubleshooting:

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args`
 Kernel arguments, used to pass configuration to Apple kernel and drivers. There are many arguments, which may be found by looking for the use of `PE_parse_boot_argn` function in the kernel or driver code. Some of the known boot arguments include:

  - `acpi_layer=0xFFFFFFFF`
  - `acpi_level=0xFFFF5F` (implies [`ACPI_ALL_COMPONENTS`](https://github.com/acpica/acpica/blob/master/source/include/acoutput.h)) 
  - `batman=VALUE` (`AppleSmartBatteryManager` debug mask)
  - `batman-nosmc=1` (disable `AppleSmartBatteryManager` SMC interface)
  - `cpus=VALUE` (maximum number of CPUs used)
  - `debug=VALUE` (debug mask)
  - `io=VALUE` (`IOKit` debug mask)
  - `keepsyms=1` (show panic log debug symbols)
  - `kextlog=VALUE` (kernel extension loading debug mask)
  - `nv_disable=1` (disables NVIDIA GPU acceleration)
  - `nvda_drv=1` (legacy way to enable NVIDIA web driver, removed in 10.12)
  - `npci=0x2000` ([legacy](https://www.insanelymac.com/forum/topic/260539-1068-officially-released/?do=findComment&comment=1707972), disables `kIOPCIConfiguratorPFM64`)
  - `lapic_dont_panic=1`
  - `slide=VALUE` (manually set KASLR slide)
  - `smcdebug=VALUE` (`AppleSMC` debug mask)
  - `-amd_no_dgpu_accel` (alternative to [WhateverGreen](https://github.com/acidanthera/WhateverGreen)'s `-radvesa` for new GPUs)
  - `-nehalem_error_disable`
  - `-no_compat_check` (disable model checking)
  - `-s` (single mode)
  - `-v` (verbose mode)
  - `-x` (safe mode)
 
 There are multiple external places summarising macOS argument lists: [example 1](https://osxeon.wordpress.com/2015/08/10/boot-argument-options-in-os-x), [example 2](https://superuser.com/questions/255176/is-there-a-list-of-available-boot-args-for-darwin-os-x).

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg`
 Booter arguments, similar to `boot-args` but for boot.efi. Accepts a set of arguments, which are hexadecimal 64-bit values with or without 0x prefix primarily for logging control:
 
  - `log=VALUE`
 
  - `1` --- AppleLoggingConOutOrErrSet/AppleLoggingConOutOrErrPrint (classical ConOut/StdErr)
  - `2` --- AppleLoggingStdErrSet/AppleLoggingStdErrPrint (StdErr or serial?)
  - `4` --- AppleLoggingFileSet/AppleLoggingFilePrint (BOOTER.LOG/BOOTER.OLD file on EFI partition)
 
  - `debug=VALUE`
 
  - `1` --- enables print something to BOOTER.LOG (stripped code implies there may be a crash)
  - `2` --- enables perf logging to /efi/debug-log in the device three
  - `4` --- enables timestamp printing for styled printf calls
 
  - `level=VALUE` --- Verbosity level of DEBUG output. Everything but `0x80000000` is stripped from the binary, and this is the default value.
  - `kc-read-size=VALUE` --- Chunk size used for buffered I/O from network or disk for prelinkedkernel reading and related. Set to 1MB (0x100000) by default, can be tuned for faster booting.
 
 *注*：To quickly see verbose output from `boot.efi` set this to `log=1` (currently this is broken in 10.15).
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg-once`
 Booter arguments override removed after first launch. Otherwise equivalent to `bootercfg`.
 -  `7C436110-AB2A-4BBB-A880-FE41995C9F82:fmm-computer-name`
 Current saved host name. ASCII string.
 -  `7C436110-AB2A-4BBB-A880-FE41995C9F82:nvda_drv`
 NVIDIA Web Driver control variable. Takes ASCII digit `1` or `0` to enable or disable installed driver.