---
title: 5. Booter
description: Booter（待整理）
type: docs
---

## 5.1 简介

This section allows to apply different kinds of UEFI modifications on Apple bootloader (`boot.efi`). The modifications currently provide various patches and environment alterations for different firmwares. Some of these features were originally implemented as a part of [AptioMemoryFix.efi](https://github.com/acidanthera/AptioFixPkg), which is no longer maintained. See `Tips and Tricks` section for migration steps.

If you are using this for the first time on a customised firmware, there is a
list of checks to do first. Prior to starting please ensure that you have:


- Most up-to-date UEFI firmware (check your motherboard vendor website).
- `Fast Boot` and `Hardware Fast Boot` disabled in firmware settings if present.
- `Above 4G Decoding` or similar enabled in firmware settings if present. Note, that on some motherboards (notably ASUS WS-X299-PRO) this option causes adverse effects, and must be disabled. While no other motherboards with the same issue are known, consider this option to be first to check if you have erratic boot failures.
- `DisableIoMapper` quirk enabled, or `VT-d` disabled in firmware settings if present, or ACPI DMAR table dropped.
- **No** `slide` boot argument present in NVRAM or anywhere else. It is not necessary unless you cannot boot at all or see `No slide values are usable! Use custom slide!` message in the log.
- `CFG Lock` (MSR `0xE2` write protection) disabled in firmware settings if present. Cconsider [patching it](https://github.com/LongSoft/UEFITool/blob/master/UEFIPatch/patches.txt) if you have enough skills and no option is available. See [VerifyMsrE2](https://github.com/acidanthera/AppleSupportPkg#verifymsre2) nots for more details.
- `CSM` (Compatibility Support Module) disabled in firmware settings if present. You may need to flash GOP ROM on NVIDIA 6xx/AMD 2xx or older. Use [GopUpdate](https://www.win-raid.com/t892f16-AMD-and-Nvidia-GOP-update-No-requests-DIY.html#msg15730) or [AMD UEFI GOP MAKER](http://www.insanelymac.com/forum/topic/299614-asus-eah6450-video-bios-uefi-gop-upgrade-and-gop-uefi-binary-in-efi-for-many-ati-cards/page-1#entry2042163) in case you are not sure how.
- `EHCI/XHCI Hand-off` enabled in firmware settings `only` if boot stalls unless USB devices are disconnected.
- `VT-x`, `Hyper Threading`, `Execute Disable Bit` enabled in firmware settings if present.
- While it may not be required, sometimes you have to disable `Thunderbolt support`, `Intel SGX`, and `Intel Platform Trust` in firmware settings present.

When debugging sleep issues you may want to (temporarily) disable Power Nap and automatic power off, which appear to sometimes cause wake to black screen or boot loop issues on older platforms. The particular issues may vary, but in general you should
check ACPI tables first. Here is an example of a bug found in some [Z68 motherboards](http://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/#entry2534645). To turn Power Nap and the others off run the following commands in Terminal:

```bash
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
```

**Note**: These settings may reset at hardware change and in certain other circumstances.
To view their current state use `pmset -g` command in Terminal.

## 5.2 属性列表

### 5.2.1 MmioWhitelist

**Type**: plist array
**Description**: Designed to be filled with `plist dict` values, describing addresses critical for particular firmware functioning when `DevirtualiseMmio` quirk is in use. See MmioWhitelist Properties section below.

### 5.2.2 Quirks

**Type**: plist dict
**Description**: Apply individual booter quirks described in Quirks Properties section below.

## 5.3 MmioWhitelist 属性

### 5.3.1 Address

**Type**: plist integer
**Failsafe**: 0
**Description**: Exceptional MMIO address, which memory descriptor should be left virtualised (unchanged) by `DevirtualiseMmio`. This means that the firmware will be able to directly communicate with this memory region during operating system functioning, because the region this value is in will be assigned a virtual address.

### 5.3.2 Comment

**Type**: plist string
**Failsafe**: Empty string
**Description**: Arbitrary ASCII string used to provide human readable reference for the entry. It is implementation
defined whether this value is used.

### 5.3.3 Enabled

**Type**: plist boolean
**Failsafe**: false
**Description**: This address will be devirtualised unless set to `true`.

## 5.4 Quirks 属性

### 5.4.1 `AvoidRuntimeDefrag`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Protect from boot.efi runtime memory defragmentation.

This option fixes UEFI runtime services (date, time, NVRAM, power control, etc.) support on many firmwares using SMM backing for select
services like variable storage. SMM may try to access physical addresses, but they get moved by boot.efi.

*Note*: Most but Apple and VMware firmwares need this quirk.

### 5.4.2 `DevirtualiseMmio`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Remove runtime attribute from select MMIO regions.

This option reduces stolen memory footprint from the memory map by removing runtime bit for known memory regions. This quirk may result in the increase of KASLR slides available, but is not necessarily compatible with the target board without additional measures. In general this frees from 64 to 256 megabytes of memory (present in the debug log), and on some platforms it is the only way to boot macOS, which otherwise fails with allocation error at bootloader stage.

This option is generally useful on all firmwares except some very old ones, like Sandy Bridge. On select firmwares it may require a list of exceptional addresses that still need to get their virtual addresses for proper NVRAM and hibernation functioning. Use `MmioWhitelist` section to
do this.

### 5.4.3 `DisableSingleUser`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Disable single user mode.

This is a security option allowing one to restrict single user mode usage by ignoring `CMD+S` hotkey and `-s` boot argument. The behaviour with this quirk enabled is supposed to match T2-based model behaviour. Read [this article](https://support.apple.com/HT201573) to understand how to use single user mode with this quirk enabled.

### 5.4.4 `DisableVariableWrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Protect from macOS NVRAM write access.

This is a security option allowing one to restrict NVRAM access in macOS. This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

*Note*: This quirk can also be used as an ugly workaround to buggy UEFI runtime services implementations that fail to write variables to NVRAM and break the rest of the operating system.

### 5.4.5 `DiscardHibernateMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Reuse original hibernate memory map.

This option forces XNU kernel to ignore newly supplied memory map and assume that it did not change after waking from hibernation. This behaviour is required to work by Windows, which mandates to [preserve](https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi#hibernation-state-s4-transition-requirements) runtime memory size and location after S4 wake.

*Note*: This may be used to workaround buggy memory maps on older hardware, and is now considered rare legacy. Examples of such hardware are Ivy Bridge laptops with Insyde firmware, like Acer V3-571G. Do not use this unless you fully understand the consequences.

### 5.4.6 `EnableSafeModeSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Patch bootloader to have KASLR enabled in safe mode.

This option is relevant to the users that have issues booting to safe mode (e.g. by holding `shift` or using `-x` boot argument). By default safe mode forces `0` slide as if the system was launched with `slide=0` boot argument. This quirk tries to patch `boot.efi` to lift that limitation and let some other value (from `1` to `255`) be used. This quirk requires `ProvideCustomSlide` to be enabled.

*Note*: The necessity of this quirk is determined by safe mode availability. If booting to safe mode fails, this option can be tried to be enabled.

### 5.4.7 `EnableWriteUnprotector`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Permit write access to UEFI runtime services code.

This option bypasses `RX̂` permissions in code pages of UEFI runtime services by removing write protection (`WP`) bit from `CR0` register during their execution. This quirk requires `OC_FIRMWARE_RUNTIME` protocol implemented in `FwRuntimeServices.efi`.

*Note*: The necessity of this quirk is determined by early boot crashes
of the firmware.

### 5.4.8 `ForceExitBootServices`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Retry `ExitBootServices` with new memory map on failure.

Try to ensure that `ExitBootServices` call succeeds even with outdated MemoryMap key argument by obtaining current memory map and retrying `ExitBootServices` call.

*Note*: The necessity of this quirk is determined by early boot crashes of the firmware. Do not use this unless you fully understand the consequences.

### 5.4.9 `ProtectCsmRegion`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Protect CSM region areas from relocation.

Ensure that CSM memory regions are marked as ACPI NVS to prevent boot.efi or XNU from relocating or using them.

*Note*: The necessity of this quirk is determined by artifacts and sleep wake issues. As `AvoidRuntimeDefrag` resolves a similar problem, no known firmwares should need this quirk. Do not use this unless you fully
understand the consequences.


### 5.4.10 `ProtectSecureBoot`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Protect UEFI Secure Boot variables from being written.

Reports security violation during attempts to write to `db`, `dbx`, `PK`, and `KEK` variables from the operating system.

*Note*: This quirk mainly attempts to avoid issues with NVRAM implementations with problematic defragmentation, such as select Insyde or `MacPro5,1`.

### 5.4.11 `ProvideCustomSlide`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Provide custom KASLR slide on low memory.

This option performs memory map analysis of your firmware and checks whether all slides (from `1` to `255`) can be used. As `boot.efi` generates this value randomly with `rdrand` or pseudo randomly `rdtsc`, there is a chance of boot failure when it chooses a conflicting slide. In case potential conflicts exist, this option forces macOS to use a pseudo random value among the available ones. This also ensures that `slide=` argument is never passed to the operating system for security reasons.

*Note*: The necessity of this quirk is determined by `OCABC: Only N/256 slide values are usable!` message in the debug log. If the message is present, this option is to be enabled.

### 5.4.12 `SetupVirtualMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Setup virtual memory at `SetVirtualAddresses`.

Select firmwares access memory by virtual addresses after `SetVirtualAddresses` call, which results in early boot crashes. This quirk workarounds the problem by performing early boot identity mapping of assigned virtual addresses to physical memory.

*Note*: The necessity of this quirk is determined by early boot failures.


### 5.4.13 `ShrinkMemoryMap`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Attempt to join similar memory map entries.

Select firmwares have very large memory maps, which do not fit Apple kernel, permitting up to `64` slots for runtime memory. This quirk attempts to unify contiguous slots of similar types to prevent boot failures.

*Note*: The necessity of this quirk is determined by early boot failures. It is rare to need this quirk on Haswell or newer. Do not use unless you fully understand the consequences.

### 5.4.14 `SignalAppleOS`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: Report macOS being loaded through OS Info for any OS.

This quirk is useful on Mac firmwares, which behave differently in different OS. For example, it is supposed to enable Intel GPU in Windows and Linux in some dual-GPU MacBook models.
