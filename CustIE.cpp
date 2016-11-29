// CustIE.cpp : Defines the class behaviors for the application.
//

#include "stdafx.h"
#include "afxwinappex.h"
#include "afxdialogex.h"
#include "CustIE.h"
#include "MainFrm.h"

#include "CustIEDoc.h"
#include "DocHostHtmlView.h"
#include "CustIEView.h"

#include "CustDispatch.h"

#include "CustIETools.h"

// CCustIEApp

BEGIN_MESSAGE_MAP(CCustIEApp, CWinApp)
	ON_COMMAND(ID_APP_ABOUT, &CCustIEApp::OnAppAbout)
	// Standard file based document commands
	ON_COMMAND(ID_FILE_NEW, &CWinApp::OnFileNew)
	ON_COMMAND(ID_FILE_OPEN, &CWinApp::OnFileOpen)
	ON_UPDATE_COMMAND_UI(ID_FILE_MRU_FILE1, &CCustIEApp::OnUpdateFileMruFile1)
END_MESSAGE_MAP()


// CCustIEApp construction

CCustIEApp::CCustIEApp()
	: m_pCustDisp(NULL)
	, m_fShowScriptError(false)
	, m_fSuspendFlag(false)
	, m_fMinimizeWindow(false)
	, m_fEnableWindow(false)
	, m_nKeyInputWait(2000)
	, m_nDama2ListenPort(3339)
	, m_sKeyInputName("KeyInput.exe")
	, m_nTimeOut(DEFAULT_TIMEOUT_SECONDS)
	, m_nReportTimeout(DEFAULT_REPORT_TIMEOUT)
	, m_sHTMLandScreenShotPath(DEFAULT_HTMLandScreenShotPath)
	, m_sProxyString("")
	, m_sLogDir("")
{
	// TODO: replace application ID string below with unique ID string; recommended
	// format for string is CompanyName.ProductName.SubProduct.VersionInformation
	SetAppID(_T("CustIE.AppID.NoVersion"));

	// TODO: add construction code here,
	// Place all significant initialization in InitInstance
}

CCustIEApp::~CCustIEApp() {
}

// The one and only CCustIEApp object

CCustIEApp theApp;

void SetIECoreVersion(CString exeName, long version)
{
	wchar_t* path = L"SOFTWARE\\Microsoft\\Internet Explorer\\MAIN\\FeatureControl\\FEATURE_BROWSER_EMULATION";
	wchar_t* valueName = exeName.GetBuffer();
	wchar_t err[1024];
	HKEY hKey;
	DWORD dwDisposition;
	long ret = RegOpenKeyEx(HKEY_LOCAL_MACHINE, path, 0, REG_LEGAL_OPTION, &hKey);
	if (ret != ERROR_SUCCESS)
	{
		FormatMessageW(FORMAT_MESSAGE_FROM_SYSTEM, NULL, ret, NULL, err, sizeof(err), NULL);
		ret = RegCreateKeyEx(HKEY_LOCAL_MACHINE, path, 0, NULL, REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, &dwDisposition);
		if (ret != ERROR_SUCCESS)
		{
			FormatMessageW(FORMAT_MESSAGE_FROM_SYSTEM, NULL, ret, NULL, err, sizeof(err), NULL);
			return;
		}
	}

	ret = RegSetValueEx(hKey, valueName, NULL, REG_DWORD, (BYTE*)&version, sizeof(version));
	if (ret != ERROR_SUCCESS)
		return;
}

// CCustIEApp initialization

BOOL CCustIEApp::InitInstance()
{	
	/*
	* Setup locale to zh_CN.GBK
	*/
	wchar_t * curlocale = _wsetlocale(LC_ALL, L"Chinese_People's Republic of China.936");
	int err = GetLastError();
	curlocale = _wsetlocale(LC_ALL, NULL);
	PUTLOG("* Set locale to [%s]", TOANSI(curlocale));

	/*
	* Note: Remember to link with /nxcompat:no options, while building with vs versions above vs2008
	* because CMB bank control use HEAP SPACE( HeapAlloc & VirtualProctect) to hold 2 instructions ( mov & jmp) to jump to real window procedure.
	*
	*/
	// InitCommonControlsEx() is required on Windows XP if an application
	// manifest specifies use of ComCtl32.dll version 6 or later to enable
	// visual styles.  Otherwise, any window creation will fail.
	INITCOMMONCONTROLSEX InitCtrls;
	InitCtrls.dwSize = sizeof(InitCtrls);
	// Set this to include all the common control classes you want to use
	// in your application.
	InitCtrls.dwICC = ICC_WIN95_CLASSES;
	InitCommonControlsEx(&InitCtrls);

	CWinApp::InitInstance();

	if (!AfxSocketInit())
	{
		PUTLOG("IDP_SOCKETS_INIT_FAILED");
		return FALSE;
	}

	// Initialize OLE libraries
	if (!AfxOleInit())
	{
		PUTLOG("IDP_OLE_INIT_FAILED");
		return FALSE;
	}

	AfxEnableControlContainer();

	CCustIETools::UnlockConsole();

	if (!LoadConfiguration()) {
		PUTLOG("Failed to load json configuration");
		return FALSE;
	}

	do{
		/*
		* Initialize openssl
		*
		*/
		OpenSSL_add_all_algorithms();
		SSL_load_error_strings();
		ERR_load_crypto_strings();

		/**
		* Sample test for decryption of protected username/password
		* std::string text = CCustIETools::GetUnProtectedString("oTpTjQvEGG5OX5L99PjBmA==");
		*/

		/*
		* Enable debug Privilege
		*/
		EnableDebugPrivilege();

		/*
		* Initialize KeyInput lock
		*
		*/
		CCustIETools::InitKeyInputLock();

		/*
		* Init <Done> event of KeyInput
		*/
		CCustIETools::InitKeyInputNotify();

		/*
		* GDIPlus Init
		*/
		GdiplusStartupInput gdiplusStartupInput;
		GdiplusStartup(&m_gdiplusToken, &gdiplusStartupInput, NULL);

		#ifdef USE_CURL
		/*
		* Init Curl global
		*/
		curl_global_init(CURL_GLOBAL_DEFAULT);
		#endif

		/*
		* Disable script debugging
		* If you find any script error, change it to 'no' to debug. 
		*/
		CCustIETools::RegSetString(HKEY_CURRENT_USER
								, "Software\\Microsoft\\Internet Explorer\\Main"
								, "Disable Script Debugger"
								, ShowScriptError() ? "no" : "yes");

		/*
		* More Internet settings
		* // https://support.microsoft.com/en-us/kb/182569
		1406     Miscellaneous: Access data sources across domains
		1407     Scripting: Allow Programmatic clipboard access
		1408     Reserved #
		1409     Scripting: Enable XSS Filter
		1601     Miscellaneous: Submit non-encrypted form data
		1604     Downloads: Font download
		1605     Run Java #
		1606     Miscellaneous: Userdata persistence ^
		1607     Miscellaneous: Navigate sub-frames across different domains
		1608     Miscellaneous: Allow META REFRESH * ^
		1609     Miscellaneous: Display mixed content *
		*/
		/**
		* http://answers.microsoft.com/en-us/ie/forum/ie8-windows_other/disable-activex-prompt/2e4a208f-7abc-409a-809f-9ef5fab600d0?auth=1
		Select  "Enable" for the following actions:
		a.      "Allow previously unused ActiveX controls to run without prompt"
		>>1208
		b.     "Download signed ActiveX controls"
		>>1001
		c.      "Download unsigned ActiveX controls"
		>>1004
		d.     "Initialize and script ActiveX controls not marked as safe for scripting"
		>>1201
		e.     "Run ActiveX controls and plug-ins"
		>>1200
		f.       "Script ActiveX controls marked safefor scripting."
		>>1405
		7.      Select  "Disable" for the action "Automatic prompting for ActiveX controls."
		>>2201
		*/
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1001", 3);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1004", 3);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1200", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1201", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1206", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1208", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1209", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "120A", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "120B", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1405", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "2201", 3);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "270C", 3);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1407", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1607", 0);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3", "1609", 0);

		//zones 2: Trusted Sites
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2", "1001", 3);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2", "1004", 3);

		//State = 0x00023e00 - ¡®Check for publisher¡¯s certificate Revocation¡¯ Unchecked
		//State = 0x00023c00 - ¡®Check for publisher¡¯s certificate Revocation¡¯ Checked
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\WinTrust\\Trust Providers\\Software Publishing", "State", 0x00023e00);
		
		//CertificateRevocation = 0	   - ¡®Check for server certificate Revocation¡¯ Unchecked
		//CertificateRevocation = 1   - ¡®Check for server certificate Revocation¡¯ Checked
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "CertificateRevocation", 0);
		
		//disable warn: certificate address mismatch 
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "WarnonBadCertRecving", 0);
		
		// Add trust spdb website to ie.
		/*CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\P3P\\History\\spdb.com.cn", "", 1);
		CCustIETools::RegSetInt(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\P3P\\History\\spdbccc.com.cn", "", 1);*/

		SetIECoreVersion(TOUNICODE("LoginBot.exe"), 8000);
		
		/*
		* Disable MRU list
		*/
		LoadStdProfileSettings(0);

		/*
		* Detours
		*/
#ifdef USE_DETOURS
		DetourTransactionBegin();
		DetourUpdateThread(GetCurrentThread());
		/*
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetSetCookieExW, CCustIETools::CustIE_InternetSetCookieExW);
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetSetCookieW, CCustIETools::CustIE_InternetSetCookieW);
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetSetCookieExA, CCustIETools::CustIE_InternetSetCookieExA);
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetSetCookieA, CCustIETools::CustIE_InternetSetCookieA);
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetGetCookieExW, CCustIETools::CustIE_InternetGetCookieExW);
		DetourAttach(&(PVOID&)CCustIETools::Real_InternetGetCookieExA, CCustIETools::CustIE_InternetGetCookieExA);
		DetourAttach(&(PVOID&)CCustIETools::Real_MessageBoxW, CCustIETools::CustIE_MessageBoxW);
		DetourAttach(&(PVOID&)CCustIETools::Real_MessageBoxA, CCustIETools::CustIE_MessageBoxA);
		*/
		DetourAttach(&(PVOID&)CCustIETools::Real_SetWindowsHookExW, CCustIETools::CustIE_SetWindowsHookExW);
		DetourAttach(&(PVOID&)CCustIETools::Real_SetWindowsHookExA, CCustIETools::CustIE_SetWindowsHookExA);

		LONG error = DetourTransactionCommit();
#endif
		
		/*
		* Unit test
		*/


	}while(0);

	EnableTaskbarInteraction(FALSE);

	DWORD dwTimeout = -1;  
	SystemParametersInfo(SPI_GETFOREGROUNDLOCKTIMEOUT, 0, (LPVOID)&dwTimeout, 0);  
	//if (dwTimeout < 200000) {  // Lock for 2 minutes
	//	SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 200000, (LPVOID)0, SPIF_SENDCHANGE | SPIF_UPDATEINIFILE);  
	//}
  
	// Register the application's document templates.  Document templates
	//  serve as the connection between documents, frame windows and views
	CSingleDocTemplate* pDocTemplate;
	pDocTemplate = new CSingleDocTemplate(
		IDR_MAINFRAME,
		RUNTIME_CLASS(CCustIEDoc),
		RUNTIME_CLASS(CMainFrame),       // main SDI frame window
		RUNTIME_CLASS(CCustIEView));
	if (!pDocTemplate)
		return FALSE;
	AddDocTemplate(pDocTemplate);

	// Parse command line for standard shell commands, DDE, file open
	CCommandLineInfo cmdInfo;
	// Ignore MFC-style parameters.
	//ParseCommandLine(cmdInfo);

	if (GetCommandLineW() == NULL) {
		Json::Value voucherMap;
		voucherMap["errmsg"] = "Invalid command line";
		CCustIETools::StatusReport(m_userConfig, StatusCode(OPEN_FAILE), voucherMap.toStyledString());
		return FALSE;
	}

	int argc = 0;
	LPWSTR * argv = CommandLineToArgvW(GetCommandLineW(), &argc);
	if (!argc || !ParseArgs(argc, argv)) {
		LocalFree(argv);
		Json::Value voucherMap;
		voucherMap["errmsg"] = "Failed to parse arguments";
		CCustIETools::StatusReport(m_userConfig, StatusCode(OPEN_FAILE), voucherMap.toStyledString());
		return FALSE;
	}
	LocalFree(argv);

	SetUnhandledExceptionFilter(CCustIETools::ExceptionFilter);
	
	// Setup proxy
	if( true) {
		INTERNET_PROXY_INFO proxy;
		proxy.dwAccessType = INTERNET_OPEN_TYPE_PROXY;
		std::string sProxyString = GetProxyString();
		proxy.lpszProxy = (LPCTSTR)sProxyString.c_str();
		proxy.lpszProxyBypass = NULL;  
		HRESULT hr = ::UrlMkSetSessionOption(INTERNET_OPTION_PROXY,&proxy,sizeof(proxy),0);
		InternetSetOption(NULL, INTERNET_OPTION_REFRESH , NULL, 0);
	}

	// Initialize file log
	std::string sBankId;
	std::string sTaskKey;
	if (m_userConfig.isObject() && m_userConfig.isMember("type")){
		sBankId = m_userConfig["type"].asString();
		if(sBankId ==ORG_CIB )
		{
			char UserAgentVal[] = "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko";
			UrlMkSetSessionOption(URLMON_OPTION_USERAGENT, UserAgentVal, (strlen(UserAgentVal) + 1), 0);
		}
	}
	if (m_userConfig.isObject() && m_userConfig.isMember("taskkey")){
		sTaskKey = m_userConfig["taskkey"].asString();
		std::string::size_type xpos = (sTaskKey.find("TASK:"));
		if (xpos != std::string::npos){
			sTaskKey.erase(xpos, 5);
		}
	}
	if (!sBankId.empty() && !sTaskKey.empty()){
		CCustIETools::OpenFileLog(sBankId, sTaskKey);
	}

    while(!CCustIETools::GetKeyInputLock())
    {
        auto id = GetCurrentProcessId();
        PUTLOG("%ld ----------------wait for create", id);
        Sleep(100);
        continue;
    }
	// Dispatch commands specified on the command line.  Will return FALSE if
	// app was launched with /RegServer, /Register, /Unregserver or /Unregister.
	if (!ProcessShellCommand(cmdInfo)){
		Json::Value voucherMap;
		voucherMap["errmsg"] = "Failed to ProcessShellCommand";
		CCustIETools::ReleaseKeyInputLock();
		CCustIETools::StatusReport(m_userConfig, StatusCode(OPEN_FAILE), voucherMap.toStyledString());
		return FALSE;
	}

	if (CCustIETools::IsDesktopLocked()){
		Json::Value voucherMap;
		voucherMap["errmsg"] = "Failed as console desktop is locked!";
		CCustIETools::StatusReport(m_userConfig, StatusCode(OPEN_FAILE), voucherMap.toStyledString());
		CCustIETools::ReleaseKeyInputLock();
		return FALSE;
	}

	// The one and only window has been initialized, so show and update it
	m_pMainWnd->ShowWindow(SW_MINIMIZE);
	m_pMainWnd->UpdateWindow();

	if (FALSE){
		m_pMainWnd->SetWindowPos(NULL, 0, 0, 0, 0, SWP_NOSIZE|SWP_NOACTIVATE|SWP_NOZORDER);
	}
	for (UINT i = 0; i < m_userConfig["pass"].asString().size(); i++)
	{
		int c = m_userConfig["pass"].asString().at(i);
		if (c > 255 || !::isprint(c))
		{
			Json::Value voucherMap;
			voucherMap["errmsg"] = "chinese password error";
			CCustIETools::StatusReport(theApp.m_userConfig, StatusCode(LOG_FAILE_USERNAME_PWD_ERR), voucherMap.toStyledString());
		}
	}
    CCustIETools::ReleaseKeyInputLock();
	Json::Value voucherMap;
	voucherMap["errmsg"] = "InitInstance OK";
	CCustIETools::StatusReport(m_userConfig, StatusCode(OPEN_SUCCESS), voucherMap.toStyledString());
	return TRUE;
}

int CCustIEApp::ExitInstance()
{
	// Unload Openssl
	ERR_free_strings();
	CRYPTO_cleanup_all_ex_data();
	EVP_cleanup();

	//TODO: handle additional resources you may have added
	AfxOleTerm(FALSE);

	if (m_pCustDisp) {
		delete m_pCustDisp;
		m_pCustDisp = NULL;
	}

#ifdef USE_CURL
	curl_global_cleanup();
#endif

#ifdef USE_DETOURS
	/* Detours helper */
	{
		DetourTransactionBegin();
		DetourUpdateThread(GetCurrentThread());
		/*
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetSetCookieExW, CCustIETools::CustIE_InternetSetCookieExW);
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetSetCookieW, CCustIETools::CustIE_InternetSetCookieW);
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetSetCookieExA, CCustIETools::CustIE_InternetSetCookieExA);
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetSetCookieA, CCustIETools::CustIE_InternetSetCookieA);
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetGetCookieExW, CCustIETools::CustIE_InternetGetCookieExW);
		DetourDetach(&(PVOID&)CCustIETools::Real_InternetGetCookieExA, CCustIETools::CustIE_InternetGetCookieExA);
		DetourDetach(&(PVOID&)CCustIETools::Real_MessageBoxW, CCustIETools::CustIE_MessageBoxW);
		DetourDetach(&(PVOID&)CCustIETools::Real_MessageBoxA, CCustIETools::CustIE_MessageBoxA);
		*/
		DetourDetach(&(PVOID&)CCustIETools::Real_SetWindowsHookExW, CCustIETools::CustIE_SetWindowsHookExW);
		DetourDetach(&(PVOID&)CCustIETools::Real_SetWindowsHookExA, CCustIETools::CustIE_SetWindowsHookExA);

		DetourTransactionCommit();
	}
#endif

	CCustIETools::DeinitKeyInputNotify();
	
	CCustIETools::DeinitKeyInputLock();

	GdiplusShutdown(m_gdiplusToken);

	CCustIETools::CloseFileLog();

	return CWinApp::ExitInstance();
}

// CCustIEApp message handlers


// CAboutDlg dialog used for App About

class CAboutDlg : public CDialogEx
{
public:
	CAboutDlg();

// Dialog Data
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_ABOUTBOX };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

// Implementation
protected:
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialogEx(IDD_ABOUTBOX)
{
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialogEx)
END_MESSAGE_MAP()

// App command to run the dialog
void CCustIEApp::OnAppAbout()
{
	CAboutDlg aboutDlg;
	aboutDlg.DoModal();
}

// CCustIEApp message handlers

IDispatch * CCustIEApp::GetExternalDispatch()
{
	if (!m_pCustDisp) {
		m_pCustDisp = new CImpIDispatch();
	}
	m_pCustDisp->AddRef();
	return m_pCustDisp;
}

BOOL CCustIEApp::EnableDebugPrivilege(/*LPCWSTR szPrivName*/)
{
	HANDLE _hToken = INVALID_HANDLE_VALUE;
	if (!OpenProcessToken(GetCurrentProcess(),
		TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY,
		&_hToken))
	{
		return FALSE;
	}
	if (_hToken == INVALID_HANDLE_VALUE)
	{
		return FALSE;
	}
	TOKEN_PRIVILEGES tp = { 0 };
	LUID luid = { 0 };
	TOKEN_PRIVILEGES tpPrevious = { 0 };
	DWORD cbPrevious = sizeof(TOKEN_PRIVILEGES);
	if (!LookupPrivilegeValueW(NULL, L"SeDebugPrivilege", &luid))
	{
		return FALSE;
	}
	//
	// first pass.  get current privilege setting
	//
	tp.PrivilegeCount = 1;
	tp.Privileges[0].Luid = luid;
	tp.Privileges[0].Attributes = 0;
	if (!AdjustTokenPrivileges(_hToken,
		FALSE,
		&tp,
		sizeof(TOKEN_PRIVILEGES),
		&tpPrevious,
		&cbPrevious))
	{
		return FALSE;
	}
	//
	// second pass.  set privilege based on previous setting
	//
	tpPrevious.PrivilegeCount = 1;
	tpPrevious.Privileges[0].Luid = luid;
	tpPrevious.Privileges[0].Attributes |= (SE_PRIVILEGE_ENABLED);
	if (!AdjustTokenPrivileges(_hToken,
		FALSE,
		&tpPrevious,
		cbPrevious,
		NULL,
		NULL))
	{
		return FALSE;
	}
	if (_hToken != INVALID_HANDLE_VALUE)
	{
		CloseHandle(_hToken); _hToken = INVALID_HANDLE_VALUE;
	}
	return TRUE;
}

#pragma warning(disable:4996)
bool CCustIEApp::ParseArgs(int argc, LPWSTR * argv)
{
	m_userConfig["countocr"] = 1;// set default value of count ocr

	for (int i = 0; i < argc; i++) {
		//PUTLOG("[%d]: [%s]\n", i, TOANSI(argv[i]));
		std::string optarg = TOANSI(argv[i]);

		if (!stricmp(optarg.c_str(), "-u") || !stricmp(optarg.c_str(), "--user")) {
			if (i + 1 <= argc) {
				auto u = CCustIETools::ToAnsiString(CCustIETools::utf8ToUnicodeString(CCustIETools::GetUnProtectedString( TOANSI(argv[i + 1]), GetKey())));
				m_userConfig["user"] = u;
				PUTLOG("c++ user length: %d",u.size());
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-p") || !stricmp(optarg.c_str(), "--pass")) {
			if (i + 1 <= argc) {
				m_userConfig["pass"] = CCustIETools::GetUnProtectedString(TOANSI(argv[i + 1]), GetKey());
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-t") || !stricmp(optarg.c_str(), "--type")) {
			if (i + 1 <= argc) {
				m_userConfig["type"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-s") || !stricmp(optarg.c_str(), "--subtype")) {
			if (i + 1 <= argc) {
				m_userConfig["subtype"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-l") || !stricmp(optarg.c_str(), "--logintype")) {
			if (i + 1 <= argc) {
				m_userConfig["logintype"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-r") || !stricmp(optarg.c_str(), "--reqid")) {
			if (i + 1 <= argc) {
				m_userConfig["reqid"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-k") || !stricmp(optarg.c_str(), "--taskkey")) {
			if (i + 1 <= argc) {
				m_userConfig["taskkey"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-h") || !stricmp(optarg.c_str(), "--host")) {
			if (i + 1 <= argc) {
				m_userConfig["host"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-o") || !stricmp(optarg.c_str(), "--ocrpath")) {// ocrpath == 1: not need send ocr image to NetWorkOcrWrapper. ocrpath == 0: need send ocr image to NetWorkOcrWrapper. ocrpath == 2: after get 4016, ocr will be send to front and bring the errmsg = "".
			if (i + 1 <= argc) {
				m_userConfig["ocrpath"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}

		if (!stricmp(optarg.c_str(), "-c") || !stricmp(optarg.c_str(), "--countocr")) {// modeocr == 1: use zhima as auto captcha service. modeocr == 0: use dama2 as auto captcha service.
			if (i + 1 <= argc) {
				m_userConfig["countocr"] = TOANSI(argv[i + 1]);
			}
			else {
				PUTLOG("Invalid arguments!");
				return false;
			}
		}
	}

	return true;
}

bool CCustIEApp::LoadConfiguration()
{
	do {
		std::string strConfPath = CCustIETools::GetConfigPath();
		strConfPath += "\\";
		strConfPath += "loginbot.json";

		std::ifstream ifs(strConfPath);
		std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
		int z = str.length();
		//PUTLOG("Load configuration from file[%s], length[%d]", strConfPath.c_str(), z);
		Json::Reader reader;
		if (!reader.parse(str, m_sysConfig)){
			PUTLOG("* Failed to load system configuration");
			return false;
		}
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		char szKey [MAX_PATH] = "";
		GetPrivateProfileStringA("default", "key", "", szKey, sizeof(szKey), sAppPath.c_str());
		m_sKey = szKey;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		char szKey [MAX_PATH] = "";
		GetPrivateProfileStringA("default", "KeyInput", "KeyInput.exe", szKey, sizeof(szKey), sAppPath.c_str());
		m_sKeyInputName = szKey;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "MinimizeWindow", 0, sAppPath.c_str());
		m_fMinimizeWindow = (configInt == 1);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "EnableWindow", 0, sAppPath.c_str());
		m_fEnableWindow = (configInt == 1);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "KeyInputWait", 2000, sAppPath.c_str());
		m_nKeyInputWait = configInt;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "ShowScriptError", 0, sAppPath.c_str());
		m_fShowScriptError = (configInt == 1);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "SuspendFlag", 0, sAppPath.c_str());
		m_fSuspendFlag = (configInt == 1);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "TimeOut", DEFAULT_TIMEOUT_SECONDS, sAppPath.c_str());
		m_nTimeOut = (configInt);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "ReportTimeOut", DEFAULT_REPORT_TIMEOUT, sAppPath.c_str());
		m_nReportTimeout = (configInt);
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		char sSavePath [MAX_PATH] = "";
		GetPrivateProfileStringA("default", "HTMLandScreenShotPath", DEFAULT_HTMLandScreenShotPath, sSavePath, sizeof(sSavePath), sAppPath.c_str());
		m_sHTMLandScreenShotPath = sSavePath;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		char sProxyString [MAX_PATH] = "";
		GetPrivateProfileStringA("default", "Proxy", "", sProxyString, sizeof(sProxyString), sAppPath.c_str());
		m_sProxyString = sProxyString;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		char sLogDir [MAX_PATH] = "";
		GetPrivateProfileStringA("default", "LogDir", "", sLogDir, sizeof(sLogDir), sAppPath.c_str());
		m_sLogDir = sLogDir;
	}while(0);

	do{
		std::string sAppPath = CCustIETools::GetAppPath();
		sAppPath += "LoginBot.ini";
		int configInt = GetPrivateProfileIntA("default", "Dama2ListenPort", 3339, sAppPath.c_str());
		m_nDama2ListenPort = configInt;
	}while(0);

	return true;
}

std::string CCustIEApp::GetUrlSetting(const std::string & bankid, const std::string & type, const std::string & subType)
{
	std::string sUrl;
	if (!m_sysConfig.isObject()){
		PUTLOG("* System configuration is empty");
		return sUrl;
	}
	if (!m_sysConfig.isMember(bankid)){
		PUTLOG("* No entry for [%s] in system configuration", bankid.c_str());
		return sUrl;
	}
	Json::Value jsonBank = m_sysConfig[bankid];
	if (!jsonBank.isObject()){
		PUTLOG("* bank entry is invalid");
		return sUrl;
	}
	if (!jsonBank.isMember(type)){
		PUTLOG("* No entry for type[%s] for bank[%s]", type.c_str(), bankid.c_str());
		return sUrl;
	}
	Json::Value jsonType = jsonBank[type];
	if (!jsonType.isObject()){
		PUTLOG("* Type is invalid");
		return sUrl;
	}
	if (!jsonType.isMember(subType)){
		PUTLOG("* No subtype [%s] in %s.%s, try to use [default]", subType.c_str(), bankid.c_str(), type.c_str());
		if (jsonType.isMember("default")){
			PUTLOG("* use default entry");
			sUrl = jsonType["default"].asString();
		}else{
			PUTLOG("* Failed to get config");
		}
	}else{
		sUrl = jsonType[subType].asString();
	}
	
	PUTLOG("* Get url:[%s]", sUrl.c_str());
	return sUrl;
}

bool CCustIEApp::IsLoginUrl(const std::string & bankid, const std::string & url)
{
	return false;
}

bool CCustIEApp::IsPhoneUrl(const std::string & bankid, const std::string & url)
{
	return false;
}

bool CCustIEApp::IsErrorUrl(const std::string & bankid, const std::string & url)
{
	return false;
}

bool CCustIEApp::IsMainUrl(const std::string & bankid, const std::string & url)
{
	return false;
}

void CCustIEApp::AddToRecentFileList(LPCTSTR lpszPathName)
{
	//CWinApp::AddToRecentFileList(lpszPathName);
}


void CCustIEApp::OnUpdateFileMruFile1(CCmdUI *pCmdUI)
{
	pCmdUI->Enable(FALSE);
}

std::string CCustIEApp::GetKey() const{
	return m_sKey;
}

bool CCustIEApp::ShowScriptError() const{
	return m_fShowScriptError;
}

unsigned int CCustIEApp::GetDefaultTimeout() const{
	return m_nTimeOut;
}

unsigned int CCustIEApp::ReportTimeout() const{
	return m_nReportTimeout;
}

bool CCustIEApp::MinimizeWindow() const{
	return m_fMinimizeWindow;
}

bool CCustIEApp::EnableWindow() const{
	return m_fEnableWindow;
}

unsigned int CCustIEApp::GetKeyInputWait() const{
	return m_nKeyInputWait;
}

unsigned int CCustIEApp::GetDama2ListenPort() const{
	return m_nDama2ListenPort;
}

std::string CCustIEApp::GetKeyInputName() const{
	return m_sKeyInputName;
}

std::string CCustIEApp::GetHTMLandScreenShotPath() const{
	return m_sHTMLandScreenShotPath;
}

bool CCustIEApp::SuspendFlag() const{
	return m_fSuspendFlag;
}

std::string CCustIEApp::GetBankId() const{
	std::string sBankId;
	if (m_userConfig.isObject() && m_userConfig.isMember("type")){
		sBankId = m_userConfig["type"].asString();
	}
	return sBankId;
}

std::string CCustIEApp::GetTaskKey() const{
	std::string sTaskKey;
	if (m_userConfig.isObject() && m_userConfig.isMember("taskkey")){
		sTaskKey = m_userConfig["taskkey"].asString();
		std::string::size_type xpos = (sTaskKey.find("TASK:"));
		if (xpos != std::string::npos){
			sTaskKey.erase(xpos, 5);
		}
	}
	return sTaskKey;
}

std::string CCustIEApp::GetProxyString() const
{
	return m_sProxyString;
}

std::string CCustIEApp::GetLogDir() const
{
	if (m_sLogDir.empty()){
		char szLogDir  [512] = "";
		SHGetSpecialFolderPathA(GetActiveWindow(), szLogDir, CSIDL_APPDATA, TRUE);
		return szLogDir;
	}

	std::string sLogDir = m_sLogDir;

	if (m_sLogDir.at(m_sLogDir.length() - 1) == '\\'){
		sLogDir = m_sLogDir.substr(0, m_sLogDir.length() - 1);
	}

	SYSTEMTIME today;
	GetLocalTime(&today);
	char szStamp[100] = "";
	sprintf(szStamp, "-%04hu%02hu%02hu", today.wYear, today.wMonth, today.wDay);

	sLogDir += szStamp;

	return sLogDir;
}