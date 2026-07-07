#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build Inno Setup installers for 3 stub EXE files"""
import os, sys, zipfile, subprocess, tempfile, shutil
sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS = r'C:\Users\ٍُSeandSoft\Downloads\Sandak-store\public\downloads'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ISCC = r'C:\Program Files (x86)\Inno Setup 6\ISCC.exe'
TEMP = os.path.join(tempfile.gettempdir(), 'sandak_build')

SYSTEMS = [
    ('InvoiceSystem_v2.5.0_Setup.zip', 'InvoiceSystem_v1.5.0_Setup.exe',
     'نظام الفواتير الاحترافي', '2.5.0', 'SandakInvoice250'),
    ('AccountingSystem_v2.1.0_Setup.zip', 'AccountingSystem_v3.0.0_Setup.exe',
     'نظام المحاسبة الشامل', '3.0.0', 'SandakAccounting300'),
    ('SchoolSystem_v1.5.0_Setup.zip', 'SchoolSystem_v2.5.0_Setup.exe',
     'نظام إدارة المدارس', '2.5.0', 'SandakSchool250'),
]

def build():
    if not os.path.exists(ISCC):
        print('ERROR: Inno Setup not found at', ISCC)
        return False
    
    if os.path.exists(TEMP):
        shutil.rmtree(TEMP)

    for zip_name, exe_name, display_name, version, app_id in SYSTEMS:
        zip_path = os.path.join(DOWNLOADS, zip_name)
        if not os.path.exists(zip_path):
            print('SKIP:', zip_name, 'not found')
            continue

        print('\n=== Building', display_name, 'v' + version, '===')

        work_dir = os.path.join(TEMP, zip_name.replace('.zip', ''))
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(work_dir)

        # Create README
        with open(os.path.join(work_dir, 'README.txt'), 'w', encoding='utf-8') as f:
            eng_name = {'نظام الفواتير الاحترافي': 'NdamAlFwatir',
                        'نظام المحاسبة الشامل': 'NdamAlMhasba',
                        'نظام إدارة المدارس': 'NdamAlMadars'}.get(display_name, 'App')
            f.write('''============================================
{t} v{v}
============================================

شكراً لتحميلك {t}

لتشغيل النظام:
1. تأكد من تثبيت Node.js (v18+) من https://nodejs.org
2. افتح Terminal أو Command Prompt
3. انتقل إلى مجلد التثبيت:
   cd "C:\\Program Files\\Sandak\\{e}"
4. ثبت المتطلبات:
   npm install
5. شغل النظام:
   npm run dev
6. افتح المتصفح على: http://localhost:3000

للاستخدام في الإنتاج:
   npm run build
   npm start

متجر سندك للبرمجيات والمنتجات الرقمية
https://sandak-store.com
'''.format(t=display_name, v=version, e=eng_name))

        output_name = exe_name.replace('.exe', '')
        iss_path = os.path.join(SCRIPT_DIR, output_name + '.iss')
        iss_dir = work_dir.replace('\\', '/')

        iss = '''#define MyAppName "{name}"
#define MyAppVersion "{ver}"
#define MyAppPublisher "Sandak Store"
#define MyAppURL "https://sandak-store.com"

[Setup]
AppId={aid}
AppName={{#MyAppName}}
AppVersion={{#MyAppVersion}}
AppPublisher={{#MyAppPublisher}}
AppPublisherURL={{#MyAppURL}}
DefaultDirName={{autopf}}\\Sandak\\{out}
DefaultGroupName=Sandak
OutputDir={dl}
OutputBaseFilename={out}
Compression=lzma2
SolidCompression=yes
DisableProgramGroupPage=yes
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
DisableWelcomePage=no
DisableDirPage=no

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\\Arabic.isl"

[Files]
Source: "{dir}\\*"; DestDir: "{{app}}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{{autoprograms}}\\{{#MyAppName}}"; Filename: "{{app}}\\README.txt"
Name: "{{autodesktop}}\\{{#MyAppName}}"; Filename: "{{app}}\\README.txt"

[Run]
Filename: "{{app}}\\README.txt"; Description: "عرض تعليمات التشغيل"; Flags: postinstall nowait shellexec skipifsilent
'''.format(name=display_name, ver=version, aid=app_id, out=output_name,
           dl=DOWNLOADS, dir=iss_dir)

        with open(iss_path, 'w', encoding='utf-8') as f:
            f.write(iss)

        print('Compiling...')
        res = subprocess.run([ISCC, '/Q', iss_path], capture_output=True, text=True, timeout=120)
        if res.returncode == 0:
            sz = os.path.getsize(os.path.join(DOWNLOADS, exe_name))
            print('SUCCESS:', exe_name, '-', sz, 'bytes')
        else:
            print('FAILED:', res.stderr[:200] if res.stderr else res.stdout[:200])

    if os.path.exists(TEMP):
        shutil.rmtree(TEMP)

if __name__ == '__main__':
    build()
