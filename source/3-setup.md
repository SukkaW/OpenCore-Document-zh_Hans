---
title: 3. 设定
description: Setup（搬运填坑中）
type: docs
---

\subsection{Directory Structure}\label{directory-structure}

\begin{center}
\begin{tikzpicture}[%
  grow via three points={one child at (0.5,-0.7) and
  two children at (0.5,-0.7) and (0.5,-1.4)},
  edge from parent path={(\tikzparentnode.south) |- (\tikzchildnode.west)}]
  \node {ESP}
    child { node {EFI}
      child { node {BOOT}
        child { node [selected] {BOOTx64.efi}}
      }
      child [missing] {}
      child { node {OC}
        child { node {ACPI}
          child { node [optional] {DSDT.aml}}
          child { node [optional] {SSDT-1.aml}}
          child { node [optional] {MYTABLE.aml}}
        }
        child [missing] {}
        child [missing] {}
        child [missing] {}
        child { node {Drivers}
          child { node [optional] {MyDriver.efi}}
          child { node [optional] {OtherDriver.efi}}
        }
        child [missing] {}
        child [missing] {}
        child { node {Kexts}
          child { node [optional] {MyKext.kext}}
          child { node [optional] {OtherKext.kext}}
        }
        child [missing] {}
        child [missing] {}
        child { node  {Tools}
          child { node [optional] {Tool.efi}}
        }
        child [missing] {}
        child { node [selected] {OpenCore.efi}}
        child { node [optional] {vault.plist}}
        child { node {config.plist}}
        child { node [optional] {vault.sig}}
      }
    }
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child [missing] {}
    child { node [optional] {nvram.plist}}
    child { node [optional] {opencore-YYYY-MM-DD-HHMMSS.txt}}
  ;
\end{tikzpicture}
\break
\label{fig:DS}
Figure 1. Directory Structure
\end{center}

When directory boot is used the directory structure used should follow
the description on \hyperref[fig:DS]{Directory Structure} figure. Available
entries include:

\begin{itemize}
\tightlist
 -   \texttt{BOOTx64.efi}
  \break
  Initial booter, which loads \texttt{OpenCore.efi} unless it was
  already started as a driver.
 -   \texttt{ACPI}
  \break
  Directory used for storing supplemental ACPI information
  for \hyperref[acpi]{\texttt{ACPI}} section.
 -   \texttt{Drivers}
  \break
  Directory used for storing supplemental \texttt{UEFI}
  drivers for \hyperref[uefi]{\texttt{UEFI}} section.
 -   \texttt{Kexts}
  \break
  Directory used for storing supplemental kernel information
  for \hyperref[kernel]{\texttt{Kernel}} section.
 -   \texttt{Tools}
  \break
  Directory used for storing supplemental tools.
 -   \texttt{OpenCore.efi}
  \break
  Main booter driver responsible for operating system loading.
 -   \texttt{vault.plist}
  \break
  Hashes for all files potentially loadable by \texttt{OC Config}.
 -   \texttt{config.plist}
  \break
  \texttt{OC Config}.
 -   \texttt{vault.sig}
  \break
  Signature for \texttt{vault.plist}.
 -   \texttt{nvram.plist}
  \break
  OpenCore variable import file.
 -   \texttt{opencore-YYYY-MM-DD-HHMMSS.txt}
  \break
  OpenCore log file.
\end{itemize}

\subsection{Installation and Upgrade}\label{configuration-install}

To install OpenCore reflect the
\hyperref[configuration-structure]{Configuration Structure} described
in the previous section on a EFI volume of a GPT partition. While
corresponding sections of this document do provide some information
in regards to external resources like ACPI tables, UEFI drivers,
or kernel extensions (kexts), completeness of the matter is out of
the scope of this document. Information about kernel extensions may
be found in a separate
[Kext List](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Kexts.md)
document available in OpenCore repository. Vaulting information is provided in
\hyperref[miscsecurityprops]{Security Properties} section of this document.

\texttt{OC\ config}, just like any property lists can be edited with any
stock textual editor (e.g. nano, vim), but specialised software may provide
better experience. On macOS the preferred GUI application is
[Xcode](https://developer.apple.com/xcode). For a lightweight
cross-platform and open-source alternative
[ProperTree](https://github.com/corpnewt/ProperTree) editor can be
utilised.

For BIOS booting a third-party UEFI environment provider will have to
be used. \texttt{DuetPkg} is one of the known UEFI environment providers
for legacy systems. To run OpenCore on such a legacy system you can install
\texttt{DuetPkg} with a dedicated tool:
[BootInstall](https://github.com/acidanthera/OcSupportPkg/tree/master/Utilities/BootInstall).

For upgrade purposes refer to \texttt{Differences.pdf} document, providing
the information about the changes affecting the configuration compared
to the previous release, and \texttt{Changelog.md} document, containing
the list of modifications across all published updates.

\subsection{Contribution}\label{configuration-comp}

OpenCore can be compiled as an ordinary
[EDK II](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II).
Since [UDK](https://github.com/tianocore/tianocore.github.io/wiki/UDK)
development was abandoned by TianoCore, OpenCore requires the use of
[EDK II Stable](https://github.com/tianocore/tianocore.github.io/wiki/EDK-II#stable-tags).
Currently supported EDK II release (potentially with patches enhancing the experience)
is hosted in [acidanthera/audk](https://github.com/acidanthera/audk).

The only officially supported toolchain is \texttt{XCODE5}. Other toolchains
might work, but are neither supported, nor recommended. Contribution of clean
patches is welcome. Please do follow
[EDK II C Codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C).

Required external package dependencies include
[EfiPkg](https://github.com/acidanthera/OcSupportPkg),
[MacInfoPkg](https://github.com/acidanthera/OcSupportPkg), and
[OcSupportPkg](https://github.com/acidanthera/OcSupportPkg).

To compile with \texttt{XCODE5}, besides [Xcode](https://developer.apple.com/xcode),
one should also install [NASM](https://www.nasm.us) and
[MTOC](https://github.com/acidanthera/ocbuild/raw/master/external/mtoc-mac64.zip).
The latest Xcode version is recommended for use despite the toolchain name. Example
command sequence may look as follows:

\begin{lstlisting}[caption=Compilation Commands, label=compile, style=ocbash]
git clone https://github.com/acidanthera/audk UDK
cd UDK
git clone https://github.com/acidanthera/EfiPkg
git clone https://github.com/acidanthera/MacInfoPkg
git clone https://github.com/acidanthera/OcSupportPkg
git clone https://github.com/acidanthera/OpenCorePkg
source edksetup.sh
make -C BaseTools
build -a X64 -b RELEASE -t XCODE5 -p OpenCorePkg/OpenCorePkg.dsc
\end{lstlisting}

For IDE usage Xcode projects are available in the root of the repositories. Another
approach could be [Sublime Text](https://www.sublimetext.com) with
[EasyClangComplete](https://niosus.github.io/EasyClangComplete) plugin.
Add \texttt{.clang\_complete} file with similar content to your UDK root:

\begin{lstlisting}[caption=ECC Configuration, label=eccfile, style=ocbash]
-I/UefiPackages/MdePkg
-I/UefiPackages/MdePkg/Include
-I/UefiPackages/MdePkg/Include/X64
-I/UefiPackages/EfiPkg
-I/UefiPackages/EfiPkg/Include
-I/UefiPackages/EfiPkg/Include/X64
-I/UefiPackages/AppleSupportPkg/Include
-I/UefiPackages/OpenCorePkg/Include
-I/UefiPackages/OcSupportPkg/Include
-I/UefiPackages/MacInfoPkg/Include
-I/UefiPackages/UefiCpuPkg/Include
-IInclude
-include
/UefiPackages/MdePkg/Include/Uefi.h
-fshort-wchar
-Wall
-Wextra
-Wno-unused-parameter
-Wno-missing-braces
-Wno-missing-field-initializers
-Wno-tautological-compare
-Wno-sign-compare
-Wno-varargs
-Wno-unused-const-variable
-DOC_TARGET_NOOPT=1
\end{lstlisting}

\textbf{Warning}: Tool developers modifying \texttt{config.plist} or any other OpenCore
files must ensure that their tool checks for \texttt{opencore-version} NVRAM variable
(see \hyperref[miscdebugprops]{Debug Properties} section below) and warn the user
if the version listed is unsupported or prerelease. OpenCore configuration may change
across the releases and the tool shall ensure that it carefully follows this document.
Failure to do so may result in this tool to be considered as malware and blocked with
all possible means.

\subsection{Coding conventions}\label{configuration-conv}

Just like any other project we have conventions that we follow during the development.
All third-party contributors are highly recommended to read and follow the conventions
listed below before submitting their patches. In general it is also recommended to firstly
discuss the issue in [Acidanthera Bugtracker](https://github.com/acidanthera/bugtracker)
before sending the patch to ensure no double work and to avoid your patch being rejected.

\textbf{Organisation}. The codebase is structured in multiple repositories
which contain separate EDK II packages. \texttt{AppleSupportPkg} and \texttt{OpenCorePkg}
are primary packages, and \texttt{EfiPkg}, \texttt{OcSupportPkg}, \texttt{MacInfoPkg.dsc})
are dependent packages.
\begin{itemize}
\tightlist
\item Whenever changes are required in multiple repositories, separate pull requests should
be sent to each.
\item Committing the changes should happen firstly to dependent repositories, secondly to
primary repositories to avoid automatic build errors.
\item Each unique commit should compile with \texttt{XCODE5} and preferably with other
toolchains. In the majority of the cases it can be checked by accessing the
[CI interface](https://travis-ci.com/acidanthera). Ensuring that static analysis finds
no warnings is preferred.
\item External pull requests and tagged commits must be validated. That said, commits in
master may build but may not necessarily work.
\item Internal branches should be named as follows: \texttt{author-name-date}, e.g.
\texttt{vit9696-ballooning-20191026}.
\item Commit messages should be prefixed with the primary module (e.g. library or code module) the
changes were made in. For example, \texttt{OcGuardLib: Add OC\_ALIGNED macro}. For non-library changes
\texttt{Docs} or \texttt{Build} prefixes are used.
\end{itemize}

\textbf{Design}. The codebase is written in a subset of freestanding C11 (C17) supported by
most modern toolchains used by EDK II. Applying common software development practices or requesting
clarification is recommended if any particular case is not discussed below.
\begin{itemize}
\tightlist
\item Never rely on undefined behaviour and try to avoid implementation defined behaviour unless
explicitly covered below (feel free to create an issue when a relevant case is not present).
\item Use \texttt{OcGuardLib} to ensure safe integral arithmetics avoiding overflows. Unsigned
wraparound should be relied on with care and reduced to the necessary amount.
\item Check pointers for correct alignment with \texttt{OcGuardLib} and do not rely on the architecture
being able to dereference unaligned pointers.
\item Use flexible array members instead of zero-length or one-length arrays where necessary.
\item Use static assertions (\texttt{STATIC\_ASSERT}) for type and value assumptions, and runtime
assertions (\texttt{ASSERT}) for precondition and invariant sanity checking. Do not use runtime
assertions to check for errors as they should never alter control flow and potentially be excluded.
\item Assume \texttt{UINT32}/\texttt{INT32} to be \texttt{int}-sized and use \texttt{\%u},
\texttt{\%d}, and \texttt{\%x} to print them.
\item Assume \texttt{UINTN}/\texttt{INTN} to be of unspecified size, and cast them to
\texttt{UINT64}/\texttt{INT64} for printing with \texttt{\%Lu}, \texttt{\%Ld} and so on as normal.
\item Do not rely on integer promotions for numeric literals. Use explicit casts when the type is
implementation-dependent or suffixes when type size is known. Assume \texttt{U} for \texttt{UINT32}
and \texttt{ULL} for \texttt{UINT64}.
\item Do ensure unsigned arithmetics especially in bitwise maths, shifts in particular.
\item \texttt{sizeof} operator should take variables instead of types where possible to be error prone.
Use \texttt{ARRAY\_SIZE} to obtain array size in elements. Use \texttt{L\_STR\_LEN} and
\texttt{L\_STR\_SIZE} macros from \texttt{OcStringLib} to obtain string literal sizes to ensure compiler
optimisation.
\item Do not use \texttt{goto} keyword. Prefer early \texttt{return}, \texttt{break}, or \texttt{continue}
after failing to pass error checking instead of nesting conditionals.
\item Use \texttt{EFIAPI}, force UEFI calling convention, only in protocols, external callbacks between
modules, and functions with variadic arguments.
\item Provide inline documentation to every added function, at least describing its inputs, outputs,
precondition, postcondition, and giving a brief description.
\item Do not use \texttt{RETURN\_STATUS}. Assume \texttt{EFI\_STATUS} to be a matching superset that is
to be always used when \texttt{BOOLEAN} is not enough.
\item Security violations should halt the system or cause a forced reboot.
\end{itemize}

\textbf{Codestyle}. The codebase follows
[EDK II codestyle](https://github.com/tianocore/tianocore.github.io/wiki/Code-Style-C) with few changes
and clarifications.
\begin{itemize}
\tightlist
\item Write inline documentation for the functions and variables only once: in headers, where a header prototype
is available, and inline for \texttt{static} variables and functions.
\item Use line length of 120 characters or less, preferably 100 characters.
\item Use spaces after casts, e.g. \texttt{(VOID *)(UINTN) Variable}.
\item Use SPDX license headers as shown in
[acidanthera/bugtracker\#483](https://github.com/acidanthera/bugtracker/issues/483).
\end{itemize}

\textbf{Debugging}. The codebase incorporates EDK II debugging and few custom features to improve the experience.
\begin{itemize}
\tightlist
\item Use module prefixes, 2-5 letters followed by a colon (\texttt{:}), for debug messages. For \texttt{OpenCorePkg}
use \texttt{OC:}, for libraries and drivers use their own unique prefixes.
\item Do not use dots (\texttt{.}) in the end of debug messages and separate \texttt{EFI\_STATUS}, printed by
\texttt{\%r}, with a hyphen (e.g. \texttt{OCRAM: Allocation of \%u bytes failed - \%r\textbackslash n}).
\item Use \texttt{DEBUG\_CODE\_BEGIN ()} and \texttt{DEBUG\_CODE\_END ()} constructions to guard debug checks
that may potentially reduce the performance of release builds and are otherwise unnecessary.
\item Use \texttt{DEBUG} macro to print debug messages during normal functioning, and \texttt{RUNTIME\_DEBUG} for
debugging after \texttt{EXIT\_BOOT\_SERVICES}.
\item Use \texttt{DEBUG\_VERBOSE} debug level to leave debug messages for future debugging of the code, which
are currently not necessary. By default \texttt{DEBUG\_VERBOSE} messages are ignored even in \texttt{DEBUG} builds.
\item Use \texttt{DEBUG\_INFO} debug level for all non critical messages (including errors) and \texttt{DEBUG\_BULK\_INFO}
for extensive messages that should not appear in NVRAM log that is heavily limited in size. These messages are ignored in
\texttt{RELEASE} builds.
\item Use \texttt{DEBUG\_ERROR} to print critical human visible messages that may potentially halt the boot process, and
\texttt{DEBUG\_WARN} for all other human visible errors, \texttt{RELEASE} builds included.
\end{itemize}
