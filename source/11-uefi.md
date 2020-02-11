---
title: 11. UEFI
description: UEFI（待翻译）
type: docs
---

  ## 11.1 Introduction

[UEFI](https://uefi.org/specifications) (Unified Extensible Firmware Interface) is a specification that defines a software interface between an operating system and platform firmware. This section allows to load additional UEFI modules and/or apply tweaks for the onboard firmware. To inspect firmware contents, apply modifications and perform upgrades [UEFITool](https://github.com/LongSoft/UEFITool/releases) and supplementary utilities can be used.

## 11.2 Properties

### 1.  `ConnectDrivers`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Perform UEFI controller connection after driver loading.

  This option is useful for loading filesystem drivers, which  usually follow UEFI driver model, and may not start by themselves. While effective, this option may not be necessary for drivers performing automatic connection, and may slightly slowdown the boot.

  *Note*: Some firmwares, made by Apple in particular, only connect the boot drive to speedup the boot process. Enable this option to be able to see all the boot options when having multiple drives.

### 2.  `Drivers`
  **Type**: `plist array`
  **Failsafe**: None
  **Description**: Load selected drivers from `OC/Drivers` directory.

  Designed to be filled with string filenames meant to be loaded as UEFI drivers. Depending on the firmware a different set of drivers may be required. Loading an incompatible driver may lead your system to unbootable state or even cause permanent firmware damage. Some of the known drivers include:

  - [`ApfsDriverLoader`](https://github.com/acidanthera/AppleSupportPkg) --- APFS file system bootstrap driver adding the support of embedded APFS drivers in bootable APFS containers in UEFI firmwares.
  - [`FwRuntimeServices`](https://github.com/acidanthera/OcSupportPkg) --- `OC_FIRMWARE_RUNTIME` protocol implementation that increases the security  of OpenCore and Lilu by supporting read-only and write-only NVRAM variables. Some  quirks, like `RequestBootVarRouting`, require this driver for proper function.
  Due to the nature of being a runtime driver, i.e. functioning in parallel with the target operating system, it cannot be mplemented within OpenCore itself, but is bundled with OpenCore releases.
  - [`EnhancedFatDxe`](https://github.com/acidanthera/audk) --- FAT filesystem driver from `FatPkg`. This driver is embedded in all  UEFI firmwares, and cannot be used from OpenCore. It is known that multiple firmwares have a bug in their FAT support mplementation, which leads to corrupted filesystems on write attempt. Embedding this driver within the firmware may be required in case writing to EFI partition is needed during the boot process.
  - [`NvmExpressDxe`](https://github.com/acidanthera/audk) --- NVMe support driver from `MdeModulePkg`. This driver is included in most firmwares starting with Broadwell generation. For Haswell and earlier embedding it within the firmware may be more favourable in case a NVMe SSD drive is installed.
  - [`AppleUsbKbDxe`](https://github.com/acidanthera/OcSupportPkg) --- USB keyboard driver adding the support of `AppleKeyMapAggregator` protocols on top of a custom USB keyboard driver implementation. This is an alternative to builtin `KeySupport`, which may work better or worse depending on the firmware.
  -  [`VBoxHfs`](https://github.com/acidanthera/AppleSupportPkg) --- HFS file system driver with bless support. This driver is an alternative to a closed source `HFSPlus` driver commonly found in Apple firmwares. While it is feature complete, it is approximately 3~times slower and is yet to undergo a security audit.
  -  [`XhciDxe`](https://github.com/acidanthera/audk) --- XHCI USB controller support driver from `MdeModulePkg`. This driver is included in most firmwares starting with Sandy Bridge generation. For earlier firmwares or legacy systems it may be used to support external USB 3.0 PCI cards.

  To compile the drivers from UDK (EDK II) use the same command you do normally use  for OpenCore compilation, but choose a corresponding package:

  > ```
  > git clone https://github.com/acidanthera/audk UDK
  > cd UDK
  > source edksetup.sh
  > make -C BaseTools
  > build -a X64 -b RELEASE -t XCODE5 -p FatPkg/FatPkg.dsc
  > build -a X64 -b RELEASE -t XCODE5 -p MdeModulePkg/MdeModulePkg.dsc
  > ```

### 3. `Input`
  **Type**: `plist dict`
  **Failsafe**: None
  **Description**: Apply individual settings designed for input (keyboard and mouse) in [Input Properties]() section below.

### 4. `Output`
  **Type**: `plist dict`
  **Failsafe**: None
  **Description**: Apply individual settings designed for output (text and graphics) in [Output Properties]() section below.

### 5. `Protocols`
  **Type**: `plist dict`
  **Failsafe**: None
  **Description**: Force builtin versions of select protocols described in [Protocols Properties]() section below.
  *Note*: all protocol instances are installed prior to driver loading.

### 6. `Quirks`
  **Type**: `plist dict`
  **Failsafe**: None
  **Description**: Apply individual firmware quirks described in [Quirks Properties]() section below.


## 11.3 Input Properties

### 1. `KeyForgetThreshold`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Remove key unless it was submitted during this timeout in milliseconds.

  `AppleKeyMapAggregator` protocol is supposed to contain a fixed length buffer of currently pressed keys. However, the majority of the drivers only report key presses as interrupts and pressing and holding the key on the keyboard results in subsequent submissions of this key with some defined time interval. As a result we use a timeout to remove once pressed keys from the buffer once the timeout expires and no new submission of this key happened.

  This option allows to set this timeout based on your platform. The recommended value that works on the majority of the platforms is `5` milliseconds. For reference, holding one key on VMware will repeat it roughly every `2` milliseconds and the same value for APTIO V is `3-4` milliseconds. Thus it is possible to set a slightly lower value on faster platforms and slightly higher value on slower platforms for more responsive input.

### 2. `KeyMergeThreshold`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Assume simultaneous combination for keys submitted within this timeout in milliseconds.

  Similarly to `KeyForgetThreshold`, this option works around the sequential nature of key submission. To be able to recognise simultaneously pressed keys in the situation when all keys arrive sequentially, we are required to set a timeout within which we assume the keys were pressed together.

  Holding multiple keys results in reports every `2` and `1` milliseconds for VMware and APTIO V respectively. Pressing keys one after the other results in delays of at least `6` and `10` milliseconds for the same platforms. The recommended value for this option is `2` milliseconds, but it may be decreased for faster platforms and increased for slower.

### 3. `KeySupport`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Enable internal keyboard input translation to `AppleKeyMapAggregator` protocol.

  This option activates the internal keyboard interceptor driver, based on `AppleGenericInput` aka (`AptioInputFix`), to fill `AppleKeyMapAggregator` database for input functioning. In case a separate driver is used, such as `AppleUsbKbDxe`, this option should never be enabled.

### 4. `KeySupportMode`
  **Type**: `plist string`
  **Failsafe**: empty string
  **Description**: Set internal keyboard input translation to `AppleKeyMapAggregator` protocol mode.

   -  `Auto` --- Performs automatic choice as available with the following preference: `AMI`, `V2`, `V1`.
   -  `V1` --- Uses UEFI standard legacy input protocol `EFI_SIMPLE_TEXT_INPUT_PROTOCOL`.
   -  `V2` --- Uses UEFI standard modern input protocol `EFI_SIMPLE_TEXT_INPUT_EX_PROTOCOL`.
   -  `AMI` --- Uses APTIO input protocol `AMI_EFIKEYCODE_PROTOCOL`.

### 5. `KeySwap`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Swap `Command` and `Option` keys during submission.

  This option may be useful for keyboard layouts with `Option` key situated to the right of `Command` key.

### 6. `PointerSupport`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Enable internal pointer driver.

  This option implements standard UEFI pointer protocol (`EFI_SIMPLE_POINTER_PROTOCOL`) through select OEM protocols. The option may be useful on Z87 ASUS boards, where `EFI_SIMPLE_POINTER_PROTOCOL` is broken.

### 7. `PointerSupportMode`
  **Type**: `plist string`
  **Failsafe**: empty string
  **Description**: Set OEM protocol used for internal pointer driver.

  Currently the only supported variant is `ASUS`, using specialised protocol available on select Z87 and Z97 ASUS boards. More details can be found in [`LongSoft/UefiTool#116`](https://github.com/LongSoft/UEFITool/pull/116).

### 8. `TimerResolution`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Set architecture timer resolution.

  This option allows to update firmware architecture timer period with the specified value in `100` nanosecond units. Setting a lower value generally improves performance and responsiveness of the interface and input handling.

  The recommended value is `50000` (`5` milliseconds) or slightly higher. Select ASUS Z87 boards use `60000` for the interface. Apple boards use `100000`. You may leave it as `0` in case there are issues.


## 11.4 Output Properties

### 1. `TextRenderer`
  **Type**: `plist string`
  **Failsafe**: `BuiltinGraphics`
  **Description**: Chooses renderer for text going through standard
  console output.

  Currently two renderers are supported: `Builtin` and `System`. `System` renderer uses firmware services for text rendering. `Builtin` bypassing firmware services and performs text rendering on its own. Different renderers support a different set of options. It is recommended to use `Builtin` renderer, as it supports HiDPI mode and uses full screen resolution.

  UEFI firmwares generally support `ConsoleControl` with two rendering modes: `Graphics` and `Text`. Some firmwares do not support `ConsoleControl` and rendering modes. OpenCore and macOS expect text to only be shown in `Graphics` mode and graphics to be drawn in any mode. Since this is not required by UEFI specification, exact behaviour varies.

  Valid values are combinations of text renderer and rendering mode:

   - `BuiltinGraphics` --- Switch to `Graphics` mode and use `Builtin` renderer with custom `ConsoleControl`.
   - `SystemGraphics` --- Switch to `Graphics` mode and use `System` renderer with custom `ConsoleControl`.
   - `SystemText` --- Switch to `Text` mode and use `System` renderer with custom `ConsoleControl`.
   - `SystemGeneric` --- Use `System` renderer with system `ConsoleControl` assuming it behaves correctly.

  The use of `BuiltinGraphics` is generally straightforward. For most platforms it is necessary to enable `ProvideConsoleGop`, set `Resolution` to `Max`, and optionally configure `Scale`.

  The use of `System` protocols is more complicated. In general the preferred setting is `SystemGraphics` or `SystemText`. Enabling `ProvideConsoleGop`, setting `Resolution` to `Max`, enabling `ReplaceTabWithSpace` is useful on almost all platforms. `SanitiseClearScreen`, `IgnoreTextInGraphics`, and `ClearScreenOnModeSwitch` are more specific, and their use depends on the firmware.

  *Note*: Some Macs, namely `MacPro5,1`, may have broken console output with newer GPUs, and thus only `BuiltinGraphics` may work for them.

### 2. `ConsoleMode`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Sets console output mode as specified
  with the `WxH` (e.g. `80x24`) formatted string.

  Set to empty string not to change console mode. Set to `Max` to try to use largest available console mode. Currently `Builtin` text renderer supports only one console mode, so this option is ignored.

  *Note*: This field is best to be left empty on most firmwares.

### 3. `Resolution`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Sets console output screen resolution.

  - Set to `WxH@Bpp` (e.g. `1920x1080@32`) or `WxH` (e.g. `1920x1080`) formatted string to request custom resolution from GOP if available.
  - Set to empty string not to change screen resolution.
  - Set to `Max` to try to use largest available screen resolution.

  On HiDPI screens `APPLE_VENDOR_VARIABLE_GUID` `UIScale` NVRAM variable may need to be set to `02` to enable HiDPI scaling in FileVault 2 UEFI password interface and boot screen logo. Refer to [Recommended Variables]() section for more details.

  *Note*: This will fail when console handle has no GOP protocol. When the firmware does not provide it, it can be added with `ProvideConsoleGop` set to `true`.

### 4. `ClearScreenOnModeSwitch`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Some firmwares clear only part of screen when switching from graphics to text mode, leaving a fragment of previously drawn image visible. This option fills the entire graphics screen with black color before switching to text mode.

  *Note*: This option only applies to `System` renderer.

### 5. `IgnoreTextInGraphics`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Select firmwares output text onscreen in both graphics and text mode. This is normally unexpected, because random text may appear over graphical images and cause UI corruption. Setting this option to `true` will discard all text output when console control is in mode different from `Text`.

  *Note*: This option only applies to `System` renderer.

### 6. `ReplaceTabWithSpace`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Some firmwares do not print tab characters or even everything that follows them, causing difficulties or inability to use the UEFI Shell builtin text editor to edit property lists and other documents. This option makes the console output spaces instead of tabs.

  *Note*: This option only applies to `System` renderer.

### 7. `ProvideConsoleGop`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Ensure GOP (Graphics Output Protocol) on console handle.

  macOS bootloader requires GOP to be present on console handle, yet the exact location of GOP is not covered by the UEFI specification. This option will ensure GOP is installed on console handle if it is present.

  *Note*: This option will also replace broken GOP protocol on console handle, which may be the case on `MacPro5,1` with newer GPUs.

### 8. `ProvideEarlyConsole`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Ensure switching to text mode early at startup.

  Disabling this option may result in hiding all messages during startup. Since only error messages should normally be printed during startup, this option is recommended to be always enabled. The only exception for this option to be disabled is when firmware or third-party drivers, e.g. `ApfsJumpStart` on legacy Macs, unconditionally print to standard output and cannot be otherwise controlled by the bootloader.

### 9. `ReconnectOnResChange`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reconnect console controllers after changing screen resolution.

  On some firmwares when screen resolution is changed via GOP, it is required to reconnect the controllers, which produce the console protocols (simple text out). Otherwise they will not produce text based on the new resolution.

  *Note*: On several boards this logic may result in black screen when launching OpenCore from Shell and thus it is optional. In versions prior to 0.5.2 this option was mandatory and not configurable. Please do not use this unless required.

### 10. `SanitiseClearScreen`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Some firmwares reset screen resolution to a failsafe value (like `1024x768`) on the attempts to clear screen contents when large display (e.g. 2K or 4K) is used. This option attempts to apply a workaround.

  *Note*: This option only applies to `System` renderer. On all known affected systems `ConsoleMode` had to be set to empty string for this to work.

### 11. `Scale`
  **Type**: `plist integer`
  **Failsafe**: `100`
  **Description**: Sets text renderer HiDPI scaling in percents.

  Currently only `100` and `200` values are supported.

  *Note*: This option only applies to `Builtin` renderer.


## 11.5 Protocols Properties

### 1. `AppleBootPolicy`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple Boot Policy protocol with a builtin version. This may be used to ensure APFS compatibility on VMs or legacy Macs.

  *Note*: Some Macs, namely `MacPro5,1`, do have APFS compatibility, but their Apple Boot Policy protocol contains recovery detection issues, thus using this option is advised on them as well.

### 2. `AppleEvent`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple Event protocol with a builtin version. This may be used to ensure File Vault 2 compatibility on VMs or legacy Macs.

### 3. `AppleImageConversion`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple Image Conversion protocol with a builtin version.

### 4. `AppleKeyMap`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple Key Map protocols with builtin versions.

### 5. `AppleSmcIo`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple SMC I/O protocol with a builtin version.

  This protocol replaces legacy `VirtualSmc` UEFI driver, and is compatible with any SMC kernel extension. However, in case `FakeSMC` kernel extension is used, manual NVRAM key variable addition may be needed.

### 6. `AppleUserInterfaceTheme`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Apple User Interface Theme protocol with a builtin version.

### 7. `DataHub`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Data Hub protocol with a builtin version. This will drop all previous properties if the protocol was already installed.

### 8. `DeviceProperties`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Reinstalls Device Property protocol with a builtin version. This will drop all previous properties if it was already installed. This may be used to ensure full compatibility on VMs or legacy Macs.

### 9. `FirmwareVolume`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Forcibly wraps Firmware Volume protocols or installs new to support custom cursor images for File Vault 2. Should be set to `true` to ensure File Vault 2 compatibility on everything but VMs and legacy Macs.

### 10. `HashServices`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Forcibly reinstalls Hash Services protocols with builtin versions. Should be set to `true` to ensure File Vault 2 compatibility on platforms providing broken SHA-1 hashing. Can be diagnosed by invalid cursor size with `UIScale` set to `02`, in general platforms prior to APTIO V (Haswell and older) are affected.

### 11. `OSInfo`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Forcibly reinstalls OS Info protocol with builtin versions. This protocol is generally used to receive notifications from macOS bootloader, by the firmware or by other applications.

### 12. `UnicodeCollation`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Forcibly reinstalls unicode collation services with builtin version. Should be set to `true` to ensure UEFI Shell compatibility on platforms providing broken unicode collation. In general legacy Insyde and APTIO platforms on Ivy Bridge and earlier are affected.


## 11.6 Quirks Properties

### 1. `ExitBootServicesDelay`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Adds delay in microseconds after `EXIT_BOOT_SERVICES` event.

  This is a very ugly quirk to circumvent "Still waiting for root device" message on select APTIO IV firmwares, namely ASUS Z87-Pro, when using FileVault 2 in particular. It seems that for some reason they execute code in parallel to `EXIT_BOOT_SERVICES`, which results in SATA controller being inaccessible from macOS. A better approach should be found in some future. Expect 3-5 seconds to be enough in case the quirk is needed.

### 2. `IgnoreInvalidFlexRatio`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Select firmwares, namely APTIO IV, may contain invalid values in `MSR_FLEX_RATIO` (`0x194`) MSR register. These values may cause macOS boot failure on Intel platforms.

  *Note*: While the option is not supposed to induce harm on unaffected firmwares, its usage is not recommended when it is not required.

### 3. `ReleaseUsbOwnership`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Attempt to detach USB controller ownership from the firmware driver. While most firmwares manage to properly do that, or at least have an option for, select firmwares do not. As a result, operating system may freeze upon boot. Not recommended unless required.

### 4. `RequestBootVarFallback`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Request fallback of some `Boot` prefixed variables from `OC_VENDOR_VARIABLE_GUID` to newline `EFI_GLOBAL_VARIABLE_GUID`.

  This quirk requires `RequestBootVarRouting` to be enabled and therefore `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

  By redirecting `Boot` prefixed variables to a separate GUID namespace we achieve multiple goals:
  - Operating systems are jailed and only controlled by OpenCore boot environment to enhance security.
  - Operating systems do not mess with OpenCore boot priority, and guarantee fluent updates and hibernation wakes for cases that require reboots with OpenCore in the middle.
  - Potentially incompatible boot entries, such as macOS entries, are not deleted or anyhow corrupted.

  However, some firmwares do their own boot option scanning upon startup by checking file presence on the available disks. Quite often this scanning includes non-standard locations, such as Windows Bootloader paths. Normally it is not an issue, but some firmwares, ASUS firmwares on APTIO V in particular, have bugs. For them scanning is implemented improperly, and firmware preferences may get accidentally corrupted due to `BootOrder` entry duplication (each option will be added twice) making it impossible to boot without cleaning NVRAM.

  To trigger the bug one should have some valid boot options (e.g. OpenCore) and then install Windows with `RequestBootVarRouting` enabled. As Windows bootloader option will not be created by Windows installer, the firmware will attempt to create it itself, and then corrupt its boot option list.

  This quirk forwards all UEFI specification valid boot options, that are not related to macOS, to the firmware into `BootF###` and `BootOrder` variables upon write. As the entries are added to the end of `BootOrder`, this does not break boot priority, but ensures that the firmware does not try to append a new option on its own after Windows installation for instance.

### 5. `RequestBootVarRouting`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Request redirect of all `Boot` prefixed variables from `EFI_GLOBAL_VARIABLE_GUID` to newline `OC_VENDOR_VARIABLE_GUID`.

  This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`. The quirk lets default boot entry preservation at times when firmwares delete incompatible boot entries. Simply said, you are required to enable this quirk to be able to reliably use [Startup Disk](https://support.apple.com/HT202796) preference pane in a firmware that is not compatible with macOS boot entries by design.

### 6. `UnblockFsConnect`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Some firmwares block partition handles by opening them in By Driver mode, which results in File System protocols being unable to install.

  *Note*: The quirk is mostly relevant for select HP laptops with no drives listed.