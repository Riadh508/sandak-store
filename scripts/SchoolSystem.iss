; Sandak Store - School System Installer
; نظام المدارس

#define MyAppName "نظام المدارس"
#define MyAppVersion "2.5.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"
#define MyAppExeName "SchoolSystem.exe"

[Setup]
AppId={{E6D4C5B7-8A9F-4B0C-1D2E-3F4A5B6C7D8E}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\SchoolSystem
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=SchoolSystem_v2.5.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\dist\SchoolSystem\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "تشغيل النظام"; Flags: postinstall nowait skipifsilent
