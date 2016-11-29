;NSIS Modern User Interface
;Header Bitmap Example Script
;Written by Joost Verburg

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;General

  ;Name and file
  Name "login driver installer"
  OutFile "HxbShDriverInstaller.exe"
  ;Icon "LoginBot.ico"

  ;Default installation folder
  InstallDir "C:\Windows\SysWOW64"
  
  ;Get installation folder from registry if available
  ;InstallDirRegKey HKCU "Software\LoginBot" "InstallLocation"

  ;Request application privileges for Windows Vista
  RequestExecutionLevel admin
  
;--------------------------------
;Interface Configuration

  !define MUI_HEADERIMAGE
  ;!define MUI_HEADERIMAGE_BITMAP "win.bmp" ; optional
  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  ; For Installation
  ;!insertmacro MUI_PAGE_LICENSE "License.txt"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  
  ; For Finish page
  ;!define MUI_FINISHPAGE_AUTOCLOSE
  ;!define MUI_FINISHPAGE_RUN
  ;!define MUI_FINISHPAGE_RUN_CHECKED
  ;!define MUI_FINISHPAGE_RUN_TEXT "Startup LoginBot"
  ;!define MUI_FINISHPAGE_RUN_FUNCTION "StartupLoginBot"
  ;!insertmacro MUI_PAGE_FINISH
  
  ; For Un-installation
  ;!insertmacro MUI_UNPAGE_CONFIRM
  ;!insertmacro MUI_UNPAGE_INSTFILES
  
;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Installer Sections

Section "HXBANDSHDriver" SecLoginBot

  SetOutPath "$INSTDIR"
  File "HXBPP.dll"
  File "SHBOSHPER.exe"
  ExecWait 'regsvr32 /s HXBPP.dll'
  ExecWait '"SHBOSHPER.exe" /silent /qn'
  Delete "$INSTDIR\SHBOSHPER.exe"
SectionEnd

;--------------------------------
;Descriptions

  ;Language strings
  LangString DESC_LoginBot ${LANG_ENGLISH} "main module for hxb driver"

  ;Assign language strings to sections
  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecLoginBot} $(DESC_LoginBot)
  !insertmacro MUI_FUNCTION_DESCRIPTION_END
 
;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;ADD YOUR OWN FILES HERE...
  ExecWait 'regsvr32 /s /u HXBPP.dll'
  Delete "$INSTDIR\HXBPP.dll"
SectionEnd

Function StartupLoginBot
  ExecShell "open" "$SMPROGRAMS\LoginBot\LoginBot.lnk"
FunctionEnd


