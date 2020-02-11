---
title: 8. Misc
description: Misc（待翻译）
type: docs
author_info: 由 xMuu 整理
---

## 8.1 Introduction

This section contains miscellaneous configuration entries for OpenCore behaviour that does not go to any other sections.

## 8.2 Properties

### 1. `Boot`
  **Type**: `plist dict`
  **Description**: Apply boot configuration described in [Boot Properties]() section below.

### 2. `BlessOverride`
  **Type**: `plist array`
  **Description**: Add custom scanning paths through bless model.

  Designed to be filled with `plist string` entries containing absolute UEFI paths to customised bootloaders, for example, `\EFI\Microsoft\Boot\bootmgfw.efi` for Microsoft bootloader. This allows unusual boot paths to be automaticlly discovered by the boot picker. Designwise they are equivalent to predefined blessed path, such as `\System\Library\CoreServices\boot.efi`, but unlike predefined bless paths they have highest priority.

### 3. `Debug`
  **Type**: `plist dict`
  **Description**: Apply debug configuration described in [Debug Properties]() section below.

### 4. `Entries`
  **Type**: `plist array`
  **Description**: Add boot entries to boot picker.

  Designed to be filled with `plist dict` values, describing each load entry. See [Entry Properties]() section below.

### 5. `Security`
  **Type**: `plist dict`
  **Description**: Apply security configuration described in [Security Properties]() section below.

### 6. `Tools`
  **Type**: `plist array`
  **Description**: Add tool entries to boot picker.

  Designed to be filled with `plist dict` values, describing each load entry. See [Entry Properties]() section below.

  *Note*: Select tools, for example, [UEFI Shell](https://github.com/acidanthera/OpenCoreShell) are very dangerous and **MUST NOT** appear in production configurations, especially in vaulted ones and protected with secure boot, as they may be used to easily bypass secure boot chain.


## 8.3 Boot Properties

### 1. `HibernateMode`
  **Type**: `plist string`
  **Failsafe**: `None`
  **Description**: Hibernation detection mode. The following modes are supported:

  - `None` --- Avoid hibernation for your own good.
  - `Auto` --- Use RTC and NVRAM detection.
  - `RTC` --- Use RTC detection.
  - `NVRAM` --- Use NVRAM detection.

### 2. `HideSelf`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Hides own boot entry from boot picker. This may potentially hide other entries, for instance, when another UEFI OS is installed on the same volume and driver boot is used.

### 3. `PickerAttributes`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Sets specific attributes for picker.

  Builtin picker supports colour arguments as a sum of foreground and background colors according to UEFI specification. The value of black background and black foreground (`0`) is reserved. List of colour names:

  - `0x00` --- `EFI_BLACK`
  - `0x01` --- `EFI_BLUE`
  - `0x02` --- `EFI_GREEN`
  - `0x03` --- `EFI_CYAN`
  - `0x04` --- `EFI_RED`
  - `0x05` --- `EFI_MAGENTA`
  - `0x06` --- `EFI_BROWN`
  - `0x07` --- `EFI_LIGHTGRAY`
  - `0x08` --- `EFI_DARKGRAY`
  - `0x09` --- `EFI_LIGHTBLUE`
  - `0x0A` --- `EFI_LIGHTGREEN`
  - `0x0B` --- `EFI_LIGHTCYAN`
  - `0x0C` --- `EFI_LIGHTRED`
  - `0x0D` --- `EFI_LIGHTMAGENTA`
  - `0x0E` --- `EFI_YELLOW`
  - `0x0F` --- `EFI_WHITE`
  - `0x00` --- `EFI_BACKGROUND_BLACK`
  - `0x10` --- `EFI_BACKGROUND_BLUE`
  - `0x20` --- `EFI_BACKGROUND_GREEN`
  - `0x30` --- `EFI_BACKGROUND_CYAN`
  - `0x40` --- `EFI_BACKGROUND_RED`
  - `0x50` --- `EFI_BACKGROUND_MAGENTA`
  - `0x60` --- `EFI_BACKGROUND_BROWN`
  - `0x70` --- `EFI_BACKGROUND_LIGHTGRAY`

  *Note*: This option may not work well with `System` text renderer.
  Setting a background different from black could help testing proper GOP functioning.

### 4. `PollAppleHotKeys`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Enable `modifier hotkey` handling in boot picker.

  In addition to `action hotkeys`, which are partially described in `PickerMode` section and are normally handled by Apple BDS, there exist modifier keys, which are handled by operating system bootloader, namely `boot.efi`. These keys allow to change operating system behaviour by providing different boot modes.

  On some firmwares it may be problematic to use modifier keys due to driver incompatibilities. To workaround this problem this option allows registering select hotkeys in a more permissive manner from within boot picker. Such extensions include the support of tapping on keys in addition to holding and pressing `Shift` along with other keys instead of just `Shift` alone, which is not detectible on many PS/2 keyboards. This list of known `modifier hotkeys` includes:

  - `CMD+C+MINUS` --- disable board compatibility checking.
  - `CMD+K` --- boot release kernel, similar to `kcsuffix=release`.
  - `CMD+S` --- single user mode.
  - `CMD+S+MINUS` --- disable KASLR slide, requires disabled SIP.
  - `CMD+V` --- verbose mode.
  - `Shift` --- safe mode.

### 5. `ShowPicker`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Show simple boot picker to allow boot entry selection.

### 6. `TakeoffDelay`
  **Type**: `plist integer`, 32 bit
  **Failsafe**: `0`
  **Description**: Delay in microseconds performed before handling
  picker startup and `action hotkeys`.

  Introducing a delay may give extra time to hold the right `action hotkey` sequence to e.g. boot to recovery mode. On some platforms setting this option to at least `5000-10000` microseconds may be necessary to access `action hotkeys` at all due to the nature of the keyboard driver.

### 7. `Timeout`
  **Type**: `plist integer`, 32 bit
  **Failsafe**: `0`
  **Description**: Timeout in seconds in boot picker before automatic booting of the default boot entry. Use 0 to disable timer.

### 8. `PickerMode`
  **Type**: `plist string`
  **Failsafe**: `Builtin`
  **Description**: Choose boot picker used for boot management.

  Picker describes underlying boot management with an optional user interface responsible for handling boot options. The following values are supported:

  - `Builtin` --- boot management is handled by OpenCore, a simple
  text only user interface is used.
  - `External` --- an external boot management protocol is used
  if available. Otherwise `Builtin` mode is used.
  - `Apple` --- Apple boot management is used if available.
  Otherwise `Builtin` mode is used.

  Upon success `External` mode will entirely disable all boot management in OpenCore except policy enforcement. In `Apple` mode it may additionally bypass policy enforcement. To implement `External` mode a custom user interface may utilise [OcSupportPkg](https://github.com/acidanthera/OcSupportPkg) `OcBootManagementLib`. Reference example of external graphics interface is provided in [ExternalUi](https://github.com/acidanthera/OcSupportPkg/tree/master/Tests/ExternalUi) test driver.

  OpenCore built-in boot picker contains a set of actions chosen during the boot process. The list of supported actions is similar to Apple BDS and in general can be accessed by holding `action hotkeys` during boot process. Currently the following actions are considered:

  - `Default` --- this is the default option, and it lets OpenCore built-in boot picker to loads the default boot option as specified in [Startup Disk](https://support.apple.com/HT202796) preference pane.
  - `ShowPicker` --- this option forces picker to show. Normally it can be achieved by holding `OPT` key during boot. Setting `ShowPicker` to `true` will make `ShowPicker` the default option.
  - `ResetNvram` --- this option performs select UEFI variable erase and is normally achieved by holding `CMD+OPT+P+R` key combination during boot. Another way to erase UEFI variables is to choose `Reset NVRAM` in the picker. This option requires `AllowNvramReset` to be set to `true`.
  - `BootApple` --- this options performs booting to the first found Apple operating system unless the default chosen operating system is already made by Apple. Hold `X` key to choose this option.
  - `BootAppleRecovery` --- this option performs booting to Apple operating system recovery. Either the one related to the default chosen operating system, or first found in case default chosen operating system is not made by Apple or has no recovery. Hold `CMD+R` key combination to choose this option.

  *Note 1*: Activated `KeySupport`, `AppleUsbKbDxe`, or similar driver is required for key handling to work. On many firmwares it is not possible to get all the keys function.

  *Note 2*: In addition to `OPT` OpenCore supports `Escape` key to display picker when `ShowPicker` is disabled. This key exists for `Apple` picker mode and for firmwares with PS/2 keyboards that fail to report held `OPT` key and require continual presses of `Escape` key to enter the boot menu.

  *Note 3*: On Macs with problematic GOP it may be difficult to access Apple BootPicker. To workaround this problem even without loading OpenCore `BootKicker` utility can be blessed.

 
## 8.4 Debug Properties

### 1. `DisableWatchDog`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Select firmwares may not succeed in quickly booting the operating system, especially in debug mode, which results in watch dog timer aborting the process. This option turns off watch dog timer.

### 2. `DisplayDelay`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: Delay in microseconds performed after every printed line visible onscreen (i.e. console).

### 3.  `DisplayLevel`
  **Type**: `plist integer`, 64 bit
  **Failsafe**: `0`
  **Description**: EDK II debug level bitmask (sum) showed onscreen. Unless `Target` enables console (onscreen) printing, onscreen debug output will not be visible. The following levels are supported (discover more in [DebugLib.h](https://github.com/tianocore/edk2/blob/UDK2018/MdePkg/Include/Library/DebugLib.h)):

  - `0x00000002` (bit `1`) --- `DEBUG_WARN` in `DEBUG`, `NOOPT`, `RELEASE`.
  - `0x00000040` (bit `6`) --- `DEBUG_INFO` in `DEBUG`, `NOOPT`.
  - `0x00400000` (bit `22`) --- `DEBUG_VERBOSE` in custom builds.
  - `0x80000000` (bit `31`) --- `DEBUG_ERROR` in `DEBUG`, `NOOPT`, `RELEASE`.

### 4. `Target`
  **Type**: `plist integer`
  **Failsafe**: `0`
  **Description**: A bitmask (sum) of enabled logging targets. By default all the logging output is hidden, so this option is required to be set when debugging is necessary.

  The following logging targets are supported:

  - `0x01` (bit `0`) --- Enable logging, otherwise all log is discarded.
  - `0x02` (bit `1`) --- Enable basic console (onscreen) logging.
  - `0x04` (bit `2`) --- Enable logging to Data Hub.
  - `0x08` (bit `3`) --- Enable serial port logging.
  - `0x10` (bit `4`) --- Enable UEFI variable logging.
  - `0x20` (bit `5`) --- Enable non-volatile UEFI variable logging.
  - `0x40` (bit `6`) --- Enable logging to file.

  Console logging prints less than all the other variants. Depending on the build type (`RELEASE`, `DEBUG`, or `NOOPT`) different amount of logging may be read (from least to most).

  Data Hub log will not log kernel and kext patches. To obtain Data Hub log use the following command in macOS:

  ```
  ioreg -lw0 -p IODeviceTree | grep boot-log | sort | sed 's/.*<\(.*\)>.*/\1/' | xxd -r -p
  ```

  UEFI variable log does not include some messages and has no performance data. For safety reasons log size is limited to 32 kilobytes. Some firmwares may truncate it much earlier or drop completely if they have no memory. Using non-volatile flag will write the log to NVRAM flash after every printed line. To obtain UEFI variable log use the following command
  in macOS:

  ```
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-log |
    awk '{gsub(/%0d%0a%00/,"");gsub(/%0d%0a/,"\n")}1'
  ```

  *Warning*: Some firmwares are reported to have broken NVRAM garbage collection. This means that they may not be able to always free space after variable deletion. Do not use non-volatile NVRAM logging without extra need on such devices.

  While OpenCore boot log already contains basic version information with build type and date, this data may also be found in NVRAM in `opencore-version` variable even with boot log disabled.

  File logging will create a file named `opencore-YYYY-MM-DD-HHMMSS.txt` at EFI volume root with log contents (the upper case letter sequence is replaced with date and time from the firmware). Please be warned that some file system drivers present in firmwares are not reliable, and may corrupt data when writing files through UEFI. Log is attempted to be written in the safest manner, and thus is very slow. Ensure that `DisableWatchDog` is set to `true` when you use a slow drive.


## 8.5 Security Properties

### 1. `AllowNvramReset`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Allow `CMD+OPT+P+R` handling and enable showing `NVRAM Reset` entry in boot picker.

### 2. `AllowSetDefault`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Allow `CTRL+Enter` and `CTRL+Index` handling to set the default boot option in boot picker.

### 3. `AuthRestart`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: Enable `VirtualSMC`-compatible authenticated restart.

  Authenticated restart is a way to reboot FileVault 2 enabled macOS without entering the password. To perform authenticated restart one can use a dedicated terminal command: `sudo fdesetup authrestart`. It is also used when installing operating system updates.

  VirtualSMC performs authenticated restart by saving disk encryption key split in NVRAM and RTC, which despite being removed as soon as OpenCore starts, may be considered a security risk and thus is optional.

### 4. `ExposeSensitiveData`
  **Type**: `plist integer`
  **Failsafe**: `0x6`
  **Description**: Sensitive data exposure bitmask (sum) to operating system.

  - `0x01` --- Expose printable booter path as an UEFI variable.
  - `0x02` --- Expose OpenCore version as an UEFI variable.
  - `0x04` --- Expose OpenCore version in boot picker menu title.
  - `0x08` --- Expose OEM information as a set of UEFI variables.

  Exposed booter path points to OpenCore.efi or its booter depending on the load order. To obtain booter path use the following command in macOS:

  ```
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path
  ```

  To use booter path for mounting booter volume use the following command in macOS:

  ```
  u=$(nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path | sed 's/.*GPT,\([^,]*\),.*/\1/'); \
    if [ "$u" != "" ]; then sudo diskutil mount $u ; fi
  ```

  To obtain OpenCore version use the following command in macOS:

  ```
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:opencore-version
  ```

  To obtain OEM information use the following commands in macOS:
  ```
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-product # SMBIOS Type1 ProductName
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-vendor  # SMBIOS Type2 Manufacturer
  nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-board   # SMBIOS Type2 ProductName
  ```

### 5. `HaltLevel`
  **Type**: `plist integer`, 64 bit
  **Failsafe**: `0x80000000` (`DEBUG_ERROR`)
  **Description**: EDK II debug level bitmask (sum) causing CPU to halt (stop execution) after obtaining a message of `HaltLevel`. Possible values match `DisplayLevel` values.

### 6. `Vault`
  **Type**: `plist string`
  **Failsafe**: `Secure`
  **Description**: Enables vaulting mechanism in OpenCore.

  Valid values:

  - `Optional` --- require nothing, no vault is enforced, insecure.
  - `Basic` --- require `vault.plist` file present in `OC` directory. This provides basic filesystem integrity verification and may protect from unintentional filesystem corruption.
  - `Secure` --- require `vault.sig` signature file for `vault.plist` in `OC` directory. This includes `Basic` integrity checking but also attempts to build a trusted bootchain.

  `vault.plist` file should contain SHA-256 hashes for all files used by OpenCore. Presence of this file is highly recommended to ensure that unintentional file modifications (including filesystem corruption) do not happen unnoticed. To create this file automatically use [`create_vault.sh`](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/CreateVault) script. Regardless of the underlying filesystem, path name and case must match between `config.plist` and `vault.plist`.

  `vault.sig` file should contain a raw 256 byte RSA-2048 signature from SHA-256 hash of `vault.plist`. The signature is verified against the public key embedded into `OpenCore.efi`. To embed the public key you should do either of the following:

  - Provide public key during the `OpenCore.efi` compilation in [`OpenCoreVault.c`](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c) file.
  - Binary patch `OpenCore.efi` replacing zeroes with the public key between `=BEGIN OC VAULT=` and `==END OC VAULT==` ASCII markers.

  RSA public key 520 byte format description can be found in Chromium OS documentation. To convert public key from X.509 certificate or from PEM file use [RsaTool](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/CreateVault).

  The complete set of commands to:

  - Create `vault.plist`.
  - Create a new RSA key (always do this to avoid loading old configuration).
  - Embed RSA key into `OpenCore.efi`.
  - Create `vault.sig`.

  Can look as follows:
  ```
  cd /Volumes/EFI/EFI/OC
  /path/to/create_vault.sh .
  /path/to/RsaTool -sign vault.plist vault.sig vault.pub
  off=$(($(strings -a -t d OpenCore.efi | grep "=BEGIN OC VAULT=" | cut -f1 -d' ')+16))
  dd of=OpenCore.efi if=vault.pub bs=1 seek=$off count=528 conv=notrunc
  rm vault.pub
  ```

  *Note 1*: While it may appear obvious, but you have to use an external  method to verify `OpenCore.efi` and `BOOTx64.efi` for secure boot path. For this you are recommended to at least enable UEFI SecureBoot with a custom certificate, and sign `OpenCore.efi` and `BOOTx64.efi` with your custom key. More details on customising secure boot on modern firmwares can be found in [Taming UEFI SecureBoot](https://habr.com/post/273497/) paper (in Russian).

  *Note 2*: `vault.plist` and `vault.sig` are used regardless of this option when `vault.plist` is present or public key is embedded into `OpenCore.efi`. Setting this option will only ensure configuration sanity, and abort the boot process otherwise.

### 7. `ScanPolicy`
  **Type**: `plist integer`, 32 bit
  **Failsafe**: `0xF0103`
  **Description**: Define operating system detection policy.

  This value allows to prevent scanning (and booting) from untrusted source based on a bitmask (sum) of select flags. As it is not possible to reliably detect every file system or device type, this feature cannot be fully relied upon in open environments, and the additional measures are to be applied.

  Third party drivers may introduce additional security (and performance) measures following the provided scan policy. Scan policy is exposed in `scan-policy` variable of `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` GUID for UEFI Boot Services only.

  - `0x00000001` (bit `0`) --- `OC_SCAN_FILE_SYSTEM_LOCK`, restricts scanning to only known file systems defined as a part of this policy. File system drivers may not be aware of this policy, and to avoid mounting of undesired file systems it is best not to load its driver. This bit does not affect dmg mounting, which may have any file system. Known file systems are prefixed with `OC_SCAN_ALLOW_FS_`.
  - `0x00000002` (bit `1`) --- `OC_SCAN_DEVICE_LOCK`, restricts scanning to only known device types defined as a part of this policy. This is not always possible to detect protocol tunneling, so be aware that on some systems it may be possible for e.g. USB HDDs to be recognised as SATA. Cases like this must be reported. Known device types are prefixed with `OC_SCAN_ALLOW_DEVICE_`.
  - `0x00000100` (bit `8`) --- `OC_SCAN_ALLOW_FS_APFS`, allows scanning of APFS file system.
  - `0x00000200` (bit `9`) --- `OC_SCAN_ALLOW_FS_HFS`, allows scanning of HFS file system.
  - `0x00000400` (bit `10`) --- `OC_SCAN_ALLOW_FS_ESP`, allows scanning of EFI System Partition file system.
  - `0x00000800` (bit `11`) --- `OC_SCAN_ALLOW_FS_NTFS`, allows scanning of NTFS (Msft Basic Data) file system.
  - `0x00001000` (bit `12`) --- `OC_SCAN_ALLOW_FS_EXT`, allows scanning of EXT (Linux Root) file system.
  - `0x00010000` (bit `16`) --- `OC_SCAN_ALLOW_DEVICE_SATA`, allow scanning SATA devices.
  - `0x00020000` (bit `17`) --- `OC_SCAN_ALLOW_DEVICE_SASEX`, allow scanning SAS and Mac NVMe devices.
  - `0x00040000` (bit `18`) --- `OC_SCAN_ALLOW_DEVICE_SCSI`, allow scanning SCSI devices.
  - `0x00080000` (bit `19`) --- `OC_SCAN_ALLOW_DEVICE_NVME`, allow scanning NVMe devices.
  - `0x00100000` (bit `20`) --- `OC_SCAN_ALLOW_DEVICE_ATAPI`, allow scanning CD/DVD devices.
  - `0x00200000` (bit `21`) --- `OC_SCAN_ALLOW_DEVICE_USB`, allow scanning USB devices.
  - `0x00400000` (bit `22`) --- `OC_SCAN_ALLOW_DEVICE_FIREWIRE`, allow scanning FireWire devices.
  - `0x00800000` (bit `23`) --- `OC_SCAN_ALLOW_DEVICE_SDCARD`, allow scanning card reader devices.

  *Note*: Given the above description, `0xF0103` value is expected to allow scanning of SATA, SAS, SCSI, and NVMe devices with APFS file system, and prevent scanning of any devices with HFS or FAT32 file systems in addition to not scanning APFS file systems on USB, CD, and FireWire drives. The combination reads as:

  - `OC_SCAN_FILE_SYSTEM_LOCK`
  - `OC_SCAN_DEVICE_LOCK`
  - `OC_SCAN_ALLOW_FS_APFS`
  - `OC_SCAN_ALLOW_DEVICE_SATA`
  - `OC_SCAN_ALLOW_DEVICE_SASEX`
  - `OC_SCAN_ALLOW_DEVICE_SCSI`
  - `OC_SCAN_ALLOW_DEVICE_NVME`


## 8.6 Entry Properties

### 1. `Arguments`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Arbitrary ASCII string used as boot arguments (load options) of the specified entry.

### 2. `Comment`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation defined whether this value is used.

### 3. `Enabled`
  **Type**: `plist boolean`
  **Failsafe**: `false`
  **Description**: This entry will not be listed unless set to
  `true`.

### 4. `Name`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Human readable entry name displayed in boot picker.

- `Path`
  **Type**: `plist string`
  **Failsafe**: Empty string
  **Description**: Entry location depending on entry type.

  - `Entries` specify external boot options, and therefore take device paths in `Path` key. These values are not checked, thus be extremely careful. Example: `PciRoot(0x0)/Pci(0x1,0x1)/.../\EFI\COOL.EFI`
  - `Tools` specify internal boot options, which are part of bootloader vault, and therefore take file paths relative to `OC/Tools` directory. Example: `Shell.efi`.
