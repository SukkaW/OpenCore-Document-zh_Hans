---
title: 4. ACPI
description: ACPI（搬运填坑中）
type: docs
---

\subsection{Introduction}\label{acpiintro}

ACPI (Advanced Configuration and Power Interface) is an open standard to
discover and configure computer hardware.
[ACPI specification](https://uefi.org/specifications) defines the
standard tables (e.g.~\texttt{DSDT}, \texttt{SSDT}, \texttt{FACS}, \texttt{DMAR})
and various methods (e.g. \texttt{\_DSM}, \texttt{\_PRW}) for implementation.
Modern hardware needs little changes to maintain ACPI compatibility, yet
some of those are provided as a part of OpenCore.

To compile and disassemble ACPI tables [iASL compiler](https://github.com/acpica/acpica)
can be used developed by [ACPICA](https://www.acpica.org). GUI front-end to iASL compiler
can be downloaded from [Acidanthera/MaciASL](https://github.com/acidanthera/MaciASL/releases).

\subsection{Properties}\label{acpiprops}

\begin{enumerate}
 -   \texttt{Add}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Load selected tables from \texttt{OC/ACPI}
  directory.

  Designed to be filled with \texttt{plist\ dict} values, describing each block entry.
  See \hyperref[acpipropsadd]{Add Properties} section below.

 -   \texttt{Block}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Remove selected tables from ACPI stack.

  Designed to be filled with \texttt{plist\ dict} values, describing each block entry.
  See \hyperref[acpipropsblock]{Block Properties} section below.

 -   \texttt{Patch}\\
  \textbf{Type}: \texttt{plist\ array}\\
  \textbf{Failsafe}: Empty\\
  \textbf{Description}: Perform binary patches in ACPI tables before
  table addition or removal.

  Designed to be filled with \texttt{plist\ dictionary} values describing each
  patch entry. See \hyperref[acpipropspatch]{Patch Properties} section below.

 -   \texttt{Quirks}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Apply individual ACPI quirks described
  in \hyperref[acpipropsquirks]{Quirks Properties} section below.

\end{enumerate}

\subsection{Add Properties}\label{acpipropsadd}

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
  \textbf{Description}: This ACPI table will not be added unless set to
  \texttt{true}.

 -   \texttt{Path}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: File paths meant to be loaded as ACPI tables.
  Example values include \texttt{DSDT.aml}, \texttt{SubDir/SSDT-8.aml},
  \texttt{SSDT-USBX.aml}, etc.

  ACPI table load order follows the item order in the array. All ACPI tables
  load from \texttt{OC/ACPI} directory.

  \textbf{Note}: All tables but tables with \texttt{DSDT} table identifier
  (determined by parsing data not by filename) insert new tables into ACPI stack.
  \texttt{DSDT}, unlike the rest, performs replacement of DSDT table.

\end{enumerate}

\subsection{Block Properties}\label{acpipropsblock}

\begin{enumerate}
 -   \texttt{All}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: If set to \texttt{true}, all ACPI tables matching the
  condition will be dropped. Otherwise only first matched table.

 -   \texttt{Comment}\\
  \textbf{Type}: \texttt{plist\ string}\\
  \textbf{Failsafe}: Empty string\\
  \textbf{Description}: Arbitrary ASCII string used to provide human readable
  reference for the entry. It is implementation defined whether this value is
  used.

 -   \texttt{Enabled}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: This ACPI table will not be removed unless set to
  \texttt{true}.

 -   \texttt{OemTableId}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Match table OEM ID to be equal to this value
  unless all zero.

 -   \texttt{TableLength}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Match table size to be equal to this value
  unless \texttt{0}.

 -   \texttt{TableSignature}\\
  \textbf{Type}: \texttt{plist\ data}, 4 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Match table signature to be equal to this value
  unless all zero.

  \emph{Note}: Make sure not to specify table signature when the sequence
  needs to be replaced in multiple places. Especially when performing
  different kinds of renames.

\end{enumerate}

\subsection{Patch Properties}\label{acpipropspatch}

\begin{enumerate}

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
  \textbf{Description}: This ACPI patch will not be used unless set to
  \texttt{true}.

 -   \texttt{Find}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Data to find. Must equal to \texttt{Replace} in size.

 -   \texttt{Limit}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Maximum number of bytes to search for. Can be set to
  \texttt{0} to look through the whole ACPI table.

 -   \texttt{Mask}\\
  \textbf{Type}: \texttt{plist\ data}\\
  \textbf{Failsafe}: Empty data\\
  \textbf{Description}: Data bitwise mask used during find comparison.
  Allows fuzzy search by ignoring not masked (set to zero) bits. Can be
  set to empty data to be ignored. Must equal to \texttt{Replace} in size
  otherwise.

 -   \texttt{OemTableId}\\
  \textbf{Type}: \texttt{plist\ data}, 8 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Match table OEM ID to be equal to this value
  unless all zero.

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

 -   \texttt{TableLength}\\
  \textbf{Type}: \texttt{plist\ integer}\\
  \textbf{Failsafe}: \texttt{0}\\
  \textbf{Description}: Match table size to be equal to this value
  unless \texttt{0}.

 -   \texttt{TableSignature}\\
  \textbf{Type}: \texttt{plist\ data}, 4 bytes\\
  \textbf{Failsafe}: All zero\\
  \textbf{Description}: Match table signature to be equal to this value
  unless all zero.

\end{enumerate}

In the majority of the cases ACPI patches are not useful and harmful:

\begin{itemize}
 -   Avoid renaming devices with ACPI patches. This may fail or perform
  improper renaming of unrelated devices (e.g. \texttt{EC} and
  \texttt{EC0}), be unnecessary, or even fail to rename devices in select tables. For
  ACPI consistency it is much safer to rename devices at I/O Registry
  level, as done by
  [WhateverGreen](https://github.com/acidanthera/WhateverGreen).
 -   Avoid patching \texttt{\_OSI} to support a higher level of feature sets
  unless absolutely required. Commonly this enables a number of hacks on APTIO
  firmwares, which result in the need to add more patches. Modern firmwares
  generally do not need it at all, and those that do are fine with much
  smaller patches.
 -   Try to avoid hacky changes like renaming \texttt{\_PRW} or \texttt{\_DSM}
  whenever possible.
\end{itemize}

Several cases, where patching actually does make sense, include:

\begin{itemize}
 -   Refreshing \texttt{HPET} (or another device) method header to avoid
  compatibility checks by \texttt{\_OSI} on legacy hardware. \texttt{\_STA}
  method with \texttt{if ((OSFL () == Zero)) \{ If (HPTE)  ...  Return (Zero)}
  content may be forced to always return 0xF by replacing
  \texttt{A0 10 93 4F 53 46 4C 00} with \texttt{A4 0A 0F A3 A3 A3 A3 A3}.
 -   To provide custom method implementation with in an SSDT, for instance,
  to report functional key presses on a laptop, the original method can be replaced
  with a dummy name by patching \texttt{\_Q11} with \texttt{XQ11}.
\end{itemize}

Tianocore [AcpiAml.h](https://github.com/tianocore/edk2/blob/UDK2018/MdePkg/Include/IndustryStandard/AcpiAml.h)
source file may help understanding ACPI opcodes.

\subsection{Quirks Properties}\label{acpipropsquirks}

\begin{enumerate}

 -   \texttt{FadtEnableReset}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Provide reset register and flag in FADT table to enable
  reboot and shutdown on legacy hardware. Not recommended unless required.

 -   \texttt{NormalizeHeaders}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Cleanup ACPI header fields to workaround macOS
  ACPI implementation bug causing boot crashes. Reference:
  \href{https://alextjam.es/debugging-appleacpiplatform/}{Debugging
  AppleACPIPlatform on 10.13} by Alex James aka theracermaster. The
  issue is fixed in macOS Mojave (10.14).

 -   \texttt{RebaseRegions}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Attempt to heuristically relocate ACPI memory
  regions. Not recommended.

  ACPI tables are often generated dynamically by underlying firmware
  implementation. Among the position-independent code, ACPI tables may
  contain physical addresses of MMIO areas used for device
  configuration, usually grouped in regions (e.g.
  \texttt{OperationRegion}). Changing firmware settings or hardware
  configuration, upgrading or patching the firmware inevitably leads to
  changes in dynamically generated ACPI code, which sometimes lead to
  the shift of the addresses in aforementioned \texttt{OperationRegion}
  constructions.

  For this reason it is very dangerous to apply any kind of
  modifications to ACPI tables. The most reasonable approach is to make
  as few as possible changes to ACPI and try to not replace any tables,
  especially DSDT. When this is not possible, then at least attempt to
  ensure that custom DSDT is based on the most recent DSDT or remove
  writes and reads for the affected areas.

  When nothing else helps this option could be tried to avoid stalls at
  \texttt{PCI\ Configuration\ Begin} phase of macOS booting by
  attempting to fix the ACPI addresses. It does not do magic, and only
  works with most common cases. Do not use unless absolutely required.

 -   \texttt{ResetHwSig}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reset \texttt{FACS} table \texttt{HardwareSignature}
  value to \texttt{0}.

  This works around firmwares that fail to maintain hardware signature across
  the reboots and cause issues with waking from hibernation.

 -   \texttt{ResetLogoStatus}\\
  \textbf{Type}: \texttt{plist\ boolean}\\
  \textbf{Failsafe}: \texttt{false}\\
  \textbf{Description}: Reset \texttt{BGRT} table \texttt{Displayed}
  status field to \texttt{false}.

  This works around firmwares that provide \texttt{BGRT} table but
  fail to handle screen updates afterwards.

\end{enumerate}
