---
title: 12. 排错
description: 当你遇到问题的时候应该看看这个
type: docs
author_info: 由 xMuu、Sukka、derbalkon 整理，由 Sukka、derbalkon 翻译
last_updated: 2020-09-07
---

## 12.1 旧版 Apple 操作系统

旧版操作系统的安装可能比较复杂，但有时出于各种原因还是需要用到。主板标识符和 CPUID 的兼容性是旧版操作系统正常运行的基础，除此之外还有一些细枝末节的事情需要注意。本章节将尽量阐述与旧版 macOS 操作系统相关的一系列常见问题。

### 1. macOS 10.8 和 10.9

- 这两个系统的磁盘映像使用的是 Apple 分区方案（Apple Partitioning Scheme），需要用到专门的 `PartitionDxe` 驱动程序来进行 DMG 恢复和安装。可以将 `DmgLoading` 设置为 `Disabled`，这样就可以在不加载 DMG 的情况下运行恢复功能，同时也避免了 `PartitionDxe` 的需求。
- 缓存的内核映像通常不包括网络（`IONetworkingFamily`）或音频（`IOAudioFamily`）的家族驱动，这些家族驱动往往需要使用 `Force` 加载来注入。

### 2. macOS 10.7

- 同上。
- 包括 Lilu 及其插件在内的许多 Kext 在 macOS 10.7 或更低版本上都不支持，它们所需的内核 API 比较新，不在 macOS 10.7 SDK 之中。
- macOS 10.8 之前的系统不支持 KASLR slide，因此会导致内存较低的固件分配内存失败，详见 [acidanthera/bugtracker#1125](https://github.com/acidanthera/bugtracker/issues/1125)。
- 不支持 32 位内核交互，因此内核的修补或注入是无效的。

### 3. macOS 10.6

- 上述问题均存在。
- 最近发布的 macOS 10.6 安装镜像为 macOS 10.6.7 版本 `10J3250`（`MacBookPro8,x` 专用）和 `10J4139`（`iMac12,x` 专用，不含 Xcode）。这些镜像仅限于特定的几款机型，并且不支持使用 `-no_compat_check` 来忽略兼容性检查。如果你拥有 macOS 10.6 的合法副本，又不想被上述限制所约束，可以在 [这里](https://mega.nz/folder/z5YUhYTb%23gA_IRY5KMuYpnNCg7kR3ug) 找到无机型限制的修改版镜像（`ACDT` 后缀），更多细节在 `DIGEST.txt` 中。记住，这些都是经过 OpenCore 测试的最早的 macOS 10.6 版本。

You can also patch out model checking yourself by editing `OSInstall.mpkg` with e.g. `Flat Package Editor` by making `Distribution` script to always return `true` in `hwbeModelCheck` function. Since updating the only file in the image and not corrupting other files can be difficult and may cause slow booting due to kernel cache date changes, it is recommended to script image rebuilding as shown below:

```bash
#!/bin/bash
# Original.dmg is original image, OSInstall.mpkg is patched package
mkdir RO
hdiutil mount Original.dmg -noverify -noautoopen -noautoopenrw -noautofsck -mountpoint RO cp RO/.DS_Store DS_STORE
hdiutil detach RO -force
rm -rf RO
hdiutil convert Original.dmg -format UDRW -o ReadWrite.dmg
mkdir RW
xattr -c OSInstall.mpkg
hdiutil mount ReadWrite.dmg -noverify -noautoopen -noautoopenrw -noautofsck -mountpoint RW cp OSInstall.mpkg RW/System/Installation/Packages/OSInstall.mpkg
killall Finder fseventsd
rm -rf RW/.fseventsd
cp DS_STORE RW/.DS_Store
hdiutil detach RW -force
rm -rf DS_STORE RW
```

## 12.2 UEFI 安全启动

OpenCore 的设计初衷是为 固件 和 操作系统 之间提供一个安全的启动链。在大多数 x86 平台上，可信加载（Trusted Loading）是通过 [UEFI 安全启动](https://en.wikipedia.org/wiki/UEFI_Secure_Boot) 模式实现的。OpenCore 不仅完全支持这种模式，还扩展了它的功能，以确保通过 [Vault](8-misc.html#12-Vault) 进行配置的加密存储，并使用自定义的验证过程向操作系统提供可信加载，例如 [Apple 安全启动](8-misc.html#14-SecureBootModel)。正确的安全启动链需要通过以下步骤来仔细配置：

1. 如果要启动的系统是 macOS，则需要通过设置 `SecureBootModel` 来启用 Apple 安全启动。请注意，并不是每个 macOS 版本都能使用 Apple 安全启动，具体限制详见 [Apple 安全启动](8-misc.html#14-SecureBootModel) 章节。
2. 旧的 DMG 恢复镜像往往很脆弱、易受攻击，如果担心因为加载它而突破防线，可以通过设置 `DmgLoading` 为 `Disabled` 来禁用 DMG 加载。**非必需**，但建议使用。参阅 [DMG 加载](8-misc.html#6-DmgLoading) 部分来权衡利弊。
3. 将 `MinDate` 和 `MinVersion` 设置为 `0`，以确保 APFS JumpStart 功能限制旧的驱动程序加载。更多细节参见 [APFS JumpStart](11-uefi.html#11-7-APFS-属性) 部分。除此之外，手动安装 `apfs.efi` 驱动也可以达到相同效果。
4. 确保你想要运行的操作系统不加载 `Force` 驱动也能正常启动。
5. 确保使用 `ScanPolicy` 限制加载不受信任的设备。要想做到足够安全，最好的办法是禁止加载 所有可移动设备 和 未知的文件系统。
6. 使用私钥给所有已安装的驱动程序和工具签名。不要对提供管理员权限的工具（如 UEFI Shell）签名。
7. 加密存储你的配置，详见 [Vault](8-misc.html#12-Vault) 部分。
8. 使用同一私钥签名该系统使用的所有 OpenCore 二进制文件（`BOOTX64.efi`, `BOOTIa32.efi`, `Bootstrap.efi`, `OpenCore.efi`）。
9. 如果需要用到第三方操作系统（非微软或 Apple 制造）的 bootloader，也同样为它们签名。对于 Linux，可以选择安装微软签名的 Shim bootloader，具体解释见 [Debian Wiki](https://wiki.debian.org/SecureBoot)。
10. 在 BIOS 中开启 UEFI 安全启动，并用自己的私钥安装证书。很多文章都介绍了生成证书的具体方法，比如 [这篇文章](https://habr.com/en/post/273497)，本文档不再赘述。如果需要启动 Windows，还需要添加 [Microsoft Windows Production CA 2011](http://go.microsoft.com/fwlink/?LinkID=321192) 证书。如果需要启动 Option ROM，或决定使用已签名的 Linux 驱动程序，还需要添加 [Microsoft UEFI Driver Signing CA](http://go.microsoft.com/fwlink/?LinkId=321194)。
11. 设置密码保护防止固件设置被篡改，避免 UEFI 安全启动在你不知情的情况下被禁用。

## 12.3 Windows 支持

### 1. 我能安装 Windows 系统吗？

虽然 OpenCore 并没有提供官方的 Windows 支持，但是使用 Boot Camp 安装 64 位 UEFI Windows（即 Windows 8 及更高版本）应该是可以正常工作的。安装第三方 UEFI、或者仅部分支持 UEFI 引导的系统（如 Windows 7）可能需要额外注意。不论如何，记住以下几点：

- MBR (Master Boot Record) 属于 Legacy 引导，因此将不会被支持。
- 在 OpenCore 上应用的所有更改（ACPI、NVRAM、SMBIOS）都应该与操作系统本身无关。OpenCore 会将这些改动生效于所有操作系统，这样在 Windows 上可以获得 Boot Camp 的体验。
- macOS 要求硬盘中的第一份分区为 EFI 分区，并且与 Windows 的默认布局不支持。尽管 OpenCore 确实提供了一个 [解决方法](https://github.com/acidanthera/bugtracker/issues/327)，但是强烈建议不要依赖这个方法。
- Windows 系统可能需要重新激活。为了避免这种情况发生，请考虑将 SystemUUID 设置为原始固件的 UUID。请注意，在旧固件上 UUID 可能是无效的（非随机的）。如果你还遇到了什么问题，可以考虑使用 HWID 或 KMS38 的 Windows 许可证。从 OpenCore 0.5.8 开始，你还可以通过设置 `UpdateSMBIOSMode` 为 `Custom` 来避免 OEM 激活失效。Windows 激活的细节不在本文档的讨论范围内，你应该能够在网上查找到相关资料。

### 2. 我需要安装其他什么软件吗？

在大多数情况下，要启用多操作系统切换、安装相关驱动程序，你将需要 [Boot Camp](https://support.apple.com/boot-camp) 提供的 Windows 支持软件。为了简化下载过程、或者配置硬盘中已经安装好的 Windows，可以使用 [Brigadier](https://github.com/timsutton/brigadier) 这个实用软件。请注意在使用 Brigadier 之前，你可能需要先下载并安装 [7-Zip](https://www.7-zip.org)。

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
  >
  > ```powershell
  > # 恢复鼠标滚动方向
  > Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Enum\HID\*\*\Device` Parameters FlipFlopWheel -EA 1 | ForEach-Object { Set-ItemProperty $_.PSPath FlipFlopWheel 0 }
  > ```

- `RealTimeIsUniversal` 必须设置为 `1` 以避免 Windows 和 macOS 之间的时间不同步。

  > 译者注：众所周知，Windows 将硬件时间视为本地时间，而 macOS 会计算 UTC 后当做系统时间。通过修改上述提到的注册表值，可以让 Windows 将硬件时间视为 UTC 时间。用到的 CMD 命令如下所示：
  >
  > ```cmd
  > Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1
  > ```

- 如果要访问 Apple 的文件系统（APFS、HFS），你可能需要安装单独的软件。已知的工具有 [Apple HFS+ driver](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/) ([hack for Windows 10](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/post-24180079))、[HFSExplorer](http://www.catacombae.org/hfsexplorer)、MacDrive、Paragon APFS、Paragon HFS+、TransMac，等等。

  > 译者注：**切记不要在 Windows 下写入 APFS 或 HFS，十有八九你会导致分区表错误和无法恢复的数据丢失。别怪我们没有警告过你！！**

### 3. 为什么我会在 Boot Camp 启动硬盘 控制面板 中看到 `Basic data partition`？

Boot Camp 使用 GPT 分区表获取每个引导选项的名称。独立安装 Windows 后，你必须手动重新标记分区。这可以通过许多工具完成，比如开源的 [gdisk](https://sourceforge.net/projects/gptfdisk)，使用方法如下：

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

<center><em><strong>Listing 4</strong>: 重新标记 Windows 卷宗</em></center>

### 4. 如何选择 NTFS 驱动程序

提供 NTFS 读写支持的第三方驱动程序，如 [NTFS-3G](https://www.tuxera.com/community/open-source-ntfs-3g)、Paragon NTFS、Tuxera NTFS 或 [希捷移动硬盘 Paragon 驱动程序](https://www.seagate.com/support/software/paragon) 会破坏 macOS 的功能，比如 系统偏好设置 中的 [启动磁盘](https://support.apple.com/HT202796) 选项。
虽然我们仍然不建议使用这些经常破坏文件系统的驱动程序（我们推荐使用 macOS 内建的 NTFS 读写支持，可以通过 [终端](http://osxdaily.com/2013/10/02/enable-ntfs-write-support-mac-os-x) 或 [GUI](https://mounty.app) 启用），但是这些驱动程序的厂商也提供了他们各自的解决方案，在这里我们仅列举两个：

- [Tuxera 的常见问题解答页面](https://www.tuxera.com/products/tuxera-ntfs-for-mac/faq)
- [Paragon 相关的技术支持文档](https://kb.paragon-software.com/article/6604)

> 译者注：虽然 acidanthera 团队推荐使用 macOS 内置的 NTFS 支持，但是译者强烈反对这种方法（不论是直接方法还是使用类似 Mounty 的第三方工具）。修改 fstab 的风险是极高的。在你清楚你在做什么之前，不要轻举妄动！！

## 12.4 调试

与其他硬件相关的项目类似，OpenCore 也支持审计与调试。使用 `NOOPT` 或 `DEBUG` 构建版本（而非 `RELEASE` 构建版本）可以产生更多的调试输出。对于 `NOOPT` 构建版本，你还可以使用 GDB 或 IDA Pro 进行调试。对于 GDB 请查看 [OpenCore Debug](https://github.com/acidanthera/OpenCorePkg/tree/master/Debug) 相关页面；对于 IDA Pro，你需要 7.3 或更高版本，更多详细信息请参考 IDA Pro 提供的页面：[Debugging the XNU Kernel with IDA Pro](https://www.hex-rays.com/products/ida/support/tutorials/index.shtml)。

可以使用串口调试来获取启动过程中的日志。串口调试是在 `Target` 中开启的，例如 `0xB` 代表在屏幕上显示并输出串行。可使用 `SerialInit` 配置选项来初始化串行。对于 macOS 来说，最好是选择基于 CP2102 的 UART 设备。将主板 `TX` 连接到 USB UART `RX`，主板 `GND` 连接到 USB UART `GND`。使用 `screen` 实用工具，或者下载 GUI 软件获取输出，如 [CoolTerm](https://freeware.the-meiers.org)。

*注*：在一些主板（可能还有一些 USB UART 转换器）上，PIN 的命名可能是不正确的。`GND` 和 `RX` 互换是很常见的，因此你需要将主板 `"TX"` 连接到 USB UART `GND`，主板 `"GND"` 连接到 USB UART `RX`。

务必记得在固件设置中启用 `COM` 口，一定不要使用超过 1 米的 USB 线缆，以免输出数据损坏。如果要额外启用 XNU 内核串行输出，则需要添加 `debug=0x8` 启动参数。

## 12.5 技巧和窍门

### 1. 啊呀呀呀我系统没法启动了我该怎么看日志啊？

通常情况下，获取实际的错误信息就足够了。为此，请确保：

- 你正在使用 OpenCore 的 `DEBUG` 或 `NOOPT` 版本。
- 日志已启用（`1`）并且在屏幕上显示（`2`）：`Misc → Debug → Target = 3`.
- 将以下这些等级的日志输出到屏幕上：`DEBUG_ERROR` (`0x80000000`)、`DEBUG_WARN` (`0x00000002`) 和 `DEBUG_INFO` (`0x00000040`)：`Misc → Debug → DisplayLevel = 0x80000042`.
- 遇到 `DEBUG_ERROR` 这样的致命错误时中止启动：`Misc → Security → HaltLevel = 0x80000000`。
- 禁用 Watch Dog 以避免自动重启：`Misc → Debug → DisableWatchDog = true`。
- 已启用 启动菜单 显示：`Misc → Boot → ShowPicker = true`

如果你在日志中看不出明显的错误，请逐一检查 `Quirks` 部分中可用的 hacks。例如，对于 Early Boot 出现的问题（如 OpenCore 启动菜单无法显示），通过 `UEFI Shell`（随 OpenCore 打包在一起）可以查看相关调试信息。

### 2. macOS 启动失败我该怎么调试？

- 在 `boot-args` 中添加 `debug=0x100`、`keepsyms=1`、`-v` 或其他类似的值。
- 不要忘记开启 `AppleDebug` 和 `ApplePanic` 属性。
- 调整 `Booter`、`Kernel` 和 `UEFI` 里的 Quirk。
- 可以考虑通过串行端口来检查早期的内核启动失败。为此你可能需要用到 `debug=0x108`、`serial=5` 和 `msgbuf=1048576` 参数。如果在串行初始化前就失败了，Sample.plist 中有相关补丁供你参考。
- 一定要仔细阅读日志。

### 3. 如何自定义启动项？

OpenCore 遵循 Apple Bless 标准模型、从引导目录中的 `.contentDetails` 和 `.disk_label.contentDetails` 文件中提取条目名称。这些文件包含带有输入标题的 ASCII 字符串，你可以修改它们。

### 4. 如何选择默认启动的系统？

OpenCore 使用 UEFI 首选启动项 来选择默认的启动项。设置的方式随 BIOS 不同而不同，具体请参考 macOS [启动磁盘](https://support.apple.com/HT202796) 或 Windows [启动转换](https://support.apple.com/guide/bootcamp-control-panel/start-up-your-mac-in-windows-or-macos-bcmp29b8ac66/mac) 控制面板。

由于使用 OpenCore 提供的 `BOOTx64.efi` 作为首选启动项会限制这项功能（可能还会导致一些固件删除不兼容的引导选项），我们强烈建议你启用 `RequestBootVarRouting` Quirk，这会将你所做的选择保留在 OpenCore 变量空间中。请注意，`RequestBootVarRouting` 需要单独的 `.efi` 驱动文件（译者注：即 OpenRuntime.efi）。

### 5. 安装 macOS 最简单的方法是什么？

在线安装。将 Recovery 镜像（`*.dmg` 和 `*.chunklist` 文件）和 OpenCore 一起复制到一个 FAT32 分区中。加载 OpenCore 的启动菜单并选择后缀为 `.dmg` 的条目。如果你有强迫症，你可以修改 `.contentDetails` 文件改变条目显示的文字。

你可能会用到 `AppleModels` 内置的 [macrecovery.py](https://github.com/acidanthera/OpenCorePkg/blob/master/Utilities/macrecovery/macrecovery.py) 来下载 Recovery 镜像。

如果你需要进行离线安装，请参考 [如何创建可引导的 macOS 安装器](https://support.apple.com/HT201372)。除了通过 App Store 或 系统更新，你还可以使用 [第三方工具](https://github.com/corpnewt/gibMacOS) 下载 macOS 镜像文件。

### 6. 为什么无法加载 Recovery 恢复镜像 进行在线安装？

可能是因为你没带 HFS+ 驱动。目前我们所知道的 Recovery 分区全都是 HFS+ 文件系统。

### 7. 我可以在 Apple 的硬件、或虚拟机中使用 OpenCore 吗？

~~可以，没有必要，但请加大力度~~

OpenCore 支持包括 MacPro 5,1 和虚拟机在内的大部分较新的 Mac 型号。不过，OpenCore 有关在 Mac 硬件上使用的具体细节微乎其微。你可以在 [MacRumors.com](https://forums.macrumors.com/threads/opencore-on-the-mac-pro.2207814) 查看相关讨论。

### 8. 为什么 Find 和 Replace 的补丁的长度必须相等？

对于 x86 机器码来说，[相对寻址](https://en.wikipedia.org/w/index.php?title=Relative_addressing) 无法进行大小不同的替换。对于 ACPI 代码来说这是有风险的，而且在技术上这与替换 ACPI 表等价，所以 OpenCore 没有实现。更多详细的解答可以在 [AppleLife.ru](https://applelife.ru/posts/819790) 上和本文档的 ACPI 章节找到。

### 9. 我应该如何决定哪些 `Booter` Quirk 需要被启用？

这些 Quirk 源自 `AptioMemoryFix` 驱动，为更多的固件提供了广泛支持。如果你正在使用 `OpenRuntime`，并且想要获得和 `AptioMemoryFix` 类似的行为，请启用下述 Quirk：

- `ProvideConsoleGop` （UEFI Quirk）
- `AvoidRuntimeDefrag`
- `DiscardHibernateMap`
- `EnableSafeModeSlide`
- `EnableWriteUnprotector`
- `ForceExitBootServices`
- `ProtectMemoryRegions`
- `ProvideCustomSlide`
- `RebuildAppleMemoryMap`
- `SetupVirtualMap`

但是，对于大部分现代的设备来说，上述 Quirk 不一定是必需的。比如 `DevirtualiseMmio` 和 `ProtectUefiServices` 通常是需要启用的，但是 `DiscardHibernateMap` 和 `ForceExitBootServices` 一般不建议启用。

不幸的是，对于某些 Quirk 来说（`RebuildAppleMemoryMap`, `EnableWriteUnprotector`, `ProtectMemoryRegions`, `SetupVirtualMap` 和 `SyncRuntimePermissions`）由于没有明确的参考，因此需要自行尝试最佳组合。详细内容请参考本文档中对这些 Quirk 的描述。
