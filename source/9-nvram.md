---
title: 9. NVRAM
description: NVRAM 注入（如引导标识符和 SIP）（待翻译）
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka 翻译
last_updated: 2020-03-14
---

## 9.1 Introduction

设置易失性 UEFI 变量（通常被称作 NVRAM 变量），数据类型为 `plist dict`。使用 `man nvram` 获取详细信息。macOS 广泛使用 NVRAM 变量使 操作系统、BootLoader、固件 之间互通，因此需要提供多个 NVRAM 变量才能正常运行 macOS。

每个 NVRAM 变量均由其名称、值、属性（参考 UEFI 规范）以及 [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 组成，表示 NVRAM 变量属于哪一区域。macOS 使用如下（包括但不限于）几种 GUID：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14` (`APPLE_VENDOR_VARIABLE_GUID`)
- `7C436110-AB2A-4BBB-A880-FE41995C9F82` (`APPLE_BOOT_VARIABLE_GUID`)
- `8BE4DF61-93CA-11D2-AA0D-00E098032B8C` (`EFI_GLOBAL_VARIABLE_GUID`)
- `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` (`OC_VENDOR_VARIABLE_GUID`)

*注*：某些变量可以通过 `PlatformNVRAM` 或 `PlatformInfo` 节的 `Generic` 子节添加。请确保本节中的变量不会与它们发生冲突，否则可能导致未定义的行为。

为了使 macOS 正常运行，通常需要使用 `OC_FIRMWARE_RUNTIME` 协议。该协议的实现目前是 `FwRuntimeServices` 驱动程序的一部分。虽然可能带来一些好处，但根据用途不同也会存在某些限制。

- 并非所有工具都可能知道受保护的名称空间。当使用 `RequestBootVarRouting` 时，在独立的命名空间中会限制对 `Boot` 前缀的变量访问。要访问原始变量，工具必须了解 `OC_FIRMWARE_RUNTIME` 协议的工作原理。
- 分配的 NVRAM 变量并非总是允许超过 512 个字节。当使用 `RequestBootVarFallback` 时，对于带有 `Boot` 前缀的变量，以及不符合 UEFI 2.8 规范的固件上使用非易失性覆盖变量，都存在 512 字节限制。

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
**Description**: 允许从 ESP 分区的根目录中的 `nvram.plist` 文件读取 NVRAM 变量。

This file must have root `plist dictionary` type and contain two fields:

- `Version` --- `plist integer`, file version, must be set to 1.
- `Add` --- `plist dictionary`, equivalent to `Add` from `config.plist`.

Variable loading happens prior to `Block` (and `Add`) phases. Unless `LegacyOverwrite` is enabled, it will not overwrite any existing variable. Variables allowed to be set must be specified in `LegacySchema`. Third-party scripts may be used to create `nvram.plist` file. An example of such script can be found in `Utilities`. The use of third-party scripts may require `ExposeSensitiveData` set to `0x3` to provide `boot-path` variable with OpenCore EFI partition UUID.

**警告**: 这一功能非常危险，因为这将不受保护的数据传递给固件中的变量服务。只有你的硬件不提供硬件 NVRAM 或与之不兼容时才使用。

### 4. `LegacyOverwrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许用 `nvram.plist` 文件中的变量覆盖现有 NVRAM 中的变量。

*注*：只有操作系统访问的到的变量会被覆盖。

### 5. `LegacySchema`

**Type**: `plist dict`
**Description**: Allows setting select NVRAM variables from a map (`plist dict`) of GUIDs to an array (`plist array`) of variable names in `plist string` format.

You can use `*` value to accept all variables for select GUID.

**警告**: Choose variables very carefully, as nvram.plist is not vaulted. For instance, do not put `boot-args` or `csr-active-config`, as this can bypass SIP.

### 6. `WriteFlash`
 **Type**: `plist boolean`
 **Failsafe**: `false`
 **Description**: Enables writing to flash memory for all added variables.

 *注*：This value is recommended to be enabled on most firmwares, but is left configurable for firmwares that may have issues with NVRAM variable storage garbage collection or alike.



To read NVRAM variable value from macOS one could use `nvram` by concatenating variable GUID and name separated by `:` symbol. For example, `nvram 7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args`.

A continuously updated variable list can be found in a corresponding document: [NVRAM Variables](https://docs.google.com/spreadsheets/d/1HTCBwfOBkXsHiK7os3b2CUc6k68axdJYdGl-TyXqLu0).

## 9.3 Mandatory Variables

*警告*: These variables may be added by [PlatformNVRAM]() or [Generic]() subsections of [PlatformInfo]() section. Using `PlatformInfo` is the recommend way of setting these variables.

The following variables are mandatory for macOS functioning:

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
 32-bit `FirmwareFeatures`. Present on all Macs to avoid extra parsing of SMBIOS tables
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
 32-bit `FirmwareFeaturesMask`. Present on all Macs to avoid extra parsing of SMBIOS tables.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`
 `BoardSerialNumber`. Present on newer Macs (2013+ at least) to avoid extra parsing of SMBIOS tables, especially in `boot.efi`.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`
 Primary network adapter MAC address or replacement value. Present on newer Macs (2013+ at least) to avoid accessing special memory region, especially in `boot.efi`.


## 9.4 Recommended Variables

The following variables are recommended for faster startup or other improvements:

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:csr-active-config`
 32-bit System Integrity Protection bitmask. Declared in XNU source code in [csr.h](https://opensource.apple.com/source/xnu/xnu-4570.71.2/bsd/sys/csr.h.auto.html).
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`
 Combined `FirmwareFeatures` and `ExtendedFirmwareFeatures`. Present on newer Macs to avoid extra parsing of SMBIOS tables
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`
 Combined `FirmwareFeaturesMask` and `ExtendedFirmwareFeaturesMask`. Present on newer Macs to avoid extra parsing of SMBIOS tables.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`
 Hardware `BoardProduct` (e.g. `Mac-35C1E88140C3E6CF`). Not present on real Macs, but used to avoid extra parsing of SMBIOS tables, especially in `boot.efi`.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB`
 Hardware `BoardSerialNumber`. Override for MLB. Present on newer Macs (2013+ at least).
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM`
 Hardware ROM. Override for ROM. Present on newer Macs (2013+ at least).
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:prev-lang:kbd`
 ASCII string defining default keyboard layout. Format is `lang-COUNTRY:keyboard`, e.g. `ru-RU:252` for Russian locale and ABC keyboard. Also accepts short forms: `ru:252` or `ru:0` (U.S. keyboard, compatible with 10.9). Full decoded keyboard list from `AppleKeyboardLayouts-L.dat` can be found [here](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/AppleKeyboardLayouts). Using non-latin keyboard on 10.14 will not enable ABC keyboard, unlike previous and subsequent macOS versions, and is thus not recommended in case you need 10.14.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:security-mode`
 ASCII string defining FireWire security mode. Legacy, can be found in IOFireWireFamily source code in [IOFireWireController.cpp](https://opensource.apple.com/source/IOFireWireFamily/IOFireWireFamily-473/IOFireWireFamily.kmodproj/IOFireWireController.cpp.auto.html). It is recommended not to set this variable, which may speedup system startup. Setting to `full` is equivalent to not setting the variable and `none` disables FireWire security.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:UIScale`
 One-byte data defining `boot.efi` user interface scaling. Should be **01** for normal screens and **02** for HiDPI screens.
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:DefaultBackgroundColor` Four-byte `RGBA` data defining `boot.efi` user interface background colour. Standard colours include `BF BF BF 00` (Light Gray) and `00 00 00 00}` (Syrah Black). Other colours may be set at user's preference.


## 9.5 Other Variables

以下变量对于某些特定的配置或进行故障排除可能会很有用：

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args` 内核参数，用于将配置传递给 Apple 内核和驱动程序。很多参数可以通过在内核或驱动程序代码中寻找 `PE_parse_boot_argn` 函数找到。已知的引导参数包括：

  - `acpi_layer=0xFFFFFFFF`
  - `acpi_level=0xFFFF5F` (implies [`ACPI_ALL_COMPONENTS`](https://github.com/acpica/acpica/blob/master/source/include/acoutput.h))
  - `batman=VALUE` --- `AppleSmartBatteryManager` 调试掩码
  - `batman-nosmc=1` --- 禁用 `AppleSmartBatteryManager` SMC 表面
  - `cpus=VALUE` --- 最大可用 CPU 数量
  - `debug=VALUE` --- Debug 掩码
  - `io=VALUE` --- `IOKit` 调试掩码
  - `keepsyms=1` (show panic log debug symbols)
  - `kextlog=VALUE` --- Kext 调试掩码
  - `nv_disable=1` --- 禁用 NVIDIA GPU 加速
  - `nvda_drv=1` --- 启用 NVIDIA web driver 的传统方法，这一参数在 macOS 10.12 中被去除
  - `npci=0x2000` ([legacy](https://www.insanelymac.com/forum/topic/260539-1068-officially-released/?do=findComment&comment=1707972), disables `kIOPCIConfiguratorPFM64`)
  - `lapic_dont_panic=1`
  - `slide=VALUE` --- 手动设置 KASLR 偏移值
  - `smcdebug=VALUE` --- `AppleSMC` 调试掩码
  - `-amd_no_dgpu_accel` (alternative to [WhateverGreen](https://github.com/acidanthera/WhateverGreen)'s `-radvesa` for new GPUs)
  - `-nehalem_error_disable`
  - `-no_compat_check` (disable model checking)
  - `-s` --- 单用户模式
  - `-v` --- 啰嗦模式
  - `-x` --- 安全模式

  这里有一些网站收集了 macOS 内置的启动参数列表：[列表 1](https://osxeon.wordpress.com/2015/08/10/boot-argument-options-in-os-x)、[列表 2](https://superuser.com/questions/255176/is-there-a-list-of-available-boot-args-for-darwin-os-x).

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg`
 Booter arguments, similar to `boot-args` but for `boot.efi`. Accepts a set of arguments, which are hexadecimal 64-bit values with or without `0x`. At
different stages `boot.efi` will request different debugging (logging)
modes (e.g. after `ExitBootServices` it will only print to serial).
Several booter arguments control whether these requests will succeed.
The list of known requests is covered below:

  - `0x00` – `INIT`.
  - `0x01` – `VERBOSE` (e.g. `-v`, force console logging).
  - `0x02` – `EXIT`.
  - `0x03` – `RESET:OK`.
  - `0x04` – `RESET:FAIL` (e.g. unknown `board-id`, hibernate mismatch, panic loop, etc.).
  - `0x05` – `RESET:RECOVERY`.
  - `0x06` – `RECOVERY`.
  - `0x07` – `REAN:START`.
  - `0x08` – `REAN:END`.
  - `0x09` – `DT` (can no longer log to DeviceTree).
  - `0x0A` – `EXITBS:START` (forced serial only).
  - `0x0B` – `EXITBS:END` (forced serial only).
  - `0x0C` – `UNKNOWN`.

In 10.15 debugging support was mostly broken before 10.15.4 due to some kind of refactoring and introduction of a [new debug protocol](https://github.com/acidanthera/EfiPkg/blob/master/Include/Protocol/AppleDebugLog.h). Some of the arguments and their values below may not be valid for
versions prior to 10.15.4. The list of known arguments is covered below:

- `boot-save-log=VALUE` — debug log save mode for normal boot.
  - `0`
  - `1`
  - `2` — (default).
  - `3`
  - `4` — (save to file).
- `wake-save-log=VALUE` — debug log save mode for hibernation wake.
  - `0` — disabled.
  - `1`
  - `2` — (default).
  - `3` — (unavailable).
  - `4` — (save to file, unavailable).
- `breakpoint=VALUE` — enables debug breaks (missing in production
`boot.efi`).
  - `0` — disables debug breaks on errors (default).
  - `1` — enables debug breaks on errors.
- `console=VALUE` — enables console logging.
  - `0` — disables console logging.
  - `1` — enables console logging when debug protocol is missing
(default).
  - `2` — enables console logging unconditionally (unavailable).
- `embed-log-dt=VALUE` — enables DeviceTree logging.
  - `0` — disables DeviceTree logging (default).
  - `1` — enables DeviceTree logging.
- `kc-read-size=VALUE` — Chunk size used for buffered I/O from network
or disk for prelinkedkernel reading and related. Set to 1MB
(0x100000) by default, can be tuned for faster booting.
- `log-level=VALUE` — log level bitmask.
  - `0x01` — enables trace logging (default).
- `serial=VALUE` — enables serial logging.
  - `0` — disables serial logging (default).
  - `1` — enables serial logging for `EXITBS:END` onwards.
  - `1` — enables serial logging for `EXITBS:START` onwards.
  - `3` — enables serial logging when debug protocol is missing.
  - `4` — enables serial logging unconditionally.
- `timestamps=VALUE` — enables timestamp logging.
  - `0` — disables timestamp logging.
  - `1` — enables timestamp logging (default).
- `log=VALUE` — deprecated starting from 10.15.

 *注*：To see verbose output from `boot.efi` on modern macOS versions enable `AppleDebug` option. This will save the log to general OpenCore log. For versions before 10.15.4 set `bootercfg` to `log=1`. This will print verbose output onscreen.

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:efiboot-perf-record`
  Enable performance log saving in `boot.efi`. Performance log is saved to physical memory and is pointed by `efiboot-perf-record-data` and `efiboot-perf-record-size` variables. Starting from 10.15.4 it can also be saved to OpenCore log by `AppleDebug` option.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg-once`
  Booter arguments override removed after first launch. Otherwise equivalent to `bootercfg`.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:fmm-computer-name`
  Current saved host name. ASCII string.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:nvda_drv`
  NVIDIA Web Driver control variable. Takes ASCII digit `1` or `0` to enable or disable installed driver.
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:StartupMute`
  开机时禁用固件引导提示音。8 进制整数。`0x00` 指代不静音、其他任何值（或缺少该值）表示静音。这一选项只影响带 T2 的机器。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:SystemAudioVolume`
  System audio volume level for firmware audio support. 8-bit integer. The bit of `0x80` means muted. Lower bits are used to encode volume range specific to installed audio codec. The value is capped by `MaximumBootBeepVolume` AppleHDA layout value to avoid too loud audio playback in the firmware.
