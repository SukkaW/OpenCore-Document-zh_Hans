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

<!-- FIXME -->[待补全]

