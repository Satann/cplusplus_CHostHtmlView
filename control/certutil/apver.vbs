'
'  Windows Administration Tools Pack (adminpak.msi) 
'  Diagnostic script - APver.vbs  (CG,SG)
'
'  Copyright (C) 2002 Microsoft Corporation 
'  All rights reserved 
' 
' 
'  Usage and help provided by typing "APver.vbs /? " 
'
'
'  Detects OS version, Service Pack version and whether Adminpak.msi is installed or not 
'  Returns 0 (zero) in %errorlevel% if the adminpak is not installed, otherwise returns AP version 
'            (ex. a return code of 502 means that the Win2k SP2 adminpak is installed) 
'
'  Requires WSH 5.6 and Cscript.ext to be your default script interpreter 
'  Must be an administrator to run this script 
'  Requires WMI service to be running on your machine to detect OS settings 



' Good VBscript practise - make the variable declarations mandatory  
'
option explicit

'
' MSI database open mode should be read only to be safe 
'
const msiOpenDatabaseModeReadOnly = 0

'
' MSI feature states (see MSI.chm for more info) 
'
const msiInstallStateNotUsed      = -7
const msiInstallStateBadConfig    = -6
const msiInstallStateIncomplete   = -5
const msiInstallStateSourceAbsent = -4
const msiInstallStateInvalidArg   = -2
const msiInstallStateUnknown      = -1
const msiInstallStateBroken       =  0
const msiInstallStateAdvertised   =  1
const msiInstallStateRemoved      =  1
const msiInstallStateAbsent       =  2
const msiInstallStateLocal        =  3
const msiInstallStateSource       =  4
const msiInstallStateDefault      =  5

'
' WMI error codes
'
const wmiLocalCredentialsSupplied = -2147217308

'
' NT registry hives constants 
'
const HKEY_CLASSES_ROOT   = &H80000000
const HKEY_CURRENT_USER   = &H80000001
const HKEY_LOCAL_MACHINE  = &H80000002
const HKEY_USERS          = &H80000003
const HKEY_CURRENT_CONFIG = &H80000005

'
' OS and Adminpak version detector return values
'
const versionError           = 399
const versionWindowsUnknown  = 400
const versionWindows2000     = 500
const versionWindows2000SP1  = 501
const versionWindows2000SP2  = 502
const versionWindows2000SP3  = 503
const versionWindows2000Next = 509
const versionWindowsXP       = 510
const versionWindowsXPSP1    = 511
const versionWindowsXPNext   = 519
const versionWindows2003     = 520
const versionWindows2003Next = 529
const versionWindowsFuture   = 999

'
' Win2k and W2K3 Adminpak product GUIDs
'
const guidWindows2000 = "0268927B6CAE1D11F878000680E26AE3"
const guidWindows2003 = "2FC670E5DEFE2A346A32310E6DE27C0E"

'
' exit codes returned via %errorlevel% 
'
const exitcodeNone            = 0
const exitcodeNoAPK           = 0
const exitcodeInvalidSyntax   = 1
const exitcodeError           = 2
const exitcodeInvalidMSI      = 3
const exitcodeUnexpected      = 4
const exitcodeWSHVersionError = 5
const exitcodeInvalidHost     = 6

'
' General return codes from any function 
'
const returnNoError = 0
const returnInvalidParam = 1
const returnInvalidFile = 2
const returnUnexpected = 3

'
' Output text strings 
'
const textMachineName       = "Machine Name:                             "
const textOsVersion         = "Operating System:                         "
const textAdminpakVersion   = "Installed AP Version:                     "
const textAdminpakSPLevel   = "Installed AP Service Pack Level Property: "
const textAdminpakVersionEx = "AP Package Version:                     "
const textAdminpakSPLevelEx = "AP Package Service Pack Level Property: "
const textResult            = "Effective Adminpak binaries: "

' ----------------------------------------------------------------------------
'
' The Script Starts Here 
'
' Invoke the function to detect if you have CScript or WScript as your default WSH engine 
'
' ----------------------------------------------------------------------------

' check the scripting host -- it should be CSCRIPT, verify or warn if not 
CheckScriptHost

' display banner
WScript.StdOut.WriteLine
WScript.StdOut.WriteLine "APver.vbs - Adminpak.msi version information & diagnostic tool "
WScript.StdOut.WriteLine "Copyright (C) 2002 Microsoft Corporation. All rights reserved."

' Do the main script operation 
Main 

'
' exit from the script
'
WScript.Quit exitcodeNone

' ****************************************************************************
' main function
' ****************************************************************************
Sub Main
    '
    ' variables
    '
    dim result
    dim strVersion
    dim strDatabase
    dim strInstalledDatabase
    dim osVersion, apkVersion
    dim strComputer, strUserName, strPassword

    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' process the command line arguments
    '
    ParseArguments strDatabase, strComputer, strUserName, strPassword

    '
    ' determine the cached MSI database name -- if installed
    result = DetectInstalledPackage( strComputer, strUserName, strPassword, strInstalledDatabase )

    '
    ' sub-heading
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "On machine: "
    WScript.StdOut.WriteLine "--------------- "
    WScript.StdOut.WriteLine
    
    ' determine and display the OS version
    osVersion = DetermineOsVersion( strComputer, strUserName, strPassword, strVersion )
    if strComputer = "." then
        WScript.StdOut.WriteLine textMachineName & GetComputerName
    else
        WScript.StdOut.WriteLine textMachineName & strComputer
    end if
    WScript.StdOut.WriteLine textOsVersion & TranslateVersion( osVersion ) & " (" & strVersion & ")"
    
    '
    ' now determine which version of adminpak is installed
    '
    if strInstalledDatabase = "" then
    
        ' adminpak is not installed
        WScript.StdOut.WriteLine textAdminpakVersion & "Not Installed"
        WScript.StdOut.WriteLine textAdminpakSPLevel & "<none>"
        result = exitcodeNoAPK
        
    else

        if strComputer = "." then
        
            ' show the adminpak version info - also get the version number back
            apkVersion = ShowAdminpakInfo( strInstalledDatabase, true, false )
            
        else
        
            ' show the adminpak version info - also get the version number back
            apkVersion = ShowAdminpakInfoEx( strInstalledDatabase, strComputer, strUserName, strPassword )
            
        end if
        
        '
        ' check the result and display warning if needed 
        ' 
        select case apkVersion
            case returnInvalidParam
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "The parameter is incorrect"
                WScript.Quit exitcodeError

            case returnUnexpected
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "Unexpected error occurred - failed to get the adminpak version."
                WScript.Quit exitcodeError
                
            case returnInvalidFile
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "Invalid MSI File"
                WScript.Quit exitcodeInvalidMSI 
        end select
        
    end if
    
    '
    ' similarly show the version of the adminpak.msi file that was passed as parameter 
    ' 
    if strDatabase <> "" then

        '
        ' sub-heading
        WScript.StdOut.WriteBlankLines(2)
        WScript.StdOut.WriteLine "Package: (" & strDatabase & ")"
        WScript.StdOut.Write "----------"
        WScript.StdOut.Write String( Len( strDatabase ), "-" ) & "-"
        WScript.StdOut.WriteLine
    
        ' show the adminpak version info - also get the version number back 
        ' (for the sake of exit code)
        result = ShowAdminpakInfo( strDatabase, false, false )
        
        '
        ' check the result and warn if needed 
        ' 
        select case result
            case returnInvalidParam
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "The parameter is incorrect"
                WScript.Quit exitcodeError

            case returnUnexpected
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "Unexpected error occurred - failed to get the adminpak version."
                WScript.Quit exitcodeError
                
            case returnInvalidFile
                WSctipt.StdOut.WriteLine
                WScript.StdOut.WriteLine "Invalid MSI File was passed to the script"
                WScript.Quit exitcodeInvalidMSI 
        end select

    end if
    
    '
    ' special case
    if strInstalledDatabase <> "" then
        '
        ' if this MSI file is an installed package and
        ' adminpak file version is Windows 2000 (any SP),
        ' and current running operating system version is also any of Windows 2000 (any SP)
        ' then we need to do some special processing to determine the AP Version SP level 
        ' as the Win2k AP did not set SP level properly from SP1 to SP3 
        '
        ' current output displays Win2k SP0 (2195), SP1, SP2, SP3, future SPs return code is 509   
        ' so the output could be updated to show future SP levels 
        '
        if ( (osVersion < versionWindowsXP) and _
             (apkVersion >= versionWindows2000 and apkVersion < versionWindowsXP) ) then
             
            ' display the explanation to the user on what's going on
            WScript.StdOut.WriteLine
            WScript.StdOut.WriteLine "On Windows 2000, the effective adminpak binaries on a machine are "
            WScript.StdOut.WriteLine "determined by the most recent update done to the machine.  "
            WScript.StdOut.WriteLine "The effective adminpak version is the latest of the OS service pack"
            WScript.StdOut.WriteLine "version and the adminpak service pack version. For example, if you" 
            WScript.StdOut.WriteLine "install the SP1 version of adminpak and then upgrade the machine"
            WScript.StdOut.WriteLine "to Windows 2000 SP2, the binaries installed by the SP1 adminpak will be"
            WScript.StdOut.WriteLine "updated automatically to the versions from Windows 2000 SP2.  Thus the "
            WScript.StdOut.WriteLine "effective version of adminpak binaries on the machine are from the SP2 "
            WScript.StdOut.WriteLine "update and you do NOT need to install the SP2 version of adminpak."
            WScript.StdOut.WriteLine ""

            ' now determine the result
            if osVersion > apkVersion then
                WScript.StdOut.WriteLine textResult & TranslateVersion( osVersion )
                if strDatabase = "" then result = osVersion          ' change the exit code
            elseif osVersion = apkVersion then
                WScript.StdOut.WriteLine textResult & TranslateVersion( osVersion )
                if strDatabase = "" then result = osVersion          ' change the exit code
            elseif osVersion < apkVersion then
                WScript.StdOut.WriteLine textResult & TranslateVersion( apkVersion )
                if strDatabase = "" then result = apkVersion          ' change the exit code
            end if
        else
            ' adminpak version itself is the exit code
            if strDatabase = "" then result = apkVersion
        end if

    end if

    '
    ' exit from the script
    '
    WScript.Quit result
End Sub


' ****************************************************************************
' shows the adminpak version information
' ****************************************************************************
Function ShowAdminpakInfo( strDatabase, bInstalledPackage, bRemote )
    '
    ' local variables
    '
    dim i
    dim state
    dim database
    dim installer
    dim strVersion 
    dim strFeature
    dim strProductCode
    dim nVersion, nAdminpakServicePackLevel
    
    '
    ' default error trap
    '
    on error resume next

    '
    ' get the product version -- of adminpak.msi 
    
    
    ' Check the input filename parameter  
    '
    if strDatabase = "" then
        ShowAdminpakInfo = returnInvalidParam
        Exit Function
    end if

    '
    ' connect to Windows Installer ActiveX object
    '
    set installer = nothing
    set installer = WScript.CreateObject( "WindowsInstaller.Installer" ) : CheckError

    '
    ' open the MSI database
    '
    set database = installer.OpenDatabase( strDatabase, msiOpenDatabaseModeReadOnly ) 
    CheckErrorEx( installer )
        
    '
    ' get the adminpak.msi product version from the database
    '
    GetProductDetails installer, database, strVersion, nAdminpakServicePackLevel

    '
    ' check whether we can proceed furthur or not 
    ' requirement is, we should have the product version information
    '
    if strVersion = "" then
        ShowAdminpakInfo = returnInvalidFile
        Exit Function
    end if

    '
    ' determine the Adminpak.msi version
    '
    nVersion = DetermineAdminPackVersion( strVersion, false )
    if nVersion = versionWindows2000 then
            '
            ' need to verify one of the files in the MSI table to determine
            ' which build this adminpak belongs to 
            '
            ' we use the terminal server file to test this but it could be any file in the file table 
            '
            strVersion = GetFileVersion( database, "mstsc.exe" )
            if strVersion = "" then
                ShowAdminpakInfo = returnInvalidFile
                Exit Function
            end if

            ' determine the adminpak version
            nVersion = DetermineAdminPackVersion( strVersion, true )
    end if
    
    '
    ' display the adminpak version info
    '
    if bInstalledPackage = true then
        WScript.StdOut.WriteLine textAdminpakVersion & TranslateVersion( nVersion ) & " (" & strVersion & ")"
        WScript.StdOut.WriteLine textAdminpakSPLevel & nAdminpakServicePackLevel
    else
        WScript.StdOut.WriteLine textAdminpakVersionEx & TranslateVersion( nVersion ) & " (" & strVersion & ")"
        WScript.StdOut.WriteLine textAdminpakSPLevelEx & nAdminpakServicePackLevel
    end if

    '
    ' get the MSI product code GUID from the MSI package database 
    '
    strProductCode = GetProperty( installer, database, "ProductCode" )
    if strProductCode = "" then
        ShowAdminpakInfo = returnInvalidFile
        Exit Function
    end if
        
    '
    ' display the state of the adminpak.msi file MSI Features  - which are installed locally ? 
    '
    if bInstalledPackage = true then
        WScript.StdOut.WriteBlankLines(2)
        WScript.StdOut.WriteLine "    MSI Features and current state:"
        WScript.StdOut.WriteLine "    -------------------------------"
        if bRemote = true then
            WScript.StdOut.WriteLine "    This script needs to be run locally on a machine in order"
            WScript.StdOut.WriteLine "    to see the state of MSI features. It can't work remotely."
        else
            for each strFeature in installer.Features( strProductCode )
                WScript.StdOut.Write "        "
                WScript.StdOut.Write strFeature
                if Len( strFeature ) < 30 then
                    WScript.StdOut.Write String( 30 - Len( strFeature ), " " )
                end if

                '
                ' determine the state for each of the MSI Features 
                state = installer.FeatureState(strProductCode, strFeature)
                WScript.StdOut.Write TranslateState( state, "f" )

                ' new line
                WScript.StdOut.WriteLine
            next
        end if
        CheckErrorEx( installer )
    end if
    
    '
    ' return code
    ShowAdminpakInfo = nVersion
End Function


' ****************************************************************************
' shows the adminpak version information
' ****************************************************************************
Function ShowAdminpakInfoEx( strDatabase, strComputer, strUserName, strPassword )
    '
    ' local variables
    '
    dim arrTemp
    dim objNetwork
    dim strShareName
    dim strRemotePath
    dim strRemoteDatabase
    
    '
    ' default error trap
    '
    on error resume next
    
    if strComputer = "." or strComputer = "" then
        ShowAdminpakInfoEx = ShowAdminpakInfo( strDatabase, false, false )
        Exit Function
    end if
    
    ' 
    ' split the database path -- with '\' as delimiter
    arrTemp = Split( strDatabase, "\", 2 )
    
    ' ensure that the first element in the just splitted array is a "drive" letter (terminated with ':')
    strShareName = arrTemp( 0 )
    if Right( strShareName, 1 ) <> ":" then
        ShowAdminpakInfoEx = returnInvalidParam
        Exit Function
    end if
    
    ' now replace ':' with '$' -- the conventional hidden share extension
    strShareName = Replace( strShareName, ":", "$" )
    
    '
    ' now form the UNC share name to connect to a remote machine 
    strRemotePath = "\\" & strComputer & "\" & strShareName

    '
    ' create an WSH network object
    set objNetwork = WScript.CreateObject( "WScript.Network" ) : CheckError

    '
    ' now establish connection to this remote share -- 
    objNetwork.MapNetworkDrive "", strRemotePath, false, strUserName, strPassword
    CheckError
    
    ' now call the original function on that remote machine 
    strRemoteDatabase = "\\" & strComputer & "\" & strDatabase
    strRemoteDatabase = Replace( strRemoteDatabase, ":", "$" )
    ShowAdminpakInfoEx = ShowAdminpakInfo( strRemoteDatabase, true, true )
    
    ' delete the network connection
    objNetwork.RemoveNetworkDrive strRemotePath, true, false
End Function


' ****************************************************************************
' version checker 
' ****************************************************************************
Function DetermineAdminPackVersion( strVersion, bFileVersion )
    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' default return value
    '
    DetermineAdminPackVersion = versionWindowsUnknown

    '
    ' break-up the product version 
    '
    dim arrVersionInfo
    arrVersionInfo = Split( strVersion, "." )

    '
    ' validate the OS and Adminpak versions 
    ' the no. of elements should be at least 3 and max 4
    ' since the index starts from zero, the upper bound must be greater than 2 (3 items) 
    ' also, it can not be greater than 3, if this is not so the version string is invalid
    '
    if ( UBound( arrVersionInfo ) < 2 or UBound( arrVersionInfo ) > 3 ) then
        DetermineAdminPackVersion = versionError
        Exit Function
    end if

    '
    ' adjust the version info if it contains only 3 elements
    '
    if UBound( arrVersionInfo ) = 2 then
        redim preserve arrVersionInfo( 4 )
        arrVersionInfo( 3 ) = 0
    end if

    '
    ' choose the path to follow depending on the product version
    '
    dim verMajor, verMinor, verBuild, verServicePack
    verMajor = arrVersionInfo( 0 )
    verMinor = arrVersionInfo( 1 )
    verBuild = arrVersionInfo( 2 )
    verServicePack = arrVersionInfo( 3 )
    if verMajor < 5 then
        '
        ' Non Win2k or XP or W2K3 version - probably NT4 version (therefore no adminpak) 
        '
        DetermineAdminPackVersion = versionWindowsUnknown
    elseif ( verMajor = 5 and verMinor = 0 ) then
        '
        ' Windows 2000
        ' since the Windows 2000 adminpak product version is not updated properly
        ' we need to choose a different logic to determine it's milestone or build # 
        ' This should be fixed by Win2k SP4 timeframe 
        '
        DetermineAdminPackVersion = versionWindows2000
        
        '
        ' proceed furthur with checking if the version information passed to this
        ' function belongs to a specified file (ex. we test mstsc.exe) 
        '
        if bFileVersion = true then
            '
            ' this is hard-way to detect the milestone for a specific file 
            '   verBuid = 2195 and
            '       verServicePack = 1          --> RTM / Gold
            '       verServicePack = 1620       --> SP1
            '       verServicePack = 2721       --> SP2
            '       verServicePack = 3895       --> SP3
            '
            if ( verBuild = 2195 and verServicePack = 1 ) then
                DetermineAdminPackVersion = versionWindows2000
            elseif ( verBuild = 2195 and verServicePack = 1620 ) then
                DetermineAdminPackVersion = versionWindows2000SP1
            elseif ( verBuild = 2195 and verServicePack = 2721 ) then
                DetermineAdminPackVersion = versionWindows2000SP2
            elseif ( verBuild = 2195 and verServicePack = 3895 ) then
                DetermineAdminPackVersion = versionWindows2000SP3
            elseif ( verBuild = 2195 and verServicePack > 3895 ) then
                DetermineAdminPackVersion = versionWindows2000Next
            end if
        end if
    elseif ( verMajor = 5 and verMinor = 1 ) then
        '
        ' This is Windows XP, there is no adminpak shipped in this version  
        '
        DetermineAdminPackVersion = versionWindowsXP
    elseif ( verMajor = 5 and verMinor = 2 ) then
        '
        ' This is Windows Server 2003 
        '   verBuild < 3663                             --> Beta 3 or pre-RC1
        '   verBuild >= 3663 and verBuild <= 3718       --> RC1
        '   verBuild >= 3718                            --> RC2 
        '   verBuild >= 3790                            --> RTM / GOLD
        DetermineAdminPackVersion = versionWindows2003
        if verServicePack = 0 then
            DetermineAdminPackVersion = versionWindows2003
        else
            DetermineAdminPackVersion = versionWindows2003Next
        end if
    else
        '
        ' This must be a future version of Windows (unknown to us at this time) 
        '
        DetermineAdminPackVersion = versionWindowsFuture
    end if
End Function


' ****************************************************************************
' determine the product version
' ****************************************************************************
Function GetProductDetails( installer, database, strVersion, nAdminpakServicePackLevel )
    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' get the version of this MSI file -- 'ProductVersion'
    '
    strVersion = GetProperty( installer, database, "ProductVersion" )
    
    '
    ' get the version of this MSI file -- 'AdminpakServicePackLevel'
    '
    nAdminpakServicePackLevel = GetProperty( installer, database, "AdminpakServicePackLevel" )
    if nAdminpakServicePackLevel = "" then
        '
        ' Windows 2000 will have a different property name (also they did not set this properly until after W2k SP4)  
        ' 
        nAdminpakServicePackLevel = GetProperty( installer, database, "AdminpakBuildVersion" )
    end if

    '
    ' return code -- always success
    GetProductDetails = returnNoError
End Function


' ****************************************************************************
' get the property from MSI
' ****************************************************************************
Function GetProperty( installer, database, strProperty )
    '
    ' local variables
    '
    dim strValue, strQuery
    dim viewProperty, recordProperty

    '
    ' default error trapping mechanism
    '
    on error resume next
    
    '
    ' get the version of this MSI file -- 'ProductVersion'
    '
    strQuery = "SELECT `Value` FROM `Property` WHERE `Property`='" & strProperty & "'"
    set viewProperty = database.OpenView( strQuery ) : CheckErrorEx( installer )

    '
    ' execute the query
    '
    viewProperty.Execute : CheckErrorEx( installer )

    '
    ' loop thru the view results
    '
    do
        '
        ' fetch the record
        '
	    set recordProperty = viewProperty.Fetch : CheckErrorEx( installer )
	    if recordProperty is nothing then exit do
	    if recordProperty.IsNull(1) then
	        exit function
	    end if
    	
	    '
	    ' get the property value
	    '
	    strValue = recordProperty.StringData( 1 )
    	
	    '
	    ' since the query returns singleton result -- exit from the loop
	    '
	    exit do
    loop

    '
    ' check whether we have the property value or not
    ' if property value exists, return it -- otherwise return empty string
    '
    GetProperty = ""
    if strValue <> "" then
        GetProperty = strValue
    end if
End Function


' ****************************************************************************
' get the version info of a file in the Adminpak.msi File Table 
' ****************************************************************************
Function GetFileVersion( database, strFileName )
    '
    ' local variables
    '
    dim strQuery
    dim strVersion
    dim viewFile, recordFile

    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' get the version info of the specified file  
    '
    strQuery = "SELECT `Version` FROM `File` WHERE `File`='" & strFileName & "'"
    set viewFile = database.OpenView( strQuery ) : CheckError

    '
    ' default value
    '
    strVersion = ""
    
    '
    ' execute the query
    '
    viewFile.Execute : CheckError

    '
    ' file version
    '

    do
        '
        ' fetch the record
        '
	    set recordFile = viewFile.Fetch : CheckError
	    if recordFile is nothing then exit do
	    if recordFile.IsNull(1) then
	        Exit Function
	    end if
    	
	    '
	    ' get the file version
	    '
	    strVersion = recordFile.StringData( 1 )
    	
	    '
	    ' since the query returns a singleton result -- exit from the loop
	    '
	    exit do
    loop

    '
    ' return the file version -- if we have it
    '
    GetFileVersion = ""
    if strVersion <> "" then
        GetFileVersion = strVersion
    end if
End Function


' ****************************************************************************
' detect the installed Adminpak.msi package
' ****************************************************************************
Function DetectInstalledPackage( strComputer, strUserName, strPassword, strInfo )
    '
    ' local variables
    '
    dim objService
    dim objRegistry
    
    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' get the registry object
    '
    set objService = ConnectWMI( strComputer, "root\default", strUserName, strPassword )
    set objRegistry = objService.Get( "StdRegProv" )
    if objRegistry is nothing then
        WSctipt.StdOut.WriteLine
        WScript.StdOut.WriteLine "Unexpected error occured - failed to get the WMI registry provider."
        WScript.Quit exitcodeUnexpected
    end if

    '
    ' prepare for scanning the registry 
    '
    dim arrPackages( 2, 2 )
    
    '
    ' Windows 2000 (server)
    arrPackages( 0, 0 ) = "SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData\S-1-5-18\Products\" & guidWindows2000 & "\InstallProperties"
    arrPackages( 0, 1 ) = "LocalPackage"
    arrPackages( 0, 2 ) = versionWindows2000
    
    '
    ' Windows 2000 (professional)
    arrPackages( 1, 0 ) = "SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\LocalPackages\" & guidWindows2000
    arrPackages( 1, 1 ) = "S-1-5-18"
    arrPackages( 1, 2 ) = versionWindows2000
    
    '
    ' Windows Server 2003 (identical for Windows XP 2600) 
    arrPackages( 2, 0 ) = "SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData\S-1-5-18\Products\" & guidWindows2003 & "\InstallProperties"
    arrPackages( 2, 1 ) = "LocalPackage"
    arrPackages( 2, 2 ) = versionWindows2003

    '
    ' default values
    '
    strInfo = ""
    DetectInstalledPackage = versionWindowsUnknown
    
    '
    ' search the registry (chronological order)
    '
    dim i
    dim strData
    for i = UBound( arrPackages ) to 0 step -1
        strData = RegRead( objRegistry, arrPackages( i, 0 ), arrPackages( i, 1 ) )
        if strData <> "" then
            strInfo = strData
            DetectInstalledPackage = arrPackages( i, 2 )
            exit function
        end if
    next
End Function


' ****************************************************************************
' determine the OS version
' ****************************************************************************
Function DetermineOsVersion( strComputer, strUserName, strPassword, strVersion )
    '
    ' local variables
    '
    dim arrVersionInfo
    dim objService, colItems, objItem
    dim verMajor, verMinor, verBuild, verServicePack

    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' default value
    '
    DetermineOsVersion = versionError

    '
    ' connect to WMI and query the operating system information
    '
    set objService = ConnectWMI( strComputer, "root\cimv2", strUserName, strPassword )
    set colItems = objService.ExecQuery( "Select * from Win32_OperatingSystem", ,48 ) : CheckError
    for each objItem in colItems
    
        '
        ' get the OS major and minor versions
        strVersion = objItem.Version
        arrVersionInfo = Split( strVersion, "." )
        
        verMajor = arrVersionInfo( 0 )
        verMinor = arrVersionInfo( 1 )
        verBuild = arrVersionInfo( 2 )
        verServicePack = objItem.ServicePackMajorVersion
        
        '
        ' determine the version
        if ( verMajor < 5 ) then
            '
            ' pre-Windows 2000
            '
            DetermineOsVersion = versionWindowsUnknown
        elseif ( verMajor = 5 and verMinor = 0 ) then
            if ( verServicePack = 0 ) then
                '
                ' Windows 2000 RTM build # 2195 
                '
                DetermineOsVersion = versionWindows2000
            elseif ( verServicePack = 1 ) then
                '
                ' Windows 2000 SP1
                '
                DetermineOsVersion = versionWindows2000SP1
            elseif ( verServicePack = 2 ) then
                '
                ' Windows 2000 SP2
                '
                DetermineOsVersion = versionWindows2000SP2
            elseif ( verServicePack = 3 ) then
                '
                ' Windows 2000 SP3
                '
                DetermineOsVersion = versionWindows2000SP3
            else
                '
                ' Windows 2000 post-SP3
                '
                DetermineOsVersion = versionWindows2000Next
            end if
        elseif ( verMajor = 5 and verMinor = 1 ) then
            if ( verServicePack = 0 ) then
                '
                ' Windows XP RTM build # 2600 
                '
                DetermineOsVersion = versionWindowsXP
            elseif ( verServicePack = 1 ) then
                '
                ' Windows XP SP1
                '
                DetermineOsVersion = versionWindowsXPSP1
            else
                '
                ' Windows XP post-SP1
                '
                DetermineOsVersion = versionWindowsXPNext
            end if
        elseif ( verMajor = 5 and verMinor = 2 ) then
            if ( verServicePack = 0 ) then
                '
                ' Windows Server 2003 RTM
                '
                DetermineOsVersion = versionWindows2003
            else
                '
                ' Windows Server 2003 post-RTM
                '
                DetermineOsVersion = versionWindows2003Next
            end if
        end if
    next        
End Function


' ****************************************************************************
' computer name
' ****************************************************************************
Function GetComputerName
    '
    ' local variables
    '
    dim objNetwork

    ' default value
    GetComputerName = "."

    '
    ' get a reference to the WSH network object
    '
    set objNetwork = WScript.CreateObject( "WScript.Network" )
    CheckError
    
    '
    ' get the computer name & return it 
    ' 
    GetComputerName = objNetwork.ComputerName 
    
End Function


' ****************************************************************************
' registry access
' ****************************************************************************
Function RegRead( objRegistry, strSubKey, strValueName )
    '
    ' local variables
    '
    dim strValue
    
    '
    ' default error trapping mechanism
    '
    on error resume next
    
    '
    ' default value
    '
    RegRead = ""

    '
    ' validate the input object reference    
    if objRegistry is nothing then
        WSctipt.StdOut.WriteLine
        WScript.StdOut.WriteLine "Unexpected error occured - invalid registry object."
        WScript.Quit exitcodeUnexpected
    end if

    '
    ' read the value from registr
    objRegistry.GetStringValue HKEY_LOCAL_MACHINE, strSubKey, strValueName, strValue
    CheckError
    
    '
    ' return value
    RegRead = strValue
End Function


' ****************************************************************************
' WMI connection helper
' ****************************************************************************
Function ConnectWMI( strComputer, strNamespace, strUserName, strPassword )
    '
    ' local variables
    '
    dim objLocator
    dim objService
    
    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' create WMI WBEM locator object to connect to remote CIM object manager
    '
    set objLocator = WScript.CreateObject( "WbemScripting.SWbemLocator" ) : CheckError

    ' connect to the namespace which is either local or remote
    Err.Clear
    set objService = objLocator.ConnectServer( strComputer, strNamespace, strUserName, strPassword )
    if Err.Number <> 0 Then

        ' check if user passed credentials for the local machine
        ' (wmi doesn't support connecting to the local machine with alternate credentials)
        '
        if Err.Number = wmiLocalCredentialsSupplied then

            ' supress the credentials
            strComputer = "."
            strUserName = ""
            strPassword = ""

            ' try connecting again
            Err.Clear
            set objService = objLocator.ConnectServer( ".", strNamespace, "" , "" )
        end if

        ' check for the connection errors
        CheckError

    end if

    ' set the security level
    objService.Security_.impersonationlevel = 3
    
    ' return the object to the caller
    set ConnectWMI = objService
End Function


' ****************************************************************************
' translate version code into text
' ****************************************************************************
Function TranslateVersion( version )
    '
    ' default error trapping mechanism
    '
    on error resume next

    select case version
        case versionError
            TranslateVersion = "Unknown error"
            
        case versionWindowsUnknown
            TranslateVersion = "Unknown version"
        
        case versionWindows2000
            TranslateVersion = "Windows 2000"

        case versionWindows2000SP1
            TranslateVersion = "Windows 2000 SP1"
        
        case versionWindows2000SP2
            TranslateVersion = "Windows 2000 SP2"
        
        case versionWindows2000SP3
            TranslateVersion = "Windows 2000 SP3"
        
        case versionWindows2000Next
            TranslateVersion = "Windows 2000 post-SP3"
        
        case versionWindowsXP
            TranslateVersion = "Windows XP"
        
        case versionWindowsXPSP1
            TranslateVersion = "Windows XP SP1"
        
        case versionWindowsXPNext
            TranslateVersion = "Windows XP post-SP1"
        
        case versionWindows2003
            TranslateVersion = "Windows Server 2003"
        
        case versionWindows2003Next
            TranslateVersion = "Windows Server 2003 post-RTM"
        
        case versionWindowsFuture
            TranslateVersion = "Future version of Windows (post W2K3)"
    end select
End Function


' ****************************************************************************
' determine product/feature/component state
' ****************************************************************************
Function TranslateState( state, statetype )
    TranslateState = ""
    select case state
        case msiInstallStateNotUsed
            TranslateState = "Not Used"
        
        case msiInstallStateInvalidArg
            TranslateState = "Invalid argument"
        
        case msiInstallStateBadConfig
            TranslateState = "Corrupted"

	    case msiInstallStateIncomplete
		    TranslateState = "In Progress"
    		
	    case msiInstallStateSourceAbsent
            TranslateState = "Source Absent"
    	
	    case msiInstallStateBroken
		    TranslateState = "Broken"   ' some MSI Feature type ? 
    	
	    case msiInstallStateAdvertised
	        if statetype = "f" then
		        TranslateState = "Advertised"
	        elseif statetype = "p" then
		        TranslateState = "Advertised but not installed."
		    end if
    	
        case msiInstallStateRemoved
            TranslateState = "Uninstalled"

	    case msiInstallStateAbsent
	        if statetype = "f" then
    		    TranslateState = "Not Installed"
		    elseif statetype = "p" then
		        TranslateState = "Installed for a different user."
		    end if
    	
	    case msiInstallStateLocal
		    TranslateState = "Installed"
    	
	    case msiInstallStateSource
            TranslateState = "Installed (runs from source)"
    	
	    case msiInstallStateDefault
	        if statetype = "f" then
		        TranslateState = "Default"
		    elseif statetype = "p" then
		        TranslateState = "Installed."
		    end if
    	    
        case msiInstallStateUnknown
            if statetype = "f" then
                TranslateState = "Unknown"
            elseif statetype = "p" then
                TranslateState = "Neither advertised nor installed."
            end if
            
	    case else
            TranslateState = "Unknown (state: " & state & ")"
    end select
End Function


' ****************************************************************************
' parse arguments
' ****************************************************************************
Function ParseArguments( strDatabase, strComputer, strUser, strPassword )
    '
    ' local variables
    '
    dim strArgument
    dim nEngineVersion

    '
    ' default error trapping mechanism
    '
    on error resume next

    '
    ' default return value
    '
    ParseArguments = 0
    
    '
    ' default values
    strUser = ""
    strDatabse = ""
    strPassword = ""
    strComputer = "."
    
    '
    ' if there are no arguments, then simply return
    '
    if WScript.Arguments.Count = 0 then Exit Function
    
    '
    ' check the WSH VBScript engine version
    ' for this script to run successfully, the WSH engine version should be 5.6 or above
    '
    nEngineVersion = (ScriptEngineMajorVersion * 10) + ScriptEngineMinorVersion
    if nEngineVersion < 56 then
        WScript.StdOut.WriteLine "For this script to run successfully, the script engine"
        WScript.StdOut.WriteLine "should be using WSH 5.6 or above."
        WScript.StdOut.WriteLine "You can download this from http://msdn.microsoft.com"
        WScript.Quit exitcodeWSHVersionError
    end if

    '
    ' if arguments are greater than 3 -- error exit
    '
    if ( WScript.Arguments.Count > 3 or _
         WScript.Arguments.Named.Length > 3 or _
         WScript.Arguments.UnNamed.Length > 1 ) then
        ShowHelp
	    Wscript.Quit exitcodeInvalidSyntax
    end if
    
    '
    ' check whether the passed arguments are valid parameters or not
    '
    for each strArgument in WScript.Arguments.Named
        if strArgument = "" or InStr( 1, "sup?", strArgument ) = 0 then
            WScript.StdOut.WriteLine "Invalid syntax"
            WScript.Quit exitcodeInvalidSyntax
        end if
    next
    
    '
    ' get the command line argument values
    '
    
    '
    ' database
    if WScript.Arguments.UnNamed.Length >= 1 then
        strDatabase = WScript.Arguments.UnNamed.Item( 0 )
        
        '
        ' validate the database name -- it should be "adminpak.msi" only
        '
        if LCase( Right( strDatabase, 12 ) ) <> "adminpak.msi" then
            WSctipt.StdOut.WriteLine
            WScript.StdOut.WriteLine "Invalid file name. File name should be adminpak.msi only"
            WScript.Quit exitcodeInvalidMSI
        end if
    end if
    
    '
    ' check if user is asking for help
    if WScript.Arguments.Named.Exists( "?" ) then
        ShowHelp
        if WScript.Arguments.Count = 1 then
	        Wscript.Quit exitcodeNone
        else
	        WScript.Quit exitcodeInvalidSyntax
        end if
    end if
    
    '
    ' If /S provided, get the remote computer name 
    ' 
    if WScript.Arguments.Named.Exists( "s" ) then
        strComputer = WScript.Arguments.Named.Item( "s" )
        if strComputer = "" then
            WScript.StdOut.WriteLine "Invalid syntax"
            WScript.Quit exitcodeInvalidSyntax
        end if
    end if
    
    '
    ' If /U provided, get the alternate user name (needs to be admin level) 
    ' 
    if WScript.Arguments.Named.Exists( "u" ) then
        strUser = WScript.Arguments.Named.Item( "u" )
        if strUser = "" then
            WScript.StdOut.WriteLine "Invalid syntax"
            WScript.Quit exitcodeInvalidSyntax
        end if
    end if
    
    '
    ' If /P provided, get the password 
    '
    if WScript.Arguments.Named.Exists( "p" ) then
        strPassword = WScript.Arguments.Named.Item( "p" )
        if strPassword = "" then
            WScript.StdOut.WriteLine "Invalid syntax"
            WScript.Quit exitcodeInvalidSyntax
        end if
    end if
End Function


' ****************************************************************************
' show usage HELP  (/?) 
' ****************************************************************************
Sub ShowHelp
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "APver.vbs [msi package] [/s:computer [/u:user [/p:password]]]"
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "Description:"
    WScript.StdOut.WriteLine "    This script helps admins to detect which version of the Windows"
    WScript.StdOut.WriteLine "    Administration Tools Pack (adminpak.msi) is installed on a machine."
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "Parameters:"
    WScript.StdOut.WriteLine "    msi package                 specified msi file that you want to use"
    WScript.StdOut.WriteLine "                                to cross check with the installed version."
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "    /s            computer      name of the remote machine to check"
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "    /u            user          alternate user name, used to make the remote "
    WScript.StdOut.WriteLine "                                connection to the machine specified with /s "
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "    /p            password      password to use for the user specified with /u"
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "    /?                          displays this help text"
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "Exit codes:"
    WScript.StdOut.WriteLine "-----------"
    WScript.StdOut.WriteLine "the exit code is returned via environment variable 'ERRORLEVEL'. Each digit "
    WScript.StdOut.WriteLine "signifies Major version, Minor version and service pack levels respectively."
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "Example Exit Codes:"
    WScript.StdOut.WriteLine "-------------------"
    WScript.StdOut.WriteLine "    Windows 2000                                    500"
    WScript.StdOut.WriteLine "    Windows 2000 SP1                                501"
    WScript.StdOut.WriteLine "    Windows 2000 SP2                                502"
    WScript.StdOut.WriteLine "    Windows 2000 SP3                                503"
    WScript.StdOut.WriteLine "    Windows 2000 post-SP3                           509"
    WScript.StdOut.WriteLine "    Windows Server 2003                             520"
    WScript.StdOut.WriteLine "    Windows Server 2003 post-RTM                    529"
    WScript.StdOut.WriteLine "    Future Version (post Windows Server 2003)       999"
    WScript.StdOut.WriteLine "    Pre-Windows 2000 (NT 4.0)                       400"
    WScript.StdOut.WriteLine
    WScript.StdOut.WriteLine "    Other Exit Codes:"
    WScript.StdOut.WriteLine "    -----------------"
    WScript.StdOut.WriteLine "    0 -> Adminpak is not installed"
    WScript.StdOut.WriteLine "    1 -> Invalid syntax"
    WScript.StdOut.WriteLine "    2 -> Error occured executing the script"
    WScript.StdOut.WriteLine "    3 -> Invalid MSI file was passed in"
    WScript.StdOut.WriteLine "    4 -> Unexpected error occured while executing the script"
    WScript.StdOut.WriteLine "    5 -> The script engine is out-of-date. You need WSH 5.6 to run this script"
    
End Sub


' ****************************************************************************
' error checking
' ****************************************************************************
Sub CheckError
    '
    ' do not set the default error trapping mechanism -- it will reset the "err" object
    '

	if Err = 0 then Exit Sub
	WScript.StdOut.WriteLine Hex(Err) & ": " & Err.Description
	WScript.Quit exitcodeError
End Sub


' ****************************************************************************
' error checking - extended
' ****************************************************************************
Sub CheckErrorEx( installer )
    '
    ' do not set the default error trapping mechanism -- it will reset the "err" object
    '

	dim message, errRec
	if Err = 0 then Exit Sub
	message = Err.Source & " " & Hex(Err) & ": " & Err.Description
	if not installer is nothing then
		set errRec = installer.LastErrorRecord
		if not errRec is nothing then message = message & vbNewLine & errRec.FormatText
	end if
	WScript.StdOut.WriteLine message
	WScript.Quit exitcodeError
End Sub

' ****************************************************************************
' error checking - extended
' ****************************************************************************
Sub CheckScriptHost
    '
    ' local variables
    '
    dim fso
    dim strHostName

    '
    ' default error trapping mechanism
    '
    on error resume next

    ' get the 
    set fso = WScript.CreateObject("Scripting.FileSystemObject") : CheckError
    strHostName = fso.GetFileName( WScript.FullName )

    if LCase( strHostName ) <> "cscript.exe" then
        WScript.Echo _
            "This script should be executed from the command prompt using CSCRIPT.EXE." & vbNewLine & _
            "For example: CSCRIPT.EXE apver.vbs [arguments]" & vbNewLine & _
            "To set CSCRIPT.EXE as the default application to run .vbs files, run the following:" & vbNewLine & _
            "       CSCRIPT //H:CSCRIPT //S" & vbNewLine & _
            "You can then run ""apver.vbs [arguments]"" without preceding the script with CSCRIPT."
        WScript.Quit exitcodeInvalidHost
    end if

End Sub

'' SIG '' Begin signature block
'' SIG '' MIIaIgYJKoZIhvcNAQcCoIIaEzCCGg8CAQExCzAJBgUr
'' SIG '' DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
'' SIG '' gjcCAR4wJAIBAQQQTvApFpkntU2P5azhDxfrqwIBAAIB
'' SIG '' AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFBzAviC+2s+I
'' SIG '' yFLIgtaRv4W4YAkBoIIUvDCCArwwggIlAhBKGdI4jIJZ
'' SIG '' HKVdc18VXdyjMA0GCSqGSIb3DQEBBAUAMIGeMR8wHQYD
'' SIG '' VQQKExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMRcwFQYD
'' SIG '' VQQLEw5WZXJpU2lnbiwgSW5jLjEsMCoGA1UECxMjVmVy
'' SIG '' aVNpZ24gVGltZSBTdGFtcGluZyBTZXJ2aWNlIFJvb3Qx
'' SIG '' NDAyBgNVBAsTK05PIExJQUJJTElUWSBBQ0NFUFRFRCwg
'' SIG '' KGMpOTcgVmVyaVNpZ24sIEluYy4wHhcNOTcwNTEyMDAw
'' SIG '' MDAwWhcNMDQwMTA3MjM1OTU5WjCBnjEfMB0GA1UEChMW
'' SIG '' VmVyaVNpZ24gVHJ1c3QgTmV0d29yazEXMBUGA1UECxMO
'' SIG '' VmVyaVNpZ24sIEluYy4xLDAqBgNVBAsTI1ZlcmlTaWdu
'' SIG '' IFRpbWUgU3RhbXBpbmcgU2VydmljZSBSb290MTQwMgYD
'' SIG '' VQQLEytOTyBMSUFCSUxJVFkgQUNDRVBURUQsIChjKTk3
'' SIG '' IFZlcmlTaWduLCBJbmMuMIGfMA0GCSqGSIb3DQEBAQUA
'' SIG '' A4GNADCBiQKBgQDTLiDwaHwsLS6BHLEGsqcLtxENV9pT
'' SIG '' 2HXjyTMqstT2CVs08+mQ/gkM0NsbWrnN5/aIsZ3AhyXr
'' SIG '' fVgQc2p4y3EV/cZY9imrWF6WBP0tYhFYgRzKcZTVIlgv
'' SIG '' 1cwUBYQ2upSqtE1K6e47Iq1WmX4hnGyGwEpHl2q0pjbV
'' SIG '' /Akt07Q5mwIDAQABMA0GCSqGSIb3DQEBBAUAA4GBAGFV
'' SIG '' Dj57x5ISfhEQjiLM1LMTK1voROQLeJ6kfvOnB3Ie4lnv
'' SIG '' zITjiZRM205h77Ok+0Y9UDQLn3BW9o4qfxfO5WO/eWkH
'' SIG '' cy6wlSiK9e2qqdJdzQrKEAmPzrOvKJbEeSmEktz/umdC
'' SIG '' SKaQEOS/YficU+WT0XM/+P2dT4SsVdH9EWNjMIIEAjCC
'' SIG '' A2ugAwIBAgIQCHptXG9ik0+6xP1D4RQYnTANBgkqhkiG
'' SIG '' 9w0BAQQFADCBnjEfMB0GA1UEChMWVmVyaVNpZ24gVHJ1
'' SIG '' c3QgTmV0d29yazEXMBUGA1UECxMOVmVyaVNpZ24sIElu
'' SIG '' Yy4xLDAqBgNVBAsTI1ZlcmlTaWduIFRpbWUgU3RhbXBp
'' SIG '' bmcgU2VydmljZSBSb290MTQwMgYDVQQLEytOTyBMSUFC
'' SIG '' SUxJVFkgQUNDRVBURUQsIChjKTk3IFZlcmlTaWduLCBJ
'' SIG '' bmMuMB4XDTAxMDIyODAwMDAwMFoXDTA0MDEwNjIzNTk1
'' SIG '' OVowgaAxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8w
'' SIG '' HQYDVQQLExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMTsw
'' SIG '' OQYDVQQLEzJUZXJtcyBvZiB1c2UgYXQgaHR0cHM6Ly93
'' SIG '' d3cudmVyaXNpZ24uY29tL3JwYSAoYykwMTEnMCUGA1UE
'' SIG '' AxMeVmVyaVNpZ24gVGltZSBTdGFtcGluZyBTZXJ2aWNl
'' SIG '' MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
'' SIG '' wHphh+uypwNjGysaYd6AtxUdoIuQPbsnkoQUOeuFzimS
'' SIG '' BmZIpANPjehPp/CvXtEvGceR8bWee5Ehzun/407w/K+V
'' SIG '' WLhjLeaO9ikYzXCOUMPtlrtA274l6EJV1vaF8gbni5kc
'' SIG '' MfMDD9RMnCQq3Bsbj4LzsO+nTeMUp+CP1sdowmFYqXLU
'' SIG '' +DBIT9kvb2Mg2YnKgnvCS7woxYFo5+aCQKxGOqD5PzbN
'' SIG '' TLtUQlp6ZXv+hOTHR1SsuT3sgMca98QzgYHJKpX7f146
'' SIG '' h5AU28wudfLva+Y9qWC+QgGqT6pbqD8iMZ8SFflzoR6C
'' SIG '' iwQr6kYCTG2PH1AulUsqeAaEdD2RjyxHMQIDAQABo4G4
'' SIG '' MIG1MEAGCCsGAQUFBwEBBDQwMjAwBggrBgEFBQcwAYYk
'' SIG '' aHR0cDovL29jc3AudmVyaXNpZ24uY29tL29jc3Avc3Rh
'' SIG '' dHVzMAkGA1UdEwQCMAAwRAYDVR0gBD0wOzA5BgtghkgB
'' SIG '' hvhFAQcBATAqMCgGCCsGAQUFBwIBFhxodHRwczovL3d3
'' SIG '' dy52ZXJpc2lnbi5jb20vcnBhMBMGA1UdJQQMMAoGCCsG
'' SIG '' AQUFBwMIMAsGA1UdDwQEAwIGwDANBgkqhkiG9w0BAQQF
'' SIG '' AAOBgQAt809jYCwY2vUkD1KzDOuzvGeFwiPtj0YNzxpN
'' SIG '' vvN8eiAwMhhoi5K7Mpnwk7g7FQYnez4CBgCkIZKEEwrF
'' SIG '' mOVAV8UFJeivrxFqqeU7y+kj9pQpXUBV86VTncg2Ojll
'' SIG '' CHNzpDLSr6y/xwU8/0Xsw+jaJNHOY64Jp/viG+P9QQpq
'' SIG '' ljCCBBIwggL6oAMCAQICDwDBAIs8PIgR0T72Y+zfQDAN
'' SIG '' BgkqhkiG9w0BAQQFADBwMSswKQYDVQQLEyJDb3B5cmln
'' SIG '' aHQgKGMpIDE5OTcgTWljcm9zb2Z0IENvcnAuMR4wHAYD
'' SIG '' VQQLExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNV
'' SIG '' BAMTGE1pY3Jvc29mdCBSb290IEF1dGhvcml0eTAeFw05
'' SIG '' NzAxMTAwNzAwMDBaFw0yMDEyMzEwNzAwMDBaMHAxKzAp
'' SIG '' BgNVBAsTIkNvcHlyaWdodCAoYykgMTk5NyBNaWNyb3Nv
'' SIG '' ZnQgQ29ycC4xHjAcBgNVBAsTFU1pY3Jvc29mdCBDb3Jw
'' SIG '' b3JhdGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFJvb3Qg
'' SIG '' QXV0aG9yaXR5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
'' SIG '' MIIBCgKCAQEAqQK9wXDmO/JOGyifl3heMOqiqY0lX/j+
'' SIG '' lUyjt/6doiA+fFGim6KPYDJr0UJkee6sdslU2vLrnIYc
'' SIG '' j5+EZrPFa3piI9YdPN4PAZLolsS/LWaammgmmdA6LL8M
'' SIG '' tVgmwUbnCj44liypKDmo7EmDQuOED7uabFVhrIJ8oWAt
'' SIG '' d0zpmbRkO5pQHDEIJBSfqeeRKxjmPZhjFGBYBWWfHTdS
'' SIG '' h/en75QCxhvTv1VFs4mAvzrsVJROrv2nem10Tq8YzJYJ
'' SIG '' KCEAV5BgaTe7SxIHPFb/W/ukZgoIptKBVlfvtjteFoF3
'' SIG '' BNr2vq6Alf6wzX/WpxpyXDzKvPAIoyIwswaFybMgdxOF
'' SIG '' 3wIDAQABo4GoMIGlMIGiBgNVHQEEgZowgZeAEFvQcO9p
'' SIG '' cp4jUX4Usk2O/8uhcjBwMSswKQYDVQQLEyJDb3B5cmln
'' SIG '' aHQgKGMpIDE5OTcgTWljcm9zb2Z0IENvcnAuMR4wHAYD
'' SIG '' VQQLExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNV
'' SIG '' BAMTGE1pY3Jvc29mdCBSb290IEF1dGhvcml0eYIPAMEA
'' SIG '' izw8iBHRPvZj7N9AMA0GCSqGSIb3DQEBBAUAA4IBAQCV
'' SIG '' 6AvAjfOXGDXtuAEk2HcR81xgMp+eC8s+BZGIj8k65iHy
'' SIG '' 8FeTLLWgR8hi7/zXzDs7Wqk2VGn+JG0/ycyq3gV83TGN
'' SIG '' PZ8QcGq7/hJPGGnA/NBD4xFaIE/qYnuvqhnIKzclLb5l
'' SIG '' oRKKJQ9jo/dUHPkhydYV81KsbkMyB/2CF/jlZ2wNUfa9
'' SIG '' 8VLHvefEMPwgMQmIHZUpGk3VHQKl8YDgA7Rb9LHdyFfu
'' SIG '' ZUnHUlS2tAMoEv+Q1vAIj364l8WrNyzkeuSod+N2oADQ
'' SIG '' aj/B0jaK4EESqDVqG2rbNeHUHATkqEUEyFozOG5NHA1i
'' SIG '' twqijNPVVD9GzRxVpnDbEjqHk3Wfp9KgMIIEyTCCA7Gg
'' SIG '' AwIBAgIQaguZT8AA3qoR1NhAmqi+5jANBgkqhkiG9w0B
'' SIG '' AQQFADBwMSswKQYDVQQLEyJDb3B5cmlnaHQgKGMpIDE5
'' SIG '' OTcgTWljcm9zb2Z0IENvcnAuMR4wHAYDVQQLExVNaWNy
'' SIG '' b3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1pY3Jv
'' SIG '' c29mdCBSb290IEF1dGhvcml0eTAeFw0wMDEyMTAwODAw
'' SIG '' MDBaFw0wNTExMTIwODAwMDBaMIGmMQswCQYDVQQGEwJV
'' SIG '' UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
'' SIG '' UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
'' SIG '' cmF0aW9uMSswKQYDVQQLEyJDb3B5cmlnaHQgKGMpIDIw
'' SIG '' MDAgTWljcm9zb2Z0IENvcnAuMSMwIQYDVQQDExpNaWNy
'' SIG '' b3NvZnQgQ29kZSBTaWduaW5nIFBDQTCCASAwDQYJKoZI
'' SIG '' hvcNAQEBBQADggENADCCAQgCggEBAKKEFVPYCzAONJX/
'' SIG '' OhvC8y97bTcjTfPSjOX9r/3FAjQfJMflodxU7H4CdEer
'' SIG '' 2zJYFhRRKTjxfrK0jDpHtTlOblTCMQw6bfvNzctQnBuu
'' SIG '' p9jZSiY/tcXLj5biSfJt2OmWPt4Fz/CmVTetL2DNgGFC
'' SIG '' oUlUSg8Yt0vZk5kwWkd1ZLTTu922qwydT7hzOxg6qrSH
'' SIG '' jLCIsE1PH04RtTOA3w06ZG9ExzS9SpObvKYd+QUjTmAp
'' SIG '' j8wq8oSama2o2wpwe9Y0QZClt2bHXBsdozMOm1QDGj+Y
'' SIG '' kLjM5z0EdEMcj/c55rOsSHprKg5iAWE5dm79PpgHSxTx
'' SIG '' AUb9FQDgR9pP5AXkgCUCAQOjggEoMIIBJDATBgNVHSUE
'' SIG '' DDAKBggrBgEFBQcDAzCBogYDVR0BBIGaMIGXgBBb0HDv
'' SIG '' aXKeI1F+FLJNjv/LoXIwcDErMCkGA1UECxMiQ29weXJp
'' SIG '' Z2h0IChjKSAxOTk3IE1pY3Jvc29mdCBDb3JwLjEeMBwG
'' SIG '' A1UECxMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSEwHwYD
'' SIG '' VQQDExhNaWNyb3NvZnQgUm9vdCBBdXRob3JpdHmCDwDB
'' SIG '' AIs8PIgR0T72Y+zfQDAQBgkrBgEEAYI3FQEEAwIBADAd
'' SIG '' BgNVHQ4EFgQUKVy5G7bNM+67nll99+XKLsQNNCgwGQYJ
'' SIG '' KwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQD
'' SIG '' AgFGMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEE
'' SIG '' BQADggEBAEVY4ppBf/ydv0h3d66M2eYZxVe0Gr20uV8C
'' SIG '' oUVqOVn5uSecLU2e/KLkOIo4ZCJC37kvKs+31gbK6yq/
'' SIG '' 4BqFfNtRCD30ItPUwG2IgRVEX2SDZMSplCyK25A3Sg+3
'' SIG '' 6NRhj3Z24dkl/ySElY0EVlSUoRw6PoK87qWHjByMS3lf
'' SIG '' tUn6XjJpOh9UrXVN32TnMDzbZElE+/vEHEJx5qA9Re5r
'' SIG '' AJ+sQr26EbNW5PvVoiqB2B9OolW+J49wpqJsG/9UioK8
'' SIG '' gUumobFmeqkXp8sGwEfrprPpMRVTPSoEv/9zSNyLJ0P8
'' SIG '' Y+juJIdbvjbR6DH1Mtle33l6ujCsaYZK+4wRvxuNVFkw
'' SIG '' ggUPMIID96ADAgECAgphBxFDAAAAAAA0MA0GCSqGSIb3
'' SIG '' DQEBBQUAMIGmMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
'' SIG '' V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
'' SIG '' A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSswKQYD
'' SIG '' VQQLEyJDb3B5cmlnaHQgKGMpIDIwMDAgTWljcm9zb2Z0
'' SIG '' IENvcnAuMSMwIQYDVQQDExpNaWNyb3NvZnQgQ29kZSBT
'' SIG '' aWduaW5nIFBDQTAeFw0wMjA1MjUwMDU1NDhaFw0wMzEx
'' SIG '' MjUwMTA1NDhaMIGhMQswCQYDVQQGEwJVUzETMBEGA1UE
'' SIG '' CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
'' SIG '' MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSsw
'' SIG '' KQYDVQQLEyJDb3B5cmlnaHQgKGMpIDIwMDIgTWljcm9z
'' SIG '' b2Z0IENvcnAuMR4wHAYDVQQDExVNaWNyb3NvZnQgQ29y
'' SIG '' cG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
'' SIG '' ggEKAoIBAQCqmb05qBgn9Cs9C0w/fHcup8u10YwNwjp0
'' SIG '' 15O14KBLP1lezkVPmnkp8UnMGkfuVcIIPhIg+FXy7l/T
'' SIG '' 4MqWvDDe/ljIJzLQhVTo8JEQu/MrvhnlA5sLhh3zsDmM
'' SIG '' uP0LHTxzJqxXK8opohWQghXid6NAUgOLncJwuh/pNPbz
'' SIG '' NZJOVYP42jC2IN5XBrVaQgbeWcvy36a9FUdxGSUj0stv
'' SIG '' mxl532pb8XYFeSn8w1bKj0QIhVWKy8gPRktVy4yWd0qH
'' SIG '' 6KlBBsf/DeloV2Nyw2lXtEPPMjow3Bvp1UMmKnn+ldsi
'' SIG '' ZyTJL9A04+b7UUmGuDzQJV/W7J4DYYepaEDH+OID5s8F
'' SIG '' AgMBAAGjggFAMIIBPDAOBgNVHQ8BAf8EBAMCBsAwEwYD
'' SIG '' VR0lBAwwCgYIKwYBBQUHAwMwHQYDVR0OBBYEFGvIxlEg
'' SIG '' 8LQv06C2rn9eJrK4h1IpMIGpBgNVHSMEgaEwgZ6AFClc
'' SIG '' uRu2zTPuu55Zffflyi7EDTQooXSkcjBwMSswKQYDVQQL
'' SIG '' EyJDb3B5cmlnaHQgKGMpIDE5OTcgTWljcm9zb2Z0IENv
'' SIG '' cnAuMR4wHAYDVQQLExVNaWNyb3NvZnQgQ29ycG9yYXRp
'' SIG '' b24xITAfBgNVBAMTGE1pY3Jvc29mdCBSb290IEF1dGhv
'' SIG '' cml0eYIQaguZT8AA3qoR1NhAmqi+5jBKBgNVHR8EQzBB
'' SIG '' MD+gPaA7hjlodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20v
'' SIG '' cGtpL2NybC9wcm9kdWN0cy9Db2RlU2lnblBDQS5jcmww
'' SIG '' DQYJKoZIhvcNAQEFBQADggEBADUj/RNU/Onc8N0MFHr6
'' SIG '' p7PO/ac6yLrl5/YD+1Pbp5mpoJs2nAPrgkccIb0Uy+dn
'' SIG '' QAnHFpECVc5DQrTNG12w8zIEPRLlHacHp4+jfkVVdhuW
'' SIG '' lZFp8N0480iJ73BAt9u1VYDAA8QutijcCoIOx0Pjekhd
'' SIG '' uAaJkkBsbsXc+JrvC74hCowvOrXtp85xh2gj4bPkGH24
'' SIG '' RwGlK8RYy7KJbF/90yzEb7gjsg3/PPIRRXTyCQaZGN1v
'' SIG '' wIYBGBIdKxavVu9lM6HqZ070S4Kr6Q/cAfrfYH9mR13L
'' SIG '' LHDMe07ZBrhujAz+Yh5C+ZN8oqsKntAjEK5NeyeRbya+
'' SIG '' aPqmP58j68idu4cxggTSMIIEzgIBATCBtTCBpjELMAkG
'' SIG '' A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
'' SIG '' BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
'' SIG '' dCBDb3Jwb3JhdGlvbjErMCkGA1UECxMiQ29weXJpZ2h0
'' SIG '' IChjKSAyMDAwIE1pY3Jvc29mdCBDb3JwLjEjMCEGA1UE
'' SIG '' AxMaTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0ECCmEH
'' SIG '' EUMAAAAAADQwCQYFKw4DAhoFAKCBojAZBgkqhkiG9w0B
'' SIG '' CQMxDAYKKwYBBAGCNwIBBDAcBgorBgEEAYI3AgELMQ4w
'' SIG '' DAYKKwYBBAGCNwIBFTAjBgkqhkiG9w0BCQQxFgQUOitI
'' SIG '' vTysaZNR+pqJ6H42ThtFuSwwQgYKKwYBBAGCNwIBDDE0
'' SIG '' MDKgFIASAGEAcAB2AGUAcgAuAHYAYgBzoRqAGGh0dHA6
'' SIG '' Ly93d3cubWljcm9zb2Z0LmNvbTANBgkqhkiG9w0BAQEF
'' SIG '' AASCAQA3Pi8FpoM55+jbOxA9EK3Qh5eWZN7cHynOnTpC
'' SIG '' PzH0X0R3FziIrO+Y6I9+75kaDbdylBvdZ/f1JY3E2K+r
'' SIG '' 5ZqTaHprJzaj/GG1VWvNPga4hcnH5RWGya3CvjPs5fpk
'' SIG '' yo871Dx+ly6P2oSjQoNy0rolyXdsT7vA2DpVOP3idqPz
'' SIG '' SWo8Y9j7nTNSlOmyS+DURsDLCUDIuBvopSBYmvYp0YT4
'' SIG '' 7o/7iJjZ15g3RogN36vY3XsP4YwtLOFM3lchxMKuzl8T
'' SIG '' dYUKafAavhF5GjdYtVP+BWrXaTSDJ6YVmFOix8B0b/hP
'' SIG '' dFLhb7YCS02gStD6zmqIxLDCKoA5hoF9zgZf/vk4oYIC
'' SIG '' TDCCAkgGCSqGSIb3DQEJBjGCAjkwggI1AgEBMIGzMIGe
'' SIG '' MR8wHQYDVQQKExZWZXJpU2lnbiBUcnVzdCBOZXR3b3Jr
'' SIG '' MRcwFQYDVQQLEw5WZXJpU2lnbiwgSW5jLjEsMCoGA1UE
'' SIG '' CxMjVmVyaVNpZ24gVGltZSBTdGFtcGluZyBTZXJ2aWNl
'' SIG '' IFJvb3QxNDAyBgNVBAsTK05PIExJQUJJTElUWSBBQ0NF
'' SIG '' UFRFRCwgKGMpOTcgVmVyaVNpZ24sIEluYy4CEAh6bVxv
'' SIG '' YpNPusT9Q+EUGJ0wDAYIKoZIhvcNAgUFAKBZMBgGCSqG
'' SIG '' SIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkF
'' SIG '' MQ8XDTAzMDQwMzAyMzM1NlowHwYJKoZIhvcNAQkEMRIE
'' SIG '' ELc+Um4lmGH2SF+gUBdiFSAwDQYJKoZIhvcNAQEBBQAE
'' SIG '' ggEAPJNWCpER3bClmMdYi7AxaI79FsVFeABP0+oHYarv
'' SIG '' QK+XoTyw3oRMxFe0bVQgaV85U1xcv17eIYR/egCvuY/N
'' SIG '' 46u7EmnmugjUqkLXgWysoG6zJtvpKedDEr91B5z7OqNb
'' SIG '' yHWobKXOoiWualTMeQ9Eoi81/LbCGMAzmWzRHh94Zmbl
'' SIG '' 4TQoUGbZapqYf/2wUI8EZ1yN5lIs30eqTWSsKzzD/D/5
'' SIG '' tHwcO/kiZye/1JSkwp68SxL/9ZviUvYWmUnFxAKkfgqw
'' SIG '' 7o8HspIWLl54Q7AlAcw3EFLyf4eOmeJf8n0IGh6Kh0q1
'' SIG '' t5RuOSY4Z2AyEIR2FYR2OZiAd6XNoVsnqYwp9w==
'' SIG '' End signature block
