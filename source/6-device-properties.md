---
title: 6. DeviceProperties
description: DeviceProperties（待整理）
type: docs
---

\subsection{Introduction}\label{devpropsintro}

Device configuration is provided to macOS with a dedicated buffer,
called \texttt{EfiDevicePropertyDatabase}. This buffer is a serialised
map of DevicePaths to a map of property names and their values.

Property data can be debugged with
[gfxutil](https://github.com/acidanthera/gfxutil).
To obtain current property data use the following command in macOS:
\begin{lstlisting}[label=gfxutil, style=ocbash]
ioreg -lw0 -p IODeviceTree -n efi -r -x | grep device-properties |
  sed 's/.*<//;s/>.*//' > /tmp/device-properties.hex &&
  gfxutil /tmp/device-properties.hex /tmp/device-properties.plist &&
  cat /tmp/device-properties.plist
\end{lstlisting}

\subsection{Properties}\label{devpropsprops}

\begin{enumerate}
 -   \texttt{Add}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Sets device properties from a map (\texttt{plist\ dict})
  of deivce paths to a map (\texttt{plist\ dict}) of variable names and their values
  in \texttt{plist\ metadata} format. Device paths must be provided in canonic string
  format (e.g. \texttt{PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x0)}). Properties will only
  be set if not present and not blocked.

  \emph{Note}: Currently properties may only be (formerly) added by the original driver,
  so unless a separate driver was installed, there is no reason to block the variables.

 -   \texttt{Block}\\
  \textbf{Type}: \texttt{plist\ dict}\\
  \textbf{Description}: Removes device properties from a map (\texttt{plist\ dict})
  of deivce paths to an array (\texttt{plist\ array}) of variable names in
  \texttt{plist\ string} format.

\end{enumerate}

\subsection{Common Properties}\label{devpropscommon}

Some known properties include:

\begin{itemize}
\tightlist
 -   \texttt{device-id}
  \break
  User-specified device identifier used for I/O Kit matching. Has 4 byte data type.
 -   \texttt{vendor-id}
  \break
  User-specified vendor identifier used for I/O Kit matching. Has 4 byte data type.
 -   \texttt{AAPL,ig-platform-id}
  \break
  Intel GPU framebuffer identifier used for framebuffer selection on Ivy Bridge and newer.
  Has 4 byte data type.
 -   \texttt{AAPL,snb-platform-id}
  \break
  Intel GPU framebuffer identifier used for framebuffer selection on Sandy Bridge.
  Has 4 byte data type.
 -   \texttt{layout-id}
  \break
  Audio layout used for AppleHDA layout selection. Has 4 byte data type.
\end{itemize}
