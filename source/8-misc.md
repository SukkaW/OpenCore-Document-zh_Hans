---
title: 8. Misc
description: Misc（搬运填坑中）
type: docs
---

\subsection{Introduction}\label{miscintro}

This section contains miscellaneous configuration entries for OpenCore
behaviour that does not go to any other sections

\subsection{Properties}\label{miscprops}

\begin{enumerate}
 -   \texttt{Boot}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Apply boot configuration described in
  \hyperref[miscbootprops]{Boot Properties} section below.

 -   \texttt{BlessOverride}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Description}: Add custom scanning paths through bless model.

  Designed to be filled with \texttt{plist\ string} entries containing
  absolute UEFI paths to customised bootloaders, for example,
  \texttt{\textbackslash EFI\textbackslash Microsoft\textbackslash Boot\textbackslash bootmgfw.efi}
  for Microsoft bootloader. This allows unusual boot paths to be automaticlly
  discovered by the boot picker. Designwise they are equivalent to predefined blessed path, such as
  \texttt{\textbackslash System\textbackslash Library\textbackslash CoreServices\textbackslash boot.efi},
  but unlike predefined bless paths they have highest priority.

 -   \texttt{Debug}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Apply debug configuration described in
  \hyperref[miscdebugprops]{Debug Properties} section below.

 -   \texttt{Entries}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Description}: Add boot entries to boot picker.

  Designed to be filled with \texttt{plist\ dict} values, describing each load entry.
  See \hyperref[miscentryprops]{Entry Properties} section below.

 -   \texttt{Security}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Apply security configuration described in
  \hyperref[miscsecurityprops]{Security Properties} section below.

 -   \texttt{Tools}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Description}: Add tool entries to boot picker.

  Designed to be filled with \texttt{plist\ dict} values, describing each load entry.
  See \hyperref[miscentryprops]{Entry Properties} section below.

  \emph{Note}: Select tools, for example,
  [UEFI Shell](https://github.com/acidanthera/OpenCoreShell) are very
  dangerous and \textbf{MUST NOT} appear in production configurations, especially
  in vaulted ones and protected with secure boot, as they may be used to easily
  bypass secure boot chain.

\end{enumerate}

\subsection{Boot Properties}\label{miscbootprops}

\begin{enumerate}

 -   \texttt{HibernateMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{None}\\
  \textbf{Description}: Hibernation detection mode. The following modes are supported:

  \begin{itemize}
  \tightlist
    \item \texttt{None} --- Avoid hibernation for your own good.
    \item \texttt{Auto} --- Use RTC and NVRAM detection.
    \item \texttt{RTC} --- Use RTC detection.
    \item \texttt{NVRAM} --- Use NVRAM detection.
  \end{itemize}

 -   \texttt{HideSelf}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Hides own boot entry from boot picker. This
  may potentially hide other entries, for instance, when another UEFI OS is
  installed on the same volume and driver boot is used.

 -   \texttt{PickerAttributes}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Sets specific attributes for picker.

  Builtin picker supports colour arguments as a sum of foreground and background
  colors according to UEFI specification. The value of black background and
  black foreground (\texttt{0}) is reserved. List of colour names:

  \begin{itemize}
  \tightlist
  \item \texttt{0x00} --- \texttt{EFI\_BLACK}
  \item \texttt{0x01} --- \texttt{EFI\_BLUE}
  \item \texttt{0x02} --- \texttt{EFI\_GREEN}
  \item \texttt{0x03} --- \texttt{EFI\_CYAN}
  \item \texttt{0x04} --- \texttt{EFI\_RED}
  \item \texttt{0x05} --- \texttt{EFI\_MAGENTA}
  \item \texttt{0x06} --- \texttt{EFI\_BROWN}
  \item \texttt{0x07} --- \texttt{EFI\_LIGHTGRAY}
  \item \texttt{0x08} --- \texttt{EFI\_DARKGRAY}
  \item \texttt{0x09} --- \texttt{EFI\_LIGHTBLUE}
  \item \texttt{0x0A} --- \texttt{EFI\_LIGHTGREEN}
  \item \texttt{0x0B} --- \texttt{EFI\_LIGHTCYAN}
  \item \texttt{0x0C} --- \texttt{EFI\_LIGHTRED}
  \item \texttt{0x0D} --- \texttt{EFI\_LIGHTMAGENTA}
  \item \texttt{0x0E} --- \texttt{EFI\_YELLOW}
  \item \texttt{0x0F} --- \texttt{EFI\_WHITE}
  \item \texttt{0x00} --- \texttt{EFI\_BACKGROUND\_BLACK}
  \item \texttt{0x10} --- \texttt{EFI\_BACKGROUND\_BLUE}
  \item \texttt{0x20} --- \texttt{EFI\_BACKGROUND\_GREEN}
  \item \texttt{0x30} --- \texttt{EFI\_BACKGROUND\_CYAN}
  \item \texttt{0x40} --- \texttt{EFI\_BACKGROUND\_RED}
  \item \texttt{0x50} --- \texttt{EFI\_BACKGROUND\_MAGENTA}
  \item \texttt{0x60} --- \texttt{EFI\_BACKGROUND\_BROWN}
  \item \texttt{0x70} --- \texttt{EFI\_BACKGROUND\_LIGHTGRAY}
  \end{itemize}

  \emph{Note}: This option may not work well with \texttt{System} text renderer.
  Setting a background different from black could help testing proper GOP functioning.

 -   \texttt{PollAppleHotKeys}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enable \texttt{modifier hotkey} handling in boot picker.

  In addition to \texttt{action hotkeys}, which are partially described in \texttt{PickerMode}
  section and are normally handled by Apple BDS, there exist modifier keys, which are
  handled by operating system bootloader, namely \texttt{boot.efi}. These keys
  allow to change operating system behaviour by providing different boot modes.

  On some firmwares it may be problematic to use modifier keys due to driver incompatibilities.
  To workaround this problem this option allows registering select hotkeys in a more
  permissive manner from within boot picker. Such extensions include the support
  of tapping on keys in addition to holding and pressing \texttt{Shift} along with
  other keys instead of just \texttt{Shift} alone, which is not detectible on many
  PS/2 keyboards. This list of known \texttt{modifier hotkeys} includes:
  \begin{itemize}
  \tightlist
  \item \texttt{CMD+C+MINUS} --- disable board compatibility checking.
  \item \texttt{CMD+K} --- boot release kernel, similar to \texttt{kcsuffix=release}.
  \item \texttt{CMD+S} --- single user mode.
  \item \texttt{CMD+S+MINUS} --- disable KASLR slide, requires disabled SIP.
  \item \texttt{CMD+V} --- verbose mode.
  \item \texttt{Shift} --- safe mode.
  \end{itemize}

 -   \texttt{ShowPicker}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Show simple boot picker to allow boot entry selection.

 -   \texttt{TakeoffDelay}\\
  \textbf{Type}: \texttt{plist\ integer}, 32 bit\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Delay in microseconds performed before handling
  picker startup and \texttt{action hotkeys}.

  Introducing a delay may give extra time to hold the right \texttt{action hotkey}
  sequence to e.g. boot to recovery mode. On some platforms setting this option to
  at least \texttt{5000-10000} microseconds may be necessary to access
  \texttt{action hotkeys} at all due to the nature of the keyboard driver.

 -   \texttt{Timeout}\\
  \textbf{Type}: \texttt{plist\ integer}, 32 bit\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Timeout in seconds in boot picker before
  automatic booting of the default boot entry. Use 0 to disable timer.

 -   \texttt{PickerMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{Builtin}\\
  \textbf{Description}: Choose boot picker used for boot management.

  Picker describes underlying boot management with an optional user interface
  responsible for handling boot options. The following values are supported:

  \begin{itemize}
  \tightlist
  \item \texttt{Builtin} --- boot management is handled by OpenCore, a simple
  text only user interface is used.
  \item \texttt{External} --- an external boot management protocol is used
  if available. Otherwise \texttt{Builtin} mode is used.
  \item \texttt{Apple} --- Apple boot management is used if available.
  Otherwise \texttt{Builtin} mode is used.
  \end{itemize}


  Upon success \texttt{External} mode will entirely disable all boot management
  in OpenCore except policy enforcement. In \texttt{Apple} mode it may additionally
  bypass policy enforcement. To implement \texttt{External} mode a custom user interface may
  utilise [OcSupportPkg](https://github.com/acidanthera/OcSupportPkg)
  \texttt{OcBootManagementLib}. Reference example of external graphics interface is provided in
  [ExternalUi](https://github.com/acidanthera/OcSupportPkg/tree/master/Tests/ExternalUi)
  test driver.

  OpenCore built-in boot picker contains a set of actions chosen during the boot process.
  The list of supported actions is similar to Apple BDS and in general can be accessed by
  holding \texttt{action hotkeys} during boot process. Currently the following actions are
  considered:

  \begin{itemize}
  \tightlist
  \item \texttt{Default} --- this is the default option, and it lets OpenCore built-in
  boot picker to loads the default boot option as specified in
  [Startup Disk](https://support.apple.com/HT202796) preference pane.
  \item \texttt{ShowPicker} --- this option forces picker to show. Normally it can be
  achieved by holding \texttt{OPT} key during boot. Setting \texttt{ShowPicker} to
  \texttt{true} will make \texttt{ShowPicker} the default option.
  \item \texttt{ResetNvram} --- this option performs select UEFI variable erase and is
  normally achieved by holding \texttt{CMD+OPT+P+R} key combination during boot.
  Another way to erase UEFI variables is to choose \texttt{Reset NVRAM} in the picker.
  This option requires \texttt{AllowNvramReset} to be set to \texttt{true}.
  \item \texttt{BootApple} --- this options performs booting to the first found Apple
  operating system unless the default chosen operating system is already made by Apple.
  Hold \texttt{X} key to choose this option.
  \item \texttt{BootAppleRecovery} --- this option performs booting to Apple operating
  system recovery. Either the one related to the default chosen operating system,
  or first found in case default chosen operating system is not made by Apple or has no
  recovery. Hold \texttt{CMD+R} key combination to choose this option.
  \end{itemize}

  \emph{Note 1}: Activated \texttt{KeySupport}, \texttt{AppleUsbKbDxe}, or similar driver is required
  for key handling to work. On many firmwares it is not possible to get all the keys function.

  \emph{Note 2}: In addition to \texttt{OPT} OpenCore supports \texttt{Escape} key to display picker when
  \texttt{ShowPicker} is disabled. This key exists for \texttt{Apple} picker mode and for
  firmwares with PS/2 keyboards that fail to report held \texttt{OPT} key and require continual
  presses of \texttt{Escape} key to enter the boot menu.

  \emph{Note 3}: On Macs with problematic GOP it may be difficult to access Apple BootPicker.
  To workaround this problem even without loading OpenCore \texttt{BootKicker} utility can be blessed.

\end{enumerate}

\subsection{Debug Properties}\label{miscdebugprops}

\begin{enumerate}

 -   \texttt{DisableWatchDog}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Select firmwares may not succeed in quickly booting
  the operating system, especially in debug mode, which results in watch dog
  timer aborting the process. This option turns off watch dog timer.

 -   \texttt{DisplayDelay}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Delay in microseconds performed after
  every printed line visible onscreen (i.e. console).

 -   \texttt{DisplayLevel}\\
  \textbf{Type}: \texttt{plist\ integer}, 64 bit\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: EDK II debug level bitmask (sum) showed onscreen.
  Unless \texttt{Target} enables console (onscreen) printing,
  onscreen debug output will not be visible. The following levels
  are supported (discover more in
  [DebugLib.h](https://github.com/tianocore/edk2/blob/UDK2018/MdePkg/Include/Library/DebugLib.h)):

  \begin{itemize}
  \tightlist
    \item \texttt{0x00000002} (bit \texttt{1}) --- \texttt{DEBUG\_WARN} in \texttt{DEBUG},
      \texttt{NOOPT}, \texttt{RELEASE}.
    \item \texttt{0x00000040} (bit \texttt{6}) --- \texttt{DEBUG\_INFO} in \texttt{DEBUG},
      \texttt{NOOPT}.
    \item \texttt{0x00400000} (bit \texttt{22}) --- \texttt{DEBUG\_VERBOSE} in custom builds.
    \item \texttt{0x80000000} (bit \texttt{31}) --- \texttt{DEBUG\_ERROR} in \texttt{DEBUG},
      \texttt{NOOPT}, \texttt{RELEASE}.
  \end{itemize}

 -   \texttt{Target}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: A bitmask (sum) of enabled logging targets.
  By default all the logging output is hidden, so this option is
  required to be set when debugging is necessary.

  The following logging targets are supported:

  \begin{itemize}
  \tightlist
    \item \texttt{0x01} (bit \texttt{0}) --- Enable logging, otherwise all log is discarded.
    \item \texttt{0x02} (bit \texttt{1}) --- Enable basic console (onscreen) logging.
    \item \texttt{0x04} (bit \texttt{2}) --- Enable logging to Data Hub.
    \item \texttt{0x08} (bit \texttt{3}) --- Enable serial port logging.
    \item \texttt{0x10} (bit \texttt{4}) --- Enable UEFI variable logging.
    \item \texttt{0x20} (bit \texttt{5}) --- Enable non-volatile UEFI variable logging.
    \item \texttt{0x40} (bit \texttt{6}) --- Enable logging to file.
  \end{itemize}

  Console logging prints less than all the other variants.
  Depending on the build type (\texttt{RELEASE}, \texttt{DEBUG}, or
  \texttt{NOOPT}) different amount of logging may be read (from least to most).

  Data Hub log will not log kernel and kext patches. To obtain Data Hub log use
  the following command in macOS:
\begin{lstlisting}[label=dhublog, style=ocbash]
ioreg -lw0 -p IODeviceTree | grep boot-log | sort | sed 's/.*<\(.*\)>.*/\1/' | xxd -r -p
\end{lstlisting}

  UEFI variable log does not include some messages and has no performance data. For safety
  reasons log size is limited to 32 kilobytes. Some firmwares may truncate it much earlier
  or drop completely if they have no memory. Using non-volatile flag will write the log to
  NVRAM flash after every printed line. To obtain UEFI variable log use the following command
  in macOS:
\begin{lstlisting}[label=nvramlog, style=ocbash]
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-log |
  awk '{gsub(/%0d%0a%00/,"");gsub(/%0d%0a/,"\n")}1'
\end{lstlisting}

  \emph{Warning}: Some firmwares are reported to have broken NVRAM garbage collection.
  This means that they may not be able to always free space after variable deletion.
  Do not use non-volatile NVRAM logging without extra need on such devices.

  While OpenCore boot log already contains basic version information with build type and
  date, this data may also be found in NVRAM in \texttt{opencore-version} variable
  even with boot log disabled.

  File logging will create a file named \texttt{opencore-YYYY-MM-DD-HHMMSS.txt} at EFI
  volume root with log contents (the upper case letter sequence is replaced with date
  and time from the firmware). Please be warned that some file system drivers present
  in firmwares are not reliable, and may corrupt data when writing files through UEFI.
  Log is attempted to be written in the safest manner, and thus is very slow. Ensure that
  \texttt{DisableWatchDog} is set to \texttt{true} when you use a slow drive.

\end{enumerate}

\subsection{Security Properties}\label{miscsecurityprops}

\begin{enumerate}

 -   \texttt{AllowNvramReset}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Allow \texttt{CMD+OPT+P+R} handling and enable
  showing \texttt{NVRAM Reset} entry in boot picker.

 -   \texttt{AllowSetDefault}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Allow \texttt{CTRL+Enter} and \texttt{CTRL+Index} handling
  to set the default boot option in boot picker.

 -   \texttt{AuthRestart}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enable \texttt{VirtualSMC}-compatible authenticated restart.

  Authenticated restart is a way to reboot FileVault 2 enabled macOS without entering
  the password. To perform authenticated restart one can use a dedicated terminal
  command: \texttt{sudo fdesetup authrestart}. It is also used when installing
  operating system updates.

  VirtualSMC performs authenticated restart by saving disk encryption key split in
  NVRAM and RTC, which despite being removed as soon as OpenCore starts, may be
  considered a security risk and thus is optional.

 -   \texttt{ExposeSensitiveData}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0x6}\\
  \textbf{Description}: Sensitive data exposure bitmask (sum) to operating system.

  \begin{itemize}
  \tightlist
    \item \texttt{0x01} --- Expose printable booter path as an UEFI variable.
    \item \texttt{0x02} --- Expose OpenCore version as an UEFI variable.
    \item \texttt{0x04} --- Expose OpenCore version in boot picker menu title.
    \item \texttt{0x08} --- Expose OEM information as a set of UEFI variables.
  \end{itemize}

  Exposed booter path points to OpenCore.efi or its booter depending on the load order.
  To obtain booter path use the following command in macOS:
\begin{lstlisting}[label=nvrampath, style=ocbash]
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path
\end{lstlisting}

  To use booter path for mounting booter volume use the following command in macOS:
\begin{lstlisting}[label=nvrampathmount, style=ocbash]
u=$(nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:boot-path | sed 's/.*GPT,\([^,]*\),.*/\1/'); \
  if [ "$u" != "" ]; then sudo diskutil mount $u ; fi
\end{lstlisting}

  To obtain OpenCore version use the following command in macOS:
\begin{lstlisting}[label=nvramver, style=ocbash]
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:opencore-version
\end{lstlisting}

  To obtain OEM information use the following commands in macOS:
\begin{lstlisting}[label=nvramver, style=ocbash]
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-product # SMBIOS Type1 ProductName
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-vendor  # SMBIOS Type2 Manufacturer
nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:oem-board   # SMBIOS Type2 ProductName
\end{lstlisting}

 -   \texttt{HaltLevel}\\
  \textbf{Type}: \texttt{plist\ integer}, 64 bit\\
  \textbf{Failsafe}: \texttt{0x80000000} (\texttt{DEBUG\_ERROR})\\
  \textbf{Description}: EDK II debug level bitmask (sum) causing CPU to
  halt (stop execution) after obtaining a message of \texttt{HaltLevel}.
  Possible values match \texttt{DisplayLevel} values.

 -   \texttt{Vault}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{Secure}\\
  \textbf{Description}: Enables vaulting mechanism in OpenCore.

  Valid values:

  \begin{itemize}
  \tightlist
  \item \texttt{Optional} --- require nothing, no vault is enforced, insecure.
  \item \texttt{Basic} --- require \texttt{vault.plist} file present
  in \texttt{OC} directory. This provides basic filesystem integrity
  verification and may protect from unintentional filesystem corruption.
  \item \texttt{Secure} --- require \texttt{vault.sig} signature file for
  \texttt{vault.plist} in \texttt{OC} directory. This includes \texttt{Basic}
  integrity checking but also attempts to build a trusted bootchain.
  \end{itemize}

  \texttt{vault.plist} file should contain SHA-256 hashes for all files used by OpenCore.
  Presence of this file is highly recommended to ensure that unintentional
  file modifications (including filesystem corruption) do not happen unnoticed.
  To create this file automatically use
  [\texttt{create\_vault.sh](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/CreateVault)} script.
  Regardless of the underlying filesystem, path name and case must match
  between \texttt{config.plist} and \texttt{vault.plist}.

  \texttt{vault.sig} file should contain a raw 256 byte RSA-2048 signature from SHA-256
  hash of \texttt{vault.plist}. The signature is verified against the public
  key embedded into \texttt{OpenCore.efi}. To embed the public key you should
  do either of the following:

  \begin{itemize}
  \tightlist
  \item Provide public key during the \texttt{OpenCore.efi} compilation in
  [\texttt{OpenCoreVault.c](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c)} file.
  \item Binary patch \texttt{OpenCore.efi} replacing zeroes with the public key
  between \texttt{=BEGIN OC VAULT=} and \texttt{==END OC VAULT==} ASCII markers.
  \end{itemize}

  RSA public key 520 byte format description can be found in Chromium OS documentation.
  To convert public key from X.509 certificate or from PEM file use
  [RsaTool](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/CreateVault).


  The complete set of commands to:

  \begin{itemize}
  \tightlist
  \item Create \texttt{vault.plist}.
  \item Create a new RSA key (always do this to avoid loading old configuration).
  \item Embed RSA key into \texttt{OpenCore.efi}.
  \item Create \texttt{vault.sig}.
  \end{itemize}

  Can look as follows:
\begin{lstlisting}[label=createvault, style=ocbash]
cd /Volumes/EFI/EFI/OC
/path/to/create_vault.sh .
/path/to/RsaTool -sign vault.plist vault.sig vault.pub
off=$(($(strings -a -t d OpenCore.efi | grep "=BEGIN OC VAULT=" | cut -f1 -d' ')+16))
dd of=OpenCore.efi if=vault.pub bs=1 seek=$off count=528 conv=notrunc
rm vault.pub
\end{lstlisting}

  \emph{Note 1}: While it may appear obvious, but you have to use an external
  method to verify \texttt{OpenCore.efi} and \texttt{BOOTx64.efi} for
  secure boot path. For this you are recommended to at least enable UEFI SecureBoot
  with a custom certificate, and sign \texttt{OpenCore.efi} and \texttt{BOOTx64.efi}
  with your custom key. More details on customising secure boot on modern firmwares
  can be found in [Taming UEFI SecureBoot](https://habr.com/post/273497/)
  paper (in Russian).

  \emph{Note 2}: \texttt{vault.plist} and \texttt{vault.sig} are used regardless of this
  option when \texttt{vault.plist} is present or public key is embedded into
  \texttt{OpenCore.efi}. Setting this option will only ensure configuration sanity,
  and abort the boot process otherwise.

 -   \texttt{ScanPolicy}\\
  \textbf{Type}: \texttt{plist\ integer}, 32 bit\\
  \textbf{Failsafe}: \texttt{0xF0103}\\
  \textbf{Description}: Define operating system detection policy.

  This value allows to prevent scanning (and booting) from untrusted
  source based on a bitmask (sum) of select flags. As it is not possible
  to reliably detect every file system or device type, this feature
  cannot be fully relied upon in open environments, and the additional
  measures are to be applied.

  Third party drivers may introduce additional security (and performance)
  measures following the provided scan policy. Scan policy is exposed
  in \texttt{scan-policy} variable of \texttt{4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102}
  GUID for UEFI Boot Services only.

  \begin{itemize}
  \tightlist
    \item \texttt{0x00000001} (bit \texttt{0}) --- \texttt{OC\_SCAN\_FILE\_SYSTEM\_LOCK}, restricts
    scanning to only known file systems defined as a part of this policy. File system
    drivers may not be aware of this policy, and to avoid mounting of undesired file
    systems it is best not to load its driver. This bit does not affect dmg mounting,
    which may have any file system. Known file systems are prefixed with
    \texttt{OC\_SCAN\_ALLOW\_FS\_}.
    \item \texttt{0x00000002} (bit \texttt{1}) --- \texttt{OC\_SCAN\_DEVICE\_LOCK}, restricts scanning
    to only known device types defined as a part of this policy. This is not always possible
    to detect protocol tunneling, so be aware that on some systems it may be possible for
    e.g. USB HDDs to be recognised as SATA. Cases like this must be reported. Known device
    types are prefixed with \texttt{OC\_SCAN\_ALLOW\_DEVICE\_}.
    \item \texttt{0x00000100} (bit \texttt{8}) --- \texttt{OC\_SCAN\_ALLOW\_FS\_APFS}, allows scanning
    of APFS file system.
    \item \texttt{0x00000200} (bit \texttt{9}) --- \texttt{OC\_SCAN\_ALLOW\_FS\_HFS}, allows scanning
    of HFS file system.
    \item \texttt{0x00000400} (bit \texttt{10}) --- \texttt{OC\_SCAN\_ALLOW\_FS\_ESP}, allows scanning
    of EFI System Partition file system.
    \item \texttt{0x00000800} (bit \texttt{11}) --- \texttt{OC\_SCAN\_ALLOW\_FS\_NTFS}, allows scanning
    of NTFS (Msft Basic Data) file system.
    \item \texttt{0x00001000} (bit \texttt{12}) --- \texttt{OC\_SCAN\_ALLOW\_FS\_EXT}, allows scanning
    of EXT (Linux Root) file system.
    \item \texttt{0x00010000} (bit \texttt{16}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SATA}, allow
    scanning SATA devices.
    \item \texttt{0x00020000} (bit \texttt{17}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SASEX}, allow
    scanning SAS and Mac NVMe devices.
    \item \texttt{0x00040000} (bit \texttt{18}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SCSI}, allow
    scanning SCSI devices.
    \item \texttt{0x00080000} (bit \texttt{19}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_NVME}, allow
    scanning NVMe devices.
    \item \texttt{0x00100000} (bit \texttt{20}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_ATAPI}, allow
    scanning CD/DVD devices.
    \item \texttt{0x00200000} (bit \texttt{21}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_USB}, allow
    scanning USB devices.
    \item \texttt{0x00400000} (bit \texttt{22}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_FIREWIRE}, allow
    scanning FireWire devices.
    \item \texttt{0x00800000} (bit \texttt{23}) --- \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SDCARD}, allow
    scanning card reader devices.
  \end{itemize}

  \emph{Note}: Given the above description, \texttt{0xF0103} value is expected to allow
  scanning of SATA, SAS, SCSI, and NVMe devices with APFS file system, and prevent scanning
  of any devices with HFS or FAT32 file systems in addition to not scanning APFS file systems
  on USB, CD, and FireWire drives. The combination reads as:
  \begin{itemize}
  \tightlist
  \item \texttt{OC\_SCAN\_FILE\_SYSTEM\_LOCK}
  \item \texttt{OC\_SCAN\_DEVICE\_LOCK}
  \item \texttt{OC\_SCAN\_ALLOW\_FS\_APFS}
  \item \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SATA}
  \item \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SASEX}
  \item \texttt{OC\_SCAN\_ALLOW\_DEVICE\_SCSI}
  \item \texttt{OC\_SCAN\_ALLOW\_DEVICE\_NVME}
  \end{itemize}

\end{enumerate}

\subsection{Entry Properties}\label{miscentryprops}

\begin{enumerate}
 -   \texttt{Arguments}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used as boot arguments (load options)
  of the specified entry.

 -   \texttt{Comment}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used to provide human readable
  reference for the entry. It is implementation defined whether this value is
  used.

 -   \texttt{Enabled}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: This entry will not be listed unless set to
  \texttt{true}.

 -   \texttt{Name}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Human readable entry name displayed in boot picker.

 -   \texttt{Path}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Entry location depending on entry type.

  \begin{itemize}
  \tightlist
  \item \texttt{Entries} specify external boot options, and therefore take device
  paths in \texttt{Path} key. These values are not checked, thus be extremely careful.
  Example: \texttt{PciRoot(0x0)/Pci(0x1,0x1)/.../\textbackslash EFI\textbackslash COOL.EFI}
  \item \texttt{Tools} specify internal boot options, which are part of bootloader
  vault, and therefore take file paths relative to \texttt{OC/Tools} directory.
  Example: \texttt{Shell.efi}.
  \end{itemize}

\end{enumerate}
