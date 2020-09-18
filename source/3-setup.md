---
title: 3. Setup
description: Setup
type: docs
author_info: 由 Sukka、derbalkon 整理、由 Sukka、derbalkon 翻译。
last_updated: 2020-09-18
---

## 3.1 目录结构

```
ESP
├── EFI
│    ├── BOOT
│    │    └── BOOTx64.efi
│    └── OC
│        ├── ACPI
│        │    ├── DSDT.aml
│        │    ├── SSDT-1.aml
│        │    └── MYTABLE.aml
│        ├── Bootstrap
│        │    └── Bootstrap.efi
│        ├── Drivers
│        │    ├── MyDriver.efi
│        │    └── OtherDriver.efi
│        ├── Kexts
│        │    ├── MyKext.kext
│        │    └── OtherKext.kext
│        ├── Resources
│        │    ├── Audio
│        │    ├── Font
│        │    ├── Image
│        │    └── Label
│        ├── Tools
│        │    └── Tool.efi
│        ├── OpenCore.efi
│        ├── config.plist
│        ├── vault.plist
│        └── vault.sig
├── boot
├── nvram.plist
├── opencore-YYYY-MM-DD-HHMMSS.txt
├── panic-YYYY-MM-DD-HHMMSS.txt
└── SysReport
```

<center><em><strong>Figure 1</strong>: 目录结构</em></center><br>

使用目录引导时，使用的目录结构应该遵循上述目录结构。可用的条目有：

- **BOOTx64.efi** 和 **Bootstrap.efi** --- 初始引导程序，用来加载 `OpenCore.efi`，除非 `OpenCore.efi` 已作为驱动程序启动。对于大部分固件来说，`BOOTx64.efi` 是 UEFI 默认启动项，而 `Bootstrap.efi` 可以被注册为自定义启动项，避免因 `BOOTx64.efi` 被其它操作系统（如 Windows）所覆盖而导致 OpenCore 无法启动。更多细节请参见 [BootProtect](8-misc.html#5-BootProtect)。
- **boot** --- Duet bootstrap loader，用于在传统 BIOS 固件上模拟 UEFI 环境、并加载 `OpenCore.efi`。
- **ACPI** --- 用于存储 ACPI 补充信息的目录。
- **Drivers** --- 用于存储 UEFI 补充驱动程序的目录。
- **Kexts** --- 用于存储内核驱动（kext）补充的目录。
- **Resources** --- 媒体资源使用的目录，如 屏幕朗读 的语音文件（见「UEFI Audio 属性」章节）。这一目录同时也用于存放 GUI 界面所使用的图片，见 `OpenCanopy` 相关章节。
- **Tools** --- 用于存储补充工具的目录。
- **OpenCore.efi** --- 主引导驱动程序，负责操作系统加载。
- **config.plist** --- OC Config（即 OpenCore 的配置文件，见「配置术语」）。
- **vault.plist** --- OC Config 可能加载的所有文件的哈希。
- **vault.sig** --- `vault.plist` 的签名文件。
- **SysReport** --- 存放 `SysReport` 功能产生的系统错误报告。
- **nvram.plist** --- OpenCore 变量导入文件。
- **opencore-YYYY-MM-DD-HHMMSS.txt** --- OpenCore 日志文件。
- **panic-YYYY-MM-DD-HHMMSS.txt** --- Kernal Panic 日志文件。

*注*: 受限于固件的实现行为，OpenCore 可能无法访问绝对路径长度大于 `OC_STORAGE_SAFE_PATH_MAX`（默认值为 128）的目录。

## 3.2 安装和升级

如果要安装 OpenCore，请在使用 GPT 格式的硬盘上、按照上一节的文件夹结构建立文件和文件夹。尽管本文档的相应部分的确提供了有关你所需的外部资源（如 ACPI 表、UEFI 驱动程序或 kexts）的某些信息，但是本文档不保证会提供关于这些外部资源的全部信息。关于 kext 的完整信息可以查看由 OpenCore 提供的 [可选 kext 列表](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Kexts.md)；而本文档也在安全属性的相关章节提供了 Vauting 的相关信息。

OpenCore 的配置文件可以使用任何常规的文本编辑器（如 nano、vim、VSCode）进行编辑，但是专用软件可以带来更好的体验。在 macOS 上我们推荐使用 [Xcode](https://developer.apple.com/xcode)。你也可以使用 [ProperTree](https://github.com/corpnewt/ProperTree) ，这是一个轻量级的跨平台的开源 plist 编辑器。

如果要通过 BIOS 进行开机，你必须使用第三方 UEFI 环境提供程序。`OpenDuetPkg` 是一个常用的为旧操作系统提供 Legacy 引导的 UEFI 环境提供程序。要在这样的旧操作系统上运行 OpenCore，你可以使用一个独立的工具 `BootInstall` 安装 `OpenDuetPkg`（目前已和 OpenCore 打包在一起发布）。

如果要升级 OpenCore，[`Differences.pdf`](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) 提供了 OpenCore 配置文件变更的相关信息，[`Changelog.md`](https://github.com/acidanthera/OpenCorePkg/blob/master/Changelog.md) 提供了 OpenCore 的更新日志。

> 译者注：以下两节是为准备参与 OpenCore 开发的人员准备的。

## 3.3 贡献代码

OpenCore 可以作为普通的 [EDK II](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II) 进行编译。由于 TianoCore 放弃了对 [UDK](https://github.com/tianocore/tianocore.github.io/wiki/UDK) 的开发，因此 OpenCore 需要使用 [EDK II Stable](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II#stable-tags)。目前支持的 EDK II 版本托管在 [acidanthera/audk](https://github.com/acidanthera/audk)。软件包所需的补丁在 `Patches` 目录下。

`XCODE5` 是官方唯一支持的工具链。使用其他工具链虽然也有可能正常工作，但我们的态度是既不推荐、也不支持。也欢迎贡献一些干净、简洁的补丁，代码规范务必遵循 [EDK II C Codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C)。

要使用 `XCODE5` 编译，除了 [Xcode](https://developer.apple.com/xcode) 之外，还需要安装 [NASM](https://www.nasm.us) 和 [MTOC](https://github.com/acidanthera/ocbuild/tree/master/external)。建议使用最新的 Xcode 版本，不必因为工具链叫 `XCODE5` 而纠结于 Xcode 的版本号。命令行举例如下：

```bash
git clone --depth=1 https://github.com/acidanthera/audk UDK
cd UDK
git submodule update --init --recommend-shallow
git clone --depth=1 https://github.com/acidanthera/OpenCorePkg
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p OpenCorePkg/OpenCorePkg.dsc
```

<center><em><strong>Listing 1</strong>: 编译指令</em></center><br>

对于 IDE 的用法，Xcode 项目可在资源库的根目录下使用。还有一种方法是使用 [Sublime Text](https://www.sublimetext.com) 并带有 [EasyClangComplete](https://niosus.github.io/EasyClangComplete) 插件。在你的 UDK 根目录下添加类似内容的 `.clang_complete` 文件：

```bash
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

<center><em><strong>Listing 2</strong>: ECC 配置</em></center><br>

{% note danger 警告 %}
工具开发人员修改 `config.plist` 或其他任何 OpenCore 文件时，都务必检查 `opencore-version` NVRAM 变量（详见后面的 `Debug Properties` 章节），如果版本号不支持或尚未发布，则需警告用户。OpenCore 配置可能因版本不同而改变，因此工具开发应仔细遵循本文档，否则可能会当作恶意软件并阻止发布。
{% endnote %}

## 3.4 代码约定

和其他项目一样，我们在开发过程中也有一些约定。强烈建议所有第三方贡献者在提交补丁之前仔细阅读并遵循以下约定。另外，我们也建议在发送补丁之前先在 [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker) 里讨论一下，以免与其他人的工作重复，导致你的补丁被拒绝。

**组织结构**。代码库包含在 `OpenCorePkg` 仓库中，它是主要的 EDK II 软件包。

- 每当需要在多个仓库中进行修改时，都应当分别向每个仓库发送拉取请求（Pull Requests）。
- 提交更改应该首先提交至依赖仓库，其次才是主仓库，以避免自动构建错误。
- 每个独立的提交都应该用 `XCODE5` 编译，并最好也用其他工具链编译。在大多数情况下都可以通过 [CI interface](https://travis-ci.com/acidanthera) 进行检查。最好确保静态分析不提示任何警告。
- 外部的拉取请求和标记的提交都必须经过验证。也就是说，在 master 中的提交可能会被构建，但并不一定成功。
- 内部分支应命名如下：`作者-名字-日期`，比如 `vit9696-ballooning-20191026`。
- 提交说明（Commit Messages）应该以更改的主要模块（如库或代码模块）为前缀。例如，`OcGuardLib: Add OC_ALIGNED macro`。对于非库的改变，则应使用 `Docs` 或者 `Build` 作为前缀。

**设计**。代码库是使用独立的 C11 (C17) 子集编写的，能够被 EDK II 使用的大多数较新的工具链支持。如果下面没有讨论特殊情况，建议使用常见的软件开发操作，或者另附解释说明。

- 永远不要依赖未定义的行为，也要尽量避免实施定义的行为，除非明确涉及到下面的情况（如果缺少相关案例，随时都可以创建一个 Issue，不必拘谨）。
- 使用 `OcGuardLib` 来确保安全的积分运算，避免溢出。依赖无符号数回绕（Unsigned Wraparound）时应当谨慎，不要增加不必要的数量。
- 用 `OcGuardLib` 检查指针是否正确对齐，虽然架构能够反引用未对齐的指针，但是不要依赖它。
- 必要时使用柔性数组成员（Flexible Array Member）替代长度为 0 或为 1 的数组。
- 使用静态断言（`STATIC_ASSERT`）进行类型和值的假设，使用运行时断言（`ASSERT`）进行前提条件和不变指标的合理性检查。不要使用运行时断言来检查错误，因为他们绝不应该控制业务流程，并且有可能被排除。
- 把 `UINT32`/`INT32` 默认为 `int` 大小，并用 `%u`、`%d` 和 `%x` 来打印。
- 把 `UINTN`/`INTN` 默认为未定大小，转换为 `UINT64`/`INT64`，与 `%Lu`、`%Ld` 等正常打印。
- 不要为了数字字面量而依赖整型提升。当类型为实现依赖（implementation-dependent）的时候，使用显式转换（Explicit Cast）；当类型大小已知的时候，使用后缀。默认 `U` 代表 `UINT32`， `ULL` 代表 `UINT64`。
- 尤其要确保按位运算时、特别是按位移位时，作无符号的算术。
- `sizeof` 运算符应该尽可能地采用变量，而不是类型，否则容易出错。使用 `ARRAY_SIZE` 获取数组的元素大小。使用 `OcStringLib` 中的 `L_STR_LEN` 和 `L_STR_SIZE` 宏，获取字符串文字大小，以保证编译器的优化。
- 不要使用 `goto` 关键词。宁可在未能通过错误检查时，提前使用 `return`、`break` 或 `continue`，也不要嵌套条件语句。
- 使用 `EFIAPI`，强制执行 UEFI 调用约定，只在模块之间的协议、外部回调和带有变量参数的函数中使用。
- 为每一个新增函数提供行内注释，至少要描述其输入、输出、前置条件、后置条件，并给出简要说明。
- 不要使用 `RETURN_STATUS`。把 `EFI_STATUS` 默认为一个当 `BOOLEAN` 不够用时将始终使用的、相匹配的超集。
- 违反安全规定的行为应停止系统运行或强制重启。

**代码规范**。代码库遵循 [EDK II codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C)，并作了些许改动和解释。

- 只为函数和变量写一次行内注释：在头文件中（如果有头文件原型）和 `static` 变量、函数的行内书写。
- 行长在 120 个字符（100 个字符更好）以内。
- 在转换后使用空格，如 `(VOID *)(UINTN) Variable`。
- 使用 SPDX 许可证标头，如 [acidanthera/bugtracker#483](https://github.com/acidanthera/bugtracker/issues/483) 所示。

**排错**。代码库中加入了 EDK II 调试和一些自定义功能，以改善体验。

- 调试信息应使用模块前缀，2-5 个字母，后面加一个冒号（`:`）。对于 `OpenCorePkg` 使用 `OC:`，对于库和驱动程序则使用自己独特的前缀。
- 不要在调试信息结尾使用句点（`.`），要将 `%r` 打印的 `EFI_STATUS` 用连字符隔开（例如 `OCRAM: Allocation of %u bytes failed - **%rtextbackslash n`）。
- 使用 `DEBUG_CODE_BEGIN ()` 和 `DEBUG_CODE_END ()` 结构来看守 可能会降低版本构建性能的 和 在其他方面不必要的 调试检查。
- 在正常工作时，使用 `DEBUG` 宏打印调试信息，在 `EXIT_BOOT_SERVICES` 后使用 `RUNTIME_DEBUG` 进行调试。
- 使用 `DEBUG_VERBOSE` 调试级别留下信息，这些信息虽然目前用不到，但可以方便用于以后的调试。默认情况下， `DEBUG_VERBOSE` 信息即使在 `DEBUG` 构建中也会被忽略。
- 使用 `DEBUG_INFO` 调试级别来处理所有非关键信息（包括错误），使用 `DEBUG_BULK_INFO` 来处理不应该出现在 NVRAM 日志中的大量信息，因为 NVRAM 日志的大小十分受限。这些信息在 `RELEASE` 构建中会被忽略。
- 使用 `DEBUG_ERROR` 来打印关键的、可以看见的、可能会停止启动过程的信息，使用 `DEBUG_WARN` 来打印所有其他可被看见的错误信息，这些都包含在 `RELEASE` 构建中。

当试图找到有问题的更改时，依靠 [`git-bisect`](https://git-scm.com/docs/git-bisect) 功能会很有帮助。另外还有一些非官方资源，提供了按照逐条 Commit 更新的 OpenCore 编译文件，如 [Dortania](https://dortania.github.io/builds)。
