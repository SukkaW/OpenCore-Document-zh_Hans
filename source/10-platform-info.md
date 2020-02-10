---
title: 10. PlatformInfo
description: PlatformInfo（搬运填坑中）
type: docs
---

Platform information is comprised of several identification fields
generated or filled manually to be compatible with macOS services. The
base part of the configuration may be obtained from
[\texttt{MacInfoPkg](https://github.com/acidanthera/MacInfoPkg)}
package, which itself generates a set of interfaces based on a database
in [YAML](https://yaml.org/spec/1.2/spec.html) format. These fields
are written to three select destinations:

\begin{itemize}
\tightlist
 -   [SMBIOS](https://www.dmtf.org/standards/smbios)
 -   \href{https://github.com/acidanthera/EfiPkg/blob/master/Include/Protocol/DataHub.h}{Data
  Hub}
 -   NVRAM
\end{itemize}

Most of the fields specify the overrides in SMBIOS, and their field
names conform to EDK2
[SmBios.h](https://github.com/tianocore/edk2/blob/UDK2018/MdePkg/Include/IndustryStandard/SmBios.h)
header file. However, several important fields reside in Data Hub and
NVRAM. Some of the values can be found in more than one field and/or
destination, so there are two ways to control their update process:
manual, where one specifies all the values (the default), and semi-automatic,
where (\texttt{Automatic}) only select values are specified, and later used
for system configuration.

To inspect SMBIOS contents [dmidecode](http://www.nongnu.org/dmidecode) utility can
be used. Version with macOS specific enhancements can be downloaded from
[Acidanthera/dmidecode](https://github.com/acidanthera/dmidecode/releases).

\subsection{Properties}\label{platforminfoprops}

\begin{enumerate}
 -   \texttt{Automatic}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Generate PlatformInfo based on \texttt{Generic}
  section instead of using values from \texttt{DataHub}, \texttt{NVRAM},
  and \texttt{SMBIOS} sections.

  Enabling this option is useful when \texttt{Generic} section is flexible
  enough. When enabled \texttt{SMBIOS}, \texttt{DataHub}, and
  \texttt{PlatformNVRAM} data is unused.
 -   \texttt{UpdateDataHub}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Update Data Hub fields. These fields are read
  from \texttt{Generic} or \texttt{DataHub} sections depending on
  \texttt{Automatic} value.
 -   \texttt{UpdateNVRAM}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Update NVRAM fields related to platform information.

  These fields are read from \texttt{Generic} or \texttt{PlatformNVRAM} sections
  depending on \texttt{Automatic} value. All the other fields are
  to be specified with \texttt{NVRAM} section.

  If \texttt{UpdateNVRAM} is set to \texttt{false} the aforementioned
  variables can be updated with \hyperref[nvram]{\texttt{NVRAM}}
  section. If \texttt{UpdateNVRAM} is set to \texttt{true} the behaviour is
  undefined when any of the fields are present in \texttt{NVRAM} section.
 -   \texttt{UpdateSMBIOS}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Update SMBIOS fields. These fields are read from
  \texttt{Generic} or \texttt{SMBIOS} sections depending on
  \texttt{Automatic} value.
 -   \texttt{UpdateSMBIOSMode}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{Create}\\
  \textbf{Description}: Update SMBIOS fields approach:

  \begin{itemize}
  \tightlist
   -     \texttt{TryOverwrite} --- \texttt{Overwrite} if new size is \textless{}= than
    the page-aligned original and there are no issues with legacy region
    unlock. \texttt{Create} otherwise. Has issues with some firmwares.
   -     \texttt{Create} --- Replace the tables with newly allocated
    EfiReservedMemoryType at AllocateMaxAddress without any fallbacks.
   -     \texttt{Overwrite} --- Overwrite existing gEfiSmbiosTableGuid and
    gEfiSmbiosTable3Guid data if it fits new size. Abort with
    unspecified state otherwise.
   -     \texttt{Custom} --- Write first SMBIOS table
    (\texttt{gEfiSmbiosTableGuid}) to \texttt{gOcCustomSmbiosTableGuid}
    to workaround firmwares overwriting SMBIOS contents at
    ExitBootServices. Otherwise equivalent to \texttt{Create}. Requires
    patching AppleSmbios.kext and AppleACPIPlatform.kext to read from
    another GUID: \texttt{"EB9D2D31"} - \texttt{"EB9D2D35"} (in ASCII),
    done automatically by \texttt{CustomSMBIOSGuid} quirk.
  \end{itemize}
 -   \texttt{Generic}\\
  \textbf{Type}: \texttt{plist\ dictonary}\\
  \textbf{Optional}: When \texttt{Automatic} is \texttt{false}\\
  \textbf{Description}: Update all fields. This section is read only
  when \texttt{Automatic} is active.
 -   \texttt{DataHub}\\
  \textbf{Type}: \texttt{plist\ dictonary}\\
  \textbf{Optional}: When \texttt{Automatic} is \texttt{true}\\
  \textbf{Description}: Update Data Hub fields. This section is read
  only when \texttt{Automatic} is not active.
 -   \texttt{PlatformNVRAM}\\
  \textbf{Type}: \texttt{plist\ dictonary}\\
  \textbf{Optional}: When \texttt{Automatic} is \texttt{true}\\
  \textbf{Description}: Update platform NVRAM fields. This section is
  read only when \texttt{Automatic} is not active.
 -   \texttt{SMBIOS}\\
  \textbf{Type}: \texttt{plist\ dictonary}\\
  \textbf{Optional}: When \texttt{Automatic} is \texttt{true}\\
  \textbf{Description}: Update SMBIOS fields. This section is read only
  when \texttt{Automatic} is not active.
\end{enumerate}

\subsection{Generic Properties}\label{platforminfogeneric}

\begin{enumerate}
 -   \texttt{SpoofVendor}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Sets SMBIOS vendor fields to \texttt{Acidanthera}.

  It is dangerous to use Apple in SMBIOS vendor fields for reasons given
  in \texttt{SystemManufacturer} description. However, certain firmwares
  may not provide valid values otherwise, which could break some software.
 -   \texttt{AdviseWindows}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Forces Windows support in \texttt{FirmwareFeatures}.

  Added bits to \texttt{FirmwareFeatures}:

  \begin{itemize}
    \item \texttt{FW\_FEATURE\_SUPPORTS\_CSM\_LEGACY\_MODE} (\texttt{0x1})
    - Without this bit it is not possible to reboot to Windows installed on
      a drive with EFI partition being not the first partition on the disk.
    \item \texttt{FW\_FEATURE\_SUPPORTS\_UEFI\_WINDOWS\_BOOT} (\texttt{0x20000000})
    - Without this bit it is not possible to reboot to Windows installed on
      a drive with EFI partition being the first partition on the disk.
  \end{itemize}

 -   \texttt{SystemProductName}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{MacPro6,1}\\
  \textbf{Description}: Refer to SMBIOS \texttt{SystemProductName}.
 -   \texttt{SystemSerialNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{OPENCORE\_SN1}\\
  \textbf{Description}: Refer to SMBIOS \texttt{SystemSerialNumber}.
 -   \texttt{SystemUUID}\\
  \textbf{Type}: \texttt{plist\ string}, GUID\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{Description}: Refer to SMBIOS \texttt{SystemUUID}.
 -   \texttt{MLB}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: \texttt{OPENCORE\_MLB\_SN11}\\
  \textbf{Description}: Refer to SMBIOS \texttt{BoardSerialNumber}.
 -   \texttt{ROM}\\
  \textbf{Type}: \texttt{plist\ data}, 6 bytes\\
  \textbf{Failsafe}: all zero\\
  \textbf{Description}: Refer to
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM}.

\end{enumerate}

\subsection{DataHub Properties}\label{platforminfodatahub}

\begin{enumerate}
 -   \texttt{PlatformName}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{name} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is
  \texttt{platform} in ASCII.
 -   \texttt{SystemProductName}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{Model} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is equal to SMBIOS
  \texttt{SystemProductName} in Unicode.
 -   \texttt{SystemSerialNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{SystemSerialNumber} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is equal to SMBIOS
  \texttt{SystemSerialNumber} in Unicode.
 -   \texttt{SystemUUID}\\
  \textbf{Type}: \texttt{plist\ string}, GUID\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{system-id} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is equal to SMBIOS
  \texttt{SystemUUID}.
 -   \texttt{BoardProduct}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{board-id} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is equal to SMBIOS
  \texttt{BoardProduct} in ASCII.
 -   \texttt{BoardRevision}\\
  \textbf{Type}: \texttt{plist\ data}, 1 byte\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Sets \texttt{board-rev} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs seems to correspond
  to internal board revision (e.g. \texttt{01}).
 -   \texttt{StartupPowerEvents}\\
  \textbf{Type}: \texttt{plist\ integer}, 64-bit\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Sets \texttt{StartupPowerEvents} in
  \texttt{gEfiMiscSubClassGuid}. Value found on Macs is power management
  state bitmask, normally 0. Known bits read by
  \texttt{X86PlatformPlugin.kext}:

  \begin{itemize}
  \tightlist
   -     \texttt{0x00000001} --- Shutdown cause was a \texttt{PWROK} event
    (Same as \texttt{GEN\_PMCON\_2} bit 0)
   -     \texttt{0x00000002} --- Shutdown cause was a \texttt{SYS\_PWROK}
    event (Same as \texttt{GEN\_PMCON\_2} bit 1)
   -     \texttt{0x00000004} --- Shutdown cause was a \texttt{THRMTRIP\#}
    event (Same as \texttt{GEN\_PMCON\_2} bit 3)
   -     \texttt{0x00000008} --- Rebooted due to a SYS\_RESET\# event (Same
    as \texttt{GEN\_PMCON\_2} bit 4)
   -     \texttt{0x00000010} --- Power Failure (Same as
    \texttt{GEN\_PMCON\_3} bit 1 \texttt{PWR\_FLR})
   -     \texttt{0x00000020} --- Loss of RTC Well Power (Same as
    \texttt{GEN\_PMCON\_3} bit 2 \texttt{RTC\_PWR\_STS})
   -     \texttt{0x00000040} --- General Reset Status (Same as
    \texttt{GEN\_PMCON\_3} bit 9 \texttt{GEN\_RST\_STS})
   -     \texttt{0xffffff80} --- SUS Well Power Loss (Same as
    \texttt{GEN\_PMCON\_3} bit 14)
   -     \texttt{0x00010000} --- Wake cause was a ME Wake event (Same as
    PRSTS bit 0, \texttt{ME\_WAKE\_STS})
   -     \texttt{0x00020000} --- Cold Reboot was ME Induced event (Same as
    \texttt{PRSTS} bit 1 \texttt{ME\_HRST\_COLD\_STS})
   -     \texttt{0x00040000} --- Warm Reboot was ME Induced event (Same as
    \texttt{PRSTS} bit 2 \texttt{ME\_HRST\_WARM\_STS})
   -     \texttt{0x00080000} --- Shutdown was ME Induced event (Same as
    \texttt{PRSTS} bit 3 \texttt{ME\_HOST\_PWRDN})
   -     \texttt{0x00100000} --- Global reset ME Wachdog Timer event (Same as
    \texttt{PRSTS} bit 6)
   -     \texttt{0x00200000} --- Global reset PowerManagment Wachdog Timer
    event (Same as \texttt{PRSTS} bit 15)
  \end{itemize}
 -   \texttt{InitialTSC}\\
  \textbf{Type}: \texttt{plist\ integer}, 64-bit\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Sets \texttt{InitialTSC} in
  \texttt{gEfiProcessorSubClassGuid}. Sets initial TSC value, normally
  0.
 -   \texttt{FSBFrequency}\\
  \textbf{Type}: \texttt{plist\ integer}, 64-bit\\
  \textbf{Failsafe}: Automatic\\
  \textbf{Description}: Sets \texttt{FSBFrequency} in
  \texttt{gEfiProcessorSubClassGuid}.

  Sets CPU FSB frequency. This value equals to CPU nominal frequency divided
  by CPU maximum bus ratio and is specified in Hz. Refer to
  \texttt{MSR\_NEHALEM\_PLATFORM\_INFO}~(\texttt{CEh}) MSR value to determine
  maximum bus ratio on modern Intel CPUs.

  \emph{Note}: This value is not used on Skylake and newer but is still provided
  to follow suit.
 -   \texttt{ARTFrequency}\\
  \textbf{Type}: \texttt{plist\ integer}, 64-bit\\
  \textbf{Failsafe}: Automatic\\
  \textbf{Description}: Sets \texttt{ARTFrequency} in
  \texttt{gEfiProcessorSubClassGuid}.

  This value contains CPU ART frequency, also known as crystal clock frequency.
  Its existence is exclusive to Skylake generation and newer. The value is specified
  in Hz, and is normally 24 MHz for client Intel segment, 25 MHz for server Intel segment,
  and 19.2 MHz for Intel Atom CPUs. macOS till 10.15 inclusive assumes 24 MHz by default.

  \emph{Note}: On Intel Skylake X ART frequency may be a little less (approx. 0.25\%) than
  24 or 25 MHz due to special EMI-reduction circuit as described in
  [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker/issues/448#issuecomment-524914166).
 -   \texttt{DevicePathsSupported}\\
  \textbf{Type}: \texttt{plist\ integer}, 32-bit\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{DevicePathsSupported} in
  \texttt{gEfiMiscSubClassGuid}. Must be set to \texttt{1} for
  AppleACPIPlatform.kext to append SATA device paths to
  \texttt{Boot\#\#\#\#} and \texttt{efi-boot-device-data} variables.
  Set to \texttt{1} on all modern Macs.
 -   \texttt{SmcRevision}\\
  \textbf{Type}: \texttt{plist\ data}, 6 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{REV} in
  \texttt{gEfiMiscSubClassGuid}. Custom property read by
  \texttt{VirtualSMC} or \texttt{FakeSMC} to generate SMC \texttt{REV}
  key.
 -   \texttt{SmcBranch}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{RBr} in
  \texttt{gEfiMiscSubClassGuid}. Custom property read by
  \texttt{VirtualSMC} or \texttt{FakeSMC} to generate SMC \texttt{RBr}
  key.
 -   \texttt{SmcPlatform}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Sets \texttt{RPlt} in
  \texttt{gEfiMiscSubClassGuid}. Custom property read by
  \texttt{VirtualSMC} or \texttt{FakeSMC} to generate SMC \texttt{RPlt}
  key.
\end{enumerate}

\subsection{PlatformNVRAM Properties}\label{platforminfonvram}

\begin{enumerate}
 -   \texttt{BID}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Specifies the value of NVRAM variable
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_BID}.

 -   \texttt{ROM}\\
  \textbf{Type}: \texttt{plist\ data}, 6 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Specifies the values of NVRAM variables
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_ROM} and
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ROM}.

 -   \texttt{MLB}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: Specifies the values of NVRAM variables
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:HW\_MLB} and
  \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:MLB}.

 -   \texttt{FirmwareFeatures}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: This variable comes in pair with \texttt{FirmwareFeaturesMask}.
  Specifies the values of NVRAM variables:
  \begin{itemize}
  \tightlist
  \item \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeatures}
  \item \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeatures}
  \end{itemize}

 -   \texttt{FirmwareFeaturesMask}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: Not installed\\
  \textbf{Description}: This variable comes in pair with \texttt{FirmwareFeatures}.
  Specifies the values of NVRAM variables:
  \begin{itemize}
  \tightlist
  \item \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:FirmwareFeaturesMask}
  \item \texttt{4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14:ExtendedFirmwareFeaturesMask}
  \end{itemize}

\end{enumerate}

\subsection{SMBIOS Properties}\label{platforminfosmbios}

\begin{enumerate}
 -   \texttt{BIOSVendor}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: BIOS Information (Type 0) --- Vendor\\
  \textbf{Description}: BIOS Vendor. All rules of
  \texttt{SystemManufacturer} do apply.
 -   \texttt{BIOSVersion}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: BIOS Information (Type 0) --- BIOS Version\\
  \textbf{Description}: Firmware version. This value gets updated and
  takes part in update delivery configuration and macOS version
  compatibility. This value could look like
  \texttt{MM71.88Z.0234.B00.1809171422} in older firmwares, and is
  described in
  [BiosId.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/Guid/BiosId.h).
  In newer firmwares it should look like \texttt{236.0.0.0.0} or
  \texttt{220.230.16.0.0\ (iBridge:\ 16.16.2542.0.0,0)}. iBridge version
  is read from \texttt{BridgeOSVersion} variable, and is only present on
  macs with T2.

\begin{verbatim}
Apple ROM Version
 BIOS ID:      MBP151.88Z.F000.B00.1811142212
 Model:        MBP151
 EFI Version:  220.230.16.0.0
 Built by:     root@quinoa
 Date:         Wed Nov 14 22:12:53 2018
 Revision:     220.230.16 (B&I)
 ROM Version:  F000_B00
 Build Type:   Official Build, RELEASE
 Compiler:     Apple LLVM version 10.0.0 (clang-1000.2.42)
 UUID:         E5D1475B-29FF-32BA-8552-682622BA42E1
 UUID:         151B0907-10F9-3271-87CD-4BF5DBECACF5
\end{verbatim}
 -   \texttt{BIOSReleaseDate}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: BIOS Information (Type 0) --- BIOS Release Date\\
  \textbf{Description}: Firmware release date. Similar to
  \texttt{BIOSVersion}. May look like \texttt{12/08/2017}.
 -   \texttt{SystemManufacturer}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- Manufacturer\\
  \textbf{Description}: OEM manufacturer of the particular board. Shall
  not be specified unless strictly required. Should \emph{not} contain
  \texttt{Apple\ Inc.}, as this confuses numerous services present in
  the operating system, such as firmware updates, eficheck, as well as
  kernel extensions developed in Acidanthera, such as Lilu and its
  plugins. In addition it will also make some operating systems
  like Linux unbootable.
 -   \texttt{SystemProductName}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1), Product Name\\
  \textbf{Description}: Preferred Mac model used to mark the device as
  supported by the operating system. This value must be specified by any
  configuration for later automatic generation of the related values in
  this and other SMBIOS tables and related configuration parameters. If
  \texttt{SystemProductName} is not compatible with the target operating
  system, \texttt{-no\_compat\_check} boot argument may be used as an
  override.

  \emph{Note}: If \texttt{SystemProductName} is unknown, and related
  fields are unspecified, default values should be assumed as being set
  to \texttt{MacPro6,1} data. The list of known products can be found in
  \texttt{MacInfoPkg}.
 -   \texttt{SystemVersion}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- Version\\
  \textbf{Description}: Product iteration version number. May look like
  \texttt{1.1}.
 -   \texttt{SystemSerialNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- Serial Number\\
  \textbf{Description}: Product serial number in defined format. Known
  formats are described in
  [macserial](https://github.com/acidanthera/macserial/blob/master/FORMAT.md).
 -   \texttt{SystemUUID}\\
  \textbf{Type}: \texttt{plist\ string}, GUID\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- UUID\\
  \textbf{Description}: A UUID is an identifier that is designed to be
  unique across both time and space. It requires no central registration
  process.
 -   \texttt{SystemSKUNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- SKU Number\\
  \textbf{Description}: Mac Board ID (\texttt{board-id}). May look like
  \texttt{Mac-7BA5B2D9E42DDD94} or \texttt{Mac-F221BEC8} in older
  models. Sometimes it can be just empty.
 -   \texttt{SystemFamily}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Information (Type 1) --- Family\\
  \textbf{Description}: Family name. May look like \texttt{iMac\ Pro}.
 -   \texttt{BoardManufacturer}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) -
  Manufacturer\\
  \textbf{Description}: Board manufacturer. All rules of
  \texttt{SystemManufacturer} do apply.
 -   \texttt{BoardProduct}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) -
  Product\\
  \textbf{Description}: Mac Board ID (\texttt{board-id}). May look like
  \texttt{Mac-7BA5B2D9E42DDD94} or \texttt{Mac-F221BEC8} in older
  models.
 -   \texttt{BoardVersion}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) -
  Version\\
  \textbf{Description}: Board version number. Varies, may match
  \texttt{SystemProductName} or \texttt{SystemProductVersion}.
 -   \texttt{BoardSerialNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) --- Serial
  Number\\
  \textbf{Description}: Board serial number in defined format. Known
  formats are described in
  [macserial](https://github.com/acidanthera/macserial/blob/master/FORMAT.md).
 -   \texttt{BoardAssetTag}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) --- Asset
  Tag\\
  \textbf{Description}: Asset tag number. Varies, may be empty or
  \texttt{Type2\ -\ Board\ Asset\ Tag}.
 -   \texttt{BoardType}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) --- Board
  Type\\
  \textbf{Description}: Either \texttt{0xA} (Motherboard (includes
  processor, memory, and I/O) or \texttt{0xB} (Processor/Memory Module),
  refer to Table 15 -- Baseboard: Board Type for more details.
 -   \texttt{BoardLocationInChassis}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Baseboard (or Module) Information (Type 2) --- Location
  in Chassis\\
  \textbf{Description}: Varies, may be empty or
  \texttt{Part\ Component}.
 -   \texttt{ChassisManufacturer}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Enclosure or Chassis (Type 3) --- Manufacturer\\
  \textbf{Description}: Board manufacturer. All rules of
  \texttt{SystemManufacturer} do apply.
 -   \texttt{ChassisType}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Enclosure or Chassis (Type 3) --- Type\\
  \textbf{Description}: Chassis type, refer to Table 17 --- System
  Enclosure or Chassis Types for more details.
 -   \texttt{ChassisVersion}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Enclosure or Chassis (Type 3) --- Version\\
  \textbf{Description}: Should match \texttt{BoardProduct}.
 -   \texttt{ChassisSerialNumber}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Enclosure or Chassis (Type 3) --- Version\\
  \textbf{Description}: Should match \texttt{SystemSerialNumber}.
 -   \texttt{ChassisAssetTag}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: System Enclosure or Chassis (Type 3) --- Asset Tag
  Number\\
  \textbf{Description}: Chassis type name. Varies, could be empty or
  \texttt{MacBook-Aluminum}.
 -   \texttt{PlatformFeature}\\
  \textbf{Type}: \texttt{plist\ integer}, 32-bit\\
  \textbf{Failsafe}: \texttt{0xFFFFFFFF}\\
  \textbf{SMBIOS}: \texttt{APPLE\_SMBIOS\_TABLE\_TYPE133} -
  \texttt{PlatformFeature}\\
  \textbf{Description}: Platform features bitmask. Refer to
  [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)
  for more details. Use \texttt{0xFFFFFFFF} value to not provide this table.
 -   \texttt{SmcVersion}\\
  \textbf{Type}: \texttt{plist\ data}, 16 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{SMBIOS}: \texttt{APPLE\_SMBIOS\_TABLE\_TYPE134} - \texttt{Version}\\
  \textbf{Description}: ASCII string containing SMC version in upper case.
  Missing on T2 based Macs. Ignored when zero.
 -   \texttt{FirmwareFeatures}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{SMBIOS}: \texttt{APPLE\_SMBIOS\_TABLE\_TYPE128} -
  \texttt{FirmwareFeatures} and \texttt{ExtendedFirmwareFeatures}\\
  \textbf{Description}: 64-bit firmware features bitmask. Refer to
  [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)
  for more details. Lower 32 bits match \texttt{FirmwareFeatures}. Upper
  64 bits match \texttt{ExtendedFirmwareFeatures}.
 -   \texttt{FirmwareFeaturesMask}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{SMBIOS}: \texttt{APPLE\_SMBIOS\_TABLE\_TYPE128} -
  \texttt{FirmwareFeaturesMask} and
  \texttt{ExtendedFirmwareFeaturesMask}\\
  \textbf{Description}: Supported bits of extended firmware features
  bitmask. Refer to
  [AppleFeatures.h](https://github.com/acidanthera/EfiPkg/blob/master/Include/IndustryStandard/AppleFeatures.h)
  for more details. Lower 32 bits match \texttt{FirmwareFeaturesMask}.
  Upper 64 bits match \texttt{ExtendedFirmwareFeaturesMask}.
 -   \texttt{ProcessorType}\\
  \textbf{Type}: \texttt{plist\ integer}, 16-bit\\
  \textbf{Failsafe}: Automatic\\
  \textbf{SMBIOS}: \texttt{APPLE\_SMBIOS\_TABLE\_TYPE131} -
  \texttt{ProcessorType}\\
  \textbf{Description}: Combined of Processor Major and Minor types.
 -   \texttt{MemoryFormFactor}\\
  \textbf{Type}: \texttt{plist\ integer}, 8-bit\\
  \textbf{Failsafe}: OEM specified\\
  \textbf{SMBIOS}: Memory Device (Type 17) --- Form Factor\\
  \textbf{Description}: Memory form factor. On Macs it should be DIMM or
  SODIMM.
\end{enumerate}
