; Sandak Store - Combined Installer
; المثبت الشامل لأنظمة سندك

#define MyAppName "حزمة أنظمة سندك"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"

[Setup]
AppId={{9B8A7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Sandak
DefaultGroupName=Sandak
OutputDir=..\public\downloads
OutputBaseFilename=Sandak_Complete_v1.0.0_Setup
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
SetupIconFile=..\public\favicon.ico

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "التثبيت الكامل | Full Installation"
Name: "custom"; Description: "تثبيت مخصص | Custom Installation"; Flags: iscustom

[Components]
Name: "accounting"; Description: "نظام المحاسبة الشامل (Accounting System)"; Types: full custom; Flags: disablenouninstallwarning
Name: "invoice"; Description: "نظام الفواتير (Invoice System)"; Types: full custom; Flags: disablenouninstallwarning
Name: "pos"; Description: "نظام نقاط البيع (POS System)"; Types: full custom; Flags: disablenouninstallwarning
Name: "school"; Description: "نظام المدارس (School System)"; Types: full custom; Flags: disablenouninstallwarning
Name: "hotel"; Description: "نظام إدارة الفنادق الشامل (Hotel System)"; Types: full custom; Flags: disablenouninstallwarning
Name: "archiver"; Description: "برنامج الأرشفة (Archiver)"; Types: full custom; Flags: disablenouninstallwarning

[Files]
; Accounting System
Source: "..\dist\AccountingSystem\*"; DestDir: "{app}\AccountingSystem"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: accounting
; Invoice System
Source: "..\dist\InvoiceSystem\*"; DestDir: "{app}\InvoiceSystem"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: invoice
; POS System
Source: "..\dist\POSSystem\*"; DestDir: "{app}\POSSystem"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: pos
; School System
Source: "..\dist\SchoolSystem\*"; DestDir: "{app}\SchoolSystem"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: school
; Hotel System
Source: "..\dist\HotelSystem\*"; DestDir: "{app}\HotelSystem"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: hotel
; Archiver
Source: "..\dist\Archiver\*"; DestDir: "{app}\Archiver"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: archiver

[Icons]
Name: "{autoprograms}\Sandak\نظام المحاسبة الشامل"; Filename: "{app}\AccountingSystem\AccountingSystem.exe"; Components: accounting
Name: "{autodesktop}\نظام المحاسبة الشامل"; Filename: "{app}\AccountingSystem\AccountingSystem.exe"; Components: accounting
Name: "{autoprograms}\Sandak\نظام الفواتير"; Filename: "{app}\InvoiceSystem\InvoiceSystem.exe"; Components: invoice
Name: "{autodesktop}\نظام الفواتير"; Filename: "{app}\InvoiceSystem\InvoiceSystem.exe"; Components: invoice
Name: "{autoprograms}\Sandak\نظام نقاط البيع"; Filename: "{app}\POSSystem\POSSystem.exe"; Components: pos
Name: "{autodesktop}\نظام نقاط البيع"; Filename: "{app}\POSSystem\POSSystem.exe"; Components: pos
Name: "{autoprograms}\Sandak\نظام المدارس"; Filename: "{app}\SchoolSystem\SchoolSystem.exe"; Components: school
Name: "{autodesktop}\نظام المدارس"; Filename: "{app}\SchoolSystem\SchoolSystem.exe"; Components: school
Name: "{autoprograms}\Sandak\نظام إدارة الفنادق الشامل"; Filename: "{app}\HotelSystem\HotelSystem.exe"; Components: hotel
Name: "{autodesktop}\نظام إدارة الفنادق الشامل"; Filename: "{app}\HotelSystem\HotelSystem.exe"; Components: hotel
Name: "{autoprograms}\Sandak\برنامج الأرشفة"; Filename: "{app}\Archiver\Archiver.exe"; Components: archiver
Name: "{autodesktop}\برنامج الأرشفة"; Filename: "{app}\Archiver\Archiver.exe"; Components: archiver

[Run]
Filename: "{app}\AccountingSystem\AccountingSystem.exe"; Description: "تشغيل نظام المحاسبة الشامل"; Flags: postinstall nowait skipifsilent unchecked; Components: accounting
Filename: "{app}\InvoiceSystem\InvoiceSystem.exe"; Description: "تشغيل نظام الفواتير"; Flags: postinstall nowait skipifsilent unchecked; Components: invoice
Filename: "{app}\POSSystem\POSSystem.exe"; Description: "تشغيل نظام نقاط البيع"; Flags: postinstall nowait skipifsilent unchecked; Components: pos
Filename: "{app}\SchoolSystem\SchoolSystem.exe"; Description: "تشغيل نظام المدارس"; Flags: postinstall nowait skipifsilent unchecked; Components: school
Filename: "{app}\HotelSystem\HotelSystem.exe"; Description: "تشغيل نظام إدارة الفنادق الشامل"; Flags: postinstall nowait skipifsilent unchecked; Components: hotel
Filename: "{app}\Archiver\Archiver.exe"; Description: "تشغيل برنامج الأرشفة"; Flags: postinstall nowait skipifsilent unchecked; Components: archiver
