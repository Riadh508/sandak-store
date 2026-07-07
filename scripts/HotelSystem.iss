; Sandak Store - Hotel System Installer
; نظام إدارة الفنادق الشامل

#define MyAppName "نظام إدارة الفنادق الشامل"
#define MyAppVersion "3.0.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"
#define MyAppExeName "HotelSystem.exe"

[Setup]
AppId={{F7E5D6C8-9B0A-4C1D-2E3F-4A5B6C7D8E9F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\HotelSystem
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=HotelSystem_v3.0.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\dist\HotelSystem\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "تشغيل النظام"; Flags: postinstall nowait skipifsilent
