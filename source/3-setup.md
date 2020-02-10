---
title: 3. Setup
description: Setup（待整理）
type: docs
---

## 3.1 目录结构

```
ESP
├── EFI
|    |
|    ├── BOOT
|    |    └── BOOTx64.efi
|    └── OC
|        └── ACPI
|        |    ├── DSDT.aml
|        |    ├── SSDT-1.aml
|        |    └── MYTABLE.aml
|        ├── Drivers
|        |    ├── MyDriver.efi
|        |    └── OtherDriver.efi
|        ├── Kexts
|        |    ├── MyKext.kext
|        |    └── OtherKext.kext
|        ├── Tools
|        |    └── Tool.efi
|        ├── OpenCore.efi
|        ├── vault.plist
|        ├── config.plist
|        └── vault.sig
├── nvram.plist
└── opencore-YYYY-MM-DD-HHMMSS.txt

# Figure 1. Directory Structure
```

使用目录引导时，使用的目录结构应该遵循上述目录结构。可用的条目有：

- **BOOTx64.efi**
Initial booter, which loads OpenCore.efi unless it was already started as a driver.
- **ACPI**
Directory used for storing supplemental ACPI information for ACPI section.
- **Drivers**
Directory used for storing supplemental UEFI drivers for UEFI section.
- **Kexts**
Directory used for storing supplemental kernel information for Kernel section.
- **Tools**
Directory used for storing supplemental tools.
- **OpenCore.efi**
Main booter driver responsible for operating system loading.
- **vault.plist**
Hashes for all files potentially loadable by OC Config.
- **config.plist**
OC Config.
- **vault.sig**
Signature for vault.plist.
- **nvram.plist**
OpenCore variable import file.
- **opencore-YYYY-MM-DD-HHMMSS.txt**
OpenCore log file.

## 3.2 安装和升级

To install OpenCore reflect the Configuration Structure described in the previous section on a EFI volume of a GPT partition. While corresponding sections of this document do provide some information in regards to external resources like ACPI tables, UEFI drivers, or kernel extensions (kexts), completeness of the matter is out of the scope of this document. Information about kernel extensions may be found in a separate [Kext List](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Kexts.md) document available in OpenCore repository. Vaulting information is provided in Security Properties section of this document.

`OC Config`, just like any property lists can be edited with any stock textual editor (e.g. nano, vim), but specialised software may provide better experience. On macOS the preferred GUI application is [Xcode](https://developer.apple.com/xcode). For a lightweight cross-platform and open-source alternative [ProperTree](https://github.com/corpnewt/ProperTree) editor can be utilised.

For BIOS booting a third-party UEFI environment provider will have to be used. `DuetPkg` is one of the known UEFI environment providers for legacy systems. To run OpenCore on such a legacy system you can install `DuetPkg` with a dedicated tool: [BootInstall](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/BootInstall).

For upgrade purposes refer to `Differences.pdf` document, providing
the information about the changes affecting the configuration compared
to the previous release, and `Changelog.md` document, containing
the list of modifications across all published updates.

## 3.3 贡献代码

OpenCore can be compiled as an ordinary [EDK II](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II). Since [UDK](https://github.com/tianocore/tianocore.github.io/wiki/UDK) development was abandoned by TianoCore, OpenCore requires the use of [EDK II Stable](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II#stable-tags). Currently supported EDK II release (potentially with patches enhancing the experience) is hosted in [acidanthera/audk](https://github.com/acidanthera/audk).

The only officially supported toolchain is `XCODE5`. Other toolchains might work, but are neither supported, nor recommended. Contribution of clean patches is welcome. Please do follow [EDK II C Codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C).

Required external package dependencies include [EfiPkg](https://github.com/acidanthera/OcSupportPkg), [MacInfoPkg](https://github.com/acidanthera/OcSupportPkg), and [OcSupportPkg](https://github.com/acidanthera/OcSupportPkg).

To compile with `XCODE5`, besides [Xcode](https://developer.apple.com/xcode), one should also install [NASM](https://www.nasm.us) and [MTOC](https://github.com/acidanthera/ocbuild/raw/master/external/mtoc-mac64.zip). The latest Xcode version is recommended for use despite the toolchain name. Example
command sequence may look as follows:

```bash
git clone https://github.com/acidanthera/audk UDK
cd UDK
git clone https://github.com/acidanthera/EfiPkg
git clone https://github.com/acidanthera/MacInfoPkg
git clone https://github.com/acidanthera/OcSupportPkg
git clone https://github.com/acidanthera/OpenCorePkg
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p OpenCorePkg/OpenCorePkg.dsc
```

For IDE usage Xcode projects are available in the root of the repositories. Another approach could be [Sublime Text](https://www.sublimetext.com) with [EasyClangComplete](https://niosus.github.io/EasyClangComplete) plugin. Add `.clang\_complete` file with similar content to your UDK root:

```
-I/UefiPackages/MdePkg
-I/UefiPackages/MdePkg/Include
-I/UefiPackages/MdePkg/Include/X64
-I/UefiPackages/EfiPkg
-I/UefiPackages/EfiPkg/Include
-I/UefiPackages/EfiPkg/Include/X64
-I/UefiPackages/AppleSupportPkg/Include
-I/UefiPackages/OpenCorePkg/Include
-I/UefiPackages/OcSupportPkg/Include
-I/UefiPackages/MacInfoPkg/Include
-I/UefiPackages/UefiCpuPkg/Include
-IInclude
-include
/UefiPackages/MdePkg/Include/Uefi.h
-fshort-wchar
-Wall
-Wextra
-Wno-unused-parameter
-Wno-missing-braces
-Wno-missing-field-initializers
-Wno-tautological-compare
-Wno-sign-compare
-Wno-varargs
-Wno-unused-const-variable
-DOC_TARGET_NOOPT=1
```

> **Warning:** Tool developers modifying `config.plist` or any other OpenCore files must ensure that their tool checks for `opencore-version` NVRAM variable (see `Debug Properties` section below) and warn the user if the version listed is unsupported or prerelease. OpenCore configuration may change across the releases and the tool shall ensure that it carefully follows this document. Failure to do so may result in this tool to be considered as malware and blocked with all possible means.

## 3.4 代码约定

Just like any other project we have conventions that we follow during the development. All third-party contributors are highly recommended to read and follow the conventions listed below before submitting their patches. In general it is also recommended to firstly discuss the issue in [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker) before sending the patch to ensure no double work and to avoid your patch being rejected.

**Organisation**. The codebase is structured in multiple repositories
which contain separate EDK II packages. `AppleSupportPkg` and `OpenCorePkg` are primary packages, and `EfiPkg`, `OcSupportPkg`, `MacInfoPkg.dsc`) are dependent packages.

- Whenever changes are required in multiple repositories, separate pull requests should be sent to each.
- Committing the changes should happen firstly to dependent repositories, secondly to primary repositories to avoid automatic build errors.
- Each unique commit should compile with `XCODE5` and preferably with other toolchains. In the majority of the cases it can be checked by accessing the [CI interface](https://travis-ci.com/acidanthera). Ensuring that static analysis finds no warnings is preferred.
- External pull requests and tagged commits must be validated. That said, commits in master may build but may not necessarily work.
- Internal branches should be named as follows: `author-name-date`, e.g. `vit9696-ballooning-20191026`.
- Commit messages should be prefixed with the primary module (e.g. library or code module) the changes were made in. For example, `OcGuardLib: Add OC\_ALIGNED macro`. For non-library changes `Docs` or `Build` prefixes are used.

**Design**. The codebase is written in a subset of freestanding C11 (C17) supported by most modern toolchains used by EDK II. Applying common software development practices or requesting clarification is recommended if any particular case is not discussed below.

- Never rely on undefined behaviour and try to avoid implementation defined behaviour unless explicitly covered below (feel free to create an issue when a relevant case is not present).
- Use `OcGuardLib` to ensure safe integral arithmetics avoiding overflows. Unsigned wraparound should be relied on with care and reduced to the necessary amount.
- Check pointers for correct alignment with `OcGuardLib` and do not rely on the architecture being able to dereference unaligned pointers.
- Use flexible array members instead of zero-length or one-length arrays where necessary.
- Use static assertions (`STATIC\_ASSERT`) for type and value assumptions, and runtime assertions (`ASSERT`) for precondition and invariant sanity checking. Do not use runtime assertions to check for errors as they should never alter control flow and potentially be excluded.
- Assume `UINT32`/`INT32` to be `int`-sized and use `\%u`, `\%d`, and `\%x` to print them.
- Assume `UINTN`/`INTN` to be of unspecified size, and cast them to `UINT64`/`INT64` for printing with `\%Lu`, `\%Ld` and so on as normal.
- Do not rely on integer promotions for numeric literals. Use explicit casts when the type is
implementation-dependent or suffixes when type size is known. Assume `U` for `UINT32` and `ULL` for `UINT64`.
- Do ensure unsigned arithmetics especially in bitwise maths, shifts in particular.
- `sizeof` operator should take variables instead of types where possible to be error prone. Use `ARRAY\_SIZE` to obtain array size in elements. Use `L\_STR\_LEN` and `L\_STR\_SIZE` macros from `OcStringLib` to obtain string literal sizes to ensure compiler optimisation.
- Do not use `goto` keyword. Prefer early `return`, `break`, or `continue` after failing to pass error checking instead of nesting conditionals.
- Use `EFIAPI`, force UEFI calling convention, only in protocols, external callbacks between modules, and functions with variadic arguments.
- Provide inline documentation to every added function, at least describing its inputs, outputs, precondition, postcondition, and giving a brief description.
- Do not use `RETURN\_STATUS`. Assume `EFI\_STATUS` to be a matching superset that is to be always used when `BOOLEAN` is not enough.
- Security violations should halt the system or cause a forced reboot.

**Codestyle**. The codebase follows
[EDK II codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C) with few changes
and clarifications.

- Write inline documentation for the functions and variables only once: in headers, where a header prototype is available, and inline for `static` variables and functions.
- Use line length of 120 characters or less, preferably 100 characters.
- Use spaces after casts, e.g. `(VOID *)(UINTN) Variable`.
- Use SPDX license headers as shown in [acidanthera/bugtracker#483](https://github.com/acidanthera/bugtracker/issues/483).

**Debugging**. The codebase incorporates EDK II debugging and few custom features to improve the experience.

- Use module prefixes, 2-5 letters followed by a colon (`:`), for debug messages. For `OpenCorePkg` use `OC:`, for libraries and drivers use their own unique prefixes.
- Do not use dots (`.`) in the end of debug messages and separate `EFI\_STATUS`, printed by `\%r`, with a hyphen (e.g. `OCRAM: Allocation of \%u bytes failed - **\%r\textbackslash n`).**
- Use `DEBUG\_CODE\_BEGIN ()` and `DEBUG\_CODE\_END ()` constructions to guard debug checks that may potentially reduce the performance of release builds and are otherwise unnecessary.
- Use `DEBUG` macro to print debug messages during normal functioning, and `RUNTIME\_DEBUG` for debugging after `EXIT\_BOOT\_SERVICES`.
- Use `DEBUG\_VERBOSE` debug level to leave debug messages for future debugging of the code, which are currently not necessary. By default `DEBUG\_VERBOSE` messages are ignored even in `DEBUG` builds.
- Use `DEBUG\_INFO` debug level for all non critical messages (including errors) and `DEBUG\_BULK\_INFO` for extensive messages that should not appear in NVRAM log that is heavily limited in size. These messages are ignored in `RELEASE` builds.
- Use `DEBUG\_ERROR` to print critical human visible messages that may potentially halt the boot process, and `DEBUG\_WARN` for all other human visible errors, `RELEASE` builds included.
