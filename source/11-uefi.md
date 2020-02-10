---
title: 10. UEFI
description: UEFI（搬运填坑中）
type: docs
---

\subsection{Introduction}\label{uefiintro}

[UEFI](https://uefi.org/specifications) (Unified Extensible Firmware Interface)
is a specification that defines a software interface between an operating system and
platform firmware. This section allows to load additional UEFI modules and/or apply
tweaks for the onboard firmware. To inspect firmware contents, apply modifications
and perform upgrades [UEFITool](https://github.com/LongSoft/UEFITool/releases)
and supplementary utilities can be used.

\subsection{Properties}\label{uefiprops}

\begin{enumerate}
 -   \texttt{ConnectDrivers}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Perform UEFI controller connection after driver loading.

  This option is useful for loading filesystem drivers, which
  usually follow UEFI driver model, and may not start by themselves.
  While effective, this option may not be necessary for drivers performing
  automatic connection, and may slightly slowdown the boot.

  \emph{Note}: Some firmwares, made by Apple in particular, only connect the boot
  drive to speedup the boot process. Enable this option to be able to see all the
  boot options when having multiple drives.

 -   \texttt{Drivers}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: None\\
  \textbf{Description}: Load selected drivers from \texttt{OC/Drivers}
  directory.

  Designed to be filled with string filenames meant to be loaded as UEFI
  drivers. Depending on the firmware a different set of drivers may be required.
  Loading an incompatible driver may lead your system to unbootable state or
  even cause permanent firmware damage. Some of the known drivers include:

  \begin{itemize}
  \tightlist
  \item [\texttt{ApfsDriverLoader](https://github.com/acidanthera/AppleSupportPkg)}
  --- APFS file system bootstrap driver adding the support of embedded APFS drivers
  in bootable APFS containers in UEFI firmwares.
  \item [\texttt{FwRuntimeServices](https://github.com/acidanthera/OcSupportPkg)}
  --- \texttt{OC\_FIRMWARE\_RUNTIME} protocol implementation that increases the security
  of OpenCore and Lilu by supporting read-only and write-only NVRAM variables. Some
  quirks, like \texttt{RequestBootVarRouting}, require this driver for proper function.
  Due to the nature of being a runtime driver, i.e. functioning in parallel with the
  target operating system, it cannot be implemented within OpenCore itself, but is bundled
  with OpenCore releases.
  \item [\texttt{EnhancedFatDxe](https://github.com/acidanthera/audk)}
  --- FAT filesystem driver from \texttt{FatPkg}. This driver is embedded in all
  UEFI firmwares, and cannot be used from OpenCore. It is known that multiple firmwares
  have a bug in their FAT support implementation, which leads to corrupted filesystems
  on write attempt. Embedding this driver within the firmware may be required in case
  writing to EFI partition is needed during the boot process.
  \item [\texttt{NvmExpressDxe](https://github.com/acidanthera/audk)}
  --- NVMe support driver from \texttt{MdeModulePkg}. This driver is included in most
  firmwares starting with Broadwell generation. For Haswell and earlier embedding it
  within the firmware may be more favourable in case a NVMe SSD drive is installed.
  \item [\texttt{AppleUsbKbDxe](https://github.com/acidanthera/OcSupportPkg)}
  --- USB keyboard driver adding the support of \texttt{AppleKeyMapAggregator} protocols
  on top of a custom USB keyboard driver implementation. This is an alternative to
  builtin \texttt{KeySupport}, which may work better or worse depending on the firmware.
  \item [\texttt{VBoxHfs](https://github.com/acidanthera/AppleSupportPkg)}
  --- HFS file system driver with bless support. This driver is an alternative to
  a closed source \texttt{HFSPlus} driver commonly found in Apple firmwares. While
  it is feature complete, it is approximately 3~times slower and is yet to undergo
  a security audit.
  \item [\texttt{XhciDxe](https://github.com/acidanthera/audk)}
  --- XHCI USB controller support driver from \texttt{MdeModulePkg}. This driver is
  included in most firmwares starting with Sandy Bridge generation. For earlier firmwares
  or legacy systems it may be used to support external USB 3.0 PCI cards.
  \end{itemize}

  To compile the drivers from UDK (EDK II) use the same command you do normally use
  for OpenCore compilation, but choose a corresponding package:
\begin{lstlisting}[label=compileudk, style=ocbash]
git clone https://github.com/acidanthera/audk UDK
cd UDK
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p FatPkg/FatPkg.dsc
build -a X64 -b RELEASE -t XCODE5 -p MdeModulePkg/MdeModulePkg.dsc
\end{lstlisting}

 -   \texttt{Input}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Failsafe}: None\\
  \textbf{Description}: Apply individual settings designed for input (keyboard and mouse) in
  \hyperref[uefiinputprops]{Input Properties} section below.

 -   \texttt{Output}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Failsafe}: None\\
  \textbf{Description}: Apply individual settings designed for output (text and graphics) in
  \hyperref[uefioutputprops]{Output Properties} section below.

 -   \texttt{Protocols}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Failsafe}: None\\
  \textbf{Description}: Force builtin versions of select protocols described
  in \hyperref[uefiprotoprops]{Protocols Properties} section below.

  \emph{Note}: all protocol instances are installed prior to driver loading.

 -   \texttt{Quirks}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Failsafe}: None\\
  \textbf{Description}: Apply individual firmware quirks described in
  \hyperref[uefiquirkprops]{Quirks Properties} section below.

\end{enumerate}

\subsection{Input Properties}\label{uefiinputprops}

\begin{enumerate}

 -   \texttt{KeyForgetThreshold}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Remove key unless it was submitted during this timeout in milliseconds.

  \texttt{AppleKeyMapAggregator} protocol is supposed to contain a fixed length buffer
  of currently pressed keys. However, the majority of the drivers only report key
  presses as interrupts and pressing and holding the key on the keyboard results in
  subsequent submissions of this key with some defined time interval. As a result
  we use a timeout to remove once pressed keys from the buffer once the timeout
  expires and no new submission of this key happened.

  This option allows to set this timeout based on your platform. The recommended
  value that works on the majority of the platforms is \texttt{5} milliseconds.
  For reference, holding one key on VMware will repeat it roughly every \texttt{2}
  milliseconds and the same value for APTIO V is \texttt{3-4} milliseconds. Thus
  it is possible to set a slightly lower value on faster platforms
  and slightly higher value on slower platforms for more responsive input.

 -   \texttt{KeyMergeThreshold}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Assume simultaneous combination for keys submitted within
  this timeout in milliseconds.

  Similarly to \texttt{KeyForgetThreshold}, this option works around the sequential
  nature of key submission. To be able to recognise simultaneously pressed keys
  in the situation when all keys arrive sequentially, we are required to set
  a timeout within which we assume the keys were pressed together.

  Holding multiple keys results in reports every \texttt{2} and \texttt{1} milliseconds
  for VMware and APTIO V respectively. Pressing keys one after the other results in
  delays of at least \texttt{6} and \texttt{10} milliseconds for the same platforms.
  The recommended value for this option is \texttt{2} milliseconds, but it may be
  decreased for faster platforms and increased for slower.

 -   \texttt{KeySupport}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enable internal keyboard input translation to
  \texttt{AppleKeyMapAggregator} protocol.

  This option activates the internal keyboard interceptor driver, based on
  \texttt{AppleGenericInput} aka (\texttt{AptioInputFix}), to fill
  \texttt{AppleKeyMapAggregator} database for input functioning. In case
  a separate driver is used, such as \texttt{AppleUsbKbDxe}, this option
  should never be enabled.

 -   \texttt{KeySupportMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: empty string\\
  \textbf{Description}: Set internal keyboard input translation to
  \texttt{AppleKeyMapAggregator} protocol mode.

  \begin{itemize}
  \tightlist
  \item \texttt{Auto} --- Performs automatic choice as available with the following preference: \texttt{AMI}, \texttt{V2}, \texttt{V1}.
  \item \texttt{V1} --- Uses UEFI standard legacy input protocol \texttt{EFI\_SIMPLE\_TEXT\_INPUT\_PROTOCOL}.
  \item \texttt{V2} --- Uses UEFI standard modern input protocol \texttt{EFI\_SIMPLE\_TEXT\_INPUT\_EX\_PROTOCOL}.
  \item \texttt{AMI} --- Uses APTIO input protocol \texttt{AMI\_EFIKEYCODE\_PROTOCOL}.
  \end{itemize}

 -   \texttt{KeySwap}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Swap \texttt{Command} and \texttt{Option} keys during submission.

  This option may be useful for keyboard layouts with \texttt{Option} key situated to the right
  of \texttt{Command} key.

 -   \texttt{PointerSupport}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enable internal pointer driver.

  This option implements standard UEFI pointer protocol (\texttt{EFI\_SIMPLE\_POINTER\_PROTOCOL})
  through select OEM protocols. The option may be useful on Z87 ASUS boards, where
  \texttt{EFI\_SIMPLE\_POINTER\_PROTOCOL} is broken.

 -   \texttt{PointerSupportMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: empty string\\
  \textbf{Description}: Set OEM protocol used for internal pointer driver.

  Currently the only supported variant is \texttt{ASUS}, using specialised protocol available
  on select Z87 and Z97 ASUS boards. More details can be found in
  [\texttt{LongSoft/UefiTool\#116](https://github.com/LongSoft/UEFITool/pull/116)}.

 -   \texttt{TimerResolution}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Set architecture timer resolution.

  This option allows to update firmware architecture timer period with the specified value
  in \texttt{100} nanosecond units. Setting a lower value generally improves performance
  and responsiveness of the interface and input handling.

  The recommended value is \texttt{50000} (\texttt{5} milliseconds) or slightly higher. Select
  ASUS Z87 boards use \texttt{60000} for the interface. Apple boards use \texttt{100000}.
  You may leave it as \texttt{0} in case there are issues.

\end{enumerate}

\subsection{Output Properties}\label{uefioutputprops}

\begin{enumerate}

 -   \texttt{TextRenderer}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{BuiltinGraphics}\\
  \textbf{Description}: Chooses renderer for text going through standard
  console output.

  Currently two renderers are supported: \texttt{Builtin} and
  \texttt{System}. \texttt{System} renderer uses firmware services
  for text rendering. \texttt{Builtin} bypassing firmware services
  and performs text rendering on its own. Different renderers support
  a different set of options. It is recommended to use \texttt{Builtin}
  renderer, as it supports HiDPI mode and uses full screen resolution.

  UEFI firmwares generally support \texttt{ConsoleControl} with two
  rendering modes: \texttt{Graphics} and \texttt{Text}. Some firmwares
  do not support \texttt{ConsoleControl} and rendering modes. OpenCore
  and macOS expect text to only be shown in \texttt{Graphics} mode and
  graphics to be drawn in any mode. Since this is not required by UEFI
  specification, exact behaviour varies.

  Valid values are combinations of text renderer and rendering mode:

  \begin{itemize}
  \tightlist
  \item \texttt{BuiltinGraphics} --- Switch to \texttt{Graphics}
    mode and use \texttt{Builtin} renderer with
    custom \texttt{ConsoleControl}.
  \item \texttt{SystemGraphics} --- Switch to \texttt{Graphics}
    mode and use \texttt{System} renderer with
    custom \texttt{ConsoleControl}.
  \item \texttt{SystemText} --- Switch to \texttt{Text}
    mode and use \texttt{System} renderer with
    custom \texttt{ConsoleControl}.
  \item \texttt{SystemGeneric} --- Use \texttt{System} renderer with
    system \texttt{ConsoleControl} assuming it behaves correctly.
  \end{itemize}

  The use of \texttt{BuiltinGraphics} is generally straightforward.
  For most platforms it is necessary to enable \texttt{ProvideConsoleGop},
  set \texttt{Resolution} to \texttt{Max}, and optionally configure
  \texttt{Scale}.

  The use of \texttt{System} protocols is more complicated. In general
  the preferred setting is \texttt{SystemGraphics} or \texttt{SystemText}.
  Enabling \texttt{ProvideConsoleGop}, setting \texttt{Resolution} to
  \texttt{Max}, enabling \texttt{ReplaceTabWithSpace} is useful on almost
  all platforms. \texttt{SanitiseClearScreen}, \texttt{IgnoreTextInGraphics},
  and \texttt{ClearScreenOnModeSwitch} are more specific, and their use
  depends on the firmware.

  \emph{Note}: Some Macs, namely \texttt{MacPro5,1}, may have broken
  console output with newer GPUs, and thus only \texttt{BuiltinGraphics}
  may work for them.

 -   \texttt{ConsoleMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Sets console output mode as specified
  with the \texttt{WxH} (e.g. \texttt{80x24}) formatted string.

  Set to empty string not to change console mode. Set to \texttt{Max}
  to try to use largest available console mode. Currently
  \texttt{Builtin} text renderer supports only one console mode, so
  this option is ignored.

  \emph{Note}: This field is best to be left empty on most firmwares.

 -   \texttt{Resolution}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Sets console output screen resolution.

  \begin{itemize}
  \tightlist
  \item Set to \texttt{WxH@Bpp} (e.g. \texttt{1920x1080@32}) or \texttt{WxH}
  (e.g. \texttt{1920x1080}) formatted string to request custom resolution
  from GOP if available.
  \item Set to empty string not to change screen resolution.
  \item Set to \texttt{Max} to try to use largest available screen resolution.
  \end{itemize}

  On HiDPI screens \texttt{APPLE\_VENDOR\_VARIABLE\_GUID} \texttt{UIScale}
  NVRAM variable may need to be set to \texttt{02} to enable HiDPI scaling
  in FileVault 2 UEFI password interface and boot screen logo. Refer to
  \hyperref[nvramvarsrec]{Recommended Variables} section for more details.

  \emph{Note}: This will fail when console handle has no GOP protocol. When
  the firmware does not provide it, it can be added with \texttt{ProvideConsoleGop}
  set to \texttt{true}.

 -   \texttt{ClearScreenOnModeSwitch}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Some firmwares clear only part of screen when switching
  from graphics to text mode, leaving a fragment of previously drawn image visible.
  This option fills the entire graphics screen with black color before switching to
  text mode.

  \emph{Note}: This option only applies to \texttt{System} renderer.

 -   \texttt{IgnoreTextInGraphics}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Select firmwares output text onscreen in both graphics and
  text mode. This is normally unexpected, because random text may appear over
  graphical images and cause UI corruption. Setting this option to \texttt{true} will
  discard all text output when console control is in mode different from \texttt{Text}.

  \emph{Note}: This option only applies to \texttt{System} renderer.

 -   \texttt{ReplaceTabWithSpace}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Some firmwares do not print tab characters or even everything
  that follows them, causing difficulties or inability to use the UEFI Shell builtin
  text editor to edit property lists and other documents. This option makes the console
  output spaces instead of tabs.

  \emph{Note}: This option only applies to \texttt{System} renderer.

 -   \texttt{ProvideConsoleGop}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Ensure GOP (Graphics Output Protocol) on console handle.

  macOS bootloader requires GOP to be present on console handle, yet the exact
  location of GOP is not covered by the UEFI specification. This option will
  ensure GOP is installed on console handle if it is present.

  \emph{Note}: This option will also replace broken GOP protocol on console handle,
  which may be the case on \texttt{MacPro5,1} with newer GPUs.

 -   \texttt{ProvideEarlyConsole}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Ensure switching to text mode early at startup.

  Disabling this option may result in hiding all messages during startup.
  Since only error messages should normally be printed during startup, this option
  is recommended to be always enabled. The only exception for this option
  to be disabled is when firmware or third-party drivers, e.g. \texttt{ApfsJumpStart}
  on legacy Macs, unconditionally print to standard output and cannot be otherwise
  controlled by the bootloader.

 -   \texttt{ReconnectOnResChange}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reconnect console controllers after changing screen resolution.

  On some firmwares when screen resolution is changed via GOP, it is required to reconnect
  the controllers, which produce the console protocols (simple text out). Otherwise they
  will not produce text based on the new resolution.

  \emph{Note}: On several boards this logic may result in black screen when launching
  OpenCore from Shell and thus it is optional. In versions prior to 0.5.2 this option
  was mandatory and not configurable. Please do not use this unless required.

 -   \texttt{SanitiseClearScreen}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Some firmwares reset screen resolution to a failsafe
  value (like \texttt{1024x768}) on the attempts to clear screen contents
  when large display (e.g. 2K or 4K) is used. This option attempts to apply
  a workaround.

  \emph{Note}: This option only applies to \texttt{System} renderer.
   On all known affected systems \texttt{ConsoleMode} had to be set to
   empty string for this to work.

 -   \texttt{Scale}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{100}\\
  \textbf{Description}: Sets text renderer HiDPI scaling in percents.

  Currently only \texttt{100} and \texttt{200} values are supported.

  \emph{Note}: This option only applies to \texttt{Builtin} renderer.

\end{enumerate}


\subsection{Protocols Properties}\label{uefiprotoprops}

\begin{enumerate}

 -   \texttt{AppleBootPolicy}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple Boot Policy protocol with a builtin
  version. This may be used to ensure APFS compatibility on VMs or legacy Macs.

  \emph{Note}: Some Macs, namely \texttt{MacPro5,1}, do have APFS compatibility,
  but their Apple Boot Policy protocol contains recovery detection issues, thus
  using this option is advised on them as well.

 -   \texttt{AppleEvent}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple Event protocol with a builtin
  version. This may be used to ensure File Vault 2 compatibility on VMs or legacy Macs.

 -   \texttt{AppleImageConversion}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple Image Conversion protocol with a builtin
  version.

 -   \texttt{AppleKeyMap}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple Key Map protocols with builtin
  versions.

 -   \texttt{AppleSmcIo}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple SMC I/O protocol with a builtin
  version.

  This protocol replaces legacy \texttt{VirtualSmc} UEFI driver, and is compatible
  with any SMC kernel extension. However, in case \texttt{FakeSMC} kernel extension
  is used, manual NVRAM key variable addition may be needed.

 -   \texttt{AppleUserInterfaceTheme}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Apple User Interface Theme protocol with a builtin
  version.

 -   \texttt{DataHub}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Data Hub protocol with a builtin version.
  This will drop all previous properties if the protocol was already installed.

 -   \texttt{DeviceProperties}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reinstalls Device Property protocol with a builtin
  version. This will drop all previous properties if it was already installed.
  This may be used to ensure full compatibility on VMs or legacy Macs.

 -   \texttt{FirmwareVolume}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forcibly wraps Firmware Volume protocols or installs new
  to support custom cursor images for File Vault 2. Should be set to \texttt{true}
  to ensure File Vault 2 compatibility on everything but VMs and legacy Macs.

 -   \texttt{HashServices}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forcibly reinstalls Hash Services protocols with builtin
  versions. Should be set to \texttt{true} to ensure File Vault 2 compatibility
  on platforms providing broken SHA-1 hashing. Can be diagnosed by invalid
  cursor size with \texttt{UIScale} set to \texttt{02}, in general platforms
  prior to APTIO V (Haswell and older) are affected.

 -   \texttt{OSInfo}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forcibly reinstalls OS Info protocol with builtin
  versions. This protocol is generally used to receive notifications from macOS
  bootloader, by the firmware or by other applications.

 -   \texttt{UnicodeCollation}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forcibly reinstalls unicode collation services with builtin
  version. Should be set to \texttt{true} to ensure UEFI Shell compatibility
  on platforms providing broken unicode collation. In general legacy Insyde and APTIO
  platforms on Ivy Bridge and earlier are affected.

\end{enumerate}

\subsection{Quirks Properties}\label{uefiquirkprops}

\begin{enumerate}

 -   \texttt{ExitBootServicesDelay}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Adds delay in microseconds after \texttt{EXIT\_BOOT\_SERVICES}
  event.

  This is a very ugly quirk to circumvent "Still waiting for root device" message
  on select APTIO IV firmwares, namely ASUS Z87-Pro, when using FileVault 2 in particular.
  It seems that for some reason they execute code in parallel to \texttt{EXIT\_BOOT\_SERVICES},
  which results in SATA controller being inaccessible from macOS. A better approach should be
  found in some future. Expect 3-5 seconds to be enough in case the quirk is needed.

 -   \texttt{IgnoreInvalidFlexRatio}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Select firmwares, namely APTIO IV, may contain invalid values in
  \texttt{MSR\_FLEX\_RATIO} (\texttt{0x194}) MSR register. These values may cause
  macOS boot failure on Intel platforms.

  \emph{Note}: While the option is not supposed to induce harm on unaffected firmwares,
  its usage is not recommended when it is not required.

 -   \texttt{ReleaseUsbOwnership}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Attempt to detach USB controller ownership from
  the firmware driver. While most firmwares manage to properly do that,
  or at least have an option for, select firmwares do not. As a result,
  operating system may freeze upon boot. Not recommended unless required.

 -   \texttt{RequestBootVarFallback}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Request fallback of some \texttt{Boot} prefixed variables from
  \texttt{OC\_VENDOR\_VARIABLE\_GUID} to \newline \texttt{EFI\_GLOBAL\_VARIABLE\_GUID}.

  This quirk requires \texttt{RequestBootVarRouting} to be enabled and therefore
  \texttt{OC\_FIRMWARE\_RUNTIME} protocol implemented in \texttt{FwRuntimeServices.efi}.

  By redirecting \texttt{Boot} prefixed variables to a separate GUID namespace we achieve
  multiple goals:
  \begin{itemize}
  \tightlist
  \item Operating systems are jailed and only controlled by OpenCore boot
  environment to enhance security.
  \item Operating systems do not mess with OpenCore boot priority, and guarantee
  fluent updates and hibernation wakes for cases that require reboots with OpenCore
  in the middle.
  \item Potentially incompatible boot entries, such as macOS entries, are not deleted
  or anyhow corrupted.
  \end{itemize}

  However, some firmwares do their own boot option scanning upon startup by checking
  file presence on the available disks. Quite often this scanning includes non-standard
  locations, such as Windows Bootloader paths. Normally it is not an issue, but some
  firmwares, ASUS firmwares on APTIO V in particular, have bugs. For them scanning is
  implemented improperly, and firmware preferences may get accidentally corrupted
  due to \texttt{BootOrder} entry duplication (each option will be added twice) making
  it impossible to boot without cleaning NVRAM.

  To trigger the bug one should have some valid boot options (e.g. OpenCore) and then
  install Windows with \texttt{RequestBootVarRouting} enabled. As Windows bootloader
  option will not be created by Windows installer, the firmware will attempt to create it
  itself, and then corrupt its boot option list.

  This quirk forwards all UEFI specification valid boot options, that are not related to
  macOS, to the firmware into \texttt{BootF\#\#\#} and \texttt{BootOrder} variables upon
  write. As the entries are added to the end of \texttt{BootOrder}, this does not
  break boot priority, but ensures that the firmware does not try to append a new option
  on its own after Windows installation for instance.

 -   \texttt{RequestBootVarRouting}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Request redirect of all \texttt{Boot} prefixed variables from
  \texttt{EFI\_GLOBAL\_VARIABLE\_GUID} to \newline \texttt{OC\_VENDOR\_VARIABLE\_GUID}.

  This quirk requires \texttt{OC\_FIRMWARE\_RUNTIME} protocol implemented
  in \texttt{FwRuntimeServices.efi}. The quirk lets default boot entry
  preservation at times when firmwares delete incompatible boot entries.
  Simply said, you are required to enable this quirk to be able to reliably
  use [Startup Disk](https://support.apple.com/HT202796) preference
  pane in a firmware that is not compatible with macOS boot entries by design.

 -   \texttt{UnblockFsConnect}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Some firmwares block partition handles by opening them
  in By Driver mode, which results in File System protocols being unable to install.

  \emph{Note}: The quirk is mostly relevant for select HP laptops with no drives listed.

\end{enumerate}
