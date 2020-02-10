---
title: 12. 排错
description: Troubleshooting（待翻译）
type: docs
---

## 12.1 Windows support

### Can I install Windows?

While no official Windows support is provided, 64-bit UEFI Windows installations (Windows 8 and above) prepared with Boot Camp are supposed to work. Third-party UEFI installations as well as systems partially supporting UEFI boot, like Windows 7, might work with some extra precautions. Things to keep in mind:

   -  MBR (Master Boot Record) installations are legacy and will not be supported.
   -  To install Windows, macOS, and OpenCore on the same drive you can specify windows bootloader path (`\EFI\Microsoft\Boot\bootmgfw.efi`) in `BlessOverride` section.
   -  All the modifications applied (to ACPI, NVRAM, SMBIOS, etc.) are supposed to be operating system agnostic, i.e. apply equally regardless of the OS booted. This enables Boot Camp software experience on Windows.
   -  macOS requires the first partition to be EFI System Partition, and does not support the default Windows layout. While OpenCore does have a [workaround](https://github.com/acidanthera/bugtracker/issues/327) for this, it is highly recommend not to rely on it and install properly.
   -  Windows may need to be reactivated. To avoid it consider setting SystemUUID to the original firmware UUID. Be warned, on old firmwares it may be invalid, i.e. not random. In case you still have issues, consider using HWID or KMS38 license. The nuances of Windows activation are out of the scope of this document and can be found online.


### What additional software do I need?

To enable operating system switching and install relevant drivers in the majority of cases you will need Windows support software from [Boot Camp](https://support.apple.com/boot-camp). For simplicity of the download process or when configuring an already installed Windows version a third-party utility, [Brigadier](https://github.com/timsutton/brigadier), can be used successfully. Note, that you may have to download and install [7-Zip](https://www.7-zip.org) prior to using Brigadier.

Remember to always use the latest version of Windows support software from Boot Camp, as versions prior to 6.1 do not support APFS, and thus will not function correctly. To download newest software pass most recent Mac model to Brigadier, for example `./brigadier.exe -m iMac19,1`. To install Boot Camp on an unsupported Mac model afterwards run PowerShell as Administrator and enter `msiexec /i BootCamp.msi`. In case you already have a previous version of Boot Camp installed you will have to remove it first by running `msiexec /x BootCamp.msi` command. `BootCamp.msi` file is located in `BootCamp/Drivers/Apple` directory and can be reached through Windows Explorer.

While Windows support software from Boot Camp solves most of compatibility problems, sometimes you may have to address some of them manually:

   -  To invert mouse wheel scroll direction `FlipFlopWheel` must be set to `1` as explained on [SuperUser](https://superuser.com/a/364353).
   -  `RealTimeIsUniversal` must be set to `1` to avoid time desync between Windows and macOS as explained on [SuperUser](https://superuser.com/q/494432) (this one is usually not needed).
   -  To access Apple filesystems like HFS and APFS separate software may need to be installed. Some of the known tools are: [Apple HFS+ driver](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/) ([hack for Windows 10](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/page-4#post-24180079)), [HFSExplorer](http://www.catacombae.org/hfsexplorer), MacDrive, Paragon APFS, Paragon HFS+, TransMac, etc. Remember to never ever attempt to modify Apple file systems from Windows as this often leads to irrecoverable data loss.


### Why do I see `Basic data partition` in Boot Camp Startup Disk control panel?

Boot Camp control panel uses GPT partition table to obtain each boot option name. After installing Windows separately you will have to relabel the partition manually. This can be done with many tools including open-source [gdisk](https://sourceforge.net/projects/gptfdisk) utility. Reference example:

> ```
> PS C:\gdisk> .\gdisk64.exe \\.\physicaldrive0
> GPT fdisk (gdisk) version 1.0.4
> 
> Command (? for help): p
> Disk \\.\physicaldrive0: 419430400 sectors, 200.0 GiB
> Sector size (logical): 512 bytes
> Disk identifier (GUID): DEC57EB1-B3B5-49B2-95F5-3B8C4D3E4E12
> Partition table holds up to 128 entries
> Main partition table begins at sector 2 and ends at sector 33
> First usable sector is 34, last usable sector is 419430366
> Partitions will be aligned on 2048-sector boundaries
> Total free space is 4029 sectors (2.0 MiB)
> 
> Number  Start (sector)    End (sector)  Size       Code  Name
>    1            2048         1023999   499.0 MiB   2700  Basic data partition
>    2         1024000         1226751   99.0 MiB    EF00  EFI system partition
>    3         1226752         1259519   16.0 MiB    0C01  Microsoft reserved ...
>    4         1259520       419428351   199.4 GiB   0700  Basic data partition
>
> Command (? for help): c
> Partition number (1-4): 4
> Enter name: BOOTCAMP
> 
> Command (? for help): w
> 
> Final checks complete. About to write GPT data. THIS WILL OVERWRITE EXISTING PARTITIONS!!
> 
> Do you want to proceed? (Y/N): Y
> OK; writing new GUID partition table (GPT) to \\.\physicaldrive0.
> Disk synchronization succeeded! The computer should now use the new partition table.
> The operation has completed successfully.
> ```
**Listing 3: Relabeling Windows volume**

### How to choose Windows BOOTCAMP with custom NTFS drivers?

Third-party drivers providing NTFS support, such as [NTFS-3G](https://www.tuxera.com/community/open-source-ntfs-3g), Paragon NTFS, Tuxera NTFS or [Seagate Paragon Driver](https://www.seagate.com/support/software/paragon) break certain macOS functionality, including [Startup Disk](https://support.apple.com/HT202796) preference pane normally used for operating system selection. While the recommended option remains not to use such drivers as they commonly corrupt the filesystem, and prefer the driver bundled with macOS with optional write support ([command](http://osxdaily.com/2013/10/02/enable-ntfs-write-support-mac-os-x) or [GUI](https://mounty.app)), there still exist vendor-specific workarounds for their products: [Tuxera](https://www.tuxera.com/products/tuxera-ntfs-for-mac/faq), [Paragon](https://kb.paragon-software.com/article/6604), etc.


## 12.2 Debugging

Similar to other projects working with hardware OpenCore supports auditing and debugging. The use of `NOOPT` or `DEBUG` build modes instead of `RELEASE` can produce a lot more debug output. With `NOOPT` source level debugging with GDB or IDA Pro is also available. For GDB check [OcSupport Debug](https://github.com/acidanthera/OcSupportPkg/tree/master/Debug) page. For IDA Pro you will need IDA Pro 7.3 or newer, refer to [Debugging the XNU Kernel with IDA Pro](https://www.hex-rays.com/products/ida/support/tutorials/index.shtml) for more details.

To obtain the log during boot you can make the use of serial port debugging. Serial port debugging is enabled in `Target`, e.g. `0xB` for onscreen with serial. OpenCore uses `115200` baud rate, `8` data bits, no parity, and `1` stop bit. For macOS your best choice are CP2102-based UART devices. Connect motherboard `TX` to USB UART `RX`, and motherboard `GND` to USB UART `GND`. Use `screen` utility to get the output, or download GUI software, such as [CoolTerm](https://freeware.the-meiers.org).

*Note*: On several motherboards (and possibly USB UART dongles) PIN naming may be incorrect. It is very common to have `GND` swapped with `RX`, thus you have to connect motherboard `"TX"` to USB UART `GND`, and motherboard `"GND"` to USB UART `RX`.

Remember to enable `COM` port in firmware settings, and never use USB cables longer than 1 meter to avoid output corruption. To additionally enable XNU kernel serial output you will need `debug=0x8` boot argument.


## 12.3 Tips and Tricks

### 1.How to debug boot failure?

​Normally it is enough to obtain the actual error message. For this ensure that:
   -  You have a `DEBUG` or `NOOPT` version of OpenCore.
   -  Logging is enabled (`1`) and shown onscreen (`2`): `Misc`  =>  `Debug`  =>  `Target`  =  `3`.
   -  Logged messages from at least `DEBUG_ERROR` (`0x80000000`), `DEBUG_WARN` (`0x00000002`), and `DEBUG_INFO` (`0x00000040`) levels are visible onscreen: `Misc`  =>  `Debug`  =>  `DisplayLevel`  =  `0x80000042`.
   -  Critical error messages, like `DEBUG_ERROR`, stop booting: `Misc`  =>  `Security`  =>  `HaltLevel`  =  `0x80000000`.
   -  Watch Dog is disabled to prevent automatic reboot: `Misc`  =>  `Debug`  =>  `DisableWatchDog`  =  `true`.
   -  Boot Picker (entry selector) is enabled: `Misc`  =>  `Boot`  =>  `ShowPicker`  =  `true`.

​If there is no obvious error, check the available hacks in `Quirks` sections one by one. For early boot troubleshooting, for instance, when OpenCore menu does not appear, using [UEFI Shell](https://github.com/acidanthera/OpenCoreShell) may help to see early debug messages.


### 2. How to customise boot entries?

​OpenCore follows standard Apple Bless model and extracts the entry name from `.contentDetails` and `.disk_label.contentDetails` files in the booter directory if present. These files contain an ASCII string with an entry title, which may then be customised by the user.


### 3. How to choose the default boot entry?

​OpenCore uses the primary UEFI boot option to select the default entry. This choice can be altered from UEFI Setup, with the macOS [Startup Disk](https://support.apple.com/HT202796) preference, or the Windows [Boot Camp](https://support.apple.com/guide/bootcamp-control-panel/start-up-your-mac-in-windows-or-macos-bcmp29b8ac66/mac) Control Panel. Since choosing OpenCore's `BOOTx64.EFI` as a primary boot option limits this functionality in addition to several firmwares deleting incompatible boot options, potentially including those created by macOS, you are strongly encouraged to use the `RequestBootVarRouting` quirk, which will preserve your selection made in the operating system within the OpenCore variable space. Note, that `RequestBootVarRouting` requires a separate driver for functioning.


### 4. What is the simplest way to install macOS?

Copy online recovery image (`*.dmg` and `*.chunklist` files) to `com.apple.recovery.boot` directory on a FAT32 partition with OpenCore. Load OpenCore Boot Picker and choose the entry, it will have a `(dmg)` suffix. Custom name may be created by providing `.contentDetails` file.

To download recovery online you may use [macrecovery.py](https://github.com/acidanthera/MacInfoPkg/blob/master/macrecovery/macrecovery.py) tool from [MacInfoPkg](https://github.com/acidanthera/MacInfoPkg/releases).

​For offline installation refer to [How to create a bootable installer for macOS](https://support.apple.com/HT201372) article. Apart from App Store and `softwareupdate` utility there also are [third-party tools](https://github.com/corpnewt/gibMacOS) to download an offline image.


### 5. Why do online recovery images (`*.dmg`) fail to load?

​This may be caused by missing HFS+ driver, as all presently known recovery volumes have HFS+ filesystem.


### 6. Can I use this on Apple hardware or virtual machines?

​Sure, most relatively modern Mac models including `MacPro5,1` and virtual machines are fully supported. Even though there are little to none specific details relevant to Mac hardware, some ongoing instructions can be found in [acidanthera/bugtracker\#377](https://github.com/acidanthera/bugtracker/issues/377).


### 7. Why do Find\&Replace patches must equal in length?

​For machine code (x86 code) it is not possible to do differently sized replacements due to [relative addressing](https://en.wikipedia.org/w/index.php?title=Relative_addressing). For ACPI code this is risky, and is technically equivalent to ACPI table replacement, thus not implemented. More detailed explanation can be found on [AppleLife.ru](https://applelife.ru/posts/819790).


### 8. How can I migrate from `AptioMemoryFix`?

​Behaviour similar to that of `AptioMemoryFix` can be obtained by installing `FwRuntimeServices` driver and enabling the quirks listed below. Please note, that most of these are not necessary to be enabled. Refer to their individual descriptions in this document for more details.

   -  `ProvideConsoleGop` (UEFI quirk)
   -  `AvoidRuntimeDefrag`
   -  `DiscardHibernateMap`
   -  `EnableSafeModeSlide`
   -  `EnableWriteUnprotector`
   -  `ForceExitBootServices`
   -  `ProtectCsmRegion`
   -  `ProvideCustomSlide`
   -  `SetupVirtualMap`
   -  `ShrinkMemoryMap`
