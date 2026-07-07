; Sandak Store - Invoice System Installer
; نظام الفواتير

#define MyAppName "نظام الفواتير"
#define MyAppVersion "1.5.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"
#define MyAppExeName "InvoiceSystem.exe"

[Setup]
AppId={{C4B2A3F5-6E7D-4F8A-9B0C-1D2E3F4A5B6C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\InvoiceSystem
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=InvoiceSystem_v1.5.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\dist\InvoiceSystem\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "تشغيل النظام"; Flags: postinstall nowait skipifsilent
