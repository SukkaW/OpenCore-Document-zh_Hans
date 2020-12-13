---
title: 9. NVRAM
description: NVRAM 注入（如引导标识符和 SIP）
type: docs
author_info: 由 xMuu、Sukka 整理，由 Sukka、derbalkon 翻译
last_updated: 2020-12-13
---

## 9.1 简介

设置易失性 UEFI 变量（通常被称作 NVRAM 变量），数据类型为 `plist dict`。使用 `man nvram` 获取详细信息。macOS 广泛使用 NVRAM 变量使 操作系统、BootLoader、固件 之间互通，因此需要提供多个 NVRAM 变量才能正常运行 macOS。

每个 NVRAM 变量均由其名称、值、属性（参考 UEFI 规范）以及 [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 组成，表示 NVRAM 变量属于哪一区域。macOS 使用如下（包括但不限于）几种 GUID：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14` (`APPLE_VENDOR_VARIABLE_GUID`)
- `7C436110-AB2A-4BBB-A880-FE41995C9F82` (`APPLE_BOOT_VARIABLE_GUID`)
- `8BE4DF61-93CA-11D2-AA0D-00E098032B8C` (`EFI_GLOBAL_VARIABLE_GUID`)
- `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102` (`OC_VENDOR_VARIABLE_GUID`)

*注*：某些变量可以通过 `PlatformNVRAM` 或 `PlatformInfo` 节的 `Generic` 子节添加。请确保本节中的变量不会与它们发生冲突，否则可能导致未定义的行为。

为了使 macOS 正常运行，通常需要使用 `OC_FIRMWARE_RUNTIME` 协议。该协议的实现目前是 `OpenRuntime`（原名 `FwRuntimeServices.efi`）驱动程序的一部分。虽然可能带来一些好处，但根据用途不同也会存在某些限制。

- 并非所有工具都可能知道受保护的名称空间。当使用 `RequestBootVarRouting` 时，在独立的命名空间中会限制对 `Boot` 前缀的变量访问。要访问原始变量，工具必须了解 `OC_FIRMWARE_RUNTIME` 协议的工作原理。

## 9.2 属性列表

### 1. `Add`

**Type**: `plist dict`
**Description**: 从一组 GUID 映射（`plist dict`）中读取格式为 `plist metadata` 的变量映射，并将其添加到 NVRAM 中。GUID 必须以 Canonical String 格式提供，大写或小写均可（如 `8BE4DF61-93CA-11D2-AA0D-00E098032B8C`）。

创建的变量会设置 `EFI_VARIABLE_BOOTSERVICE_ACCESS` 和 `EFI_VARIABLE_RUNTIME_ACCESS` 的属性。变量只有在不存在且未被屏蔽的情况下才会被设置，也就是说，如果想要覆盖一个现有的变量值，请将该变量的名称添加到 `Delete` 部分，这种方法能够提供一个默认的值，直到操作系统接手为止。

*注*：如果 `plist key` 不符合 GUID 格式，则可能出现一些未定义的行为。

### 2. `Delete`

**Type**: `plist dict`
**Description**: 从一组 GUID 映射（`plist dict`）读取一组包含 `plist string` 的数组（`plist array`），这些将会被从 NVRAM 变量中被删除。

### 3. `LegacyEnable`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许从 ESP 分区的根目录中的 `nvram.plist` 文件读取 NVRAM 变量。

该文件必须以 `plist dictionary` 为文件根格式，并包含以下两个字段：

- `Version` --- `plist integer`，文件版本，必须设定为 1。
- `Add` --- `plist dictionary`，等同于 `config.plist` 中的 `Add`。

变量加载优先于 `Delete`（以及 `Add`）阶段。除非启用了 `LegacyOverwrite`，否则不会覆盖现有的任何变量。允许设置的变量必须指定于 `LegacySchema` 中。第三方脚本可以用来创建 `nvram.plist` 文件，脚本示例可参照 `Utilities`。使用第三方脚本可能要将 `ExposeSensitiveData` 设置为 `0x3` 来为 `boot-path` 变量提供 OpenCore EFI 分区的 UUID。

{% note danger 警告 %}
这一功能非常危险，因为会将不受保护的数据传递给固件中的变量服务。只有在你的硬件不提供硬件 NVRAM 或与之不兼容时才使用。
{% endnote %}

### 4. `LegacyOverwrite`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许用 `nvram.plist` 文件中的变量覆盖现有 NVRAM 中的变量。

*注*：只有操作系统访问的到的变量会被覆盖。

### 5. `LegacySchema`

**Type**: `plist dict`
**Description**: 允许从 GUID 映射（`plist dict`）中选择 NVRAM 变量设置到一个变量名称数组（`plist array`），格式为 `plist string`。

可用 `*` 值来接受所有用来选择 GUID 的变量。

{% note danger 警告 %}
选择变量要非常慎重，因为 nvram.plist 不会被存储。比如，不要把 `boot-args` 或 `csr-active-config` 放进去，因为会绕过 SIP。
{% endnote %}

### 6. `WriteFlash`

**Type**: `plist boolean`
**Failsafe**: `false`
**Description**: 允许将所有添加的变量写入闪存。

*注*：这个 Quirk 本应该在大多数固件上启用，但是由于可能存在 NVRAM 变量存储 GC 或类似的问题的固件，所以我们将这个 Quirk 设计为可配置的。

要从 macOS 中读取 NVRAM 变量的值，可以使用 `nvram`，并将变量 GUID 和名称用 `:` 符号隔开，形如 `nvram 7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args`。

变量列表可参照相关文档（持续更新）：[NVRAM Variables](https://docs.google.com/spreadsheets/d/1HTCBwfOBkXsHiK7os3b2CUc6k68axdJYdGl-TyXqLu0)。

## 9.3 必需变量

{% note danger 警告 %}
这些变量可通过 PlatformNVRAM 或 PlatformInfo 的 Generic 部分添加。推荐使用 `PlatformInfo` 来设置这些变量。
{% endnote %}

以下变量为 macOS 运行必需：

- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures`
  32 位 `FirmwareFeatures`。存在于所有 Mac 上，用来避免额外解析 SMBIOS 表。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask`
  32 位 `FirmwareFeaturesMask`。存在于所有 Mac 上，用来避免额外解析 SMBIOS 表。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB`
  `BoardSerialNumber`。存在于较新的 Mac 上（至少 2013 年以后），用来避免额外解析 SMBIOS 表，尤其是在 `boot.efi` 中。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM`
  主要的网络适配器的 MAC 地址或替换值。存在于较新的 Mac（至少 2013 年以后）上，用来避免访问特殊内存区域，尤其是在 `boot.efi` 中。

## 9.4 建议变量

建议使用以下变量来加快启动速度或改善其他表现：

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:csr-active-config`
  系统完整性保护的位掩码（32-bit），声明于 XNU 源码 [csr.h](https://opensource.apple.com/source/xnu/xnu-4570.71.2/bsd/sys/csr.h.auto.html)。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures`
  结合 `FirmwareFeatures` 和 `ExtendedFirmwareFeatures`。存在于较新的 Mac 上，用来避免额外解析 SMBIOS 表。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask`
  结合 `FirmwareFeaturesMask` 和 `ExtendedFirmwareFeaturesMask`。存在于较新的 Mac 上，用来避免额外解析 SMBIOS 表。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_BID`
  硬件 `BoardProduct`（如 `Mac-35C1E88140C3E6CF`）。在真正的 Mac 上不存在，但可用于避免额外解析 SMBIOS 表，尤其是在 `boot.efi` 中。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_MLB`
  硬件 `BoardSerialNumber`。覆盖 MLB，存在于较新的 Mac 上（至少 2013 年以后）。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW_ROM`
  硬件 ROM。覆盖 ROM，存在于较新的 Mac 上（至少 2013 年以后）。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:prev-lang:kbd`
  定义默认键盘布局的 ASCII 字符串。格式为 `lang-COUNTRY:keyboard`，例如 `ru-RU:252` 代表俄语和 ABC 键盘。也接受简短形式：`ru:252` 或 `ru:0`（美国键盘，兼容 10.9）。完整的键盘列表解码来自 `AppleKeyboardLayouts-L.dat`，可前往[这里](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/AppleKeyboardLayouts)查看。与之前或之后的 macOS 版本不同，在 10.14 上，使用非拉丁语键盘将无法启用 ABC 键盘，因此假如你需要使用 10.14 版本则不建议你使用这一变量。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:security-mode`
  定义 FireWire 安全模式的 ASCII 字符串。这一变量旧版本才有，可在 [IOFireWireController.cpp](https://opensource.apple.com/source/IOFireWireFamily/IOFireWireFamily-473/IOFireWireFamily.kmodproj/IOFireWireController.cpp.auto.html) 中的 IOFireWireFamily 源码里找到。建议不要设置这个变量，这样可能会加快启动速度。设置为 `full` 等同于不设置该变量，设置为 `none` 将禁用 FireWire 安全性。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:UIScale`
  定义 `boot.efi` 用户界面缩放比例的一字节数据。普通屏幕应为 **01**，HiDPI 屏幕应为 **02**。
- `4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:DefaultBackgroundColor`
  定义 `boot.efi` 用户界面背景色的四字节 `BGRA` 数据。标准色包括 **BF BF BF 00**（浅灰）和 **00 00 00 00**（西拉黑）。其他颜色可根据用户喜好设置。

## 9.5 其他变量

以下变量对于某些特定的配置或进行故障排除可能会很有用：

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args`
  内核参数，用于将配置传递给 Apple 内核和驱动程序。很多参数可以通过在内核或驱动程序代码中寻找 `PE_parse_boot_argn` 函数找到。已知的引导参数包括：

  - `acpi_layer=0xFFFFFFFF`
  - `acpi_level=0xFFFF5F` --- 表示 [`ACPI_ALL_COMPONENTS`](https://github.com/acpica/acpica/blob/master/source/include/acoutput.h)
  - `arch=i386` --- 强制内核架构为 `i386`，详见 `KernelArch` 选项
  - `batman=VALUE` --- `AppleSmartBatteryManager` 调试掩码
  - `batman-nosmc=1` --- 禁用 `AppleSmartBatteryManager` SMC 接口
  - `cpus=VALUE` --- 最大可用 CPU 数量
  - `debug=VALUE` --- Debug 掩码
  - `io=VALUE` --- `IOKit` 调试掩码
  - `keepsyms=1` --- 显示 Panic 日志调试符号
  - `kextlog=VALUE` --- Kext 调试掩码
  - `nvram-log=1` --- 启用 AppleEFINVRAM 日志
  - `nv_disable=1` --- 禁用 NVIDIA GPU 加速
  - `nvda_drv=1` --- 启用 NVIDIA web driver 的传统方法，这一参数在 macOS 10.12 中被去除
  - `npci=0x2000` --- [旧方法](https://www.insanelymac.com/forum/topic/260539-1068-officially-released/?do=findComment&comment=1707972) 禁用 `kIOPCIConfiguratorPFM64`
  - `lapic_dont_panic=1`
  - `slide=VALUE` --- 手动设置 KASLR 偏移值
  - `smcdebug=VALUE` --- `AppleSMC` 调试掩码
  - `-amd_no_dgpu_accel` --- 替代 [WhateverGreen](https://github.com/acidanthera/WhateverGreen) 的 `-radvesa`，用于较新的 GPUs
  - `-nehalem_error_disable`
  - `-no_compat_check` --- 禁用机型检查（适用于 10.7 以上的版本）
  - `-s` --- 单用户模式
  - `-v` --- 啰嗦模式
  - `-x` --- 安全模式

  这里有一些网站收集了 macOS 内置的启动参数列表：[列表 1](https://osxeon.wordpress.com/2015/08/10/boot-argument-options-in-os-x)、[列表 2](https://superuser.com/questions/255176/is-there-a-list-of-available-boot-args-for-darwin-os-x).

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg`
  Booter 参数，类似于 `boot-args`，但用于 `boot.efi` 。接受参数为一组十六进制的 64 位值，带或不带 `0x`。在不同阶段，`boot.efi` 会请求不同的调试（日志）模式（例如，在 `ExitBootServices` 之后它只会打印到串行调试接口）。有些 Booter 参数会控制这些请求是否成功。下面是已知请求的列表：

  - `0x00` – `INIT`
  - `0x01` – `VERBOSE` （如 `-v`，强制控制台记录日志）
  - `0x02` – `EXIT`
  - `0x03` – `RESET:OK`
  - `0x04` – `RESET:FAIL` （如未知的 `board-id`，休眠错配，Panic 循环，等等）
  - `0x05` – `RESET:RECOVERY`
  - `0x06` – `RECOVERY`
  - `0x07` – `REAN:START`
  - `0x08` – `REAN:END`
  - `0x09` – `DT` （不再将日志记录到设备树）
  - `0x0A` – `EXITBS:START` （仅强制的串行调试接口）
  - `0x0B` – `EXITBS:END` （仅强制的串行调试接口）
  - `0x0C` – `UNKNOWN`

  在 10.15 中，由于某种重构和 [新调试协议](https://github.com/acidanthera/OpenCorePkg/blob/master/Include/Apple/Protocol/AppleDebugLog.h) 的引入，10.15.4 之前的调试支持基本上不能用了。下面的一些参数和值可能不适用于 10.15.4 之前的版本。以下是已知参数的列表：

  - `boot-save-log=VALUE` --- 正常启动时的调试日志保存模式
    - `0`
    - `1`
    - `2` --- 默认
    - `3`
    - `4` --- 保存到文件
  - `wake-save-log=VALUE` --- 休眠唤醒时的调试日志保存模式
    - `0` --- 禁用
    - `1`
    - `2` --- 默认
    - `3` --- 不可用
    - `4` --- 保存到文件，不可用
  - `breakpoint=VALUE` --- 调试中断相关（在产品 `boot.efi` 中缺少）
    - `0` --- 禁用错误时的调试中断（默认）
    - `1` --- 启用错误时的调试中断
  - `console=VALUE` --- 启用控制台日志记录
    - `0` --- 禁用控制台日志记录
    - `1` --- 当缺少调试协议时，启用控制台日志记录（默认）
    - `2` --- 无条件启用控制台日志记录（不可用）
  - `embed-log-dt=VALUE` --- 设备树日志记录相关
    - `0` --- 禁用设备树日志记录
    - `1` --- 启用设备树日志记录
  - `kc-read-size=VALUE` --- 用于网络或磁盘缓冲 I/O 的数据块大小，用于预链接内核读取和相关用途。默认设置为 1MB
  (0x100000)，可以通过调整使启动更快
  - `log-level=VALUE` --- 日志等级位掩码
    - `0x01` --- 启用跟踪记录（默认）
  - `serial=VALUE` --- 串行控制台日志记录相关
    - `0` --- 禁用串行日志记录（默认）
    - `1` --- 从 `EXITBS:END` 开始启用串行日志记录
    - `2` --- 从 `EXITBS:START` 开始启用串行日志记录
    - `3` --- 当缺少调试协议时，启用串行日志记录
    - `4` --- 无条件启用串行日志记录
  - `timestamps=VALUE` --- 时间戳日志记录相关
    - `0` --- 禁用时间戳记录
    - `1` --- 启用时间戳记录（默认）
  - `log=VALUE` --- 10.15 开始弃用
    - `1` --- AppleLoggingConOutOrErrSet/AppleLoggingConOutOrErrPrint (classical ConOut/StdErr)
    - `2` --- AppleLoggingStdErrSet/AppleLoggingStdErrPrint (StdErr or serial?)
    - `4` --- AppleLoggingFileSet/AppleLoggingFilePrint (BOOTER.LOG/BOOTER.OLD file on EFI partition)
  - `debug=VALUE` --- 10.15 开始弃用
    - 1 --- 启用输出到 BOOTER.LOG（如果出现了被精简过的代码，则意味着可能发生过崩溃）
    - 2 --- 启用性能日志（Perf Log），记录到 /efi/debug-log
    - 4 --- 为调用 printf 启用时间戳输出
  - `level=VALUE` --- 10.15 开始弃用
    `DEBUG` 输出的详细程度。默认除 `0x80000000` 以外，其他内容都会被精简掉。

  *注*：如要查看现代 macOS 版本上的 `boot.efi` verbose 输出，请启用 `AppleDebug` 选项。这样会把日志保存到通用 OpenCore 日志中。对于 10.15.4 之前的版本，将 `bootercfg` 设置为 `log=1`，可以将 verbose 输出打印在屏幕上。

- `7C436110-AB2A-4BBB-A880-FE41995C9F82:efiboot-perf-record`
  启用 `boot.efi` 中的性能日志保存功能。性能日志会被保存到物理内存中，并通过 `efiboot-perf-record-data` 和 `efiboot-perf-record-size` 变量进行指向。从 10.15.4 开始，它也可以通过 `AppleDebug` 选项保存到 OpenCore 日志中。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg-once`
  在首次启动后删除 Booter 参数覆盖，否则等同于 `bootercfg`。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:fmm-computer-name`
  当前保存的主机名称，格式为 ASCII 字符串。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:nvda_drv`
  NVIDIA Web Driver 的控制变量。用 ASCII 数字 `1` 来启用或用 `0` 来禁用已安装的驱动程序。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:run-efi-updater`
  覆盖 macOS 中对 EFI 固件更新（MultiUpdater、ThorUtil）等的支持。将此值设置为 `No` 或其他可以转换为布尔类型的值将能够禁用 10.10 起的 macOS 固件更新。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:StartupMute`
  开机时禁用固件引导提示音。8 进制整数。`0x00` 指代不静音、其他任何值（或缺少该值）表示静音。
- `7C436110-AB2A-4BBB-A880-FE41995C9F82:SystemAudioVolume`
  固件音频支持的系统音频音量等级。8 进制整数。`0x80` 指代静音。低位用于编码安装的音频编码解码器的音量范围。该值以 `MaximumBootBeepVolume` AppleHDA layout 值为上限，以避免固件中的音频播放声音过大。
