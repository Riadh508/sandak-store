#define MyAppName "نظام الفواتير الاحترافي"
#define MyAppVersion "2.5.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"

[Setup]
AppId=SandakInvoice250
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak\InvoiceSystem_v1.5.0_Setup
DefaultGroupName=Sandak
OutputDir=C:\Users\ٍُSeandSoft\Downloads\Sandak-store\public\downloads
OutputBaseFilename=InvoiceSystem_v1.5.0_Setup
Compression=lzma2
SolidCompression=yes
DisableProgramGroupPage=yes
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
DisableWelcomePage=no
DisableDirPage=no

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Files]
Source: "C:/Users/SEANDS~1/AppData/Local/Temp/sandak_build/InvoiceSystem_v2.5.0_Setup\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\README.txt"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\README.txt"

[Run]
Filename: "{app}\README.txt"; Description: "عرض تعليمات التشغيل"; Flags: postinstall nowait shellexec skipifsilent
