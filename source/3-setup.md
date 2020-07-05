---
title: 3. Setup
description: Setup
type: docs
author_info: 由 Sukka 整理、由 Sukka 翻译。
last_updated: 2020-06-19
---

## 3.1 目录结构

```
ESP
├── EFI
│    │
│    ├── BOOT
│    │    └── BOOTx64.efi
│    └── OC
│        ├── ACPI
│        │    ├── DSDT.aml
│        │    ├── SSDT-1.aml
│        │    └── MYTABLE.aml
│        ├── Drivers
│        │    ├── MyDriver.efi
│        │    └── OtherDriver.efi
│        ├── Kexts
│        │    ├── MyKext.kext
│        │    └── OtherKext.kext
│        ├── Resources
│        │    └── Audio
│        ├── Tools
│        │    └── Tool.efi
│        ├── OpenCore.efi
│        ├── vault.plist
│        ├── config.plist
│        └── vault.sig
├── SysReport
├── nvram.plist
└── opencore-YYYY-MM-DD-HHMMSS.txt

# Figure 1. 目录结构
```

使用目录引导时，使用的目录结构应该遵循上述目录结构。可用的条目有：

- **BOOTx64.efi** 和 **Bootstrap.efi** - 初始引导程序。除非 `OpenCore.efi` 已作为驱动程序启动，否则将用于加载 `OpenCore.efi`。对于大部分固件来说，`BOOTx64.efi` 是 UEFI 默认启动项，而 `Bootstrap.efi` 可以被注册为自定义启动项，避免 `BOOTx64.efi` 被其它操作系统所覆盖。
- **boot** - Duet bootstrap loader，用于在传统 BIOS 固件上模拟 UEFI 环境、并加载 `OpenCore.efi`。
- **ACPI** - 用于存储 ACPI 补充信息的目录。
- **Drivers** - 用于存储 UEFI 补充驱动程序的目录。
- **Kexts** - 用于存储内核驱动（kext）补充的目录。
- **Tools** - 用于存储补充工具的目录。
- **OpenCore.efi** - 主引导驱动程序，负责操作系统加载。
- **vault.plist** - OC Config 可能加载的所有文件的哈希。
- **config.plist** - OC Config（即 OpenCore 的配置文件，见「配置术语」）。这一目录同时也用于存放 GUI 界面所使用的图片，见 `OpenCanopy` 相关章节。
- **vault.sig** - `vault.plist` 的签名文件。
- **nvram.plist** - OpenCore 变量导入文件。
- **Resources** - 媒体资源使用的目录，如 屏幕朗读 的语音文件（见「UEFI Audio 属性」章节）。
- **SysReport** - 存放 `SysReport` 功能产生的系统错误报告。
- **opencore-YYYY-MM-DD-HHMMSS.txt** - OpenCore 日志文件。
- **panic-YYYY-MM-DD-HHMMSS.txt** - Kernal Panic 日志文件。

*注*: 受限于固件的实现行为，OpenCore 可能无法访问绝对路径长度大于 `OC_STORAGE_SAFE_PATH_MAX`（默认值为 128）的目录。

## 3.2 安装和升级

如果要安装 OpenCore，请在使用 GPT 格式的硬盘上、按照上一节的文件夹结构建立文件和文件夹。尽管本文档的相应部分的确提供了有关你所需的外部资源（如 ACPI 表、UEFI 驱动程序或 kexts）的某些信息，但是本文档不保证会提供关于这些外部资源的全部信息。关于 kext 的完整信息可以查看由 OpenCore 提供的 [可选 kext 列表](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Kexts.md)；而本文档也在安全属性的相关章节提供了 Vauting 的相关信息。

OpenCore 的配置文件可以使用任何常规的文本编辑器（如 nano、vim、VSCode）进行编辑，但是专用软件可以带来更好的体验。在 macOS 上我们推荐使用 [Xcode](https://developer.apple.com/xcode)。你也可以使用 [ProperTree](https://github.com/corpnewt/ProperTree) ，这是一个轻量级的跨平台的开源 plist 编辑器。

如果要通过 BIOS 进行开机，你必须使用第三方 UEFI 环境提供程序。`OpenDuetPkg` 是一个常用的为旧操作系统提供 Legacy 引导的 UEFI 环境提供程序。要在这样的旧操作系统上运行 OpenCore，你可以使用一个独立的工具 `BootInstall` 安装 `OpenDuetPkg`（目前已和 OpenCore 打包在一起发布）。

如果要升级 OpenCore，[`Differences.pdf`](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) 提供了 OpenCore 配置文件变更的相关信息，[`Changelog.md`](https://github.com/acidanthera/OpenCorePkg/blob/master/Changelog.md) 提供了 OpenCore 的更新日志。

> 译者注：以下两节是为准备参与 OpenCore 开发的人员准备的。

## 3.3 贡献代码

OpenCore can be compiled as an ordinary [EDK II](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II). Since [UDK](https://github.com/tianocore/tianocore.github.io/wiki/UDK) development was abandoned by TianoCore, OpenCore requires the use of [EDK II Stable](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II#stable-tags). Currently supported EDK II release is hosted in [acidanthera/audk](https://github.com/acidanthera/audk). The required patches for the package are present in `Patches` directory.

The only officially supported toolchain is `XCODE5`. Other toolchains might work, but are neither supported, nor recommended. Contribution of clean patches is welcome. Please do follow [EDK II C Codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C).

To compile with `XCODE5`, besides [Xcode](https://developer.apple.com/xcode), one should also install [NASM](https://www.nasm.us) and [MTOC](https://github.com/acidanthera/ocbuild/tree/master/external). The latest Xcode version is recommended for use despite the toolchain name. Example
command sequence may look as follows:

```bash
git clone --recursive --depth=1 https://github.com/acidanthera/audk UDK
cd UDK
git clone https://github.com/acidanthera/DuetPkg
git clone https://github.com/acidanthera/OpenCorePkg
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p OpenCorePkg/OpenCorePkg.dsc
```

For IDE usage Xcode projects are available in the root of the repositories. Another approach could be [Sublime Text](https://www.sublimetext.com) with [EasyClangComplete](https://niosus.github.io/EasyClangComplete) plugin. Add `.clang_complete` file with similar content to your UDK root:

```
-I/UefiPackages/MdePkg
-I/UefiPackages/MdePkg/Include
-I/UefiPackages/MdePkg/Include/X64
-I/UefiPackages/OpenCorePkg/Include/AMI
-I/UefiPackages/OpenCorePkg/Include/Acidanthera
-I/UefiPackages/OpenCorePkg/Include/Apple
-I/UefiPackages/OpenCorePkg/Include/Apple/X64
-I/UefiPackages/OpenCorePkg/Include/Duet
-I/UefiPackages/OpenCorePkg/Include/Generic
-I/UefiPackages/OpenCorePkg/Include/Intel
-I/UefiPackages/OpenCorePkg/Include/Microsoft
-I/UefiPackages/OpenCorePkg/Include/VMware
-I/UefiPackages/OvmfPkg/Include
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
-DNO_MSABI_VA_FUNCS=1
```

> **Warning:** Tool developers modifying `config.plist` or any other OpenCore files must ensure that their tool checks for `opencore-version` NVRAM variable (see `Debug Properties` section below) and warn the user if the version listed is unsupported or prerelease. OpenCore configuration may change across the releases and the tool shall ensure that it carefully follows this document. Failure to do so may result in this tool to be considered as malware and blocked with all possible means.

## 3.4 代码约定

Just like any other project we have conventions that we follow during the development. All third-party contributors are highly recommended to read and follow the conventions listed below before submitting their patches. In general it is also recommended to firstly discuss the issue in [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker) before sending the patch to ensure no double work and to avoid your patch being rejected.

**Organisation**. The codebase is contained in `OpenCorePkg` repo. which is the primary EDK II package.

- Whenever changes are required in multiple repositories, separate pull requests should be sent to each.
- Committing the changes should happen firstly to dependent repositories, secondly to primary repositories to avoid automatic build errors.
- Each unique commit should compile with `XCODE5` and preferably with other toolchains. In the majority of the cases it can be checked by accessing the [CI interface](https://travis-ci.com/acidanthera). Ensuring that static analysis finds no warnings is preferred.
- External pull requests and tagged commits must be validated. That said, commits in master may build but may not necessarily work.
- Internal branches should be named as follows: `author-name-date`, e.g. `vit9696-ballooning-20191026`.
- Commit messages should be prefixed with the primary module (e.g. library or code module) the changes were made in. For example, `OcGuardLib: Add OC_ALIGNED macro`. For non-library changes `Docs` or `Build` prefixes are used.

**Design**. The codebase is written in a subset of freestanding C11 (C17) supported by most modern toolchains used by EDK II. Applying common software development practices or requesting clarification is recommended if any particular case is not discussed below.

- Never rely on undefined behaviour and try to avoid implementation defined behaviour unless explicitly covered below (feel free to create an issue when a relevant case is not present).
- Use `OcGuardLib` to ensure safe integral arithmetics avoiding overflows. Unsigned wraparound should be relied on with care and reduced to the necessary amount.
- Check pointers for correct alignment with `OcGuardLib` and do not rely on the architecture being able to dereference unaligned pointers.
- Use flexible array members instead of zero-length or one-length arrays where necessary.
- Use static assertions (`STATIC_ASSERT`) for type and value assumptions, and runtime assertions (`ASSERT`) for precondition and invariant sanity checking. Do not use runtime assertions to check for errors as they should never alter control flow and potentially be excluded.
- Assume `UINT32`/`INT32` to be `int`-sized and use `%u`, `%d`, and `%x` to print them.
- Assume `UINTN`/`INTN` to be of unspecified size, and cast them to `UINT64`/`INT64` for printing with `%Lu`, `%Ld` and so on as normal.
- Do not rely on integer promotions for numeric literals. Use explicit casts when the type is
implementation-dependent or suffixes when type size is known. Assume `U` for `UINT32` and `ULL` for `UINT64`.
- Do ensure unsigned arithmetics especially in bitwise maths, shifts in particular.
- `sizeof` operator should take variables instead of types where possible to be error prone. Use `ARRAY_SIZE` to obtain array size in elements. Use `L_STR_LEN` and `L_STR_SIZE` macros from `OcStringLib` to obtain string literal sizes to ensure compiler optimisation.
- Do not use `goto` keyword. Prefer early `return`, `break`, or `continue` after failing to pass error checking instead of nesting conditionals.
- Use `EFIAPI`, force UEFI calling convention, only in protocols, external callbacks between modules, and functions with variadic arguments.
- Provide inline documentation to every added function, at least describing its inputs, outputs, precondition, postcondition, and giving a brief description.
- Do not use `RETURN_STATUS`. Assume `EFI_STATUS` to be a matching superset that is to be always used when `BOOLEAN` is not enough.
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
- Do not use dots (`.`) in the end of debug messages and separate `EFI_STATUS`, printed by `%r`, with a hyphen (e.g. `OCRAM: Allocation of %u bytes failed - **%rtextbackslash n`).**
- Use `DEBUG_CODE_BEGIN ()` and `DEBUG_CODE_END ()` constructions to guard debug checks that may potentially reduce the performance of release builds and are otherwise unnecessary.
- Use `DEBUG` macro to print debug messages during normal functioning, and `RUNTIME_DEBUG` for debugging after `EXIT_BOOT_SERVICES`.
- Use `DEBUG_VERBOSE` debug level to leave debug messages for future debugging of the code, which are currently not necessary. By default `DEBUG_VERBOSE` messages are ignored even in `DEBUG` builds.
- Use `DEBUG_INFO` debug level for all non critical messages (including errors) and `DEBUG_BULK_INFO` for extensive messages that should not appear in NVRAM log that is heavily limited in size. These messages are ignored in `RELEASE` builds.
- Use `DEBUG_ERROR` to print critical human visible messages that may potentially halt the boot process, and `DEBUG_WARN` for all other human visible errors, `RELEASE` builds included.

When trying to find the problematic change it is useful to rely on [`git-bisect`](https://git-scm.com/docs/git-bisect) functionality.
