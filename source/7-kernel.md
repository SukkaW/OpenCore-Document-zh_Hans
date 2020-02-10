---
title: 7. Kernel
description: Kernel（搬运填坑中）
type: docs
---

\subsection{Introduction}\label{kernelintro}

This section allows to apply different kinds of kernelspace modifications on
Apple Kernel ([XNU](https://opensource.apple.com/source/xnu)). The modifications
currently provide driver (kext) injection, kernel and driver patching, and driver
blocking.

\subsection{Properties}\label{kernelprops}

\begin{enumerate}
 -   \texttt{Add}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Load selected kernel drivers from \texttt{OC/Kexts} directory.

  Designed to be filled with \texttt{plist\ dict} values, describing each driver.
  See \hyperref[kernelpropsadd]{Add Properties} section below. Kernel driver load
  order follows the item order in the array, thus the dependencies should be written
  prior to their consumers.

 -   \texttt{Block}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Remove selected kernel drivers from prelinked kernel.

  Designed to be filled with \texttt{plist\ dictionary} values, describing each
  blocked driver. See \hyperref[kernelpropsblock]{Block Properties} section below.

 -   \texttt{Emulate}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Emulate select hardware in kernelspace via parameters
  described in \hyperref[kernelpropsemu]{Emulate Properties} section below.

 -   \texttt{Patch}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Perform binary patches in kernel and drivers prior to
  driver addition and removal.

  Designed to be filled with \texttt{plist\ dictionary} values, describing each
  patch. See \hyperref[kernelpropspatch]{Patch Properties} section below.

 -   \texttt{Quirks}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Apply individual kernel and driver quirks described
  in \hyperref[kernelpropsquirks]{Quirks Properties} section below.

\end{enumerate}

\subsection{Add Properties}\label{kernelpropsadd}

\begin{enumerate}
 -   \texttt{BundlePath}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Kext bundle path (e.g. \texttt{Lilu.kext}
  or \texttt{MyKext.kext/Contents/PlugIns/MySubKext.kext}).

 -   \texttt{Comment}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used to provide human readable
  reference for the entry. It is implementation defined whether this value is
  used.

 -   \texttt{Enabled}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: This kernel driver will not be added unless set to
  \texttt{true}.

 -   \texttt{ExecutablePath}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Kext executable path relative to bundle
  (e.g. \texttt{Contents/MacOS/Lilu}).

 -   \texttt{MaxKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Adds kernel driver on specified macOS version or older.

  \hypertarget{kernmatch}Kernel version can be obtained with \texttt{uname -r} command,
  and should look like 3 numbers separated by dots, for example \texttt{18.7.0} is the
  kernel version for \texttt{10.14.6}. Kernel version interpretation is implemented as follows:
  \begin{align*}
    \begin{aligned}
      ParseDarwinVersion(\kappa,\lambda,\mu)&=\kappa \cdot10000 &&
        \text{Where }\kappa\in(0,99)\text{ is kernel version major} \\
      &+ \lambda\cdot100 &&
        \text{Where }\lambda\in(0,99)\text{ is kernel version minor} \\
      &+ \mu &&
        \text{Where }\mu\in(0,99)\text{ is kernel version patch}
    \end{aligned}
  \end{align*}
  Kernel version comparison is implemented as follows:
  \begin{align*}
    \alpha&=\begin{cases}
      \vspace{-0.5cm}\mbox{\hspace{8cm}} & \mbox{\hspace{5cm}} \\
      ParseDarwinVersion(\texttt{MinKernel}), & \text{If } \texttt{MinKernel} \text{ is valid} \\
      0 & Otherwise
    \end{cases} \\
    \beta&=\begin{cases}
      \vspace{-0.5cm}\mbox{\hspace{8cm}} & \mbox{\hspace{5cm}} \\
      ParseDarwinVersion(\texttt{MaxKernel}), & \text{If } \texttt{MaxKernel} \text{ is valid} \\
      \infty & Otherwise
    \end{cases} \\
    \gamma&=\begin{cases}
      \vspace{-0.5cm}\mbox{\hspace{8cm}} & \mbox{\hspace{5cm}} \\
      ParseDarwinVersion(FindDarwinVersion()), & \text{If valid } \texttt{"Darwin Kernel Version"} \text{ is found} \\
      \infty & Otherwise
    \end{cases} \\
    & \hspace{5cm} f(\alpha,\beta,\gamma)=\alpha\leq\gamma\leq\beta
  \end{align*}
  Here $ParseDarwinVersion$ argument is assumed to be 3 integers obtained by splitting Darwin kernel version
  string from left to right by the \texttt{.} symbol. $FindDarwinVersion$ function looks up
  Darwin kernel version by locating \texttt{"Darwin Kernel Version $\kappa$.$\lambda$.$\mu$"} string
  in the kernel image.

 -   \texttt{MinKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Adds kernel driver on specified macOS version or newer.

  \emph{Note}: Refer to \hyperlink{kernmatch}{\texttt{Add} \texttt{MaxKernel} description} for matching logic.

 -   \texttt{PlistPath}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Kext \texttt{Info.plist} path relative to bundle
  (e.g. \texttt{Contents/Info.plist}).

\end{enumerate}

\subsection{Block Properties}\label{kernelpropsblock}

\begin{enumerate}
 -   \texttt{Comment}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used to provide human readable
  reference for the entry. It is implementation defined whether this value is
  used.

 -   \texttt{Enabled}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: This kernel driver will not be blocked unless set to
  \texttt{true}.

 -   \texttt{Identifier}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Kext bundle identifier
    (e.g. \texttt{com.apple.driver.AppleTyMCEDriver}).

 -   \texttt{MaxKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Blocks kernel driver on specified macOS version or older.

  \emph{Note}: Refer to \hyperlink{kernmatch}{\texttt{Add} \texttt{MaxKernel} description} for matching logic.

 -   \texttt{MinKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Blocks kernel driver on specified macOS version or newer.

  \emph{Note}: Refer to \hyperlink{kernmatch}{\texttt{Add} \texttt{MaxKernel} description} for matching logic.

\end{enumerate}

\subsection{Emulate Properties}\label{kernelpropsemu}

\begin{enumerate}
 -   \texttt{Cpuid1Data}\\
  \textbf{Type}: \texttt{plist\ data}, 16 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Sequence of \texttt{EAX}, \texttt{EBX}, \texttt{ECX},
  \texttt{EDX} values to replace \texttt{CPUID (1)} call in XNU kernel.

  This property serves for two needs:

  \begin{itemize}
    \tightlist
    \item Enabling support of an unsupported CPU model.
    \item Enabling XCPM support for an unsupported CPU variant.
  \end{itemize}

  Normally it is only the value of \texttt{EAX} that needs to be taken care of,
  since it represents the full CPUID. The remaining bytes are to be left as zeroes.
  Byte order is Little Endian, so for example, \texttt{A9 06 03 00} stands for CPUID
  \texttt{0x0306A9} (Ivy Bridge).

  For XCPM support it is recommended to use the following combinations.

  \begin{itemize}
    \tightlist
    \item Haswell-E (\texttt{0x306F2}) to Haswell (\texttt{0x0306C3}):\\
    \texttt{Cpuid1Data}: \texttt{C3 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00}\\
    \texttt{Cpuid1Mask}: \texttt{FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00}
    \item Broadwell-E (\texttt{0x0406F1}) to Broadwell (\texttt{0x0306D4}):\\
    \texttt{Cpuid1Data}: \texttt{D4 06 03 00 00 00 00 00 00 00 00 00 00 00 00 00}\\
    \texttt{Cpuid1Mask}: \texttt{FF FF FF FF 00 00 00 00 00 00 00 00 00 00 00 00}
  \end{itemize}

  Further explanations can be found at
  [acidanthera/bugtracker\#365](https://github.com/acidanthera/bugtracker/issues/365).
  See \texttt{Special NOTES} for Haswell+ low-end.

 -   \texttt{Cpuid1Mask}\\
  \textbf{Type}: \texttt{plist\ data}, 16 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Bit mask of active bits in \texttt{Cpuid1Data}.

  When each \texttt{Cpuid1Mask} bit is set to 0, the original CPU bit is used,
  otherwise set bits take the value of \texttt{Cpuid1Data}.

\end{enumerate}

\subsection{Patch Properties}\label{kernelpropspatch}

\begin{enumerate}
 -   \texttt{Base}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Selects symbol-matched base for patch lookup (or immediate
  replacement) by obtaining the address of provided symbol name. Can be set to
  empty string to be ignored.

 -   \texttt{Comment}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used to provide human readable
  reference for the entry. It is implementation defined whether this value is
  used.

 -   \texttt{Count}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Number of patch occurrences to apply. \texttt{0} applies
  the patch to all occurrences found.

 -   \texttt{Enabled}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: This kernel patch will not be used unless set to
  \texttt{true}.

 -   \texttt{Find}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Data to find. Can be set to empty for immediate
  replacement at \texttt{Base}. Must equal to \texttt{Replace} in size
  otherwise.

 -   \texttt{Identifier}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Kext bundle identifier (e.g. \texttt{com.apple.driver.AppleHDA})
  or \texttt{kernel} for kernel patch.

 -   \texttt{Limit}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Maximum number of bytes to search for. Can be set to
  \texttt{0} to look through the whole kext or kernel.

 -   \texttt{Mask}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Data bitwise mask used during find comparison.
  Allows fuzzy search by ignoring not masked (set to zero) bits. Can be
  set to empty data to be ignored. Must equal to \texttt{Replace} in size
  otherwise.

 -   \texttt{MaxKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Patches data on specified macOS version or older.

  \emph{Note}: Refer to \hyperlink{kernmatch}{\texttt{Add} \texttt{MaxKernel} description} for matching logic.

 -   \texttt{MinKernel}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Patches data on specified macOS version or newer.

  \emph{Note}: Refer to \hyperlink{kernmatch}{\texttt{Add} \texttt{MaxKernel} description} for matching logic.

 -   \texttt{Replace}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Replacement data of one or more bytes.

 -   \texttt{ReplaceMask}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Data bitwise mask used during replacement.
  Allows fuzzy replacement by updating masked (set to non-zero) bits. Can be
  set to empty data to be ignored. Must equal to \texttt{Replace} in size
  otherwise.

 -   \texttt{Skip}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Number of found occurrences to be skipped before replacement
  is done.

\end{enumerate}

\subsection{Quirks Properties}\label{kernelpropsquirks}

\begin{enumerate}

 -   \texttt{AppleCpuPmCfgLock}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables \texttt{PKG\_CST\_CONFIG\_CONTROL} (\texttt{0xE2})
  MSR modification in AppleIntelCPUPowerManagement.kext, commonly causing early
  kernel panic, when it is locked from writing.

  Certain firmwares lock \texttt{PKG\_CST\_CONFIG\_CONTROL} MSR register. To check its
  state one can use bundled \texttt{VerifyMsrE2} tool. Select firmwares have this
  register locked on some cores only.

  As modern firmwares provide \texttt{CFG Lock} setting, which allows configuring
  \texttt{PKG\_CST\_CONFIG\_CONTROL} MSR register lock, this option should be avoided
  whenever possible. For several APTIO firmwares not displaying \texttt{CFG Lock} setting
  in the GUI it is possible to access the option directly:

  \begin{enumerate}
    \tightlist
    \item Download [UEFITool](https://github.com/LongSoft/UEFITool/releases) and
      [IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases).
    \item Open your firmware image in UEFITool and find \texttt{CFG Lock} unicode string.
      If it is not present, your firmware may not have this option and you should stop.
    \item Extract the \texttt{Setup.bin} PE32 Image Section (the one UEFITool found) through
      \texttt{Extract Body} menu option.
    \item Run IFR-Extractor on the extracted file (e.g. \texttt{./ifrextract Setup.bin Setup.txt}).
    \item Find \texttt{CFG Lock, VarStoreInfo (VarOffset/VarName):} in \texttt{Setup.txt} and
      remember the offset right after it (e.g. \texttt{0x123}).
    \item Download and run [Modified GRUB Shell](http://brains.by/posts/bootx64.7z) compiled by
      [brainsucker](https://geektimes.com/post/258090) or use
      [a newer version](https://github.com/datasone/grub-mod-setup_var) by
      [datasone](https://github.com/datasone).
    \item Enter \texttt{setup\_var 0x123 0x00} command, where \texttt{0x123} should be replaced by
      your actual offset, and reboot.
  \end{enumerate}

  \textbf{WARNING}: Variable offsets are unique not only to each motherboard but even to its firmware
  version. Never ever try to use an offset without checking.

 -   \texttt{AppleXcpmCfgLock}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables \texttt{PKG\_CST\_CONFIG\_CONTROL} (\texttt{0xE2})
  MSR modification in XNU kernel, commonly causing early kernel panic, when it is
  locked from writing (XCPM power management).

  \emph{Note}: This option should be avoided whenever possible. See \texttt{AppleCpuPmCfgLock}
  description for more details.

 -   \texttt{AppleXcpmExtraMsrs}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables multiple MSR access critical for select CPUs,
  which have no native XCPM support.

  This is normally used in conjunction with \texttt{Emulate} section on Haswell-E,
  Broadwell-E, Skylake-X, and similar CPUs. More details on the XCPM patches are outlined in
  [acidanthera/bugtracker\#365](https://github.com/acidanthera/bugtracker/issues/365).

  \emph{Note}: Additional not provided patches will be required for Ivy Bridge or Pentium
  CPUs. It is recommended to use \texttt{AppleIntelCpuPowerManagement.kext} for the former.

 -   \texttt{AppleXcpmForceBoost}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forces maximum performance in XCPM mode.

  This patch writes \texttt{0xFF00} to \texttt{MSR\_IA32\_PERF\_CONTROL} (\texttt{0x199}),
  effectively setting maximum multiplier for all the time.

  \emph{Note}: While this may increase the performance, this patch is strongly discouraged
  on all systems but those explicitly dedicated to scientific or media calculations.
  In general only certain Xeon models benefit from the patch.

 -   \texttt{CustomSMBIOSGuid}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Performs GUID patching for \texttt{UpdateSMBIOSMode}
  \texttt{Custom} mode. Usually relevant for Dell laptops.

 -   \texttt{DisableIoMapper}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables \texttt{IOMapper} support in XNU (VT-d),
  which may conflict with the firmware implementation.

  \emph{Note}: This option is a preferred alternative to dropping \texttt{DMAR}
  ACPI table and disabling VT-d in firmware preferences, which does not break
  VT-d support in other systems in case they need it.

 -   \texttt{DummyPowerManagement}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables \texttt{AppleIntelCpuPowerManagement}.

  \emph{Note}: This option is a preferred alternative to
  \texttt{NullCpuPowerManagement.kext} for CPUs without native power
  management driver in macOS.

 -   \texttt{ExternalDiskIcons}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Apply icon type patches to AppleAHCIPort.kext to force
  internal disk icons for all AHCI disks.

  \emph{Note}: This option should be avoided whenever possible. Modern firmwares
  usually have compatible AHCI controllers.

 -   \texttt{IncreasePciBarSize}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Increases 32-bit PCI bar size in IOPCIFamily from 1 to 4 GBs.

  \emph{Note}: This option should be avoided whenever possible. In general the necessity
  of this option means misconfigured or broken firmware.

 -   \texttt{LapicKernelPanic}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables kernel panic on LAPIC interrupts.

 -   \texttt{PanicNoKextDump}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Prevent kernel from printing kext dump in the panic
  log preventing from observing panic details. Affects 10.13 and above.

 -   \texttt{PowerTimeoutKernelPanic}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Disables kernel panic on setPowerState timeout.

  An additional security measure was added to macOS Catalina (10.15) causing
  kernel panic on power change timeout for Apple drivers. Sometimes it may cause
  issues on misconfigured hardware, notably digital audio, which sometimes fails
  to wake up. For debug kernels \texttt{setpowerstate\_panic=0} boot argument
  should be used, which is otherwise equivalent to this quirk.

 -   \texttt{ThirdPartyDrives}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Apply vendor patches to IOAHCIBlockStorage.kext to enable
  native features for third-party drives, such as TRIM on SSDs or hibernation
  support on 10.15 and newer.

  \emph{Note}: This option may be avoided on user preference. NVMe SSDs are
  compatible without the change. For AHCI SSDs on modern macOS version there
  is a dedicated built-in utility called \texttt{trimforce}. Starting from 10.15
  this utility creates \texttt{EnableTRIM} variable in \texttt{APPLE\_BOOT\_VARIABLE\_GUID}
  namespace with \texttt{01 00 00 00} value.

 -   \texttt{XhciPortLimit}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Patch various kexts (AppleUSBXHCI.kext, AppleUSBXHCIPCI.kext,
  IOUSBHostFamily.kext) to remove USB port count limit of 15 ports.

  \emph{Note}: This option should be avoided whenever possible. USB port limit
  is imposed by the amount of used bits in locationID format and there is no
  possible way to workaround this without heavy OS modification. The only
  valid solution is to limit the amount of used ports to 15 (discarding some).
  More details can be found on [AppleLife.ru](https://applelife.ru/posts/550233).

\end{enumerate}
