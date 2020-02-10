---
title: 2. 配置
description: Introduction（搬运填坑中）
type: docs
---

## 2.1 配置术语


\begin{itemize}
 -   \texttt{OC\ config} --- OpenCore Configuration file in \texttt{plist}
  format named \texttt{config.plist}. It has to provide extensible way
  to configure OpenCore and is structured to be separated into multiple
  named sections situated in the root \texttt{plist\ dictionary}. These
  sections are permitted to have \texttt{plist\ array} or
  \texttt{plist\ dictionary} types and are described in corresponding
  sections of this document.
 -   \texttt{valid\ key} --- \texttt{plist\ key} object of
  \texttt{OC\ config} described in this document or its future
  revisions. Besides explicitly described \texttt{valid\ keys}, keys
  starting with \texttt{\#} symbol (e.g. \texttt{\#Hello}) are also
  considered \texttt{valid\ keys} and behave as comments, effectively
  discarding their value, which is still required to be a valid
  \texttt{plist\ object}. All other \texttt{plist\ keys} are not valid,
  and their presence yields to \texttt{undefined\ behaviour}.
 -   \texttt{valid\ value} --- valid \texttt{plist\ object} of
  \texttt{OC\ config} described in this document that matches all the
  additional requirements in specific \texttt{plist\ object} description
  if any.
 -   \texttt{invalid\ value} --- valid \texttt{plist\ object} of
  \texttt{OC\ config} described in this document that is of other
  \texttt{plist\ type}, does not conform to additional requirements
  found in specific \texttt{plist\ object} description (e.g.~value
  range), or missing from the corresponding collection.
  \texttt{Invalid\ value} is read with or without an error message as
  any possible value of this \texttt{plist\ object} in an undetermined
  manner (i.e.~the values may not be same across the reboots). Whilst
  reading an \texttt{invalid\ value} is equivalent to reading certain
  defined \texttt{valid\ value}, applying incompatible value to the host
  system may yield to \texttt{undefined\ behaviour}.
 -   \texttt{optional\ value} --- \texttt{valid\ value} of
  \texttt{OC\ config} described in this document that reads in a certain
  defined manner provided in specific \texttt{plist\ object} description
  (instead of \texttt{invalid\ value}) when not present in
  \texttt{OC\ config}. All other cases of \texttt{invalid\ value} do
  still apply. Unless explicitly marked as \texttt{optional\ value}, any
  other value is required to be present and reads to
  \texttt{invalid\ value} if missing.
 -   \texttt{fatal\ behaviour} --- behaviour leading to boot termination.
  Implementation must stop the boot process from going any further until
  next host system boot. It is allowed but not required to perform cold
  reboot or show any warning message.
 -   \texttt{undefined\ behaviour} --- behaviour not prescribed by this
  document. Implementation is allowed to take any measures including but
  not limited to \texttt{fatal\ behaviour}, assuming any states or
  values, or ignoring, unless these measures negatively affect system
  security in general.
\end{itemize}

\subsection{Configuration Processing}\label{configuration-processing}

\texttt{OC\ config} is guaranteed to be processed at least once if it
was found. Depending on OpenCore bootstrapping mechanism multiple
\texttt{OC\ config} files may lead to reading any of them. No
\texttt{OC\ Config} may be present on disk, in which case all the values
read follow the rules of \texttt{invalid\ value} and
\texttt{optional\ value}.

\texttt{OC\ config} has size, nesting, and key amount limitations.
\texttt{OC\ config} size does not exceed \texttt{16\ MBs}.
\texttt{OC\ config} has no more than \texttt{8} nesting levels.
\texttt{OC\ config} has up to \texttt{16384} XML nodes (i.e.~one
\texttt{plist\ dictionary} item is counted as a pair of nodes) within
each \texttt{plist\ object}.

Reading malformed \texttt{OC\ config} file leads to
\texttt{undefined\ behaviour}. Examples of malformed \texttt{OC\ config}
cover at least the following cases:

\begin{itemize}
\tightlist
 -   files non-conformant to \texttt{plist} DTD
 -   files with unsupported or non-conformant \texttt{plist\ objects} found
  in this document
 -   files violating size, nesting, and key amount limitations
\end{itemize}

It is recommended but not required to abort loading malformed
\texttt{OC\ config} and continue as if no \texttt{OC\ config} was
present. For forward compatibility it is recommended but not required
for the implementation to warn about the use of
\texttt{invalid\ values}. Recommended practice of interpreting
\texttt{invalid\ values} is to conform to the following convention where
applicable:

\begin{longtable}[]{@{}ll@{}}
\toprule
Type & Value\tabularnewline
\midrule
\endhead
\texttt{plist\ string} & Empty string
(\texttt{\textless{}string\textgreater{}\textless{}/string\textgreater{}})\tabularnewline
\texttt{plist\ data} & Empty data
(\texttt{\textless{}data\textgreater{}\textless{}/data\textgreater{}})\tabularnewline
\texttt{plist\ integer} & 0
(\texttt{\textless{}integer\textgreater{}0\textless{}/integer\textgreater{}})\tabularnewline
\texttt{plist\ boolean} & False
(\texttt{\textless{}false/\textgreater{}})\tabularnewline
\texttt{plist\ tristate} & False
(\texttt{\textless{}false/\textgreater{}})\tabularnewline
\bottomrule
\end{longtable}

\subsection{Configuration Structure}\label{configuration-structure}

\texttt{OC\ config} is separated into following sections, which are described
in separate sections of this document. By default it is tried to not enable
anything and optionally provide kill switches with \texttt{Enable} property
for \texttt{plist dict} entries. In general the configuration is written
idiomatically to group similar actions in subsections:

\begin{itemize}
\tightlist
 -   \texttt{Add} provides support for data addition.
 -   \texttt{Block} provides support for data removal or ignorance.
 -   \texttt{Patch} provides support for data modification.
 -   \texttt{Quirks} provides support for specific hacks.
\end{itemize}

Root configuration entries consist of the following:

\begin{itemize}
\tightlist
 -   \hyperref[acpi]{\texttt{ACPI}}
 -   \hyperref[booter]{\texttt{Booter}}
 -   \hyperref[devprops]{\texttt{DeviceProperties}}
 -   \hyperref[kernel]{\texttt{Kernel}}
 -   \hyperref[misc]{\texttt{Misc}}
 -   \hyperref[nvram]{\texttt{NVRAM}}
 -   \hyperref[platforminfo]{\texttt{PlatformInfo}}
 -   \hyperref[uefi]{\texttt{UEFI}}
\end{itemize}

\emph{Note}: Currently most properties try to have defined values even if not
specified in the configuration for safety reasons. This behaviour should not
be relied upon, and all fields must be properly specified in the configuration.
