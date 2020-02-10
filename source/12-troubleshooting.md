---
title: 12. 排错
description: Troubleshooting（搬运填坑中）
type: docs
---

## 12.1 Windows support

### Can I install Windows?

  While no official Windows support is provided, 64-bit UEFI Windows installations (Windows 8 and above) prepared with Boot Camp are supposed to work. Third-party UEFI installations as well as systems partially supporting UEFI boot, like Windows 7, might work with some extra precautions. Things to keep in mind:

   -  MBR (Master Boot Record) installations are legacy and will not be supported.
   -  To install Windows, macOS, and OpenCore on the same drive you can specify windows bootloader path (\texttt{\textbackslash EFI\textbackslash Microsoft\textbackslash Boot\textbackslash bootmgfw.efi})
  in \texttt{BlessOverride} section.
   -  All the modifications applied (to ACPI, NVRAM, SMBIOS, etc.) are supposed
  to be operating system agnostic, i.e. apply equally regardless of the OS booted.
  This enables Boot Camp software experience on Windows.
   -  macOS requires the first partition to be EFI System Partition, and does
  not support the default Windows layout. While OpenCore does have a
  [workaround](https://github.com/acidanthera/bugtracker/issues/327)
  for this, it is highly recommend not to rely on it and install properly.
   -  Windows may need to be reactivated. To avoid it consider
  setting SystemUUID to the original firmware UUID. Be warned,
  on old firmwares it may be invalid, i.e. not random. In case you still have issues,
  consider using HWID or KMS38 license. The nuances of Windows activation are out of the
  scope of this document and can be found online.
  \end{itemize}

  \textbf{What additional software do I need?}

  To enable operating system switching and install relevant drivers in the majority of
  cases you will need Windows support software from
  [Boot Camp](https://support.apple.com/boot-camp). For simplicity of the download
  process or when configuring an already installed Windows version a third-party utility,
  [Brigadier](https://github.com/timsutton/brigadier), can be used successfully.
  Note, that you may have to download and install [7-Zip](https://www.7-zip.org)
  prior to using Brigadier.

  Remember to always use the latest version of Windows support software from Boot Camp,
  as versions prior to 6.1 do not support APFS, and thus will not function correctly.
  To download newest software pass most recent Mac model to Brigadier, for example
  \texttt{./brigadier.exe -m iMac19,1}. To install Boot Camp on an unsupported Mac model
  afterwards run PowerShell as Administrator and enter \texttt{msiexec /i BootCamp.msi}.
  In case you already have a previous version of Boot Camp installed you will have to
  remove it first by running \texttt{msiexec /x BootCamp.msi} command. \texttt{BootCamp.msi}
  file is located in \texttt{BootCamp/Drivers/Apple} directory and can be reached through
  Windows Explorer.

  While Windows support software from Boot Camp solves most of compatibility problems,
  sometimes you may have to address some of them manually:

  \begin{itemize}
   -  To invert mouse wheel scroll direction \texttt{FlipFlopWheel} must be set
  to \texttt{1} as explained on [SuperUser](https://superuser.com/a/364353).
   -  \texttt{RealTimeIsUniversal} must be set to \texttt{1} to avoid time
  desync between Windows and macOS as explained on
  [SuperUser](https://superuser.com/q/494432) (this one is usually not needed).
   -  To access Apple filesystems like HFS and APFS separate software may need to
  be installed. Some of the known tools are:
  [Apple HFS+ driver](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/)
  ([hack for Windows 10](https://forums.macrumors.com/threads/apple-hfs-windows-driver-download.1368010/page-4#post-24180079)),
  [HFSExplorer](http://www.catacombae.org/hfsexplorer), MacDrive, Paragon APFS,
  Paragon HFS+, TransMac, etc. Remember to never ever attempt to modify Apple file systems
  from Windows as this often leads to irrecoverable data loss.
  \end{itemize}

  \textbf{Why do I see \texttt{Basic data partition} in Boot Camp Startup Disk control panel?}

  Boot Camp control panel uses GPT partition table to obtain each boot option name.
  After installing Windows separately you will have to relabel the partition manually.
  This can be done with many tools including open-source
  [gdisk](https://sourceforge.net/projects/gptfdisk) utility. Reference example:

\begin{lstlisting}[caption=Relabeling Windows volume, label=relabel, style=ocbash]
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
\end{lstlisting}


  \textbf{How to choose Windows BOOTCAMP with custom NTFS drivers?}

  Third-party drivers providing NTFS support, such as
  [NTFS-3G](https://www.tuxera.com/community/open-source-ntfs-3g), Paragon NTFS,
  Tuxera NTFS or [Seagate Paragon Driver](https://www.seagate.com/support/software/paragon)
  break certain macOS functionality, including
  [Startup Disk](https://support.apple.com/HT202796) preference
  pane normally used for operating system selection. While the recommended option
  remains not to use such drivers as they commonly corrupt the filesystem, and prefer
  the driver bundled with macOS with optional write support (
  [command](http://osxdaily.com/2013/10/02/enable-ntfs-write-support-mac-os-x) or
  [GUI](https://mounty.app)),
  there still exist vendor-specific workarounds for their products:
  [Tuxera](https://www.tuxera.com/products/tuxera-ntfs-for-mac/faq),
  [Paragon](https://kb.paragon-software.com/article/6604), etc.

\subsection{Debugging}\label{troubleshootingdebug}

Similar to other projects working with hardware OpenCore supports auditing and debugging.
The use of \texttt{NOOPT} or \texttt{DEBUG} build modes instead of \texttt{RELEASE}
can produce a lot more debug output. With \texttt{NOOPT} source level debugging with
GDB or IDA Pro is also available. For GDB check
[OcSupport Debug](https://github.com/acidanthera/OcSupportPkg/tree/master/Debug)
page. For IDA Pro you will need IDA Pro 7.3 or newer, refer to
[Debugging the XNU Kernel with IDA Pro](https://www.hex-rays.com/products/ida/support/tutorials/index.shtml)
for more details.

To obtain the log during boot you can make the use of serial port debugging. Serial port
debugging is enabled in \texttt{Target}, e.g. \texttt{0xB} for onscreen with serial. OpenCore
uses \texttt{115200} baud rate, \texttt{8} data bits, no parity, and \texttt{1} stop bit.
For macOS your best choice are CP2102-based UART devices. Connect motherboard \texttt{TX}
to USB UART \texttt{RX}, and motherboard \texttt{GND} to USB UART \texttt{GND}. Use
\texttt{screen} utility to get the output, or download GUI software, such as
[CoolTerm](https://freeware.the-meiers.org).

\emph{Note}: On several motherboards (and possibly USB UART dongles) PIN naming may be
incorrect. It is very common to have \texttt{GND} swapped with \texttt{RX}, thus you have
to connect motherboard ``\texttt{TX}'' to USB UART \texttt{GND}, and motherboard ``\texttt{GND}''
to USB UART \texttt{RX}.

Remember to enable \texttt{COM} port in firmware settings, and never use USB cables longer
than 1 meter to avoid output corruption. To additionally enable XNU kernel serial output
you will need \texttt{debug=0x8} boot argument.

\subsection{Tips and Tricks}\label{troubleshootingtricks}

\begin{enumerate}
 -   \textbf{How to debug boot failure?}

  Normally it is enough to obtain the actual error message. For this
  ensure that:
  \begin{itemize}
  \tightlist
   -  You have a \texttt{DEBUG} or \texttt{NOOPT} version of OpenCore.
   -  Logging is enabled (\texttt{1}) and shown onscreen (\texttt{2}):
  \texttt{Misc} $\rightarrow$ \texttt{Debug} $\rightarrow$ \texttt{Target}
  $=$ \texttt{3}.
   -  Logged messages from at least \texttt{DEBUG\_ERROR}
  (\texttt{0x80000000}), \texttt{DEBUG\_WARN} (\texttt{0x00000002}), and
  \texttt{DEBUG\_INFO} (\texttt{0x00000040}) levels are visible onscreen:
  \texttt{Misc} $\rightarrow$ \texttt{Debug} $\rightarrow$ \texttt{DisplayLevel}
  $=$ \texttt{0x80000042}.
   -  Critical error messages, like \texttt{DEBUG\_ERROR}, stop booting:
  \texttt{Misc} $\rightarrow$ \texttt{Security}
  $\rightarrow$ \texttt{HaltLevel} $=$ \texttt{0x80000000}.
   -  Watch Dog is disabled to prevent automatic reboot:
  \texttt{Misc} $\rightarrow$ \texttt{Debug} $\rightarrow$
  \texttt{DisableWatchDog} $=$ \texttt{true}.
   -  Boot Picker (entry selector) is enabled: \texttt{Misc}
  $\rightarrow$ \texttt{Boot} $\rightarrow$ \texttt{ShowPicker} $=$ \texttt{true}.
  \end{itemize}

  If there is no obvious error, check the available hacks in \texttt{Quirks} sections
  one by one. For early boot troubleshooting, for instance, when OpenCore menu does not appear,
  using [UEFI Shell](https://github.com/acidanthera/OpenCoreShell) may help to see
  early debug messages.

 -   \textbf{How to customise boot entries?}

  OpenCore follows standard Apple Bless model and extracts the entry name
  from \texttt{.contentDetails} and \texttt{.disk\_label.contentDetails} files in the
  booter directory if present. These files contain an ASCII string with an entry title,
  which may then be customised by the user.

 -   \textbf{How to choose the default boot entry?}

  OpenCore uses the primary UEFI boot option to select the default entry. This choice
  can be altered from UEFI Setup, with the macOS
  [Startup Disk](https://support.apple.com/HT202796) preference, or the Windows
  [Boot Camp](https://support.apple.com/guide/bootcamp-control-panel/start-up-your-mac-in-windows-or-macos-bcmp29b8ac66/mac) Control Panel.
  Since choosing OpenCore's \texttt{BOOTx64.EFI} as a primary boot option limits this
  functionality in addition to several firmwares deleting incompatible boot options,
  potentially including those created by macOS, you are strongly encouraged to use the
  \texttt{RequestBootVarRouting} quirk, which will preserve your selection made in
  the operating system within the OpenCore variable space. Note, that \texttt{RequestBootVarRouting}
  requires a separate driver for functioning.

 -   \textbf{What is the simplest way to install macOS?}

  Copy online recovery image (\texttt{*.dmg} and \texttt{*.chunklist} files)
  to \texttt{com.apple.recovery.boot} directory on a FAT32 partition with OpenCore.
  Load OpenCore Boot Picker and choose the entry, it will have a \texttt{(dmg)} suffix.
  Custom name may be created by providing \texttt{.contentDetails} file.

  To download recovery online you may use
  [macrecovery.py](https://github.com/acidanthera/MacInfoPkg/blob/master/macrecovery/macrecovery.py)
  tool from [MacInfoPkg](https://github.com/acidanthera/MacInfoPkg/releases).

  For offline installation refer to
  [How to create a bootable installer for macOS](https://support.apple.com/HT201372)
  article. Apart from App Store and \texttt{softwareupdate} utility there also are
  [third-party tools](https://github.com/corpnewt/gibMacOS) to download an offline image.

 -   \textbf{Why do online recovery images (\texttt{*.dmg}) fail to load?}

  This may be caused by missing HFS+ driver, as all presently known recovery volumes
  have HFS+ filesystem.

 -   \textbf{Can I use this on Apple hardware or virtual machines?}

  Sure, most relatively modern Mac models including \texttt{MacPro5,1} and virtual machines
  are fully supported. Even though there are little to none specific details relevant to
  Mac hardware, some ongoing instructions can be found in
  [acidanthera/bugtracker\#377](https://github.com/acidanthera/bugtracker/issues/377).

 -   \textbf{Why do Find\&Replace patches must equal in length?}

  For machine code (x86 code) it is not possible to do differently sized replacements due to
  [relative addressing](https://en.wikipedia.org/w/index.php?title=Relative_addressing).
  For ACPI code this is risky, and is technically equivalent to ACPI table replacement,
  thus not implemented. More detailed explanation can be found on
  [AppleLife.ru](https://applelife.ru/posts/819790).

 -   \textbf{How can I migrate from \texttt{AptioMemoryFix}?}

  Behaviour similar to that of \texttt{AptioMemoryFix} can be obtained by
  installing \texttt{FwRuntimeServices} driver and enabling the quirks listed below.
  Please note, that most of these are not necessary to be enabled. Refer to their
  individual descriptions in this document for more details.
  \begin{itemize}
  \tightlist
   -  \texttt{ProvideConsoleGop} (UEFI quirk)
   -  \texttt{AvoidRuntimeDefrag}
   -  \texttt{DiscardHibernateMap}
   -  \texttt{EnableSafeModeSlide}
   -  \texttt{EnableWriteUnprotector}
   -  \texttt{ForceExitBootServices}
   -  \texttt{ProtectCsmRegion}
   -  \texttt{ProvideCustomSlide}
   -  \texttt{SetupVirtualMap}
   -  \texttt{ShrinkMemoryMap}
  \end{itemize}

\end{enumerate}

\end{document}
