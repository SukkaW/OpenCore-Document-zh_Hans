---
title: 9. NVRAM
description: NVRAM（搬运填坑中）
type: docs
---

\subsection{Introduction}\label{nvramintro}

Has \texttt{plist\ dict} type and allows to set volatile UEFI variables
commonly referred as NVRAM variables. Refer to \texttt{man\ nvram} for
more details. macOS extensively uses NVRAM variables for OS --- Bootloader
--- Firmware intercommunication, and thus supplying several NVRAM is
required for proper macOS functioning.

Each NVRAM variable consists of its name, value, attributes (refer to
UEFI specification), and its
[GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier),
representing which `section' NVRAM variable belongs to. macOS uses
several GUIDs, including but not limited to:

\begin{itemize}
\tightlist
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14}
  (\texttt{APPLE\_VENDOR\_VARIABLE\_GUID})
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82}
  (\texttt{APPLE\_BOOT\_VARIABLE\_GUID})
 -   \texttt{8BE4DF61-93CA-11D2-AA0D-00E098032B8C}
  (\texttt{EFI\_GLOBAL\_VARIABLE\_GUID})
 -   \texttt{4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102}
  (\texttt{OC\_VENDOR\_VARIABLE\_GUID})
\end{itemize}

\emph{Note}: Some of the variables may be added by
\hyperref[platforminfonvram]{PlatformNVRAM} or
\hyperref[platforminfogeneric]{Generic} subsections of
\hyperref[platforminfo]{PlatformInfo} section.
Please ensure that variables of this section never collide with them,
as behaviour is undefined otherwise.

For proper macOS functioning it is often required to use \texttt{OC\_FIRMWARE\_RUNTIME}
protocol implementation currently offered as a part of \texttt{FwRuntimeServices} driver.
While it brings any benefits, there are certain limitations which arise depending on the
use.

\begin{enumerate}
\item Not all tools may be aware of protected namespaces.\\
  When \texttt{RequestBootVarRouting} is used \texttt{Boot}-prefixed variable access
  is restricted and protected in a separate namespace. To access the original variables
  tools have to be aware of \texttt{OC\_FIRMWARE\_RUNTIME} logic.
\item Assigned NVRAM variables are not always allowed to exceed 512 bytes.\\
  This is true for \texttt{Boot}-prefixed variables when \texttt{RequestBootVarFallback}
  is used, and for overwriting volatile variables with non-volatile on UEFI 2.8
  non-conformant firmwares.
\end{enumerate}

\subsection{Properties}\label{nvramprops}

\begin{enumerate}
 -   \texttt{Add}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Sets NVRAM variables from a map (\texttt{plist\ dict})
  of GUIDs to a map (\texttt{plist\ dict}) of variable names and their values
  in \texttt{plist\ metadata} format. GUIDs must be provided in canonic string
  format in upper or lower case (e.g. \texttt{8BE4DF61-93CA-11D2-AA0D-00E098032B8C}).

  Created variables get \texttt{EFI\_VARIABLE\_BOOTSERVICE\_ACCESS} and
  \texttt{EFI\_VARIABLE\_RUNTIME\_ACCESS} attributes set.
  Variables will only be set if not present and not blocked.
  To overwrite a variable add it to \texttt{Block} section. This approach
  enables to provide default values till the operating system takes the lead.

  \emph{Note}: If \texttt{plist\ key} does not conform to GUID format,
  behaviour is undefined.

 -   \texttt{Block}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Removes NVRAM variables from a map (\texttt{plist\ dict})
  of GUIDs to an array (\texttt{plist\ array}) of variable names in
  \texttt{plist\ string} format.

 -   \texttt{LegacyEnable}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enables loading of NVRAM variable file named \texttt{nvram.plist}
  from EFI volume root.

  This file must have root \texttt{plist\ dictionary} type and contain two fields:
  \begin{itemize}
  \tightlist
  \item \texttt{Version} --- \texttt{plist\ integer}, file version, must be set to 1.
  \item \texttt{Add} --- \texttt{plist\ dictionary}, equivalent to \texttt{Add} from
  \texttt{config.plist}.
  \end{itemize}

  Variable loading happens prior to \texttt{Block} (and \texttt{Add}) phases. Unless
  \texttt{LegacyOverwrite} is enabled, it will not overwrite any existing variable.
  Variables allowed to be set must be specified in \texttt{LegacySchema}.
  Third-party scripts may be used to create \texttt{nvram.plist}
  file. An example of such script can be found in \texttt{Utilities}. The use of third-party
  scripts may require \texttt{ExposeSensitiveData} set to \texttt{0x3} to provide
  \texttt{boot-path} variable with OpenCore EFI partition UUID.

  \textbf{WARNING}: This feature is very dangerous as it passes unprotected data to your
  firmware variable services. Use it only when no hardware NVRAM implementation is provided
  by the firmware or it is incompatible.

 -   \texttt{LegacyOverwrite}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Permits overwriting firmware variables from \texttt{nvram.plist}.

  \emph{Note}: Only variables accessible from the operating system will be overwritten.

 -   \texttt{LegacySchema}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Allows setting select NVRAM variables from a map
  (\texttt{plist\ dict}) of GUIDs to an array (\texttt{plist\ array}) of
  variable names in \texttt{plist\ string} format.

  You can use \texttt{*} value to accept all variables for select GUID.

  \textbf{WARNING}: Choose variables very carefully, as nvram.plist is not vaulted.
  For instance, do not put \texttt{boot-args} or \texttt{csr-active-config}, as
  this can bypass SIP.

 -   \texttt{WriteFlash}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Enables writing to flash memory for all added variables.

  \emph{Note}: This value is recommended to be enabled on most firmwares, but is
  left configurable for firmwares that may have issues with NVRAM variable storage
  garbage collection or alike.

\end{enumerate}

To read NVRAM variable value from macOS one could use \texttt{nvram}
by concatenating variable GUID and name separated by \texttt{:} symbol.
For example, \texttt{nvram 7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args}.

A continuously updated variable list can be found in a corresponding document:
[NVRAM Variables](https://docs.google.com/spreadsheets/d/1HTCBwfOBkXsHiK7os3b2CUc6k68axdJYdGl-TyXqLu0).

\subsection{Mandatory Variables}\label{nvramvars}

\emph{Warning}: These variables may be added by
\hyperref[platforminfonvram]{PlatformNVRAM} or
\hyperref[platforminfogeneric]{Generic} subsections of
\hyperref[platforminfo]{PlatformInfo} section.
Using \texttt{PlatformInfo} is the recommend way of setting these variables.

The following variables are mandatory for macOS functioning:

\begin{itemize}
\tightlist
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures}
  \break
  32-bit \texttt{FirmwareFeatures}. Present on all Macs to avoid extra parsing of SMBIOS tables
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask}
  \break
  32-bit \texttt{FirmwareFeaturesMask}. Present on all Macs to avoid extra parsing
  of SMBIOS tables.
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB}
  \break
  \texttt{BoardSerialNumber}. Present on newer Macs (2013+ at least) to avoid extra parsing
  of SMBIOS tables, especially in boot.efi.
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM}
  \break
  Primary network adapter MAC address or replacement value. Present on newer Macs
  (2013+ at least) to avoid accessing special memory region, especially in boot.efi.
\end{itemize}

\subsection{Recommended Variables}\label{nvramvarsrec}

The following variables are recommended for faster startup or other
improvements:

\begin{itemize}
\tightlist
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:csr-active-config}
  \break
  32-bit System Integrity Protection bitmask. Declared in XNU source code in
  [csr.h](https://opensource.apple.com/source/xnu/xnu-4570.71.2/bsd/sys/csr.h.auto.html).
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures}
  \break
  Combined \texttt{FirmwareFeatures} and \texttt{ExtendedFirmwareFeatures}. Present on
  newer Macs to avoid extra parsing of SMBIOS tables
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask}
  \break
  Combined \texttt{FirmwareFeaturesMask} and \texttt{ExtendedFirmwareFeaturesMask}.
  Present on newer Macs to avoid extra parsing of SMBIOS tables.
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_BID}
  \break
  Hardware \texttt{BoardProduct} (e.g. \texttt{Mac-35C1E88140C3E6CF}). Not present on
  real Macs, but used to avoid extra parsing of SMBIOS tables, especially in boot.efi.
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_MLB}
  \break
  Hardware \texttt{BoardSerialNumber}. Override for MLB. Present on newer Macs (2013+ at least).
 -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_ROM}
  \break
  Hardware ROM. Override for ROM. Present on newer Macs (2013+ at least).
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:prev-lang:kbd}
  \break
  ASCII string defining default keyboard layout. Format is \texttt{lang-COUNTRY:keyboard},
  e.g. \texttt{ru-RU:252} for Russian locale and ABC keyboard. Also accepts short forms:
  \texttt{ru:252} or \texttt{ru:0} (U.S. keyboard, compatible with 10.9). Full decoded
  keyboard list from \texttt{AppleKeyboardLayouts-L.dat} can be found
  [here](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/AppleKeyboardLayouts). Using non-latin keyboard on 10.14
  will not enable ABC keyboard, unlike previous and subsequent macOS versions, and is thus not recommended in case you need 10.14.
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:security-mode}
  \break
  ASCII string defining FireWire security mode. Legacy, can be found in IOFireWireFamily
  source code in
  [IOFireWireController.cpp](https://opensource.apple.com/source/IOFireWireFamily/IOFireWireFamily-473/IOFireWireFamily.kmodproj/IOFireWireController.cpp.auto.html).
  It is recommended not to set this variable, which may speedup system startup. Setting to
  \texttt{full} is equivalent to not setting the variable and \texttt{none} disables
  FireWire security.
  -   \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:UIScale}
  \break
  One-byte data defining boot.efi user interface scaling. Should be \textbf{01} for normal
  screens and \textbf{02} for HiDPI screens.
\end{itemize}

\subsection{Other Variables}\label{nvramvarsother}

The following variables may be useful for certain configurations or
troubleshooting:

\begin{itemize}
\tightlist
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:boot-args}
  \break
  Kernel arguments, used to pass configuration to Apple kernel and drivers.
  There are many arguments, which may be found by looking for the use of
  \texttt{PE\_parse\_boot\_argn} function in the kernel or driver code.
  Some of the known boot arguments include:

  \begin{itemize}
  \item \texttt{acpi\_layer=0xFFFFFFFF}
  \item \texttt{acpi\_level=0xFFFF5F} (implies
    \href{https://github.com/acpica/acpica/blob/master/source/include/acoutput.h}
    {\texttt{ACPI\_ALL\_COMPONENTS}})
  \item \texttt{batman=VALUE} (\texttt{AppleSmartBatteryManager} debug mask)
  \item \texttt{batman-nosmc=1} (disable \texttt{AppleSmartBatteryManager} SMC interface)
  \item \texttt{cpus=VALUE} (maximum number of CPUs used)
  \item \texttt{debug=VALUE} (debug mask)
  \item \texttt{io=VALUE} (\texttt{IOKit} debug mask)
  \item \texttt{keepsyms=1} (show panic log debug symbols)
  \item \texttt{kextlog=VALUE} (kernel extension loading debug mask)
  \item \texttt{nv\_disable=1} (disables NVIDIA GPU acceleration)
  \item \texttt{nvda\_drv=1} (legacy way to enable NVIDIA web driver, removed in 10.12)
  \item \texttt{npci=0x2000} ([legacy](https://www.insanelymac.com/forum/topic/260539-1068-officially-released/?do=findComment&comment=1707972), disables \texttt{kIOPCIConfiguratorPFM64})
  \item \texttt{lapic\_dont\_panic=1}
  \item \texttt{slide=VALUE} (manually set KASLR slide)
  \item \texttt{smcdebug=VALUE} (\texttt{AppleSMC} debug mask)
  \item \texttt{-amd\_no\_dgpu\_accel} (alternative to [WhateverGreen](https://github.com/acidanthera/WhateverGreen)'s \texttt{-radvesa} for new GPUs)
  \item \texttt{-nehalem\_error\_disable}
  \item \texttt{-no\_compat\_check} (disable model checking)
  \item \texttt{-s} (single mode)
  \item \texttt{-v} (verbose mode)
  \item \texttt{-x} (safe mode)
  \end{itemize}

  There are multiple external places summarising macOS argument lists:
  [example 1](https://osxeon.wordpress.com/2015/08/10/boot-argument-options-in-os-x),
  [example 2](https://superuser.com/questions/255176/is-there-a-list-of-available-boot-args-for-darwin-os-x).

 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg}
  \break
  Booter arguments, similar to \texttt{boot-args} but for boot.efi. Accepts a set of
  arguments, which are hexadecimal 64-bit values with or without 0x prefix primarily
  for logging control:
  \begin{itemize}
  \item \texttt{log=VALUE}
    \begin{itemize}
    \item \texttt{1} --- AppleLoggingConOutOrErrSet/AppleLoggingConOutOrErrPrint
    (classical ConOut/StdErr)
    \item \texttt{2} --- AppleLoggingStdErrSet/AppleLoggingStdErrPrint (StdErr or serial?)
    \item \texttt{4} --- AppleLoggingFileSet/AppleLoggingFilePrint (BOOTER.LOG/BOOTER.OLD
    file on EFI partition)
    \end{itemize}
  \item \texttt{debug=VALUE}
  \begin{itemize}
  \item \texttt{1} --- enables print something to BOOTER.LOG (stripped code implies there
  may be a crash)
  \item \texttt{2} --- enables perf logging to /efi/debug-log in the device three
  \item \texttt{4} --- enables timestamp printing for styled printf calls
  \end{itemize}
  \item \texttt{level=VALUE} --- Verbosity level of DEBUG output. Everything but
  \texttt{0x80000000} is stripped from the binary, and this is the default value.
  \item \texttt{kc-read-size=VALUE} --- Chunk size used for buffered I/O from network or
  disk for prelinkedkernel reading and related. Set to 1MB (0x100000) by default, can be
  tuned for faster booting.
  \end{itemize}

  \emph{Note}: To quickly see verbose output from \texttt{boot.efi} set this to \texttt{log=1}
  (currently this is broken in 10.15).
\item \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:bootercfg-once}
  \break
  Booter arguments override removed after first launch. Otherwise equivalent to \texttt{bootercfg}.
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:fmm-computer-name}
  \break
  Current saved host name. ASCII string.
 -   \texttt{7C436110-AB2A-4BBB-A880-FE41995C9F82:nvda\_drv}
  \break
  NVIDIA Web Driver control variable. Takes ASCII digit \texttt{1} or \texttt{0}
  to enable or disable installed driver.
\end{itemize}
