---
title: 12. 排错
description: Troubleshooting（待翻译）
type: docs
author_info: 由 xMuu 整理，由 Sukka 翻译
---

## 12.1 Windows 支持

### 我能安装 Windows 系统吗？

虽然 OpenCore 并没有提供官方的 Windows 支持，但是使用 Boot Camp 安装 64 位 UEFI Windows（即 Windows 8 及更高版本）应该是可以正常工作的。安装第三方 UEFI、或者仅部分支持 UEFI 引导的系统（如 Windows 7）可能需要额外注意。不论如何，记住以下几点：

- MBR (Master Boot Record) 属于 Legacy 引导，因此将不会被支持。
- 在同一块硬盘上安装 Windows、macOS 和 OpenCore 时，你尅在 `BlessOverride` 部分中指定 Windows Bootloader 的路径（`\EFI\Microsoft\Boot\bootmgfw.efi`）。
- 在 OpenCore 上应用的所有更改（ACPI、NVRAM、SMBIOS）都应该与操作系统本身无关。OpenCore 会将这些改动生效于所有操作系统，这样在 Windows 上可以获得 Boot Camp 的体验。
- macOS 要求硬盘中的第一份分区为 EFI 分区，并且与 Windows 的默认布局不支持。尽管 OpenCore 确实提供了一个 [解决方法](https://github.com/acidanthera/bugtracker/issues/327)，但是强烈建议不要依赖这个方法。
- Windows 系统可能需要重新激活。为了避免这种情况发生，请考虑将 SystemUUID 设置为原始固件的 UUID。请注意，在旧固件上 UUID 可能是无效的（非随机的）。如果你还遇到了什么问题，可以考虑使用 HWID 或 KMS38 的 Windows 许可证。Windows 激活的细节不在本文档的讨论范围内，你应该能够在网上查找到相关资料。

### 我需要安装其他什么软件吗？

在大多数情况下，要启用多操作系统切换、安装相关驱动程序，你将需要 [Boot Camp](https://support.apple.com/boot-camp) 提供的 Windows 支持软件。为了简化下载过程、或者配置硬盘中已经安装好的 Windows，可以使用 [Brigadier](https://github.com/timsutton/brigadier) 这个实用软件。请注意在使用 Brigadier 之前，你可能需要先下载并安装[7-Zip](https://www.7-zip.org)。

> 译者注：[7-zip 官方中文网站](https://sparanoid.com/lab/7z/)

记住，一定要使用最新版本的 Boot Camp 的 Windows 支持软件。6.1 之前的版本不支持 APFS 文件系统、因此无法运行。要下载最新的软件，请将最新 Mac 的型号作为参数传递给 Brigadier，如 `./brigadier.exe -m iMac19,1`。之后，在不受支持的 Mac 型号上安装 Boot Camp，请以管理员身份运行 PowerShell，输入 `msiexec /i BootCamp.msi` 即可。如果你之前不小心已经安装了旧版本的 Boot Camp，则必须先通过运行 `msiexec /x BootCamp.msi` 将其卸载。`BootCamp.msi` 文件位于 `BootCamp/Drivers/Apple` 目录中、可以通过资源管理器访问。

> 译者注：在资源管理器下，按住 <kbd>Shift</kbd> 同时右击窗口中空白处，此时菜单中会显示「在此处运行 PowerShell」，即在当前目录下运行 PowerShell。但是这种方式启动的 PowerShell 不具备管理员权限。

尽管 Boot Camp 提供的 Windows 支持软件解决了大多数兼容性问题，但是有时候您还是需要手动解决一些问题：

- 要反转鼠标滚轮的滚动方向，必须按照 [这个网站](https://superuser.com/a/364353) 提供的方法、设置 `FlipFlopWheel` 的值为 `1`。

> 译者注：
> 涉及到的注册表是 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Enum\HID\VID_???\VID_???\Device Parameters.`
> 你可以在 PowerShell 中执行下述命令进行设置；
>
> ```powershell
> # 获取当前设置
> Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Enum\HID\*\*\Device` Parameters FlipFlopWheel -EA 0
> # 修改设置
> # 鼠标滚动方向 相反 FlipFlopWheel 1
> # 鼠标滚动方向 自然滚动 FlipFlopWheel 0
> Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Enum\HID\*\*\Device` Parameters FlipFlopWheel -EA 0 | ForEach-Object { Set-ItemProperty $_.PSPath FlipFlopWheel 1 }
> ```
>
> 如果需要撤销更改，可以使用下述命令：
> ```powershell
> # 恢复鼠标滚动方向
> Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Enum\HID\*\*\Device` Parameters FlipFlopWheel -EA 1 | ForEach-Object { Set-ItemProperty $_.PSPath FlipFlopWheel 0 }
> ```

- `RealTimeIsUniversal` 必须设置为 `1` 以避免 Windows 和 macOS 之间的时间不同步。

> 译者注：众所周知，Windows 将硬件时间视为本地时间，而 macOS 会计算 UTC 后当做系统时间。通过修改上述提到的注册表值，可以让 Windows 将硬件时间视为 UTC 时间。用到的 CMD 命令如下所示：
> ```cmd
> Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1
> ```

- 如果要访问 Apple 的文件系统（APFS、HFS），你可能需要安装单独的软件。已知的工具有 [Apple HFS+ driver](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/) ([hack for Windows 10](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/page-4#post-24180079))、[HFSExplorer](http://www.catacombae.org/hfsexplorer)、MacDrive、Paragon APFS、Paragon HFS+、TransMac，等等。

> 译者注：**切记不要在 Windows 下写入 APFS 或 HFS，十有八九你会导致分区表错误和无法恢复的数据丢失。别怪我们没有警告过你！！**

### 为什么我会在 Boot Camp 启动硬盘 控制面板 中看到 `Basic data partition`？

Boot Camp 使用 GPT 分区表获取每个引导选项的名称。独立安装 Windows 后，你必须手动重新标记分区。这可以挺过许多工具完成，比如开源的 [gdisk](https://sourceforge.net/projects/gptfdisk)，使用方法如下：

> **Listing 3: Relabeling Windows volume**

```powershell
PS C:\gdisk> .\gdisk64.exe \\.\physicaldrive0
GPT fdisk (gdisk) version 1.0.4

Command (? for help): p
Disk \\.\physicaldrive0: 419430400 sectors, 200.0 GiB
Sector size (logical): 512 bytes
Disk identifier (GUID): DEC57EB1-B3B5-49B2-95F5-3B8C4D3E4E12
Partition table holds up to 128 entries
Main partition table begins at sector 2 and ends at sector 33
First usable sector is 34, last usable sector is 419430366
Partitions will be aligned on 2048-sector boundaries
Total free space is 4029 sectors (2.0 MiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048         1023999   499.0 MiB   2700  Basic data partition
   2         1024000         1226751   99.0 MiB    EF00  EFI system partition
   3         1226752         1259519   16.0 MiB    0C01  Microsoft reserved ...
   4         1259520       419428351   199.4 GiB   0700  Basic data partition

Command (? for help): c
Partition number (1-4): 4
Enter name: BOOTCAMP

Command (? for help): w

Final checks complete. About to write GPT data. THIS WILL OVERWRITE EXISTING PARTITIONS!!

Do you want to proceed? (Y/N): Y
OK; writing new GUID partition table (GPT) to \\.\physicaldrive0.
Disk synchronization succeeded! The computer should now use the new partition table.
The operation has completed successfully.
```

### 如何选择 NTFS 驱动程序

提供 NTFS 读写支持的第三方驱动程序，如 [NTFS-3G](https://www.tuxera.com/community/open-source-ntfs-3g)、Paragon NTFS、Tuxera NTFS 或 [希捷移动硬盘 Paragon 驱动程序](https://www.seagate.com/support/software/paragon) 会破坏 macOS 的功能，比如 系统偏好设置 中的 启动磁盘 选项。
虽然我们仍然不建议使用这些经常破坏文件系统的驱动程序（我们推荐使用 macOS 内建的 NTFS 读写支持，可以通过终端或 GUI 启用），但是这些驱动程序的厂商也提供了他们各自的解决方案，在这里我们仅列举两个：

- [Tuxera 的常见问题解答页面](https://www.tuxera.com/products/tuxera-ntfs-for-mac/faq)
- [Paragon 相关的技术支持文档](https://kb.paragon-software.com/article/6604)

## 12.2 调试

与其他硬件相关的项目类似，OpenCore 也支持审计与调试。使用 NOOPT 或 DEBUG 构建版本（而非 RELEASE 构建版本）可以产生更多的调试输出。对于 NOOPT 构建版本，你还可以使用 GDB 或 IDA Pro 进行调试。对于 GDB 请查看 [OcSupport Debug](https://github.com/acidanthera/OcSupportPkg/tree/master/Debug) 相关页面；对于 IDA Pro，你需要 7.3 或更高版本，更多详细信息请参考 IDA Pro 提供的页面：[Debugging the XNU Kernel with IDA Pro](https://www.hex-rays.com/products/ida/support/tutorials/index.shtml)。

To obtain the log during boot you can make the use of serial port debugging. Serial port debugging is enabled in `Target`, e.g. `0xB` for onscreen with serial. OpenCore uses `115200` baud rate, `8` data bits, no parity, and `1` stop bit. For macOS your best choice are CP2102-based UART devices. Connect motherboard `TX` to USB UART `RX`, and motherboard `GND` to USB UART `GND`. Use `screen` utility to get the output, or download GUI software, such as [CoolTerm](https://freeware.the-meiers.org).

*注释*: On several motherboards (and possibly USB UART dongles) PIN naming may be incorrect. It is very common to have `GND` swapped with `RX`, thus you have to connect motherboard `"TX"` to USB UART `GND`, and motherboard `"GND"` to USB UART `RX`.

Remember to enable `COM` port in firmware settings, and never use USB cables longer than 1 meter to avoid output corruption. To additionally enable XNU kernel serial output you will need `debug=0x8` boot argument.

## 12.3 技巧和窍门

### 1. 啊呀呀呀我系统没法启动了我该怎么看日志啊？

通常情况下，获取实际的错误信息就足够了。为此，请确保：

- 你正在使用 OpenCore 的 DEBUG 或 NOOPT 版本。
- 日志已启用（`1`）并且在屏幕上显示（`2`）：`Misc => Debug => Target = 3`.
- 将以下这些等级的日志输出到屏幕上：`DEBUG_ERROR` (`0x80000000`)、`DEBUG_WARN` (`0x00000002`) 和 `DEBUG_INFO` (`0x00000040`)：`Misc => Debug => DisplayLevel = 0x80000042`.
- 遇到 `DEBUG_ERROR` 这样的致命错误时中止启动：`Misc => Security => HaltLevel = 0x80000000`。
- 禁用 Watch Dog 以避免自动重启：`Misc => Debug => DisableWatchDog = true`。
- 已启用 启动菜单 显示：`Misc => Boot => ShowPicker = true`

如果你在日志中看不出明显的错误，请逐一检查 Quirks 部分中可用的 hacks。例如，对于 Early Boot 出现的问题（如 OpenCore 启动菜单无法显示），通过 [UEFI Shell](https://github.com/acidanthera/OpenCoreShell) 可以查看相关调试信息。

### 2. 如何自定义启动项？

OpenCore 遵循 Apple Bless 标准模型、从引导目录中的 `.contentDetails` 和 `.disk_label.contentDetails` 文件中提取条目名称。这些文件包含带有输入标题的 ASCII 字符串，你可以修改它们。

### 3. 如何选择默认启动的系统？

OpenCore 使用 UEFI 首选启动项 来选择默认的启动项。设置的方式随 BIOS 不同而不同，具体请参考 macOS [启动磁盘](https://support.apple.com/HT202796) 或 Windows [Boot Camp](https://support.apple.com/guide/bootcamp-control-panel/start-up-your-mac-in-windows-or-macos-bcmp29b8ac66/mac) 控制面板。

由于使用 OpenCore 提供的 `BOOTx64.efi` 作为首选启动项会限制这项功能（可能还会导致一些固件删除不兼容的引导选项），我们强烈建议你修改 `RequestBootVarRouting` quirk，这会将你所做的选择保留在 OpenCore 变量空间中。请注意，`RequestBootVarRouting` 需要单独的 `.efi` 驱动文件。

### 4. 安装 macOS 最简单的方法是什么？

在线安装。将 Recovery 镜像（`*.dmg` 和 `*.chunklist` 文件）和 OpenCore 一起复制到一个 FAT32 分区中。加载 OpenCore 的启动菜单并选择后缀为 `.dmg` 的条目。如果你有强迫症，你可以修改 `.contentDetails` 文件改变条目显示的文字。

你可能会用到 [MacInfoPkg](https://github.com/acidanthera/MacInfoPkg/releases) 内置的 [macrecovery.py](https://github.com/acidanthera/MacInfoPkg/blob/master/macrecovery/macrecovery.py) 来下载 Recovery 镜像。

如果你需要进行离线安装，请参考 [How to create a bootable installer for macOS](https://support.apple.com/HT201372)。除了通过 App Store 或 系统更新，你还可以使用 [第三方工具](https://github.com/corpnewt/gibMacOS) 下载 macOS 镜像文件。

### 5. 为什么无法加载 Recovery 恢复镜像 进行在线安装？

可能是因为你没带 HFS+ 驱动。目前我们所知道的 Recovery 分区全都是 HFS+ 文件系统。

### 6. 我可以在 Apple 的硬件、或虚拟机中使用 OpenCore 吗？

~~下一个问题~~
~~可以，没有必要，但请加大力度~~

OpenCore 支持包括 MacPro 5,1 和虚拟机在内的大部分较新的 Mac 想好。不过，OpenCore 与 Mac 硬件的具体细节微乎其微，你可以在 [acidanthera/bugtracker#377](https://github.com/acidanthera/bugtracker/issues/377) 查看相关讨论。

### 7. 为什么 Find 和 Replace 的补丁的长度必须相等？

对于 x86 机器码来说，[相对寻址](https://en.wikipedia.org/w/index.php?title=Relative_addressing) 无法进行大小不同的替换。对于 ACPI 代码来说这是有风险的，而且在技术上这与替换 ACPI 表等价，所以 OpenCore 没有实现。更多详细的解答可以在 [AppleLife.ru](https://applelife.ru/posts/819790) 上找到。

### 8. 我如何从 `AptioMemoryFix` 迁移到 OpenCore?

可以通过安装 `FwRuntimeServices.efi` 驱动程序并启用以下列出的 quirk 来获得与 `AptioMemoryFix` 类似的行为。 请注意，其中大多数功能都不需要启用。有关更多详细信息，请参阅本文档中关于它们的单独描述。

- `ProvideConsoleGop` (UEFI quirk)
- `AvoidRuntimeDefrag`
- `DiscardHibernateMap`
- `EnableSafeModeSlide`
- `EnableWriteUnprotector`
- `ForceExitBootServices`
- `ProtectCsmRegion`
- `ProvideCustomSlide`
- `SetupVirtualMap`
- `ShrinkMemoryMap`
