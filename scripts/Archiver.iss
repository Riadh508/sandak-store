; Sandak Store - Archiver Installer
; برنامج الأرشفة

#define MyAppName "برنامج الأرشفة"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"
#define MyAppExeName "Archiver.exe"

[Setup]
AppId={{A8F6E7D9-0C1B-4D2E-3F4A-5B6C7D8E9F0A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\Archiver
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=Archiver_v1.0.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\dist\Archiver\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "تشغيل النظام"; Flags: postinstall nowait skipifsilent
