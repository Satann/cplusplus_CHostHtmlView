
Readme for the Windows Server 2003 Administration Tools Pack


PLEASE UNINSTALL PREVIOUS VERSIONS OF THE ADMINPAK BEFORE INSTALLING



I. Setup issues: 
----------------
The AdminPak.msi file will ONLY install on 
1. Windows XP Professional build 2600 with QFE Q329357 or 
2. Windows XP Professional SP1 or
3. Windows Server 2003

Using it on any other build or product is not supported as the install will stop with an error stating:  


Windows Server 2003 Administration Tools Pack can only be installed on Windows XP Professional with QFE Q329357 applied, on Windows XP Professional Service Pack 1 or later, or on computers running Windows Server 2003 operating systems.


The AdminPak.msi file cannot be installed on any version of Windows 2000, or on Windows NT 4 servers. To manage servers from Windows 2000 machines you can install the Windows 2000 version of AdminPak.msi on your Windows 2000 machine.   



II.  What is the AdminPak? 
---------------------------
The Windows Server 2003 Administration Tools Pack (a.k.a AdminPak) is a program that installs the existing set of server administration tools onto a Windows XP Professional machine or Windows Server 2003 machine.  This allows administrators to remotely manage both Windows 2000 as well as Windows Server 2003 servers.  The tools contained in the AdminPak.msi file are officially part of the Windows Server 2003 product and this msi file just installs them onto your Windows XP Professional or Windows Server 2003 machine.  

You can continue to use the Windows 2000 version of AdminPak.msi on Windows 2000 machines.  If you choose to upgrade your Windows 2000 machine to Windows XP or Windows Server 2003, it is recommended to remove the Windows 2000 version of AdminPak before upgrading.  If the AdminPak is not uninstalled prior to the upgrade, then you must install this Windows Server 2003 Administration Tools Pack version after the upgrade is complete.  See KB article Q304718 for complete information on managing both Windows 2000 as well as Windows Server 2003 servers using the tools contained in the AdminPak setup program. 

All beta and RC versions must be uninstalled before the final version of the AdminPak file is installed.  The AdminPak.msi file can also be found in the i386 directory on the Windows Server 2003 CD media.  



III. Upgrades / Reinstalls / Final Release issues: 
---------------------------------------------------
NOTE:  YOU MUST UNINSTALL THE BETA 3, RC1 or RC2 VERSIONS OF AdminPak.msi BEFORE installing this version of AdminPak.msi on Windows XP Pro or Windows Server 2003.  


Microsoft recommends that you download the final version of the adminpak.msi file from www.microsoft.com/downloads and use it instead of the older beta or RC versions.  However, you MUST uninstall earlier builds before installing the final version. To uninstall the AdminPak.msi file, go to the "Add / Remove" option in Control Panel and select the AdminPak and remove it.  Or you can double click on the AdminPak.msi file or right click and run it, then select "uninstall" from the wizard.  If you have problems uninstalling the older beta 3 AdminPak.msi file see the KB article Q238413 for information on the msizap and msciuu tools (found in the support tools msi package on the Windows CD) which can remove old msi packages.  



IV. Known Issues / Product Support: 
-----------------------------------
All known issues relating to this software are documented in the PSS KnowledgeBase article Q304718.  You may review this file by going to http://www.microsoft.com/support and typing in the article number without the "Q". i.e. search on 304718  

Alternatively you may want to search on the filename AdminPak.msi to find all articles relating to this file.  The Q304718 will document all known issues and should be checked before contacting product support with questions about this tool set. 


NOTE:  IF YOU HAVE THE BETA 3, RC1 or RC2 Versions of AdminPak.msi installed, you MUST uninstall the older versions before you install this version of AdminPak.msi.  Build to build upgrades are not supported. If you have not uninstalled earlier versions of the adminpak you will not get correct operation of some tools and you will not be supported. 

After uninstalling the beta 3 version, the RAS User Extension snapin tool does not remove some registry entries. You will see an error message when loading the AD Users and Computers tool until you manually remove these registry entries. When the beta 3 version of AdminPak has been uninstalled and this version is installed you will still see the following error message:  

"Snapin failed to initialize.
 Name: RAS Dialin - User node Extension 
 CLSID: B52C1E50-1DD2-11D1-BC43-00C0FC31FD3 " 


To correct this, you can manually remove the RAS User Extension registry keys, or cut and paste the following into a batch file (or .cmd file) called AP-fix.cmd and run the AP-fix file to automatically remove the registry keys.  This will prevent the AD Users and Computers snapin tool from trying to locate the RAS User Extension tool - the RAS Extension tool is no longer shipping in the AdminPak.msi file.  See KB article Q304718 for complete information.  


WARNING - MICROSOFT RECOMMENDS THAT YOU BACK UP YOUR REGISTRY BEFORE DOING ANY TYPE OF OPERATION THAT CHANGES THE REGISTRY  


AP-fix.cmd 


-----------  copy the lines below up to the "end copy" message  -------------- 
@echo off
rem 
rem  RAS user snapin extension - regkey cleanup, Beta 3 to this version upgrades only 
rem 
rem  use Reg.exe on Windows XP to delete the old key created by the Beta 3 RAS user extension snapin 
rem 
echo. 
echo.  ready to remove the RAS User extension registry keys? 
echo. 
pause
@echo on 
reg delete HKEY_CLASSES_ROOT\RasDialin.UserAdminExt    /f 
reg delete HKEY_CLASSES_ROOT\RasDialin.UserAdminExt.1  /f
reg delete HKLM\SOFTWARE\Microsoft\MMC\NodeTypes\{19195a5b-6da0-11d0-afd3-00c04fd930c9}\Extensions\NameSpace /f 
@echo off 
echo.  
rem 
rem  finished - the AD User and Computers snapin tool will no longer look for the RAS User extension tool 
rem 
--------------- end copy ---------------------- 
