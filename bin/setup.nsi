;NSIS Modern User Interface
;Header Bitmap Example Script
;Written by Joost Verburg

  !ifndef bankid
      !define bankid ""
  !endif
;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;General

  ;Name and file
  Name "LoginBot${bankid} installer"
  OutFile "LoginBot${bankid}Installer.exe"
  Icon "LoginBot.ico"

  ;Default installation folder
  InstallDir "$PROGRAMFILES\LoginBot${bankid}"
  
  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\LoginBot${bankid}" "InstallLocation"

  ;Request application privileges for Windows Vista
  RequestExecutionLevel admin
  
;--------------------------------
;Interface Configuration

  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "win.bmp" ; optional
  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  ; For Installation
  !insertmacro MUI_PAGE_LICENSE "License.txt"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  
  ; For Finish page
  !define MUI_FINISHPAGE_AUTOCLOSE
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_CHECKED
  !define MUI_FINISHPAGE_RUN_TEXT "Startup LoginBot${bankid}"
  !define MUI_FINISHPAGE_RUN_FUNCTION "StartupLoginBot"
  !insertmacro MUI_PAGE_FINISH
  
  ; For Un-installation
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  
;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Installer Sections

Section "LoginBot" SecLoginBot

  SetOutPath "$INSTDIR"
  File "logindog.js"
  File "License.txt"
  File "LoginBot.ico"
  File "vcredist_x86.exe"
  File "node.exe"
  File "start.bat"
  
  SetOutPath "$INSTDIR\node_modules"
  File /r "node_modules\*.*"
  
  SetOutPath "$INSTDIR\lib"
  File "lib\httpserver.js"
  File "lib\httpclient.js"  
  File "lib\log.js" 
  File "lib\strcodec.js" 

  SetOutPath "$INSTDIR\config"
  File "config\config.js"
  File "config\statuscode.js"
  File "config\statuscontrol.js"

  SetOutPath "$INSTDIR\bot"
  File "bot\LoginBot.exe"
  File "bot${bankid}\LoginBot.ini"
  
  SetOutPath "$INSTDIR\bot"
  File "bot\KeyInput.exe"
  File "bot\WinRing0.dll"
  File "bot\WinRing0x64.sys"
  File "bot\WinRing0.sys"
  File "bot\KbdInput.exe"
  File "bot\WinIo32.dll"
  File "bot\WinIo64.sys"
  
  SetOutPath "$INSTDIR\bot"  
  File "bot\NetWorkOcrWrapper.exe"
  File "bot\CrackCaptchaAPI.dll"
  File "bot\ZMApi.dll"
  File "bot${bankid}\OCRConfig.xml"
  File "bot${bankid}\log.properties"
  
  SetOutPath "$INSTDIR\bot"
  File "bot\SundayOcrWrapper.exe"
  File "bot\Sunday.dll"
  File "bot\SundayCmb.dll"
  
  SetOutPath "$INSTDIR\bot\index"
  File "bot\index\abc"
  File "bot\index\bcm"
  File "bot\index\boc"
  File "bot\index\ccb"
  File "bot\index\cmb"
  File "bot\index\icbc"
  
  SetOutPath "$INSTDIR\bot\hook"
  File "bot\hook\bcm.xy"

  SetOutPath "$INSTDIR\bot\config"
  File "bot${bankid}\config\alert.js"
  File "bot${bankid}\config\banks.js"
  File "bot${bankid}\config\loginbot.json"
  File "bot${bankid}\config\statem.js"
  File "bot${bankid}\config\statuscode.js"

  SetOutPath "$INSTDIR\bot\script"
  File "bot${bankid}\script\handler.js"
  File "bot${bankid}\script\json.js"
  File "bot${bankid}\script\login.js"
  File "bot${bankid}\script\main.js"
  File "bot${bankid}\script\monitor.js"
  File "bot${bankid}\script\phone.js"
  File "bot${bankid}\script\token.js"
  File "bot${bankid}\script\utility.js"
  
  SetOutPath "$INSTDIR\bot\server"
  File "bot\server\upload.html"
  File "bot\server\upload.php"
  
  ;Install vc2010 redist runtime
  ExecWait '"$INSTDIR\vcredist_x86.exe" /q'
  
  ;Store installation folder
  WriteRegStr HKCU "Software\LoginBot${bankid}" "Location" "$INSTDIR"
  
  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ;Create a shortcut
  SetOutPath "$INSTDIR"
  CreateDirectory "$SMPROGRAMS\LoginBot${bankid}"
  CreateShortCut  "$SMPROGRAMS\LoginBot${bankid}\LoginBot.lnk" \
				  "$INSTDIR\node.exe" \
				  '"$INSTDIR\logindog.js"' \
				  "$INSTDIR\LoginBot.ico" 0 \
				  SW_SHOWNORMAL \
				  CONTROL|SHIFT|L \
				  "Startup loginbot${bankid}"
				  
  CreateShortCut  "$SMPROGRAMS\LoginBot${bankid}\Uninstall.lnk" \
				  "$INSTDIR\Uninstall.exe" \
				  '' \
				  "$INSTDIR\Uninstall.exe" 0 	

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "DisplayName" \
				 "LoginBot${bankid}"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "Publisher" \
				 "LoginBotPublisher${bankid}"
				 
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "DisplayVersion" \
				 "1.0.0.0"	

  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "VersionMajor" \
				 "1"	
				 
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "VersionMinor" \
				 "1"					 
				 				 
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "EstimatedSize" \
				 "10000"					 
				 
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "UninstallString" \
				 "$\"$INSTDIR\Uninstall.exe$\""				  
	
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}" \
                 "QuietUninstallString" \
				 "$\"$INSTDIR\uninstall.exe$\" /S"
SectionEnd

;--------------------------------
;Descriptions

  ;Language strings
  LangString DESC_LoginBot ${LANG_ENGLISH} "main module for loginbot${bankid}"

  ;Assign language strings to sections
  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecLoginBot} $(DESC_LoginBot)
  !insertmacro MUI_FUNCTION_DESCRIPTION_END
 
;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;ADD YOUR OWN FILES HERE...
  Delete "$INSTDIR\logindog.js"
  Delete "$INSTDIR\License.txt"
  Delete "$INSTDIR\LoginBot.ico"

  Delete "$INSTDIR\node.exe"
  
  ;;;;Ignore on uninstall
  ; ExecWait '"$INSTDIR\vcredist_x86.exe" /q /uninstall'

  Delete "$INSTDIR\vcredist_x86.exe"

  RMDir /r "$INSTDIR\lib"
  RMDir /r "$INSTDIR\config"
  RMDir /r "$INSTDIR\bot"
  
  RMDir /r "$SMPROGRAMS\LoginBot${bankid}"
  
  Delete "$INSTDIR\Uninstall.exe"

  RMDir /r "$INSTDIR"

  DeleteRegKey /ifempty HKCU "Software\LoginBot${bankid}"

  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LoginBot${bankid}"
  
SectionEnd

Function StartupLoginBot
  ExecShell "open" "$SMPROGRAMS\LoginBot${bankid}\LoginBot.lnk"
FunctionEnd


