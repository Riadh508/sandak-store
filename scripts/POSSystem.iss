; Sandak Store - POS System Installer
; نظام نقاط البيع

#define MyAppName "نظام نقاط البيع"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"
#define MyAppExeName "POSSystem.exe"

[Setup]
AppId={{D5C3B4A6-7F8E-4A9B-0C1D-2E3F4A5B6C7D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\POSSystem
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=POSSystem_v2.0.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\dist\POSSystem\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "تشغيل النظام"; Flags: postinstall nowait skipifsilent
