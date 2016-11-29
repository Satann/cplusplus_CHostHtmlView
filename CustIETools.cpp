#include "stdafx.h"
#include "CustIETools.h"
#include "MainFrm.h"
#include "CustIE.h"

// bcm hook header
#include "bcmhook\myhook.h"
#include "bcmhook\dllload.h"
#include "BinaryCode.h"
#include "CustIEView.h"

#include "SendInput\SimulateInputString.h"

#include <tcpmib.h>
#include <Iprtrmib.h>
#include <IPHlpApi.h>

#include <direct.h>  
#include <io.h>  
#include <imagehlp.h>
#define ACCESS _access  
#define MKDIR(a) _mkdir((a))  

HANDLE CCustIETools::m_hKeyInputLock = INVALID_HANDLE_VALUE;

HANDLE CCustIETools::m_hEvtKeyInputDone = INVALID_HANDLE_VALUE;

FILE * CCustIETools::m_logfd = NULL;

std::string CCustIETools::m_sOcrFrom = "";
std::string CCustIETools::m_sOcrCount = "1";

#ifdef USE_DETOURS
DWORD (__stdcall * CCustIETools::Real_InternetSetCookieExW)(LPCWSTR , LPCWSTR , LPCWSTR , DWORD , DWORD_PTR ) = InternetSetCookieExW;
BOOL  (__stdcall * CCustIETools::Real_InternetSetCookieW)(LPCWSTR , LPCWSTR , LPCWSTR  ) = InternetSetCookieW;
DWORD (__stdcall * CCustIETools::Real_InternetSetCookieExA)(LPCSTR , LPCSTR , LPCSTR , DWORD , DWORD_PTR ) = InternetSetCookieExA;
BOOL  (__stdcall * CCustIETools::Real_InternetSetCookieA)(LPCSTR , LPCSTR , LPCSTR  ) = InternetSetCookieA;
BOOL  (__stdcall * CCustIETools::Real_InternetGetCookieExW)(LPCWSTR , LPCWSTR , LPWSTR , LPDWORD ,  DWORD ,  LPVOID  ) = InternetGetCookieExW;
BOOL  (__stdcall * CCustIETools::Real_InternetGetCookieExA)(LPCSTR , LPCSTR , LPSTR , LPDWORD ,  DWORD ,  LPVOID  )= InternetGetCookieExA;
BOOL  (__stdcall * CCustIETools::Real_MessageBoxW)(HWND ,  LPCWSTR ,  LPCWSTR ,  UINT    )= MessageBoxW;
BOOL  (__stdcall * CCustIETools::Real_MessageBoxA)(HWND ,  LPCSTR ,   LPCSTR ,   UINT    )= MessageBoxA;
HHOOK   (__stdcall * CCustIETools::Real_SetWindowsHookExW)(   int idHook, HOOKPROC  lpfn, HINSTANCE hMod, DWORD dwThreadId ) = SetWindowsHookExW;
HHOOK   (__stdcall * CCustIETools::Real_SetWindowsHookExA)(   int idHook, HOOKPROC  lpfn, HINSTANCE hMod, DWORD dwThreadId )   = SetWindowsHookExA;
#endif

CCustIETools::CCustIETools()
{
}


CCustIETools::~CCustIETools()
{
}

std::string CCustIETools::ToAnsiString(const std::wstring & wstr)
{
	std::string strResult;
	int expectedBufferLength = WideCharToMultiByte(CP_ACP, 0, wstr.c_str(), -1, NULL, 0, NULL, NULL);
	if (expectedBufferLength > 0) {
		char * pszBuffer = (char *)malloc(expectedBufferLength);
		if (pszBuffer) {
			WideCharToMultiByte(CP_ACP, 0, wstr.c_str(), -1, pszBuffer, expectedBufferLength, NULL, NULL);
			pszBuffer[expectedBufferLength-1] = '\0';
			strResult = pszBuffer;
			free(pszBuffer);
			pszBuffer = NULL;
		}
	}
	else
	{
		PUTLOG("cant to ansi string,code:%d",GetLastError());
	}
	return strResult;
}

std::string CCustIETools::ToUtf8String(const std::wstring & wstr)
{
	std::string strResult;
	int expectedBufferLength = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, NULL, 0, NULL, NULL);
	if (expectedBufferLength > 0) {
		char * pszBuffer = (char *)malloc(expectedBufferLength);
		if (pszBuffer) {
			WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, pszBuffer, expectedBufferLength, NULL, NULL);
			pszBuffer[expectedBufferLength-1] = '\0';
			strResult = pszBuffer;
			free(pszBuffer);
			pszBuffer = NULL;
		}
	}
	return strResult;
}

std::wstring CCustIETools::ToUnicodeString(const std::string & str)
{
	std::wstring wstrResult;
	int expectedBufferLength = MultiByteToWideChar(CP_ACP, 0, str.c_str(), -1, NULL, 0);
	if (expectedBufferLength) {
		wchar_t * pwszBuffer = (wchar_t *)malloc(sizeof(wchar_t) * expectedBufferLength);
		if (pwszBuffer) {
			MultiByteToWideChar(CP_ACP, 0, str.c_str(), -1, pwszBuffer, expectedBufferLength);
			pwszBuffer[expectedBufferLength-1] = L'\0';
			wstrResult = pwszBuffer;
			free(pwszBuffer);
			pwszBuffer = NULL;
		}
	}
	return wstrResult;
}

std::wstring CCustIETools::utf8ToUnicodeString(const std::string & str)
{
	std::wstring wstrResult;
	int expectedBufferLength = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, NULL, 0);
	if (expectedBufferLength) {
		wchar_t * pwszBuffer = (wchar_t *)malloc(sizeof(wchar_t) * expectedBufferLength);
		if (pwszBuffer) {
			MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, pwszBuffer, expectedBufferLength);
			pwszBuffer[expectedBufferLength-1] = L'\0';
			wstrResult = pwszBuffer;
			free(pwszBuffer);
			pwszBuffer = NULL;
		}
	}
	return wstrResult;
}
std::string CCustIETools::ToHexString(const unsigned char * buff, size_t len)
{
	static const unsigned char HEXTABLE [] = "0123456789abcdef";
	std::string strRet = "";
	for (size_t i = 0; i < len ; i ++){
		unsigned char ch = buff[i];
		strRet += HEXTABLE[((ch & 0xf0) >> 4)];
		strRet += HEXTABLE[((ch & 0x0f))];
	}
	return strRet;
}

#pragma warning(disable:4996)
char * CCustIETools::StrDup(const char * src)
{
	size_t slen = strlen(src);
	char * temp = (char *)malloc(slen + 1);
	strcpy(temp, src);
	temp[slen] = '\0';
	return temp;
}

std::string CCustIETools::GetAppPath()
{
	char szBuffer[256] = "";
	GetModuleFileNameA(NULL, szBuffer, sizeof(szBuffer) / sizeof(szBuffer[0]));
	strrchr(szBuffer, '\\')[1] = '\0';
	return szBuffer;
}

std::string CCustIETools::GetConfigPath()
{
	return GetAppPath() + "config\\";
}

std::string CCustIETools::GetHookPath()
{
    return GetAppPath() + "hook\\";
}

std::string CCustIETools::GetScriptPath()
{
	return GetAppPath() + "script\\";
}

#pragma warning(disable:4996)
void CCustIETools::PutLog(const char * format, ...)
{
	char szBuffer[1024] = "";
	va_list ap;
	va_start(ap, format);
	vsnprintf(szBuffer, sizeof(szBuffer) / sizeof(szBuffer[0]) - 1, format, ap);
	szBuffer [sizeof(szBuffer) - 1] = '\0';
	va_end(ap);
	OutputDebugStringA(szBuffer);
	// For log trace
	// Start a client on production: DbgView /a /t /g /s /e
	// Connect local DbgView to remote production.

	if (m_logfd != NULL){
		SYSTEMTIME now;
		GetLocalTime(&now);
		fprintf(m_logfd, "BotID[%06d]-[%04d%02d%02d.%02d%02d%02d.%03d]: %s\r\n"
			, GetCurrentProcessId()
			, now.wYear, now.wMonth, now.wDay, now.wHour, now.wMinute, now.wSecond, now.wMilliseconds
			, szBuffer);
		fflush(m_logfd);
	}
}

bool CCustIETools::CallScript(CComPtr<IDispatch> & pHtmlDocDisp, const std::string & strFunc, const std::vector<std::string> & paramArray, std::string & result)
{
	CComPtr<IHTMLDocument2> pHtmlDoc;
	pHtmlDocDisp->QueryInterface(IID_IHTMLDocument2, (void **)&pHtmlDoc);

	CComPtr<IDispatch> spScript;
	pHtmlDoc->get_Script(&spScript);
	if (!spScript)
	{
		return false;
	}

	//Find dispid for given function in the object
	CComBSTR bstrMember(TOUNICODE(strFunc));
	DISPID dispid = NULL;
	HRESULT hr = spScript->GetIDsOfNames(IID_NULL, &bstrMember, 1,LOCALE_SYSTEM_DEFAULT, &dispid);
	if (FAILED(hr))
	{
		return false;
	}

	const int arraySize = paramArray.size();

	//Putting parameters  
	DISPPARAMS dispparams;
	memset(&dispparams, 0, sizeof(dispparams));

	dispparams.cArgs = arraySize;
	dispparams.rgvarg = new VARIANT[dispparams.cArgs];
	dispparams.cNamedArgs = 0;

	for (int i = 0; i < arraySize; i++)
	{
		CComBSTR bstr = TOUNICODE(paramArray[(arraySize - 1 - i)]); // back reading
		bstr.CopyTo(&dispparams.rgvarg[i].bstrVal);
		dispparams.rgvarg[i].vt = VT_BSTR;
	}

	EXCEPINFO excepInfo;
	memset(&excepInfo, 0, sizeof excepInfo);

	UINT nArgErr = (UINT)-1;  // initialize to invalid arg
	CComVariant vaResult;
	//Call JavaScript function         
	hr = spScript->Invoke(dispid
		, IID_NULL
		, 0
		, DISPATCH_METHOD
		, &dispparams
		, &vaResult
		, &excepInfo
		, &nArgErr);

	delete[] dispparams.rgvarg;

	if (FAILED(hr))
	{
		return false;
	}
	else {
		if (vaResult.vt == VT_BSTR) {
			result = TOANSI(vaResult.bstrVal);
		}
	}
	return true;
}

bool CCustIETools::EvalScript(CComPtr<IHTMLDocument2> & spHtmlDoc, const std::string & code)
{
	CComVariant vaResult;

	CComPtr<IHTMLWindow2> spWindow;
	spHtmlDoc->get_parentWindow(&spWindow);
	if (!spWindow) {
		return false;
	}

	CComBSTR bstrCode = TOUNICODE(code);
	CComBSTR bstrLang = L"JavaScript";
	HRESULT hResult = spWindow->execScript(bstrCode, bstrLang, &vaResult);

	if (FAILED(hResult)) {
		_com_error errmsg(hResult);
		PUTLOG("ExecScript Failed! [%s]", TOANSI((LPCWSTR)errmsg.ErrorMessage()));
		return false;
	}
	else {
		//PUTLOG("ExecScript OK!");
	}
	
	return true;
}

bool CCustIETools::LoadScript(CComPtr<IDispatch> & pHtmlDocDisp, const std::string & script, bool recursive)
{
	CComPtr<IHTMLDocument2> spHtmlDoc;
	pHtmlDocDisp->QueryInterface(IID_IHTMLDocument2, (void**)&spHtmlDoc);
	if (spHtmlDoc) {
		if (recursive)
			return EvalScriptEx(spHtmlDoc, script);
		else
			return EvalScript(spHtmlDoc, script);
	}
	return false;
}

std::string CCustIETools::LastErrMsg(unsigned int dwError)
{
	LPSTR lpBuffer = NULL;
	if (FormatMessageA(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM,
		NULL, dwError,
		MAKELANGID(LANG_NEUTRAL, SUBLANG_SYS_DEFAULT),
		(LPSTR)&lpBuffer, 0, NULL))
	{
		std::string strErrMsg = lpBuffer;
		LocalFree(lpBuffer);
		return strErrMsg;
	}
	return "";
}

#ifdef _MSC_VER
#pragma warning(disable:4996)
#endif
bool CCustIETools::Fork(const std::string & application, const std::vector<std::string> & strParams, bool waitForChild, unsigned int * pRetCode)
{
	std::string cmdline = "\"";
	cmdline += application;
	cmdline += "\"";

	for (unsigned int i = 0; i < strParams.size(); ++i) {
		cmdline += " \"";
		cmdline += strParams[(i)];
		cmdline += "\"";
	}

	char * sCmdLine = CCustIETools::StrDup(cmdline.c_str());

	PROCESS_INFORMATION pi;
	memset(&pi, 0, sizeof(pi));
	STARTUPINFOA si;
	memset(&si, 0, sizeof(si));
	si.cb = sizeof(si);

	DWORD dwCreateFlags = CREATE_NO_WINDOW;

	if (CreateProcessA(NULL, sCmdLine, NULL, NULL, FALSE, dwCreateFlags, NULL, NULL, &si, &pi)) {
		if (waitForChild) {
			WaitForSingleObject(pi.hProcess, INFINITE);
			DWORD dwRetCode;
			GetExitCodeProcess(pi.hProcess, &dwRetCode);
			*pRetCode = dwRetCode;
		}

		CloseHandle(pi.hThread);
		CloseHandle(pi.hProcess);
		free(sCmdLine);
		return true;
	}else{
		int nCode = GetLastError();
		PUTLOG("Failed to fork: %d", nCode);
	}

	free(sCmdLine);
	return false;
}

DWORD __stdcall CCustIETools::ThreadFormFill(void * param)
{
	if (theApp.SuspendFlag()){
		SuspendProcByName("LoginBot.exe", true);
	}

	// Wait for GUI to focus on;
	::Sleep(theApp.GetKeyInputWait()); 

	// Parse thread parameters
	struct FormFillParam_t  * pFormFillParam = (struct FormFillParam_t *)param;
	unsigned int nInputInterval = pFormFillParam->nInputInterval;
	char * sValue = pFormFillParam->sValue;
	bool fWait = pFormFillParam->fWait ? true : false;
	free(pFormFillParam); pFormFillParam = NULL;
	// Prepare parameters
	char szBuffer[256] = "";
	std::vector<std::string> vecStrParams;
	vecStrParams.push_back("-w");
	vecStrParams.push_back(itoa(nInputInterval, szBuffer, 10));
	vecStrParams.push_back(sValue);
	free(sValue); sValue = NULL;
	// Fork child process
	unsigned int retCode = 0;
	Fork(GetAppPath() + theApp.GetKeyInputName(), vecStrParams, fWait, &retCode);

	if (theApp.SuspendFlag()){
		SuspendProcByName("LoginBot.exe", false);
	}

	// Release lock
	((CMainFrame *)(AfxGetApp()->m_pMainWnd))->PostMessage(WM_USER_INPUT_DONE);

	return 0;
}

bool CCustIETools::KeyInput(unsigned int nInputInterval, const std::string & sValue, bool fWait)
{
	DWORD dwThreadId = 0;
	struct FormFillParam_t * pFormFillParam = (struct FormFillParam_t *)malloc(sizeof(FormFillParam_t));
	memset(pFormFillParam, 0, sizeof(struct FormFillParam_t));
	pFormFillParam->nInputInterval = nInputInterval;
	pFormFillParam->sValue = CCustIETools::StrDup(sValue.c_str());
	pFormFillParam->fWait = fWait;
	HANDLE hInputThread = CreateThread(NULL, 0, ThreadFormFill, pFormFillParam, 0, &dwThreadId);
	return true;
}

bool CCustIETools::IsKeyInputDone()
{
	if (WaitForSingleObject(m_hEvtKeyInputDone, 0) != WAIT_TIMEOUT){
		return true;
	}
	return false;
}

bool CCustIETools::ReleaseKeyInputLock()
{
	if (!needLock()){
		return false;
	}
	ReleaseMutex(m_hKeyInputLock);
	return true;
}

bool CCustIETools::SetKeyInputDone()
{
	return SetEvent(m_hEvtKeyInputDone) ? true : false;
}

///////////////////////////////////////////////////////////////////////////////
bool CCustIETools::GetKeyInputLock()
{
	if (!needLock()){
		return true;
	}
	if (WaitForSingleObject(m_hKeyInputLock, 0) != WAIT_TIMEOUT) {
		PUTLOG("* GetKeyInputLock, TID: %u", GetCurrentThreadId());
		return true;
	}
	return false;
}

bool CCustIETools::ActiveWindow(/*bool fFocus*/)
{
	std::string sBankId = theApp.m_userConfig["type"].asString();
	if(!needLock())
		return true;
	PUTLOG("* Active window");
	HWND  hForeWnd =  GetForegroundWindow(); 
	DWORD dwForeThID =  GetWindowThreadProcessId( hForeWnd, NULL ); 

	HWND hWnd= AfxGetMainWnd()->GetSafeHwnd(); 
	DWORD dwCurThID  =  GetCurrentThreadId(); 

	if (theApp.EnableWindow()){
		EnableWindow(hWnd, TRUE);
	}
	if (dwCurThID != dwForeThID){
		if (!AttachThreadInput(dwCurThID, dwForeThID, TRUE/*fFocus*/)){
			PUTLOG("Failed to attach thread input");
		}else{
			PUTLOG("* OK to attach thread input");
		}
	}
	// May Fail, as "https://msdn.microsoft.com/en-us/subscriptions/wzcddbek%28v=vs.84%29.aspx"
	//  An example is a Command Prompt window that is hosted by the Console Window Host process.
	// More: http://www.howtogeek.com/howto/4996/what-is-conhost.exe-and-why-is-it-running/
	if (SetForegroundWindow(hWnd)){
		AttachThreadInput(dwCurThID, dwForeThID, FALSE);
		LockSetForegroundWindow(LSFW_LOCK);
		ShowWindow( hWnd, SW_NORMAL ); 
		if (TRUE){
			SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE/*|SWP_NOMOVE*/);
		}
	}
	// And how to fix:
	// mouse_event(...)
	else{
		::ShowWindow(hWnd, SW_NORMAL);
		::SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE/*|SWP_NOMOVE*/);
		ActiveWindowByMouseEvent(hWnd);
	}
	return true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
CComPtr<IHTMLDocument2> CCustIETools::GetHtmlDocFromIFrameWindow(CComPtr<IHTMLWindow2> spWindow)
{
	if (!spWindow) {
		return CComPtr<IHTMLDocument2>();
	}

	CComPtr<IHTMLDocument2> spDocument;
	HRESULT hRes = spWindow->get_document(&spDocument);
	if ((S_OK == hRes) && (spDocument != NULL))
	{
		return spDocument;
	}

	// hRes could be E_ACCESSDENIED that means a security restriction that
	// prevents scripting across frames that loads documents from different internet domains.
	CComQIPtr<IServiceProvider>  spServiceProvider = spWindow;
	if (spServiceProvider == NULL)
	{
		return CComPtr<IHTMLDocument2>();
	}

	CComPtr<IWebBrowser2> spWebBrws;
	hRes = spServiceProvider->QueryService(IID_IWebBrowserApp, IID_IWebBrowser2, (void**)&spWebBrws);
	if (hRes != S_OK)
	{
		return CComPtr<IHTMLDocument2>();
	}

	CComPtr<IWebBrowser2> spBrws = spWebBrws;
	if (spBrws == NULL)
	{
		return CComPtr<IHTMLDocument2>();
	}

	// Get the document object from the IWebBrowser2 object.
	CComPtr<IDispatch> spDisp;
	hRes = spBrws->get_Document(&spDisp);
	spDocument = spDisp;
	return spDocument;
}

bool CCustIETools::EvalScriptEx(CComPtr<IHTMLDocument2> spHtmlDoc, const std::string & script)
{
	// First, Eval script on current DOM
	BSTR bstrDocUrl = NULL;
	spHtmlDoc->get_URL(&bstrDocUrl);
	if (bstrDocUrl) {
		//PUTLOG("* Run script on IFrame, URL: %s", TOANSI(bstrDocUrl));
		SysFreeString(bstrDocUrl);
	}
	EvalScript(spHtmlDoc, script);

	// Second, Recursively call in all child frames.
	CComPtr<IHTMLFramesCollection2> spFrameCollection;
	spHtmlDoc->get_frames(&spFrameCollection);
	long nFrameCount = 0;
	if (spFrameCollection) {
		spFrameCollection->get_length(&nFrameCount);
	}
	for (long i = 0; i < nFrameCount; i++) {
		CComVariant varFrame; CComVariant varIndex(i);
		if (SUCCEEDED(spFrameCollection->item(&varIndex, &varFrame))
			&& varFrame.vt == VT_DISPATCH
			&& varFrame.pdispVal)
		{
			CComQIPtr<IHTMLWindow2> spFrameWin = varFrame.pdispVal;

			CComPtr<IHTMLDocument2> spFrameHtmlDoc = GetHtmlDocFromIFrameWindow(spFrameWin);
			if (!spFrameHtmlDoc) {
				continue;
			}
			EvalScriptEx(spFrameHtmlDoc, script);
		}
	}

	return true;
}

bool CCustIETools::SaveImageFromClip(const std::string & filepath)
{
	HBITMAP source = (HBITMAP) GetClipboardData(CF_BITMAP);
	if (!source){
		PUTLOG("* Failed to Get clipboard data, %d", GetLastError());
		CloseClipboard();
		return false;
	}

	BITMAP source_info = { 0 };
	if( !::GetObject( source, sizeof( source_info ), &source_info ) ){
		PUTLOG("* Failed to get BITMAP");
		CloseClipboard();
		return false;
	}

	Gdiplus::PixelFormat pixel_format = PixelFormat24bppRGB;
	if (source_info.bmBitsPixel == 32){
		pixel_format = PixelFormat32bppARGB;
	}

	Gdiplus::Status s;
	std::auto_ptr< Gdiplus::Bitmap > target( new Gdiplus::Bitmap( source_info.bmWidth, source_info.bmHeight, pixel_format ) );
	if( !target.get() ){
		PUTLOG("* Failed to new GDI:Bitmap");
		CloseClipboard();
		return false;
	}

	if( ( s = target->GetLastStatus() ) != Gdiplus::Ok ){
		PUTLOG("* Failed to create GDI:Bitmap");
		CloseClipboard();
		return false;
	}

	Gdiplus::BitmapData target_info;
	Gdiplus::Rect rect( 0, 0, source_info.bmWidth, source_info.bmHeight );

	s = target->LockBits( &rect, Gdiplus::ImageLockModeWrite, pixel_format, &target_info );
	if( s != Gdiplus::Ok ){
		PUTLOG("* Failed to LockBits");
		CloseClipboard();
		return false;
	}

	if( target_info.Stride != source_info.bmWidthBytes ){
		PUTLOG("* Bitmap format error, target:[%d], source:[%d]", target_info.Stride, source_info.bmWidthBytes );
		CloseClipboard();
		return false; // pixel_format is wrong!
	}

	source_info.bmBits = malloc(source_info.bmWidthBytes * source_info.bmHeight);

	GetBitmapBits(source, source_info.bmWidthBytes * source_info.bmHeight, source_info.bmBits);

	CopyMemory( target_info.Scan0, source_info.bmBits, source_info.bmWidthBytes * source_info.bmHeight );

	free(source_info.bmBits);

	s = target->UnlockBits( &target_info );
	if( s != Gdiplus::Ok ){
		PUTLOG("* Failed to unlock bits");
		CloseClipboard();
		return false;
	}

	CLSID clsidPNG;
	GetEncoderClsid("image/jpeg", &clsidPNG);
	target->Save(TOUNICODE(filepath.c_str()),&clsidPNG);

	CloseClipboard();
	return true;
}

std::string CCustIETools::GetVCodeTextByClip(unsigned int ocrpath, const std::string & sBankId, CComPtr<IHTMLElement2> spBody, CComPtr<IHTMLElement> spElement, int imgWidth, int imgHeight)
{
	IDispatch* pdispCtrlRange = NULL;

	CComPtr<IHTMLControlRange> spCtrlRange;

	if (FAILED(spBody->createControlRange(&pdispCtrlRange)) )
		return "";

	if (pdispCtrlRange == NULL)
		return "";

	if (FAILED(pdispCtrlRange->QueryInterface(IID_IHTMLControlRange, (void**) &spCtrlRange)) )
		return "";

	if (spCtrlRange == NULL)
		return "";

	CComPtr<IHTMLControlElement> spCtrlElement;
	if (FAILED(spElement->QueryInterface(IID_IHTMLControlElement, (void**) &spCtrlElement)) )
		return "";

	if (FAILED(spCtrlRange->add(spCtrlElement)))
		return "";

	VARIANT vEmpty;
	VariantInit(&vEmpty);
	VARIANT_BOOL vbReturn;
	if(FAILED(spCtrlRange->execCommand(_bstr_t("Copy"), VARIANT_FALSE, vEmpty, &vbReturn))){
		PUTLOG("* Failed to Execute `copy' command, %u", GetLastError());
		CloseClipboard();
		return "";
	}

	std::string sImagePath = GetTempFilePath(sBankId, "jpeg", true);

	if (!OpenClipboard(AfxGetApp()->m_pMainWnd->GetSafeHwnd())){
		PUTLOG("* Failed to open clipboard, %u", GetLastError());
		return "";
	}

	if (!SaveImageFromClip(sImagePath)){// Always call `CloseClipboard()'
		PUTLOG("Failed to save image from clipboard");
		return "";
	}

	if(theApp.m_userConfig["type"].asString() == ORG_PSBC){
		BOOL success = CleanPLBCOCRImage(ToUnicodeString(sImagePath).c_str());
		if(!success){
			PUTLOG("Failed to clean PLBC bank ocr image.");
			return "";
		}
	}

	PUTLOG("Try to post image to ocr engine:[%s] [%s]", sBankId.c_str(), sImagePath.c_str());

	std::string sImageHash = "";
	if (!RequestOcr(ocrpath, sBankId, sImagePath, sImageHash)) {
		PUTLOG("Failed to Request OCR for image");
		return "";
	}
	return sImageHash;
}

BOOL CCustIETools::CleanPLBCOCRImage(const TCHAR* strFile)
{
	CImage imgSrc;
	CImage imgDst;
	HRESULT result = imgSrc.Load(strFile);
	if(result != S_OK)
		return FALSE;
	int maxY = imgSrc.GetHeight();  
	int maxX = imgSrc.GetWidth();     

	imgDst.Create(maxX,maxY,imgSrc.GetBPP(),0);//图像大小与imgSrc相同，每个像素占1字节  

	if(imgDst.IsNull())  
		return FALSE;  

	byte* pDataSrc = (byte*)imgSrc.GetBits(); //获取指向图像数据的指针  
	byte* pDataDst = (byte*)imgDst.GetBits();    
	int pitchSrc = imgSrc.GetPitch(); //获取每行图像占用的字节数 +：top-down；-：bottom-up DIB  
	int pitchDst = imgDst.GetPitch();    
	int bitCountSrc = imgSrc.GetBPP()/8;  // 获取每个像素占用的字节数  
	int bitCountDst = imgDst.GetBPP()/8;  

	int tmpR,tmpG,tmpB;  
	//黑色变白色
	for(int i=0;i<maxX;i++)  
	{  
		for(int j=0;j<maxY;j++)  
		{  
			tmpB = *(pDataSrc+pitchSrc*j+i*bitCountSrc);  
			tmpG = *(pDataSrc+pitchSrc*j+i*bitCountSrc+1);  
			tmpR = *(pDataSrc+pitchSrc*j+i*bitCountSrc+2);  
			if(tmpR > 100 || tmpG > 100 || tmpB > 100 ){
				*(pDataDst+pitchDst*j+i*bitCountDst) = tmpR;
				*(pDataDst+pitchDst*j+i*bitCountDst+1) = tmpG;  
				*(pDataDst+pitchDst*j+i*bitCountDst+2) = tmpB; 
			}else{
				*(pDataDst+pitchDst*j+i*bitCountDst) = 255;  
				*(pDataDst+pitchDst*j+i*bitCountDst+1) = 255;  
				*(pDataDst+pitchDst*j+i*bitCountDst+2) = 255; 
			}
		}  
	}  

	//二值化
	for(int i=0;i<maxX;i++)  
	{  
		for(int j=0;j<maxY;j++)  
		{  
			tmpB = *(pDataDst+pitchDst*j+i*bitCountDst);  
			tmpG = *(pDataDst+pitchDst*j+i*bitCountDst+1);  
			tmpR = *(pDataDst+pitchDst*j+i*bitCountDst+2);  
			if(tmpB > 100 && tmpG > 100){
				//白色
				*(pDataDst+pitchDst*j+i*bitCountDst) = 255;
				*(pDataDst+pitchDst*j+i*bitCountDst+1) = 255;
				*(pDataDst+pitchDst*j+i*bitCountDst+2) = 255;
			}else{
				//黑色
				*(pDataDst+pitchDst*j+i*bitCountDst) = 0;
				*(pDataDst+pitchDst*j+i*bitCountDst+1) = 0;
				*(pDataDst+pitchDst*j+i*bitCountDst+2) = 0;
			}
		}  
	}  
	result = imgDst.Save(strFile);
	if(result == S_OK)
		return TRUE;
	else return FALSE;
}

std::string CCustIETools::GetVCodeText(unsigned int ocrpath, const std::string & sBankId, CComPtr<IHTMLElement> spElement, int imgWidth, int imgHeight)
{
	CComPtr<IHTMLElementRender> spRender;
	spElement->QueryInterface(IID_IHTMLElementRender, (void **)&spRender);

	if (!spRender) {
		PUTLOG("OCR: Failed to get imageRender interface");
		return "";
	}

	long cx, cy = 0;
	HRESULT hr = S_OK;
	if (imgWidth == 0)
		hr = spElement->get_offsetWidth(&cx);
	else{
		cx = imgWidth;
	}
	if (imgHeight == 0)
		hr = spElement->get_offsetHeight(&cy);
	else{
		cy = imgHeight;
	}
	if (!(cx > 0 && cy > 0)) {
		PUTLOG("OCR: failed to get width [%d] & height[%d], hr=%x.", cx, cy, hr);
		return "";
	}
	PUTLOG("OCR: Get image width [%d] & height[%d], hr=%x.", cx, cy, hr);

	Bitmap snap(cx, cy);
	Graphics canvas(&snap);
	HDC hSnapDc = canvas.GetHDC();
	if (hSnapDc == NULL) {
		PUTLOG("OCR: Failed to get DC");
		return "";
	}
	spRender->DrawToDC(hSnapDc);
	canvas.ReleaseHDC(hSnapDc);
	CLSID clsidPNG;
	GetEncoderClsid("image/jpeg", &clsidPNG);
	std::string sImagePath = GetTempFilePath(sBankId, "jpeg", true);
	if (Gdiplus::Status(Ok) != snap.Save(TOUNICODE(sImagePath.c_str()), &clsidPNG, NULL))
	{
		PUTLOG("OCR: failed to save image.");
		return "";
	}

	PUTLOG("Try to post image to ocr engine:[%s] [%s]", sBankId.c_str(), sImagePath.c_str());

	std::string sImageHash = "";
	if (!RequestOcr(ocrpath, sBankId, sImagePath, sImageHash)) {
		PUTLOG("Failed to Request OCR for image");
		return "";
	}
	return sImageHash;
}

std::string CCustIETools::QueryVCode(const std::string & sImageHash)
{
	std::string sText;
	if (QueryOcrResult(sImageHash, sText)){
		return sText;
	}
	return "";
}

std::string CCustIETools::SetOcrFrom(const std::string & sOcrFrom)
{	
	PUTLOG("* Get sOcrFrom value:[%s]", sOcrFrom.c_str());
	if("?" == sOcrFrom)
	{
		return  CCustIETools::m_sOcrFrom;
	}
	CCustIETools::m_sOcrFrom = sOcrFrom;
	PUTLOG("* CCustIETools::m_sOcrFrom:[%s]", CCustIETools::m_sOcrFrom.c_str());
	return CCustIETools::m_sOcrFrom;
}

std::string CCustIETools::SetOcrCount(const std::string & sOcrCount)
{	
	PUTLOG("* Get SetOcrCount value:[%s]", sOcrCount.c_str());
	if("?" == sOcrCount)
	{
		return  theApp.m_userConfig["countocr"].asString();//CCustIETools::m_sOcrCount;
	}
	//CCustIETools::m_sOcrCount 
	theApp.m_userConfig["countocr"]	= sOcrCount;
	PUTLOG("* CCustIETools::sOcrCount:[%s]", theApp.m_userConfig["countocr"].asString().c_str());
	return  theApp.m_userConfig["countocr"].asString();//CCustIETools::m_sOcrCount;
}

bool CCustIETools::SendInputPW(const std::string & sPassword)
{
	SendString sender = "";
	sender.SetString(sPassword.c_str());
	sender.Send();

	::Sleep(1000);

	return true;
}

std::string CCustIETools::QueryPhoneCode(const std::string & sKey)
{
	//TODO: Query local file by sTaskKey to get phone code
	std::string strSMSCode;
	
	if (sKey.empty() || sKey.find("TASK:") != 0){
		return strSMSCode;
	}	
	std::string sTaskkey = sKey.substr(5);

	std::string sResultFile = GetTempFilePath(sTaskkey, "json", false);

	// java not flush, c read fail
	// try this code
	if (_access( sResultFile.c_str(), 6) == -1)
	{
		PUTLOG("filel _access fail");
	}
	std::string strResult;
	do{
		std::ifstream ifs(sResultFile);
		PUTLOG("status: %d",ifs.rdstate());
		strResult = std::string((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
		if (strResult.length() == 0){
			return strSMSCode;
		}		
	}while(0);

	Json::Reader reader;
	Json::Value jdata ;
	if (!reader.parse(strResult, jdata)){
		return strSMSCode;
	}
	// TODO:update all data
	else{
		theApp.m_userConfig["reqid"] = jdata["reqId"].asString();
		//CCustIETools::SaveGlobalSettings(jdata);
	}

	if  (!jdata.isObject() || !jdata.isMember("extraParams")){
		return strSMSCode;
	}

	Json::Value jsonExtra = jdata["extraParams"];
	if (!jsonExtra.isObject() || !jsonExtra.isMember("smsCode")){
		return strSMSCode;
	}

	//TODO: Ugly code
	if (jsonExtra.isMember("reqId")){
		std::string sReqId = jsonExtra["reqId"].asString();
		if (!sReqId.empty()){
			PUTLOG("* TODO: Update GlobalSetting <reqId> by [%s]", sReqId.c_str());
		}
	}

	strSMSCode = jsonExtra["smsCode"].asString();

	PUTLOG("Phone code result: [%s]", strSMSCode.c_str());

	if(!strSMSCode.empty())
	{
		::DeleteFileA(sResultFile.c_str());
	}

	return strSMSCode;
}

bool CCustIETools::InitKeyInputLock()
{
	m_hKeyInputLock = CreateMutexA(NULL, FALSE, "Local\\MutexForKeyInput");
	return (m_hKeyInputLock != NULL);
}

bool CCustIETools::InitKeyInputNotify()
{
	m_hEvtKeyInputDone = CreateEventA(NULL, FALSE, FALSE, NULL);
	return (m_hEvtKeyInputDone != NULL);
}

bool CCustIETools::DeinitKeyInputLock()
{
	if (m_hKeyInputLock) {
		CloseHandle(m_hKeyInputLock);
		m_hKeyInputLock = INVALID_HANDLE_VALUE;
	}
	return true;
}

bool CCustIETools::DeinitKeyInputNotify()
{
	if (m_hEvtKeyInputDone) {
		CloseHandle(m_hEvtKeyInputDone);
		m_hEvtKeyInputDone = INVALID_HANDLE_VALUE;
	}
	return true;
}
bool CCustIETools::GetEncoderClsid(const std::string & format, CLSID* pClsid)
{
	UINT  num = 0;          // number of image encoders
	UINT  size = 0;         // size of the image encoder array in bytes

	ImageCodecInfo* pImageCodecInfo = NULL;

	GetImageEncodersSize(&num, &size);
	if (size == 0)
	{
		return false;
	}

	pImageCodecInfo = (ImageCodecInfo*)(malloc(size));
	if (pImageCodecInfo == NULL)
	{
		return false;
	}

	GetImageEncoders(num, size, pImageCodecInfo);

	for (UINT j = 0; j < num; ++j)
	{
		if (!wcscmp(pImageCodecInfo[j].MimeType, TOUNICODE(format.c_str())))
		{
			*pClsid = pImageCodecInfo[j].Clsid;
			free(pImageCodecInfo); pImageCodecInfo = NULL;
			return true;  // Success
		}
	}

	free(pImageCodecInfo);
	return false;  // Failure
}

int CCustIETools::CreatDir(const char *pDir)  
{  
	int i = 0;  
	int iRet;  
	int iLen;  
	char* pszDir;  

	if(NULL == pDir)  
	{  
		return 0;  
	}  

	if(0 == ACCESS(pDir,0))  
	{  
		return 0;  
	}  

	pszDir = strdup(pDir);  
	iLen = strlen(pszDir);  

	// 创建中间目录  
	for (i = 0;i < iLen;i ++)  
	{  
		if (pszDir[i] == '\\' || pszDir[i] == '/')  
		{   
			pszDir[i] = '\0';  

			//如果不存在,创建  
			iRet = ACCESS(pszDir,0);  
			if (iRet != 0)  
			{  
				iRet = MKDIR(pszDir);  
				if (iRet != 0)  
				{  
					return -1;  
				}   
			}  
			//支持linux,将所有\换成/  
			pszDir[i] = '/';  
		}   
	}  
	iRet = ACCESS(pszDir,0); 
	if (iRet != 0)  
	{  
		iRet = MKDIR(pszDir);  
	}
	free(pszDir);  
	return iRet;  
}  

std::string CCustIETools::GetFilePath(std::string & folder, const std::string & prefix, const std::string & ext, bool fUniq)
{
	char szTempPath[MAX_PATH] = "";
	memcpy(szTempPath, folder.c_str(), folder.length());
	strcat(szTempPath, "\\");
	strcat(szTempPath, prefix.c_str());

	if (fUniq){
		SYSTEMTIME now;
		GetLocalTime(&now);
		strcat(szTempPath, "-");
		char timestamp[MAX_PATH] = "";
		sprintf(timestamp, "%04d%02d%02d.%u", now.wYear, now.wMonth, now.wDay, (unsigned int)time(NULL));
		strcat(szTempPath, timestamp);
	}

	strcat(szTempPath, ".");
	strcat(szTempPath, ext.c_str());
	return szTempPath;
}

std::string CCustIETools::GetTempFilePath(const std::string & prefix, const std::string & ext, bool fUniq)
{
	char szTempPath[MAX_PATH] = "";
	GetTempPathA(sizeof(szTempPath), szTempPath);
	//strcat(szTempPath, "\\");
	strcat(szTempPath, prefix.c_str());

	if (fUniq){
		strcat(szTempPath, "-");
		std::string taskeyname = theApp.m_userConfig["taskkey"].asString();
		taskeyname = taskeyname.replace(taskeyname.find(":"),1,"_");
		strcat(szTempPath, taskeyname.c_str());

		strcat(szTempPath, "-");
		char timestamp[MAX_PATH] = "";
		sprintf(timestamp, "%u.%u", (unsigned int)time(NULL), GetTickCount());
		strcat(szTempPath, timestamp);
	}

	strcat(szTempPath, ".");
	strcat(szTempPath, ext.c_str());
	return szTempPath;
}

bool CCustIETools::RequestOcr(unsigned int ocrpath, const std::string & bankid, const std::string & imagePath, std::string & sImageInfo)
{
	
	std::string sImageHash = MD5Sum(imagePath);
	if (sImageHash.empty()){
		PUTLOG("* Failed to get image hash.");
		return false;
	}

	char sTempPath[MAX_PATH] = "";
	strcat(sTempPath, sImageHash.c_str());
	strcat(sTempPath, "-");
	char timestamp[MAX_PATH] = "";
	sprintf(timestamp, "%u.%u", (unsigned int)time(NULL), GetTickCount());
	strcat(sTempPath, timestamp);
	sImageHash = sTempPath;

	PUTLOG("* imagePath:%s . sImageHash: %s",imagePath, sImageHash);
	std::string sResultFile = GetTempFilePath(sImageHash, "txt", false);

	std::string  ocrImage = Base64EncodeOCRImage(imagePath);
	//std::string sImageHash = MD5Sum(imagePath);
	Json::Value info;  
	Json::StyledWriter info_write;
	info["hash"] = sImageHash;
	info["image"] = ocrImage;
	sImageInfo = info_write.write(info);

	PUTLOG("Value of ocrpath [%u] ", ocrpath);
	if( ocrpath != 0)
	{
		FILE * fout = stdout;

		std::string sTempFile = GetTempFilePath(sImageHash, "txt", true);

		if (!sTempFile.empty()){
			fout = fopen(sTempFile.c_str(), "w");
			if (!fout) fout = stdout;
		}
		PUTLOG("Set ocr result to ?front.");
		fprintf(fout, "%s", "?front");
		if (fout != stdout){
			fclose(fout);
		}
		else
		{
			PUTLOG("Fail to write ?front to ocr result file.");
		}

		if (!MoveFileExA(sTempFile.c_str(), sResultFile.c_str(), MOVEFILE_REPLACE_EXISTING)){
			PUTLOG("Failed to rename temp file [%s] to result file [%s]", sTempFile.c_str(), sResultFile.c_str());
			//return false;
		}

		return true;
	}
	PUTLOG("* Start using auto ocr platform.");

	std::string countocr = theApp.m_userConfig["countocr"].asString();
	PUTLOG("value of  countocr [%s] ", countocr.c_str());

	std::vector<std::string> vecParams;
	vecParams.push_back("-b");
	vecParams.push_back(bankid);
	vecParams.push_back("-c");//ocr retry count
	vecParams.push_back(countocr);
	vecParams.push_back("-t");
	vecParams.push_back(sResultFile);
	vecParams.push_back(imagePath);

	Json::Value val;  
	Json::StyledWriter style_write;
	val["bankid"] = bankid;
	val["countocr"] = countocr;
	val["resultFilePath"] = sResultFile;
	val["imagePath"] = imagePath;
	std::string sendBuf = style_write.write(val);

	std::string processName = "NetWorkOcrWrapper";
	if(isProcessStarted(theApp.GetDama2ListenPort(), processName))
	{
		//socket: send a request to server.
		if (!SendOcrRequestToNetworkOCRWrapper(sendBuf))
		{
			PUTLOG("Failed to send OCR request to NetworkOCRWrapper process.");
			return false;
		}
	}
	else
	{
		unsigned int retCode = 0;
		std::string sOcrParser = (!stricmp(bankid.c_str(), "network")) ? "NetworkOCRWrapper.exe" : "SundayOcrWrapper.exe";
		if (!Fork(GetAppPath() + sOcrParser
			, vecParams
			//, true/*Synchronism, for test*/
			, false/*Asynchronism, for production*/
			, &retCode))
		{
			PUTLOG("Failed to fork OCR process.");
			return false;
		}
	}

	return true;
}

bool CCustIETools::isProcessStarted( IN unsigned port, std::string &processName)
{
	PMIB_TCPTABLE_OWNER_PID pTcpTable;
	pTcpTable = new MIB_TCPTABLE_OWNER_PID;

	//获取所需要的内存大小
	DWORD tmpSize = sizeof(MIB_TCPTABLE_OWNER_PID); 
	GetExtendedTcpTable( pTcpTable, &tmpSize,false , AF_INET,  TCP_TABLE_OWNER_PID_ALL, 0);

	//分配足够大小的内存并获取端口信息
	DWORD dwSize = tmpSize/sizeof(MIB_TCPTABLE_OWNER_PID);
	delete pTcpTable;
	pTcpTable = NULL;
	pTcpTable = new MIB_TCPTABLE_OWNER_PID[dwSize];
	GetExtendedTcpTable( pTcpTable, &tmpSize, true, AF_INET,  TCP_TABLE_OWNER_PID_ALL, 0);

	//判断端口是否被占用，并找出占用端口的进程，对于某些system权限的进程需要提权
	for (int i = 0; i < (int) pTcpTable->dwNumEntries; i++) {
		if ( port == ntohs( (u_short) pTcpTable->table[i].dwLocalPort ) )
		{
			HANDLE provileges = NULL;
			LUID Luid;
			//提权操作
			if ( !OpenProcessToken( GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES| TOKEN_QUERY, &provileges) )
			{
				long res = GetLastError();
				PUTLOG("error code %d", res);
				if (pTcpTable != NULL)
				{
					delete []pTcpTable;
					pTcpTable = NULL;
				}
				return false;
			}

			if (!LookupPrivilegeValue(NULL,SE_DEBUG_NAME,&Luid))
			{
				PUTLOG("LookupPrivilegeValue err!");
				if (pTcpTable != NULL)
				{
					delete []pTcpTable;
					pTcpTable = NULL;
				}
				return false;
			}

			TOKEN_PRIVILEGES tp;
			tp.PrivilegeCount=1;
			tp.Privileges[0].Attributes=SE_PRIVILEGE_ENABLED;
			tp.Privileges[0].Luid=Luid;

			if (!AdjustTokenPrivileges(provileges,0,&tp,sizeof(TOKEN_PRIVILEGES),NULL,NULL))
			{
				PUTLOG("AdjustTokenPrivileges err!");
				if (pTcpTable != NULL)
				{
					delete []pTcpTable;
					pTcpTable = NULL;
				}
				return false;
			}

			HANDLE hProcess = OpenProcess( PROCESS_ALL_ACCESS, false, pTcpTable->table[i].dwOwningPid);
			if ( hProcess == NULL )
			{
				long res = GetLastError();
				PUTLOG("error code %d", res);
				if (pTcpTable != NULL)
				{
					delete []pTcpTable;
					pTcpTable = NULL;
				}
				return false;
			}
			char wsProcessName[MAX_PATH + 1] = {0};
			DWORD len = MAX_PATH;
			if ( GetProcessImageFileNameA(hProcess, wsProcessName, len) )
			{
				CloseHandle(hProcess);
				std::string findProcessName = wsProcessName;
				if(findProcessName.find(processName) != std::string::npos)
				{
					return true;
				}
			}
			else
			{
				CloseHandle(hProcess);
				hProcess = NULL;
				if (pTcpTable != NULL)
				{
					delete []pTcpTable;
					pTcpTable = NULL;
				}
				return false;
			}
		}
	}

	if (pTcpTable != NULL)
	{
		delete []pTcpTable;
		pTcpTable = NULL;
	}

	return false;
}

bool CCustIETools::SendOcrRequestToNetworkOCRWrapper(std::string & sendData)
{
	WORD wVersionRequested;  
	WSADATA wsaData;   
	int err;  

	wVersionRequested = MAKEWORD( 1, 1 );   // 请求1.1版本的WinSock库  

	err = WSAStartup( wVersionRequested, &wsaData );  
	if ( err != 0 ) {  
		return false;          // 返回值为零的时候是表示成功申请WSAStartup  
	}  

	if ( LOBYTE( wsaData.wVersion ) != 1 || HIBYTE( wsaData.wVersion ) != 1 ) {  
		WSACleanup( );  
		return false;   
	}  

	SOCKET sockClient = socket(AF_INET, SOCK_STREAM, 0);  

	SOCKADDR_IN addrSrv;  
	addrSrv.sin_addr.S_un.S_addr = inet_addr("127.0.0.1");      // 本地回路地址是127.0.0.1;   
	addrSrv.sin_family = AF_INET;  
	addrSrv.sin_port = htons(theApp.GetDama2ListenPort());  
	connect(sockClient, (SOCKADDR*)&addrSrv, sizeof(SOCKADDR));  

	send(sockClient, sendData.c_str(), strlen(sendData.c_str())+1, 0);  
	closesocket(sockClient);
	WSACleanup();   // 终止对套接字库的使用
	return true;
}

bool CCustIETools::QueryOcrResult(const std::string & sImageHash, std::string & sText)
{
	std::string sResultFile = GetTempFilePath(sImageHash, "txt", false);

	std::string sTempFile = GetTempFilePath(sImageHash, "txt", true);

	if (!MoveFileA(sResultFile.c_str(), sTempFile.c_str())){
		return false;
	}

	sResultFile = sTempFile;

	FILE * fin = fopen(sResultFile.c_str(), "r");
	if (!fin) {
		//PUTLOG("Failed to open OCR result file: [%s]", sResultFile.c_str());
		return false;
	}
	char szBuffer[MAX_PATH] = "";
	fscanf(fin, "%s", &szBuffer);
	fclose(fin);

	PUTLOG("* OCR result: %s .", szBuffer);

	sText = szBuffer;

	PUTLOG("* Delete ocr result file: %s .", sResultFile.c_str());
	::DeleteFileA(sResultFile.c_str());

	//int startPos = sText.find("?refresh;reqid:");
	int startPos = sText.find(";reqid:");
	if(startPos != std::string::npos)
	{
		theApp.m_userConfig["reqid"] = sText.substr(startPos+7);
		PUTLOG("* After refresh  reqid,theApp.m_userConfig[reqid]: [%s]", theApp.m_userConfig["reqid"]);

		std::string splitChar = ";";
		size_t last = 0;
		size_t index= sText.find_first_of(splitChar,last);
		if(index != std::string::npos )
		{
			sText = sText.substr(last,index-last);
		}
		else
		{
			PUTLOG("Split OCR result error by \";\". str: %s", szBuffer);
		}
		
	}

	return !sText.empty();
}

#ifdef USE_CURL
bool CCustIETools::HttpRequest(const std::string & url, std::string & response)
{
	CURL * curl = NULL;
	curl = curl_easy_init();
	if (!curl) {
		PUTLOG("Failed to init curl handle");
		return false;
	}
	curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
	curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
	curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);

	curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWriteCallback);
	curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

	/* Perform the request, res will get the return code */
	CURLcode res = curl_easy_perform(curl);

	/* Check for errors */
	if (res != CURLE_OK) {
		PUTLOG("curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
		curl_easy_cleanup(curl);
		return false;
	}

	/* always cleanup */
	curl_easy_cleanup(curl);
	return res == CURLE_OK;
}

bool CCustIETools::HttpRequest(const std::string & url, const std::string & body, std::string & response)
{
	return false;
}

bool CCustIETools::HttpUpload(const std::string & url, const std::string & filePath, const std::string & htmltag, std::string & response)
{
	/*
	const wchar_t * formxml =
	_T("<form>")
	_T("<input type='file' name='imagelogo'></input>")
	_T("</form>");
	HttpPostForm(url, formxml, _T(""), response);
	*/

	CURL *curl;
	CURLcode res;

	struct curl_httppost *formpost = NULL;
	struct curl_httppost *lastptr = NULL;
	struct curl_slist *headerlist = NULL;

	static const char buf[] = "Expect:";

	// imagelogo = {fileName: filePath};
	curl_formadd(&formpost,
		&lastptr,
		CURLFORM_COPYNAME, htmltag.c_str(),
		CURLFORM_FILE, (const char *)filePath.c_str(), //TODO: use utf8 encoding
		CURLFORM_FILENAME, filePath.substr(filePath.rfind("\\") + 1).c_str(),
		CURLFORM_END);

	curl = curl_easy_init();
	/* initalize custom header list (stating that Expect: 100-continue is not wanted */
	headerlist = curl_slist_append(headerlist, buf);
	if (curl) {
		/* what URL that receives this POST */
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

		/* only disable 100-continue header if explicitly requested */
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerlist);

		curl_easy_setopt(curl, CURLOPT_HTTPPOST, formpost);

		/* send all data to this function  */
		curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWriteCallback);

		/* we pass our 'chunk' struct to the callback function */
		curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&response);

		/* Perform the request, res will get the return code */
		res = curl_easy_perform(curl);

		/* Check for errors */
		if (res != CURLE_OK) {
			PUTLOG("curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
		}
		else {
			PUTLOG("url=[%s] [%lu] bytes retrieved\n", url.c_str(), response.length());
		}
		/* always cleanup */
		curl_easy_cleanup(curl);

		/* then cleanup the formpost chain */
		curl_formfree(formpost);

		/* free slist */
		curl_slist_free_all(headerlist);
	}

	return res == CURLE_OK;
}

bool CCustIETools::HttpPostJson(const std::string & url, const std::string & data, std::string & response)
{
	std::string resp;
	std::vector<std::string> vecHeader;
	vecHeader.push_back("content-type: application/json; charset=utf-8");
	vecHeader.push_back("accept: */*");
	return CCustIETools::HttpPost(url, vecHeader, data, resp);
}

bool CCustIETools::HttpPost(const std::string & url, const std::vector<std::string> & vecHeaders, const std::string & data, std::string & response)
{
	CURL * curl = NULL;
	curl = curl_easy_init();
	if (!curl) {
		PUTLOG("Failed to init curl handle");
		return false;
	}
	curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
	curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
	curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);

	struct curl_slist *chunk = NULL;
	for(auto it = vecHeaders.begin(); it != vecHeaders.end(); ++it){
		chunk = curl_slist_append(chunk, it->c_str());
	}
	curl_easy_setopt(curl, CURLOPT_HTTPHEADER, chunk);

	curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWriteCallback);
	curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

	curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
	curl_easy_setopt(curl, CURLOPT_TIMEOUT, theApp.ReportTimeout());
	
	/* Perform the request, res will get the return code */
	CURLcode res = curl_easy_perform(curl);

	/* Check for errors */
	if (res != CURLE_OK) {
		PUTLOG("curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
		curl_easy_cleanup(curl);
		curl_slist_free_all(chunk);
		return false;
	}

	/* always cleanup */
	curl_easy_cleanup(curl);
	curl_slist_free_all(chunk);
	return res == CURLE_OK;
}

#endif

size_t CCustIETools::CurlWriteCallback(void * content, size_t sz, size_t cnt, void * userp)
{
	if (!userp) {
		PUTLOG("Invalid parameter for curl callback");
		return 0;
	}
		
	std::string * pStr = (std::string *)userp;

	pStr->append((char *)content, sz * cnt);

	return sz * cnt;
}

bool CCustIETools::RegSetString(HKEY hRoot, const std::string & keyPath, const std::string & keyName, const std::string & value)
{
	HKEY hKey = NULL;
	long ret = RegOpenKeyExA(hRoot, keyPath.c_str(), 0, REG_LEGAL_OPTION, &hKey);
	if (ret != ERROR_SUCCESS)
	{
		DWORD dwDisposition = 0;
		ret = RegCreateKeyExA(hRoot, keyPath.c_str(), 0, NULL, REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, &dwDisposition);
		if (ret != ERROR_SUCCESS)
		{
			return false;
		}
	}

	ret = RegSetValueExA(hKey, keyName.c_str(), NULL, REG_SZ, (BYTE*)value.c_str(), value.length());

	RegCloseKey(hKey);

	if (ret != ERROR_SUCCESS) {
		return false;
	}
	return true;
}

bool CCustIETools::RegSetInt(HKEY hRoot, const std::string & keyPath, const std::string & keyName, unsigned int value)
{
	HKEY hKey = NULL;
	long ret = RegOpenKeyExA(hRoot, keyPath.c_str(), 0, REG_LEGAL_OPTION, &hKey);
	if (ret != ERROR_SUCCESS)
	{
		DWORD dwDisposition = 0;
		ret = RegCreateKeyExA(hRoot, keyPath.c_str(), 0, NULL, REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, &dwDisposition);
		if (ret != ERROR_SUCCESS)
		{
			return false;
		}
	}

	ret = RegSetValueExA(hKey, keyName.c_str(), NULL, REG_DWORD, (BYTE*)&value, sizeof(value));

	RegCloseKey(hKey);

	if (ret != ERROR_SUCCESS) {
		return false;
	}
	return true;
}

std::string CCustIETools::MD5Sum(const std::string & filepath)
{
	FILE * fin = fopen(filepath.c_str(), "rb");
	if (!fin){
		return "";
	}
	fseek(fin, 0, SEEK_END);
	int len = ftell(fin);
	if (len <= 0){
		return "";
	}

	fseek(fin, 0, SEEK_SET);

	unsigned char * buff = (unsigned char *)malloc(len);

	int fini = 0;
	while(fini < len){
		int rd = fread(buff + fini, 1, len - fini, fin);
		if (rd <= 0){
			break;
		}
		fini += rd;
	}

	if(fini != len){
		free(buff); buff = NULL;
		return "";
	}

	unsigned char sum [MD5_DIGEST_LENGTH + 1] = "";
	memset(sum, 0, sizeof(sum));
	MD5(buff, len, sum);

	return ToHexString(sum, MD5_DIGEST_LENGTH);
}

std::string CCustIETools::Base64EncodeOCRImage(const std::string & filepath)
{
	std::ifstream OCRImage;

	OCRImage.open(filepath.c_str(), std::ios::binary|std::ios::in);

	if(!OCRImage)
	{
		return "";
	}
	std::string imagestr((std::istreambuf_iterator<char>(OCRImage)),
	std::istreambuf_iterator<char>()); 
	std::string b64str;

	std::vector<unsigned char> vec;
	for (std::string::const_iterator it = imagestr.begin(); it != imagestr.end(); ++it){
		vec.push_back(*it);
	}

	OCRImage.close();

	Base64Encode(vec, b64str);

	return b64str;
}

bool CCustIETools::Base64Encode(const std::vector<unsigned char > & vchInput, std::string & b64str)
{
	if (vchInput.size() == 0) return false;
	
	EVP_ENCODE_CTX	ctx;
	EVP_EncodeInit(&ctx);

	int destbuflen = vchInput.size() * 2 + 1; // enough

	char * destbuf = (char *)malloc(destbuflen);

	int outl = 0;
	EVP_EncodeUpdate(&ctx, (unsigned char *)destbuf, &outl, (unsigned char *)&vchInput[0], vchInput.size());

	int tmplen = 0;
	EVP_EncodeFinal(&ctx, (unsigned char *)&destbuf[outl], &tmplen);
	outl += tmplen;

	b64str.append(destbuf, outl);
	// Remove tailing <newline>;
	// http://www.boyunjian.com/do/article/snapshot.do?uid=5944363983042313521
	if (!b64str.empty() && b64str.at(b64str.length() - 1) == '\n'){
		b64str.erase(b64str.length() - 1);
	}
	free(destbuf); destbuf = NULL;

	return !b64str.empty();
}


std::string CCustIETools::Base64Encode(const std::string & rawstr)
{
	std::string b64str;
	std::vector<unsigned char> vec;
	for (std::string::const_iterator it = rawstr.begin(); it != rawstr.end(); ++it){
		vec.push_back(*it);
	}
	Base64Encode(vec, b64str);
	return b64str;
}

bool CCustIETools::Base64Decode(const std::string & b64str, std::vector<unsigned char > & vecResult)
{
	if (b64str.length() == 0) return false;
	
	EVP_ENCODE_CTX	ctx;
	int srclen = (((b64str.length()+2)/4)*3)+1;
	int destlen = 0;

	vecResult.resize(srclen);
	unsigned char * destbuf = &vecResult[0];
	EVP_DecodeInit(&ctx);

	EVP_DecodeUpdate(&ctx, (unsigned char *)destbuf, &destlen, (unsigned char *)b64str.c_str(), b64str.length());

	int tmplen = 0;

	EVP_DecodeFinal(&ctx, (unsigned char *)&vecResult[destlen], &tmplen);
	destlen += tmplen;

	vecResult.resize(destlen);

	return !vecResult.empty();
}

bool CCustIETools::AESEncrypt(const std::string & text, const std::string & key, std::vector<unsigned char > & vecDest)
{
	if (text.length() == 0) return false;
	
	EVP_CIPHER_CTX ctx;
	vecDest.resize(text.length() + 64);   // enough

	EVP_CIPHER_CTX_init(&ctx);

	int ret = EVP_EncryptInit_ex(&ctx, EVP_aes_128_ecb(), NULL, (const unsigned char*)key.c_str(), NULL);

	int outl = 0;
	ret = EVP_EncryptUpdate(&ctx, (unsigned char *)&vecDest[0], &outl, (const unsigned char*)text.c_str(), text.length());

	int	templen = 0;
	ret = EVP_EncryptFinal_ex(&ctx, (unsigned char *)&vecDest[outl], &templen); 
	outl += templen;

	vecDest.resize(outl);

	ret = EVP_CIPHER_CTX_cleanup(&ctx);

	return !vecDest.empty();
}

bool CCustIETools::AESDecrypt(const std::vector<unsigned char > & vecInput, const std::string & key, std::string & text)
{
	if (vecInput.size() == 0) return false;
	
	EVP_CIPHER_CTX ctx;
	std::vector<unsigned char> vecDest;
	vecDest.resize(vecInput.size() + 64);

	EVP_CIPHER_CTX_init(&ctx);

	int ret = EVP_DecryptInit_ex(&ctx, EVP_aes_128_ecb(), NULL, (const unsigned char*)key.c_str(), NULL);

	int textlen = 0;
	ret = EVP_DecryptUpdate(&ctx, (unsigned char *)&vecDest[0], &textlen, (const unsigned char*)&vecInput[0], vecInput.size());

	int	templen = 0;
	ret = EVP_DecryptFinal_ex(&ctx, (unsigned char *)&vecDest[textlen], &templen); 
	textlen += templen;

	vecDest.resize(textlen);

	ret = EVP_CIPHER_CTX_cleanup(&ctx);

	text.append((char *)&vecDest[0], textlen);

	return !text.empty();
}

std::string CCustIETools::GetUnProtectedString(const std::string & b64passphrase, const std::string & key)
{
	std::string text = "";

	std::vector<unsigned char > vecResult;
	if (!CCustIETools::Base64Decode(b64passphrase, vecResult)){
		return text;
	}

	CCustIETools::AESDecrypt(vecResult, key, text);

	return text;
}

std::string CCustIETools::SetProtectedString(const std::string & text, const std::string & key)
{
	std::string b64passphrase = "";

	// Encrypt
	std::vector<unsigned char > vchPassphrase;
	CCustIETools::AESEncrypt(text, key, vchPassphrase);

	// Encode
	CCustIETools::Base64Encode(vchPassphrase, b64passphrase);

	return b64passphrase;
}

bool CCustIETools::Exit(bool fForce)
{
	PUTLOG("* Script request to quit, %s", fForce ? "Force" : "Elegant");

	if (fForce){
		ExitProcess(0);
	}else{
		AfxGetApp()->m_pMainWnd->PostMessage(WM_CLOSE, 0, 0);
	}
	return true;
}

void CCustIETools::string_replace(std::string& strBig, const std::string& strsrc, const std::string&strdst)
{
    std::string::size_type pos=0;
    std::string::size_type srclen=strsrc.size();
    std::string::size_type dstlen=strdst.size();
    while( (pos=strBig.find(strsrc, pos)) != std::string::npos){
        strBig.replace(pos, srclen, strdst);
        pos += dstlen;
    }
}

static CString m_cfg_return_filename(CString m)
{
#ifdef  _UNICODE
	wchar_t drive[100];
	wchar_t dir[100];
	wchar_t fname[100];
	wchar_t ext[100];
	wchar_t *m1={0};
	m.ReleaseBuffer();
	_wsplitpath_s( m, drive, dir, fname, ext );
	CString l;
	l+=fname;
	l+=ext;
	l.Replace(__T("\\"),__T("\\\\"));
	return l;
#else
	char drive[100];
	char dir[100];
	char fname[100];
	char ext[100];
	char *m1={0};
	USES_CONVERSION;
	m1=m.GetBuffer();
	m.ReleaseBuffer();
	_splitpath_s( m1, drive, dir, fname, ext );
	CString l;
	l+=fname;
	l+=ext;
	l.Replace(__T("\\"),__T("\\\\"));
	return l;
#endif
}

static HMODULE Process_GetModule(DWORD th32ProcessId, LPCTSTR lpModuleFileName)
{
	HMODULE hModule = NULL;
	MODULEENTRY32 me32 = { 0 };
	CString sModuleFileName("");

	HANDLE hProcess = ::CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, th32ProcessId);
	if(hProcess != INVALID_HANDLE_VALUE)
	{
		me32.dwSize = sizeof(MODULEENTRY32);
		if(::Module32First(hProcess, &me32))
		{
			sModuleFileName = (CString )lpModuleFileName;
			do {
				if (0 == sModuleFileName.CompareNoCase(m_cfg_return_filename(me32.szExePath)))
				{
					hModule = me32.hModule;
					break;
				}
			}
			while(::Module32Next(hProcess, &me32));
		}
		::CloseHandle(hProcess);
	}
	return hModule;
}

static DWORD BinaryCode_GetAddrByModule(const char * lpModuleName, DWORD nModuleOffset)
{	
	HMODULE hModule = GetModuleHandleA(lpModuleName);
	DWORD nModuleAddress = (DWORD )hModule;
	if (0 != nModuleAddress)
	{
		DWORD nPhysical = nModuleAddress + nModuleOffset;
		return nPhysical;
	}
	return 0;
}

static BOOL Mem_ReadAddressByteSet(DWORD nBase, BYTE* byszValue, int nNum)
{
	DWORD dwOLD = 0;
	MEMORY_BASIC_INFORMATION  mbi = {0};
	VirtualQuery((LPCVOID )nBase, &mbi, sizeof(mbi));
	VirtualProtect((LPVOID )nBase, sizeof(BYTE) * nNum, PAGE_EXECUTE_READWRITE, &dwOLD);
	memcpy((void *)byszValue, (void *)nBase, nNum);
	VirtualProtect((LPVOID )nBase, sizeof(BYTE) * nNum, dwOLD,0);
	return TRUE;
}

static BOOL Mem_ModifyAddressByteSet(DWORD nBase, BYTE* byszValue, int nNum)
{
	DWORD dwOLD = 0;
	MEMORY_BASIC_INFORMATION  mbi = {0};
	VirtualQuery((LPCVOID )nBase, &mbi, sizeof(mbi));
	VirtualProtect((LPVOID )nBase, sizeof(BYTE) * nNum, PAGE_EXECUTE_READWRITE, &dwOLD);
	memcpy((void *)nBase, (void *)byszValue, nNum);
	VirtualProtect((LPVOID )nBase, sizeof(BYTE) * nNum, dwOLD,0);
	return TRUE;
}

static DWORD l_nHookABCSetFocusOnPsdCtrlAddress = 0;
static DWORD l_dwPasswordCtrlObjectAddr = 0;

void CCustIETools::HookInput_Abc(char cValue)
{
	if (0 == l_dwPasswordCtrlObjectAddr)
		return ;

	static DWORD nCall = BinaryCode_GetAddrByModule("C:\\Windows\\SysWOW64\\PowerEnterABC.ocx", 0x23710);

	if (0 == nCall) {
		return ;
	}

	DWORD dwValue = (DWORD )cValue;
	if (!isprint(cValue)){
		return ;
	}
	
	_asm {
		pushad;
		pushfd;
		push 0;
		push dwValue;
		mov ecx, dword ptr ds:[l_dwPasswordCtrlObjectAddr];
		call nCall;
		popfd;
		popad;
	}

	return ;
}

void _cdecl TraceAndCollectABCSetFocusOnPsdCtrl(DWORD dwEcx)
{
	l_dwPasswordCtrlObjectAddr = dwEcx;
}

void __declspec(naked) CodeABCSetFocusOnPsdCtrl(void)
{
	_asm
	{
		mov ecx,dword ptr ds:[esi+0x234];

		pushad;
		pushfd;
		push ecx;
		call TraceAndCollectABCSetFocusOnPsdCtrl;
		add esp,4;
		popfd;
		popad;

		push l_nHookABCSetFocusOnPsdCtrlAddress;
		add dword ptr ss:[esp], 0x6;
		retn;
	}
}

void CCustIETools::Hook_Abc()
{
	// long JUMP instruction
	BYTE byValue[5] = {0xe9, 0x00, 0x00, 0x00, 0x00};

	static BOOL s_hooked = FALSE;

	if (s_hooked){
		return ;
	}

	if (0 == l_nHookABCSetFocusOnPsdCtrlAddress) {
		l_nHookABCSetFocusOnPsdCtrlAddress = BinaryCode_GetAddrByModule("C:\\Windows\\SysWOW64\\PowerEnterABC.ocx", 0x1B037);
	}

	if (0 == l_nHookABCSetFocusOnPsdCtrlAddress) {
		PUTLOG("* BinaryCode_GetAddrByModule(C:\\Windows\\SysWOW64\\PowerEnterABC.ocx) failed");
		return ;
	}

	// the distance between original and detoured, (vector, e.g. jump back if minus, jump forward if postive);
	*(DWORD* )&byValue[1] = (DWORD )CodeABCSetFocusOnPsdCtrl - ((DWORD )l_nHookABCSetFocusOnPsdCtrlAddress + 5);

	if (!s_hooked) {
		Mem_ModifyAddressByteSet(l_nHookABCSetFocusOnPsdCtrlAddress, byValue, sizeof(byValue));
		s_hooked = TRUE;
	}

	return ;
}

static DWORD l_nHookBOCBaseAddress = 0;
static DWORD l_dwBOCPasswordBaseAddress = 0;

void _cdecl TraceAndCollectBOCGetBase(DWORD dwArg, DWORD dwEcx)
{	
	if (0 != dwArg)
	{
		l_dwBOCPasswordBaseAddress = dwArg;
	}
}

void __declspec(naked) CodeBOCGetBase(void)
{
	_asm
	{
		pushad;
		pushfd;
		push ecx;
		push ebx;
		call TraceAndCollectBOCGetBase;
		add esp,4;
		add esp,4;
		popfd;
		popad;
		mov eax, 0x101;
		push l_nHookBOCBaseAddress;
		add [esp], 0x5;
		retn;
	}
}

DWORD __stdcall CCustIETools::ThreadHookBoc(void * param){

	static BOOL bfind = FALSE;

	while(!bfind)
	{
		if(Process_GetModule(0,L"KeyboardProtection.dll")!=NULL)
		{
			bfind = TRUE;
			break;
		}
		else
		{
			Sleep(200);
		}
	}

	BYTE byValue[5] = {0xe9};
	static BYTE l_byszBOCGetBaseSrc[5] = {0};

	if (0 == l_nHookBOCBaseAddress) {
		l_nHookBOCBaseAddress = BinaryCode_GetAddrByModule("KeyboardProtection.dll",0x00009D6C + 0x1000);
	}
	if (0 == l_nHookBOCBaseAddress) {
		PUTLOG("* Fail to get boc DLL address!");
		return False;
	}

	*(DWORD* )&byValue[1] = (DWORD )CodeBOCGetBase - (DWORD )l_nHookBOCBaseAddress - 5;
	if (l_byszBOCGetBaseSrc[0] == '\0')	{
		Mem_ReadAddressByteSet(l_nHookBOCBaseAddress, l_byszBOCGetBaseSrc, sizeof(l_byszBOCGetBaseSrc));
	}

	bool IfOpenHook  =TRUE;
	if (IfOpenHook) {
		Mem_ModifyAddressByteSet(l_nHookBOCBaseAddress, byValue, sizeof(byValue));
	}
	/*if (!IfOpenHook) {
	PUTLOG("* UnHook boc");
	Mem_ModifyAddressByteSet(l_nHookBOCBaseAddress, l_byszBOCGetBaseSrc, sizeof(l_byszBOCGetBaseSrc));
	}*/

	return 0;
}

void CCustIETools::Hook_Boc()
{
	DWORD dwThreadId = 0;

	HANDLE hHookBocThread = CreateThread(NULL, 0, ThreadHookBoc, NULL , 0, &dwThreadId);	
}

void CCustIETools::HookInput_Boc(char cValue)
{
	if (0 == l_dwBOCPasswordBaseAddress)
	{
		PUTLOG("*  Fail to hook BOC");
		return ;
	}

	static DWORD nCall = BinaryCode_GetAddrByModule("KeyboardProtection.dll", 0x00001C7B + 0x1000);

	if (0 == nCall) {
		return ;
	}

	DWORD dwValue = (DWORD )cValue;
	if (!isprint(cValue)){
		return ;
	}

	_asm {
		pushad;
		pushfd;
		push dwValue;
		mov ecx, l_dwBOCPasswordBaseAddress;
		add ecx, 0x78;
		call nCall;
		popfd;
		popad;
	}
	return ;
}

//Memory Base
static DWORD l_nICBCPasswordCBase = 0;
static DWORD l_nICBCheckCBase = 0;

//Code Base
static DWORD l_nHookGetStringInputAddress = 0;
static DWORD l_nHookGetStringDeleteAddress = 0;
static DWORD l_nICBCInputCall1 = 0;
static DWORD l_nICBCInputCall2 = 0;
static DWORD l_nICBCDeleteCall = 0;

typedef struct _TICBCCtrl
{
	DWORD dwParam0;
	DWORD dwParam4;
	DWORD dwParam4C;
	DWORD dwParam70;
	DWORD dwParam74;
	DWORD dwParam78;
	DWORD dwParam7C;
	DWORD dwParam80;
	DWORD dwParam88;
	DWORD dwParam84;
	DWORD dwParam8C;
	DWORD dwParam90;
	DWORD dwParam94;
	DWORD dwParam98;
	DWORD dwParam9C;
	DWORD dwParamA0;
	DWORD dwParamAC;
	DWORD dwParamB4;
} TICBCCtrl;
static TICBCCtrl l_tICBCCtrl = {0};

BOOL SetTICBCCtrl(DWORD dwICBCCtrlAddr)
{
	BOOL bFlag = FALSE;
	_try
	{
		l_tICBCCtrl.dwParam0	= *(DWORD* )(dwICBCCtrlAddr + 5);
		l_tICBCCtrl.dwParam4	= *(DWORD* )(dwICBCCtrlAddr + 0xC);
		l_tICBCCtrl.dwParam4C	= *(DWORD* )(dwICBCCtrlAddr + 0x13);
		l_tICBCCtrl.dwParam70	= *(DWORD* )(dwICBCCtrlAddr + 0x1A);
		l_tICBCCtrl.dwParam74	= *(DWORD* )(dwICBCCtrlAddr + 0x21);
		l_tICBCCtrl.dwParam78	= *(DWORD* )(dwICBCCtrlAddr + 0x28);
		l_tICBCCtrl.dwParam7C	= *(DWORD* )(dwICBCCtrlAddr + 0x2F);
		l_tICBCCtrl.dwParam80	= *(DWORD* )(dwICBCCtrlAddr + 0x39);
		l_tICBCCtrl.dwParam84	= *(DWORD* )(dwICBCCtrlAddr + 0x43);
		l_tICBCCtrl.dwParam88	= *(DWORD* )(dwICBCCtrlAddr + 0x4D);
		l_tICBCCtrl.dwParam8C	= *(DWORD* )(dwICBCCtrlAddr + 0x57);
		l_tICBCCtrl.dwParam90	= *(DWORD* )(dwICBCCtrlAddr + 0x61);
		l_tICBCCtrl.dwParam94	= *(DWORD* )(dwICBCCtrlAddr + 0x6B);
		l_tICBCCtrl.dwParam98	= *(DWORD* )(dwICBCCtrlAddr + 0x75);
		l_tICBCCtrl.dwParam9C	= *(DWORD* )(dwICBCCtrlAddr + 0x7F);
		l_tICBCCtrl.dwParamA0	= *(DWORD* )(dwICBCCtrlAddr + 0x89);
		l_tICBCCtrl.dwParamAC	= *(DWORD* )(dwICBCCtrlAddr + 0x93);
		l_tICBCCtrl.dwParamB4	= *(DWORD* )(dwICBCCtrlAddr + 0x9D);
		bFlag = TRUE;
	}
	_except(1)
	{
		PUTLOG("*throw SetTICBCCtrl");
	}
	return bFlag;
}

BOOL ICBCCall_Init()
{
	BOOL bFlag = FALSE;
	CBinaryCode cBinaryCode;
	HMODULE hModule = NULL;
	CString sDeadCode = _T("8B C7 83 E8 08 0F 84 ?? ?? ?? ?? 48 0F 84 ?? ?? ?? ?? 83 E8 04 0F 84 ?? ?? ?? ?? 83 E8 0E 0F 84 ?? ?? ?? ?? 57");
	CString sDeadCodeICBCCtrlAddr = _T("56 8B F1 C7 06 ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ??");
	DWORD dwICBCCtrlAddr = 0;

	hModule = cBinaryCode.Process_GetModule(GetCurrentProcessId(), _T("InputControl.dll"));
	if (NULL != hModule)
	{
		if (
			!cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x5B, CBinaryCode::TBinaryType_VirtualAddress, l_nHookGetStringInputAddress)
			|| !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x4A, CBinaryCode::TBinaryType_Call, l_nICBCInputCall1)
			|| !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x5C, CBinaryCode::TBinaryType_Call, l_nICBCInputCall2)
			|| !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x172, CBinaryCode::TBinaryType_VirtualAddress, l_nHookGetStringDeleteAddress)
			|| !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x173, CBinaryCode::TBinaryType_Call, l_nICBCDeleteCall)
			|| !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCodeICBCCtrlAddr, 0, CBinaryCode::TBinaryType_VirtualAddress, dwICBCCtrlAddr))
		{
			PUTLOG("*SearchBinaryCodeString fail");
			goto exit;
		}
		if (dwICBCCtrlAddr != 0 && SetTICBCCtrl(dwICBCCtrlAddr)
			&& 0 != l_nHookGetStringInputAddress && 0 != l_nICBCInputCall1 && 0 != l_nICBCInputCall2
			&& 0 != l_nHookGetStringDeleteAddress && 0 != l_nICBCDeleteCall)
		{
			PUTLOG("*bFlag is true");
			bFlag = TRUE;
		}
	}
	else
	{
		PUTLOG("*hModule is null");
	}

exit:
	return bFlag;
}

static BOOL ICall_SearchCtrlBaseFromPage(DWORD dwMemoryStart, DWORD dwMemorySize, BOOL bPassword)
{
	BOOL bFlag = FALSE;
	DWORD dwAddr = 0;

	for (dwAddr = dwMemoryStart; dwAddr < dwMemoryStart + dwMemorySize - 0x100; dwAddr += 4)
	{
		_try
		{
			if (l_tICBCCtrl.dwParam0 == *(DWORD* )(dwAddr + 0)
				&& l_tICBCCtrl.dwParam4 == *(DWORD* )(dwAddr + 4)
				&& l_tICBCCtrl.dwParam4C == *(DWORD* )(dwAddr + 0x4C)
				&& l_tICBCCtrl.dwParam70 == *(DWORD* )(dwAddr + 0x70)
				&& l_tICBCCtrl.dwParam74 == *(DWORD* )(dwAddr + 0x74)
				&& l_tICBCCtrl.dwParam78 == *(DWORD* )(dwAddr + 0x78)
				&& l_tICBCCtrl.dwParam7C == *(DWORD* )(dwAddr + 0x7C)
				&& l_tICBCCtrl.dwParam80 == *(DWORD* )(dwAddr + 0x80)
				&& l_tICBCCtrl.dwParam84 == *(DWORD* )(dwAddr + 0x84)
				&& l_tICBCCtrl.dwParam88 == *(DWORD* )(dwAddr + 0x88)
				&& l_tICBCCtrl.dwParam8C == *(DWORD* )(dwAddr + 0x8C)
				&& l_tICBCCtrl.dwParam90 == *(DWORD* )(dwAddr + 0x90)
				&& l_tICBCCtrl.dwParam94 == *(DWORD* )(dwAddr + 0x94)
				&& l_tICBCCtrl.dwParam98 == *(DWORD* )(dwAddr + 0x98)
				&& l_tICBCCtrl.dwParam9C == *(DWORD* )(dwAddr + 0x9C)
				&& l_tICBCCtrl.dwParamA0 == *(DWORD* )(dwAddr + 0xA0)
				&& l_tICBCCtrl.dwParamAC == *(DWORD* )(dwAddr + 0xAC)
				&& l_tICBCCtrl.dwParamB4 == *(DWORD* )(dwAddr + 0xB4))
			{
				char* p = NULL;
				DWORD dwArg = 0;
				HWND hwnd = NULL;

				dwArg = dwAddr + 4;
				hwnd = *(HWND* )((DWORD )(dwArg + 0xB8));
				if (NULL != hwnd)
				{
					p = (char* )(*(DWORD* )(dwArg + 0xE0));
					if (bPassword)
					{
						if (0 == memcmp(p, "logonCardPass", strlen("logonCardPass") + 1))
						{
							l_nICBCPasswordCBase = dwArg;
							bFlag = TRUE;
						}
					}
					else
					{
						if (0 == memcmp(p, "verifyCode", strlen("verifyCode") + 1))
						{
							l_nICBCheckCBase = dwArg;
							bFlag = TRUE;
						}
					}
				}
				if (bFlag)
				{
					break;
				}
			}
		}
		_except(1)
		{

		}
	}

exit:
	return bFlag;
}

BOOL ICall_ICBCSearchCtrlBase()
{
	BOOL bFlag = FALSE;

	DWORD dwMemoryStart = 0;
	MEMORY_BASIC_INFORMATION  mbi = {0};
	BOOL bFindPasswordCtrl = FALSE;
	BOOL bFindVerifyCodeCtrl = FALSE;

	for (dwMemoryStart = 0x40000; dwMemoryStart <= 0x7FFFF000; dwMemoryStart += mbi.RegionSize)
	{
		VirtualQuery((LPCVOID )dwMemoryStart, &mbi, sizeof(mbi));
		if (PAGE_READWRITE == mbi.AllocationProtect && PAGE_READWRITE == mbi.Protect)
		{
			if (!bFindPasswordCtrl)
			{
				if (ICall_SearchCtrlBaseFromPage(dwMemoryStart, mbi.RegionSize, TRUE))
				{
					bFindPasswordCtrl = TRUE;
				}
			}
			if (!bFindVerifyCodeCtrl)
			{
				if (ICall_SearchCtrlBaseFromPage(dwMemoryStart, mbi.RegionSize, FALSE))
				{
					bFindVerifyCodeCtrl = TRUE;
				}
			}
			if (bFindPasswordCtrl && bFindVerifyCodeCtrl)
			{
				bFlag = TRUE;
				goto exit;
			}
		}
	}

exit:
	return bFlag;
}

DWORD __stdcall CCustIETools::ThreadHookICBC(void * param){

	static BOOL bTest = FALSE;
	if (!bTest)
	{
		while(!ICBCCall_Init()){
			PUTLOG("*Try ICBCCall_Init");
			Sleep(1000);
		}
		bTest = TRUE;
	}
	while(!ICall_ICBCSearchCtrlBase())
	{
		PUTLOG("*Try ICall_ICBCSearchCtrlBase");
		Sleep(1000);
	}
	PUTLOG("*Finished ThreadHookICBC");
	return 0;
}

void CCustIETools::Hook_ICBC()
{
	DWORD dwThreadId = 0;

	HANDLE hHookBocThread = CreateThread(NULL, 0, ThreadHookICBC, NULL , 0, &dwThreadId);	
}

void CCustIETools::HookInput_ICBC(BOOL bPasswordCtrl, char cValue)
{
	DWORD nCtrlBase = 0;
	BOOL bFlag = FALSE;
	DWORD dwValue = 0;
	DWORD dwSendValue = 0;
	static DWORD nCall3 = 0;
	HWND hwnd = NULL;
	//wait hook init ready.
	for(int j = 0; j < 21; j++)
	{
		nCtrlBase = bPasswordCtrl? l_nICBCPasswordCBase: l_nICBCheckCBase;

		if (0 != nCtrlBase)
		{
			_try
			{
				hwnd = *(HWND* )((DWORD )(nCtrlBase + 0xB8));
			} _except (1) {
				hwnd = NULL;
				PUTLOG("*throw, get hwnd error");
			}
		}
		if (NULL == hwnd)
		{
			Sleep(500);
			PUTLOG("*wait hook init ready: %d", j);
			if(j == 10)
			{
				goto exit;
			}
		}else break;
	}

	if (0 == nCall3) {
		nCall3 = (DWORD )SendMessageA;
	}
	//wait hook init ready.
	for(int i = 0; i < 11; i++)
	{
		if (0 == l_nICBCInputCall1 || 0 == l_nICBCInputCall2 || 0 == nCall3) {
			PUTLOG(("*l_nICBCInputCall1=0x%x, l_nICBCInputCall2=0x%x, nCall3=0x%x"), l_nICBCInputCall1, l_nICBCInputCall2, nCall3);
			if(i == 10)
			{
				goto exit;
			}
			Sleep(500);
		}
		else break;
	}

	dwValue = (DWORD )cValue;
	PUTLOG(("*hwnd=0x%x, dwValue=0x%x, nCtrlBase=0x%x, nCall=0x%x/0x%x/0x%x"), hwnd, dwValue, nCtrlBase, l_nICBCInputCall1, l_nICBCInputCall2, nCall3);
	if (_T('\0') == cValue) goto exit;

	dwSendValue = bPasswordCtrl? 0x2A: dwValue;

	_try
	{
		_asm {
			pushad;
			pushfd;
			MOV EAX,0;
			MOV ECX,DWORD PTR DS:[nCtrlBase];
			ADD ECX,0xBF0
				PUSH EAX;
			PUSH dwValue;
			CALL DWORD PTR DS:[l_nICBCInputCall1];
			PUSH dwValue;
			MOV ECX,DWORD PTR DS:[nCtrlBase];
			ADD ECX,0x1A0;
			CALL DWORD PTR DS:[l_nICBCInputCall2];;
			PUSH 0;
			PUSH dwSendValue;
			PUSH 0x6C8;
			PUSH hwnd;
			CALL DWORD PTR DS:[nCall3];;;
			popfd;
			popad;
		}
		bFlag = TRUE;
	} _except (1) {
		PUTLOG("*throw, inputchar");
	}

exit:
	PUTLOG("*ICall_ICBCInputChar. return %d", bFlag);
	return;
}

bool CCustIETools::Hook_Bcm(const std::string hookFilePath)
{
    return InitHook(TOUNICODE(hookFilePath)) != 0;
}

void CCustIETools::HookInput_Bcm(const char* cValue, int len)
{
    SetPassPw(cValue, len);
}

//只支持一网通 & 身份证
static int l_nPageIndex = 3;
static DWORD l_dwHookInputAddress = 0;
static DWORD l_dwInputCall = 0;
static DWORD l_dwShowCall = 0;
// static DWORD l_dwCurrentCtrlBase = 0;



typedef struct _TCMBCtrl
{
    DWORD dwParam0;
    DWORD dwParam4;
    DWORD dwParam4C;
    DWORD dwParam70;
    DWORD dwParam74;
    DWORD dwParam78;
    DWORD dwParam7C;
    DWORD dwParam80;
    DWORD dwParam84;
    DWORD dwParam88;
    DWORD dwParam8C;
    DWORD dwParam90;
    DWORD dwParam94;
} TCMBCtrl;
static TCMBCtrl l_tCMBCtrl = {0};

BOOL SetTCMBCtrl(DWORD dwICBCCtrlAddr)
{
    BOOL bFlag = FALSE;
    _try
    {
        l_tCMBCtrl.dwParam0	= *(DWORD* )(dwICBCCtrlAddr + 5);
        l_tCMBCtrl.dwParam4	= *(DWORD* )(dwICBCCtrlAddr + 0xC);
        l_tCMBCtrl.dwParam4C	= *(DWORD* )(dwICBCCtrlAddr + 0x13);
        l_tCMBCtrl.dwParam70	= *(DWORD* )(dwICBCCtrlAddr + 0x1A);
        l_tCMBCtrl.dwParam74	= *(DWORD* )(dwICBCCtrlAddr + 0x21);
        l_tCMBCtrl.dwParam78	= *(DWORD* )(dwICBCCtrlAddr + 0x28);
        l_tCMBCtrl.dwParam7C	= *(DWORD* )(dwICBCCtrlAddr + 0x2F);
        l_tCMBCtrl.dwParam80	= *(DWORD* )(dwICBCCtrlAddr + 0x39);
        l_tCMBCtrl.dwParam84	= *(DWORD* )(dwICBCCtrlAddr + 0x43);
        l_tCMBCtrl.dwParam88	= *(DWORD* )(dwICBCCtrlAddr + 0x4D);
        l_tCMBCtrl.dwParam8C	= *(DWORD* )(dwICBCCtrlAddr + 0x57);
        l_tCMBCtrl.dwParam90	= *(DWORD* )(dwICBCCtrlAddr + 0x61);
        l_tCMBCtrl.dwParam94	= *(DWORD* )(dwICBCCtrlAddr + 0x6B);
        bFlag = TRUE;
    }
    _except(1)
    {
        TRACE(_T("throw SetTCMBCtrl"));
    }
    return bFlag;
}

/************************************************************************
函数名: ICMBCall_Init
要求: 必须满足下面2个条件
1. CMBEdit.dll 加载后, 调用且仅调用一次ICall_HookCMBInput
2. 一定要先于ICall_SearchCtrlBase和ICall_HookCMBInput
************************************************************************/
extern BOOL ICMBCall_Init()
{
    BOOL bFlag = FALSE;
    CBinaryCode cBinaryCode;
    HMODULE hModule = NULL;
    CString sDeadCode = _T("7E ?? 6A 02 58 85 C0 7E ?? 57 8B F8 FF 75 FC 8B CE");
    CString sDeadCodeICBCCtrlAddr = _T("56 8B F1 C7 06 ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ?? C7 46 ?? ?? ?? ?? ??");
    DWORD dwICBCCtrlAddr = 0;

    hModule = cBinaryCode.Process_GetModule(GetCurrentProcessId(), _T("CMBEdit.dll"));
    if (NULL != hModule)
    {
        if (!cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x11, CBinaryCode::TBinaryType_VirtualAddress, l_dwHookInputAddress)
            || !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x12, CBinaryCode::TBinaryType_Call, l_dwInputCall)
            || !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCode, 0x1D, CBinaryCode::TBinaryType_Call, l_dwShowCall)
            || !cBinaryCode.SearchBinaryCodeString(hModule, (LPCTSTR )sDeadCodeICBCCtrlAddr, 0, CBinaryCode::TBinaryType_VirtualAddress, dwICBCCtrlAddr))
        {
            goto exit;
        }
        if (dwICBCCtrlAddr != 0 && SetTCMBCtrl(dwICBCCtrlAddr) && 0 != l_dwHookInputAddress && 0 != l_dwInputCall && 0 != l_dwShowCall)
        {
            bFlag = TRUE;
        }

    }

exit:
    return bFlag;
}


static DWORD l_dwCMBUsernameCBase = 0;
static DWORD l_dwCMBPasswordCBase = 0;

extern BOOL ICall_SearchCtrlBaseFromPage(DWORD dwMemoryStart, DWORD dwMemorySize, BOOL bPassword, int nCmpLine)
{
    BOOL bFlag = FALSE;
    DWORD dwAddr = 0;
    HWND hwnd = NULL;
    // 	DWORD dwCMBUsernameCBase = 0, dwCMBPasswordCBase = 0;

    if (dwMemoryStart < 0x40000) goto exit;
    for (dwAddr = dwMemoryStart; dwAddr < dwMemoryStart + dwMemorySize - 0x100; dwAddr += 4)
    {
        _try
        {
            if (l_tCMBCtrl.dwParam0 == *(DWORD* )(dwAddr + 0)
                && l_tCMBCtrl.dwParam4 == *(DWORD* )(dwAddr + 4)
                && l_tCMBCtrl.dwParam4C == *(DWORD* )(dwAddr + 0x4C)
                && l_tCMBCtrl.dwParam70 == *(DWORD* )(dwAddr + 0x70)
                && l_tCMBCtrl.dwParam74 == *(DWORD* )(dwAddr + 0x74)
                && l_tCMBCtrl.dwParam78 == *(DWORD* )(dwAddr + 0x78)
                && l_tCMBCtrl.dwParam7C == *(DWORD* )(dwAddr + 0x7C)
                && l_tCMBCtrl.dwParam80 == *(DWORD* )(dwAddr + 0x80)
                && l_tCMBCtrl.dwParam84 == *(DWORD* )(dwAddr + 0x84)
                && l_tCMBCtrl.dwParam88 == *(DWORD* )(dwAddr + 0x88)
                && l_tCMBCtrl.dwParam8C == *(DWORD* )(dwAddr + 0x8C)
                && l_tCMBCtrl.dwParam90 == *(DWORD* )(dwAddr + 0x90)
                && l_tCMBCtrl.dwParam94 == *(DWORD* )(dwAddr + 0x94)
                && NULL != (hwnd = *(HWND* )(dwAddr + 0x50))
                /*&& ::IsWindow(hwnd) && ::IsWindowVisible(hwnd)*/)
            {
                HWND hwnd = NULL;
                // 				int nLen = *(DWORD* )(dwAddr + 0x38) - *(DWORD* )(dwAddr + 0x30);
                int nTop = *(DWORD* )(dwAddr + 0x34);

                hwnd = *(HWND* )((DWORD )(dwAddr + 0x50));
                if (NULL != hwnd && nTop > 100 && nTop < 210 && ::IsWindowVisible(hwnd))
                {
                    //TRACE(_T("---------- get CMBPasswordHwnd = 0x%x"), hwnd);
                    // 					if (nLen >= 98 && nLen <= 102)
                    {
                        if (bPassword)
                        {
                            if (nTop > nCmpLine)
                            {
                                l_dwCMBPasswordCBase = dwAddr;
                                TRACE(_T("---------- get CMBPasswordCBase = 0x%x"), l_dwCMBPasswordCBase);
                                bFlag = TRUE;
                                //goto exit;
                            }
                        }
                        else
                        {
                            if (nTop < nCmpLine)
                            {
                                l_dwCMBUsernameCBase = dwAddr;
                                TRACE(_T("---------- get CMBUsernameBase = 0x%x"), l_dwCMBUsernameCBase);
                                bFlag = TRUE;
                                //goto exit;
                            }
                        }
                    }
                }
                if (bFlag)
                {
                    break;
                }
            }
        }
        _except(1){}
    }
exit:
    // 	if (!bFlag)
    // 	{
    // 		l_dwCMBUsernameCBase = 0;
    // 		l_dwCMBPasswordCBase = 0;
    // 	}
    // 	else
    // 	{
    // 		l_dwCMBUsernameCBase = dwCMBUsernameCBase;
    // 		l_dwCMBPasswordCBase = dwCMBPasswordCBase;
    // 	}
    return bFlag;
}
extern BOOL ICall_CMBSearchCtrlBase()
{
    BOOL bFlag = FALSE;

    DWORD dwMemoryStart = 0;
    MEMORY_BASIC_INFORMATION  mbi = {0};
    BOOL bFindUsernameCtrl = FALSE;
    BOOL bFindPasswordCtrl = FALSE;
    int nCmpLine = 160;

    if (l_nPageIndex == 1)
    {
        nCmpLine = 170;
    }
    // 	TRACE(_T("-------------starttime = %d"), clock());
    for (dwMemoryStart = 0x40000; dwMemoryStart <= 0x7FFFF000; dwMemoryStart += mbi.RegionSize)
    {
        VirtualQuery((LPCVOID )dwMemoryStart, &mbi, sizeof(mbi));
        TRACE(_T("dwMemoryStart=0x%x, size=0x%x, AllocationProtect=0x%x, Protect=0x%x\n"), dwMemoryStart, mbi.RegionSize, mbi.AllocationProtect, mbi.Protect);
        if (PAGE_READWRITE == mbi.AllocationProtect && PAGE_READWRITE == mbi.Protect)
        {
            if (!bFindPasswordCtrl)
            {
                if (ICall_SearchCtrlBaseFromPage(dwMemoryStart, mbi.RegionSize, TRUE, nCmpLine))
                {
                    bFindPasswordCtrl = TRUE;
                }
            }
            if (!bFindUsernameCtrl)
            {
                if (ICall_SearchCtrlBaseFromPage(dwMemoryStart, mbi.RegionSize, FALSE, nCmpLine))
                {
                    bFindUsernameCtrl = TRUE;
                }
            }
            if (bFindPasswordCtrl && bFindUsernameCtrl)
            {
                bFlag = TRUE;
                goto exit;
            }
            // 			bFlag = ICall_SearchCtrlBaseFromPage(dwMemoryStart, mbi.RegionSize);
            // 			if (bFlag) goto exit;
        }
    }

exit:
    if (!bFlag)
    {
        l_dwCMBUsernameCBase = 0;
        l_dwCMBPasswordCBase = 0;
    }
    // 	TRACE(_T("---------------endtime = %d"), clock());
    return bFlag;
}


extern BOOL CCall_CMBInputChar(DWORD dwCtrlBase, TCHAR cValue)
{
    BOOL bFlag = FALSE;
    DWORD dwValue = 0;

    if (0 == dwCtrlBase)
        goto exit;

    if (0 == l_dwInputCall) {
        goto exit;
    }

    dwValue = (DWORD )cValue;
    // 	TRACE(_T("----------cValue=%c"), cValue);
    //	TRACE("CCall_CMBInputChar, nBase=0x%x, nCall=0x%x, dwValue=%d", nBase, nCall, dwValue);
    if (_T('\0') == cValue) goto exit;

    _try
    {
        _asm {
            pushad;
            pushfd;
            push dwValue;
            mov ecx,dword ptr ds:[dwCtrlBase];
            call DWORD PTR DS:[l_dwInputCall];
            popfd;
            popad;
        }
        bFlag = TRUE;
    } _except (1) {
        TRACE("----throw, inputchar");
    }

exit:
    TRACE("CCall_CMBInputChar. return %d", bFlag);
    return bFlag;
}
void _cdecl TraceAndCollectCMBInput(DWORD dwCtrlBase, DWORD dwArg)
{
    // 	DWORD dwCurrentCtrlAddr = 0;
    int i = 0;
    char cArg = (char )dwArg;
    static DWORD dwLastUsernameCBase = 0;
    static DWORD dwLastPasswordCBase = 0;

    // 	dwCurrentCtrlAddr = *(DWORD* )l_dwCurrentCtrlBase;
    if (0 == dwCtrlBase)
    {
        goto exit;
    }
    else if (dwCtrlBase != l_dwCMBUsernameCBase && dwCtrlBase != dwLastPasswordCBase)
    {
        ICall_CMBSearchCtrlBase();
    }
    if (dwCtrlBase == l_dwCMBUsernameCBase)
    {
        if (dwLastUsernameCBase != l_dwCMBUsernameCBase)
        {
            dwLastUsernameCBase = l_dwCMBUsernameCBase;
        }
    }
    else if (dwCtrlBase == l_dwCMBPasswordCBase)
    {
        if (dwLastPasswordCBase != l_dwCMBPasswordCBase)
        {
            dwLastPasswordCBase = l_dwCMBPasswordCBase;
        }
    }
exit:
    return;
}

void __declspec(naked) CodeCMBInput(void)
{
    _asm
    {
        pushad;
        pushfd;
        push dword ptr ds:[esp+0x24];
        PUSH ECX;
        call TraceAndCollectCMBInput;
        add esp,8;
        popfd;
        popad;
        CALL DWORD PTR DS:[l_dwInputCall];
        MOV AL,1;
        push l_dwHookInputAddress;
        add dword ptr ds:[esp], 0x5;
        retn;
    }
}
extern BOOL ICall_HookCMBInput(BOOL bOpen)
{
    BOOL bFlag = FALSE;
    BYTE byValue[5] = {0xe9};
    static BYTE l_byszCMBInputSrc[5] = {0};
    static BOOL l_bCMBInputOpening = FALSE;

    // 	if (!ICall_Init()) goto exit;
    *(DWORD* )&byValue[1] = (DWORD )CodeCMBInput - (DWORD )l_dwHookInputAddress - 5;

    //get original byte set
    if (l_byszCMBInputSrc[0] == '\0')	Mem_ReadAddressByteSet(l_dwHookInputAddress, l_byszCMBInputSrc, sizeof(l_byszCMBInputSrc));

    if (bOpen)
    {
        if (!l_bCMBInputOpening) {
            TRACE("Hook");
            Mem_ModifyAddressByteSet(l_dwHookInputAddress, byValue, sizeof(byValue));
            l_bCMBInputOpening = TRUE;

        }
    } else {
        if (l_bCMBInputOpening) {
            TRACE("UnHook");
            Mem_ModifyAddressByteSet(l_dwHookInputAddress, l_byszCMBInputSrc, sizeof(l_byszCMBInputSrc));
            l_bCMBInputOpening = FALSE;
        }
    }
    //exit:
    return bFlag;
}

DWORD __stdcall CCustIETools::CMBHookThread(void * param)
{
    HWND hcallbackWnd = HWND(param);
    static BOOL bTest = FALSE;
	int hookCount1 = 0,hookCount2 = 0;
    if (!bTest)
    {
		PUTLOG("cmb ICMBCall_Init");
        while (!ICMBCall_Init() && hookCount1++ < 25){
            Sleep(200);
        }
        // 		bTest = TRUE;
    }
	PUTLOG("cmb ICall_CMBSearchCtrlBase");
    while (!ICall_CMBSearchCtrlBase() && hookCount2++ < 25){
        Sleep(200);
	}
	PUTLOG("count1 %d, count2 %d",hookCount1,hookCount2);
	if (hookCount1 > 25 || hookCount2 > 25)
	{
		Json::Value voucherMap;
		voucherMap["errmsg"] = "hook fail";
		CCustIETools::StatusReport(theApp.m_userConfig, StatusCode(LOG_FAILE_HOOK_FAIL), voucherMap.toStyledString());
		return FALSE;
	}
    if (!bTest)
    {
        ICall_HookCMBInput(TRUE);
    }
    bTest = TRUE;

    //if (hcallbackWnd!=NULL){
    //    ::PostMessage(hcallbackWnd,WM_HOOK_COMPLETE,BANK_CMB,0);
    //}
	s_bHookOK = true;
	PUTLOG("###########cmb hook done#####################");
    return TRUE;
}

void CCustIETools::CmbSelectTab( int tab)
{
    l_nPageIndex = tab;
}

bool CCustIETools::Hook_Cmb()
{
	CMBHookThread(NULL);
	return true;
}
bool CCustIETools::s_bHookOK = false;

bool CCustIETools::IsHookDone()
{
	return s_bHookOK;
}

void CCustIETools::HookInput_Cmb(bool isUsername, char cValu )
{
    DWORD dwBase  = isUsername? l_dwCMBUsernameCBase: l_dwCMBPasswordCBase;
    CCall_CMBInputChar(dwBase, cValu);
}

int CCustIETools::HandleAlerts(const std::string & jsonConfig, const std::string & alertMsg)
{
	std::string strParams;
	strParams += "if ('undefined' === typeof GlobalSettings){";
	strParams += "GlobalSettings = ";
	strParams += jsonConfig;
	strParams += "};";	
	strParams += "\r\n";

	do {
		std::ifstream ifs(CCustIETools::GetConfigPath() + "statuscode.js");
		std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
		int z = str.length();
		strParams += str;
	}while(0);

	do {
		std::ifstream ifs(CCustIETools::GetConfigPath() + "alert.js");
		std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
		int z = str.length();
		strParams += str;
	}while(0);

	do {
		std::ifstream ifs(CCustIETools::GetScriptPath() + "handler.js");
		std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
		int z = str.length();
		strParams += str;
	}while(0);
    std::string sourceMsg = alertMsg;
    CCustIETools::string_replace(sourceMsg, "\r\n", "");
    CCustIETools::string_replace(sourceMsg, "\n", "");

	strParams += "\r\n";
	strParams += "DecodeError(\'";
	strParams += sourceMsg;
	strParams += "\');";
	strParams += "\r\n";

	//OutputDebugStringA(strParams.c_str());

	std::string sResult;
	if (!CCustIETools::CallScript(strParams, sResult))
	{
		return 0;
	}else{
		return atoi(sResult.c_str());
	}
}

bool CCustIETools::CallScript(const std::string & code, std::string & result)
{
	CLSID clsidTest;
	CLSIDFromProgID(L"MSScriptControl.ScriptControl", &clsidTest);

	CComPtr<IDispatch> spDispatch;
	CoCreateInstance(clsidTest, NULL, CLSCTX_INPROC, IID_IDispatch, (void **)&spDispatch);
	if (!spDispatch){
		PUTLOG("Failed to Create script interface");
		return false;
	}
	
	// SetProperty(<Language>="JavaScript")
	do {
		//* When GetIDsOfNames is called with more than one name
		//, the first name (rgszNames[0]) corresponds to the member name
		//, and subsequent names correspond to the names of the member's parameters.
		DISPID propidLang;
		OLECHAR * propnameLang = L"Language";
		if (FAILED(spDispatch->GetIDsOfNames(IID_NULL, &propnameLang, 1, LOCALE_USER_DEFAULT, &propidLang)))
		{
			PUTLOG("Failed to get <Language> attribute");
			return false;
		}

		DISPPARAMS dispParams = {NULL, NULL, 0, 0};
		VARIANT vpLang;
		VariantInit(&vpLang);
		vpLang.vt = VT_BSTR;
		vpLang.bstrVal = CComBSTR("JavaScript");
		dispParams.cArgs = 1;
		dispParams.rgvarg = &vpLang;
		dispParams.cNamedArgs = 1;
		DISPID dispidNamed = DISPID_PROPERTYPUT;
		dispParams.rgdispidNamedArgs = &dispidNamed;

		VARIANT vResult;
		VariantInit(&vResult);

		EXCEPINFO e;
		UINT argErr = 0;
		HRESULT hr = S_OK;
		if(hr = (spDispatch->Invoke(propidLang, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT | DISPATCH_METHOD, &dispParams, &vResult, &e, &argErr)))
		{
			PUTLOG("Failed to invoke to setup <Language>");
			return false;
		}
		hr = hr;
	}while(0);

		
	// CallMethod("Eval('expression')");
	do {
		//* When GetIDsOfNames is called with more than one name
		//, the first name (rgszNames[0]) corresponds to the member name
		//, and subsequent names correspond to the names of the member's parameters.
		DISPID propid;
		OLECHAR * propname = L"Eval";
		if (FAILED(spDispatch->GetIDsOfNames(IID_NULL, &propname, 1, LOCALE_USER_DEFAULT, &propid)))
		{
			PUTLOG("Failed to get <Eval> attribute");
			return 0;
		}

		DISPPARAMS dispParams = {NULL, NULL, 0, 0};
		VARIANT varg;
		VariantInit(&varg);
		varg.vt = VT_BSTR;
		CComBSTR bstrCode = TOUNICODE(code);
		varg.bstrVal = bstrCode;
		dispParams.cArgs = 1;
		dispParams.rgvarg = &varg;
		dispParams.cNamedArgs = 0; // it is not required while calling method.
		DISPID dispidNamed = DISPID_PROPERTYPUT;
		dispParams.rgdispidNamedArgs = &dispidNamed;

		VARIANT vResult;
		VariantInit(&vResult);

		EXCEPINFO e;
		UINT argErr = 0;
		HRESULT hr = S_OK;
		if(hr = (spDispatch->Invoke(propid, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT | DISPATCH_METHOD, &dispParams, &vResult, &e, &argErr)))
		{
			_com_error err(hr);
			PUTLOG("Failed to <Eval>, error: %s", TOANSI(err.ErrorMessage()));
			return false;
		}
		if (vResult.vt == VT_BSTR){
			result = TOANSI(vResult.bstrVal ? vResult.bstrVal : L"");
		}else if (vResult.vt == VT_I4 ){
			char szBuf [100] = "";
			itoa(vResult.intVal, szBuf, 10);
			result = szBuf;
		}else{
			PUTLOG("Unsupported return type.");
			return false;
		}
	}while(0);

	return true;
}

BOOL __stdcall CCustIETools::EnumChildProc(HWND hwnd, LPARAM lParam)
{
	char szClassName [100] = "";
	struct FindChildParam * fcParam = (struct FindChildParam *)lParam;
	GetClassNameA(hwnd, szClassName, sizeof(szClassName));
	if (!strcmp(szClassName, fcParam->className)){
		PUTLOG("* Found child window handle by [%s]", szClassName);
		fcParam->target = hwnd;
		return FALSE; // STOP
	}
	return TRUE ; // go on
}

HWND CCustIETools::FindChildWindow(HWND hParent, const std::string & className)
{
	struct FindChildParam fcparam;
	fcparam.target = NULL;
	fcparam.className = className.c_str();
	EnumChildWindows(hParent, CCustIETools::EnumChildProc, (LPARAM)&fcparam);
	return fcparam.target;
}

bool CCustIETools::SetElementFocus(const std::string & sElementTag)
{
	HWND hChild = FindChildWindow(AfxGetApp()->m_pMainWnd->GetSafeHwnd(), sElementTag);
	if (!hChild){
		PUTLOG("* Failed to find child window by [%s]", sElementTag.c_str());
		return false;
	}

	if (!IsWindowEnabled(hChild)){
		return false;
	}
	
	GUITHREADINFO gti;
	memset(&gti, 0, sizeof(gti));
	gti.cbSize = sizeof(gti);

	GetGUIThreadInfo(0, &gti);

	char className [100] = "";
	GetClassNameA(gti.hwndFocus, className, 100);
	PUTLOG("* original class name %s", className);

	char className2 [100] = "";
	GetClassNameA(hChild, className2, 100);
	PUTLOG("* child class name %s", className2);

	if (TRUE){
		PUTLOG("* Set focus on edit control, %p, %p", gti.hwndFocus, hChild);
		::SendMessage(hChild, WM_SETFOCUS, 0, 0);
	}else{
		PUTLOG("* edit control already focused");
	}

	PUTLOG("* OK to set focus, className=[%s]", sElementTag.c_str());
	return true;
}

DWORD __stdcall CCustIETools::ThreadDelayMessage(void * param)
{
	struct DelayMessage * dm = (struct DelayMessage *) param;
	if (dm->delayMs == 0){
		PUTLOG("* Failed as of delay timeout is invalid");
		free(dm); dm = NULL;
		return 0;
	}

	CMainFrame * pMainFrame = (CMainFrame *)(AfxGetApp()->m_pMainWnd);
	if (pMainFrame == NULL){
		PUTLOG("* Failed as of CMainFrame is NULL");
		free(dm); dm = NULL;
		return 0;
	}
	
	if (dm->msgId == 0){
		PUTLOG("* Failed as of msg id is invalid");
		free(dm); dm = NULL;
		return 0;
	}

	PUTLOG("* Sleep for a while [%u]ms", dm->delayMs);
	::Sleep(dm->delayMs);

	PUTLOG("* Post message to main frame, msg id[%u]", dm->msgId);
	pMainFrame->PostMessage(dm->msgId);

	free(dm); dm = NULL;

	return 0;
}

bool CCustIETools::DelayWindowMessage(unsigned int dwMsgId, unsigned int delayMills)
{
	struct DelayMessage * dm = (struct DelayMessage *)malloc(sizeof(struct DelayMessage));
	dm->delayMs = delayMills;
	dm->msgId = dwMsgId;
	DWORD dwThreadId = 0;
	HANDLE hDelayThread = CreateThread(NULL, 0, ThreadDelayMessage, dm, 0, &dwThreadId);
	return true;
}

bool CCustIETools::GetHttpOnlyCookie(const std::string & url, const std::string & cookieName, std::string & cookieData)
{
	//https://msdn.microsoft.com/en-us/library/windows/desktop/aa384714(v=vs.85).aspx
	//You can pass NULL for lpszCookieName to get all of the cookies for the specified URL. 
	//They are returned in a single long string with a semicolon and space between each pair, just like in an HTTP header.
	wchar_t wszCookieData [4096] = L"";
	DWORD dwCookieSize = sizeof(wszCookieData)/sizeof(wszCookieData[0]);
	BOOL fRet = InternetGetCookieExW(TOUNICODE(url.c_str())
							, cookieName.empty() ? NULL : TOUNICODE(cookieName)/*L"SPDB_PER_SESSIONID",*/ /*L"SPDB_NET_SESSIONID",*/
							, wszCookieData
							, &dwCookieSize
							, INTERNET_COOKIE_HTTPONLY
							, NULL);
	if (*wszCookieData && dwCookieSize){
		cookieData = TOANSI(wszCookieData);
		//PUTLOG("* Cookie [%s]", TOANSI(wszCookieData));
	}
    if (!fRet)
    {
        PUTLOG("get cookie error:%ld",GetLastError());
    }
	return (fRet == TRUE);
}

bool CCustIETools::StatusReport(const Json::Value & gset, unsigned int statusCode, const std::string & sJsonParams)
{
	if(statusCode == LOG_FAILE_OCR && SetOcrFrom("?") == "front")
	{
		statusCode = LOG_FAILE_FOCRERR;
	}
	if(statusCode == LOG_FAILE_PHONEOCR && SetOcrFrom("?") == "back")
	{
		statusCode = LOG_FAILE_FOCRERR;
	}
	if(statusCode == LOG_FAILE_AUTOLOGOUT && SetOcrFrom("?") == "auto")
	{
		statusCode = LOG_FAILE_OCR;
	}

	//Ref: doc
	/*
	{
		"org":"cncb",
		"reqId":"zzzzz",
		"status":4010,
		"taskey":"TASK:xxxxxx",
		"voucherMap":{}
	}
	*/
	Json::Value jsonReqBody;
	jsonReqBody["org"] = gset["type"].asString();
	jsonReqBody["reqId"] = gset["reqid"].asString();
	jsonReqBody["taskey"] = gset["taskkey"].asString();
	jsonReqBody["status"] = statusCode;

	Json::Value jsonParams;
	Json::Reader reader;
	if (!reader.parse(sJsonParams, jsonParams) || !jsonParams.isObject()){
		reader.parse("{}", jsonParams);
	}
	// C++ native params
	jsonParams["botid"] = (int)::GetCurrentProcessId();
	
	// Trim right
	if (jsonParams.isObject() && jsonParams.isMember("errmsg")){

		std::string errmsg = TOUTF8(TOUNICODE(jsonParams["errmsg"].asString()));

		if(statusCode == LOG_FAILE_AUTOLOGOUT && SetOcrFrom("?") == "auto")
		{
			errmsg = "Get error ocr result from auto platform.";
		}

		// Base64 encode it, to safely transfer MB string;
		jsonParams["errmsg"] = Base64Encode(errmsg);
	}


	jsonReqBody["voucherMap"] = jsonParams;

	std::string sHost = gset["host"].asString();
	std::string sRequest = jsonReqBody.toStyledString();
	std::string sResp;

	// ccb voucherMap contain user info, not print 
	std::string pStr = sRequest;
	if (statusCode == LOG_SUCCESS)
	{
		Json::Value printJsonReqBody = jsonReqBody;
		printJsonReqBody.removeMember("voucherMap");
		pStr = printJsonReqBody.toStyledString();
	}
	PUTLOG("* [ReportStatus]\r\n" \
			" Target: [%s]\r\n" \
			" Info ==> %s\r\n"
			, sHost.c_str()
			, pStr.c_str());

	if (!HttpPostJson(sHost, TOUTF8(TOUNICODE(sRequest)), sResp)){
		PUTLOG("* Failed notify status [%u] to Host[%s]", statusCode, sHost.c_str());
	}else{
		PUTLOG("* Ok to foward status to dog.");
	}

	switch(statusCode){
	case StatusCode(LOG_TRACE):
		{
			PUTLOG("* Trace script log");
		}break;
	case StatusCode(WAIT_VCODE):
		{
			PUTLOG("* LoginBot is working");
		}break;
	case StatusCode(WAIT_TOKEN_CODE):
		{
			PUTLOG("* LoginBot is working");
		}break;
	case StatusCode(WAIT_OCR):
		{
			PUTLOG("* LoginBot is waiting front ocr result.");
		}break;
	case StatusCode(LOG_FAILE_PFOCRERR):
		{
			PUTLOG("* LoginBot get ocr error in phone step, ICBC. but jumped ,not kill bot.");
		}break;
	case StatusCode(TASK_WORKING):
		{
			PUTLOG("* waiting for phone code");
		}break;
	case StatusCode(OPEN_SUCCESS):
		{
			PUTLOG("* LoginBot created");
		}break;
	default:
		{
			if(statusCode == WAIT_OUTTIME || statusCode == LOG_FAILE_UNDEF || statusCode == LOG_FAILE_ERRORINPUT)
			{
				if(statusCode == WAIT_OUTTIME)
				{
					PUTLOG("* Error 504, try to dump html and save screenshot");
				}
				if(statusCode == LOG_FAILE_UNDEF)
				{
					PUTLOG("* Error 4999, try to dump html and save screenshot");
				}
				if(statusCode == LOG_FAILE_ERRORINPUT)
				{
					PUTLOG("* Error 4201, try to dump html and save screenshot");
				}
				// Dump the html file and save screen for analyze
				((CCustIEView*)((CMainFrame*)AfxGetMainWnd())->GetActiveView())->DumpHTMLAndSaveScreen();
			}
			// Quit LoginBot
			PUTLOG("* Quit LoginBot as StatusCode: [%u]", statusCode);
			Exit(true);
			//AfxGetApp()->m_pMainWnd->PostMessage(WM_CLOSE, 0, 0);
		}break;
	}
	return true;
}

bool CCustIETools::ActiveWindowByMouseEvent(HWND hWnd)
{
	RECT rect = {0, 0, 0, 0};
	::GetWindowRect(hWnd, &rect);

	int x = (rect.left + rect.right)>>1;
	int y = (rect.top  + (GetSystemMetrics(SM_CYCAPTION)));

	enum {
		MOUSEEVENT_MOVE = (0x0001),
		MOUSEEVENT_ABSOLUTE = (0x8000),
	};

	unsigned int nDesktopX = 800;
	unsigned int nDesktopY = 600;
	do {
		nDesktopX = GetSystemMetrics(SM_CXSCREEN);
		nDesktopY = GetSystemMetrics(SM_CYSCREEN);
	} while (0);

	/*
	* Something about !ABSOLUTE
	* 1) you move mouse 10mm on your desktop slowly;
	* 2) you move back mouse 10mm on your desktop fast;
	* 3) Does the mouse go back to its original position?
	* 4) that is because Acceleration take effects.
	* 5) Acceleration algorithm reference 3 parameters, threshold1, threshold2, and level
	* 6) relative distance is [0, threshold1) and level != 0, x2
	* 7) relative distance is [threshold1, threshold2), and level == 2, x4
	* 8) Done of explanation.
	*/
	do {
		POINT pt; memset(&pt, 0, sizeof(pt));
		GetCursorPos(&pt);
		PUTLOG("ClickWindowTitle: current postion: pt.x=%u; pt.y=%u\n", pt.x, pt.y);
	} while (0);

	/*
	* About Parameters x & y
	* mouse move is between [0, 65535];
	* if you want to move by logical pixels of desktop, 
	* you need caculate map between (x/MaxXPixelsOfDesktop * 65535) or (y/MaxYPixelsOfDesktop * 65535)
	*/
	mouse_event( MOUSEEVENT_MOVE | MOUSEEVENT_ABSOLUTE
		, static_cast<unsigned int>(1.0f * x / nDesktopX * 65535)
		, static_cast<unsigned int>(1.0f * y / nDesktopY * 65536)
		, 0, 0);

	do {
		POINT pt; memset(&pt, 0, sizeof(pt));
		GetCursorPos(&pt);
		PUTLOG("ClickWindowTitle: current position: pt.x=%u; pt.y=%u\n", pt.x, pt.y);
	} while (0);

	mouse_event(MOUSEEVENTF_LEFTDOWN  | MOUSEEVENTF_LEFTUP | MOUSEEVENT_ABSOLUTE
		, 0 // ignored when click
		, 0 // ignored when click
		, 0, 0);

	return true;
}

bool CCustIETools::SuspendProc(DWORD dwProcId)
{
#if 0
	HANDLE hThreadSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
	THREADENTRY32 threadEntry; 
	threadEntry.dwSize = sizeof(THREADENTRY32);
	Thread32First(hThreadSnapshot, &threadEntry);
	do {
		if (threadEntry.th32OwnerProcessID == dwProcId)
		{
			HANDLE hThread = OpenThread(THREAD_ALL_ACCESS, FALSE, threadEntry.th32ThreadID);
			SuspendThread(hThread);
			CloseHandle(hThread);
		}
	} while (Thread32Next(hThreadSnapshot, &threadEntry));
	CloseHandle(hThreadSnapshot);
	return true;
#else
	typedef LONG (NTAPI *NtSuspendProcess)(IN HANDLE ProcessHandle);
	HANDLE processHandle = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcId);
	NtSuspendProcess pfnNtSuspendProcess 
		= (NtSuspendProcess)GetProcAddress(GetModuleHandleA("ntdll"), "NtSuspendProcess");
	pfnNtSuspendProcess(processHandle);
	CloseHandle(processHandle);
	return true;
#endif
}

bool CCustIETools::ResumeProc(DWORD dwProcId)
{
#if 0
	HANDLE hThreadSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
	THREADENTRY32 threadEntry; 
	threadEntry.dwSize = sizeof(THREADENTRY32);
	Thread32First(hThreadSnapshot, &threadEntry);
	do {
		if (threadEntry.th32OwnerProcessID == dwProcId)
		{
			HANDLE hThread = OpenThread(THREAD_ALL_ACCESS, FALSE, threadEntry.th32ThreadID);
			ResumeThread(hThread);
			CloseHandle(hThread);
		}
	} while (Thread32Next(hThreadSnapshot, &threadEntry));
	CloseHandle(hThreadSnapshot);
	return true;
#else
	typedef LONG (NTAPI * NtResumeProcess )( HANDLE ProcessHandle );
	HANDLE processHandle = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcId);
	NtResumeProcess pfnNtResumeProcess 
		= (NtResumeProcess)GetProcAddress(GetModuleHandleA("ntdll"), "NtResumeProcess");
	pfnNtResumeProcess(processHandle);
	CloseHandle(processHandle);
	return true;
#endif
}

bool CCustIETools::IsDesktopLocked()   
{   
	typedef HDESK (WINAPI *PFNOPENDESKTOP)(LPSTR, DWORD, BOOL, ACCESS_MASK);
	typedef BOOL (WINAPI *PFNCLOSEDESKTOP)(HDESK);
	typedef BOOL (WINAPI *PFNSWITCHDESKTOP)(HDESK);
    // note: we can't call OpenInputDesktop directly because it's not   
    // available on win 9x   
    bool bLocked = FALSE;    
    // load user32.dll once only   
    HMODULE hUser32 = LoadLibrary(_T("user32.dll"));    
    if (hUser32)   
    {   
        PFNOPENDESKTOP fnOpenDesktop = (PFNOPENDESKTOP)GetProcAddress(hUser32, "OpenDesktopA");   
        PFNCLOSEDESKTOP fnCloseDesktop = (PFNCLOSEDESKTOP)GetProcAddress(hUser32, "CloseDesktop");   
        PFNSWITCHDESKTOP fnSwitchDesktop = (PFNSWITCHDESKTOP)GetProcAddress(hUser32, "SwitchDesktop");     
        if (fnOpenDesktop && fnCloseDesktop && fnSwitchDesktop)   
        {   
            HDESK hDesk = fnOpenDesktop("Default", 0, FALSE, DESKTOP_SWITCHDESKTOP);     
            if (hDesk)   
            {   
                bLocked = !fnSwitchDesktop(hDesk);   
                // cleanup   
                fnCloseDesktop(hDesk);   
            }   
        }   
    } 
	if (hUser32 != NULL){
		FreeLibrary(hUser32);
		hUser32 = NULL;
	}
    return bLocked;  
} 

bool CCustIETools::UnlockConsole()
{
	std::vector<std::string> args;
	args.push_back("1");
	args.push_back("/dest:console");
	unsigned int exitCode = 0;
	// http://stackoverflow.com/questions/7003981/createprocess-fails-under-windows-7
	Fork("c:\\windows\\SysNative\\tscon.exe", args, true, &exitCode);
	return exitCode == 0;
}

bool CCustIETools::SuspendProcByName(const std::string & procName, bool fSuspend)
{
	DWORD aProcesses[1024]; 
	DWORD cbNeeded; 
	DWORD cProcesses;
	unsigned int i;

	// Get the list of process identifiers.

	if ( !EnumProcesses( aProcesses, sizeof(aProcesses), &cbNeeded ) )
		return false;

	// Calculate how many process identifiers were returned.

	cProcesses = cbNeeded / sizeof(DWORD);

	// Print the names of the modules for each process.

	for ( i = 0; i < cProcesses; i++ )
	{
		DWORD dwProcId =  aProcesses[i];
		if (dwProcId == GetCurrentProcessId()){
			continue;
		}

		HANDLE processHandle = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwProcId);

		if (processHandle == NULL){
			continue;
		}
		char szProcName [MAX_PATH] = "";
		GetProcessImageFileNameA(processHandle, szProcName, MAX_PATH);
		CloseHandle(processHandle);

		char szBaseName [MAX_PATH] = "";
		const char * pBaseName = strrchr(szProcName, '\\');
		if (pBaseName != NULL){
			strcpy(szBaseName, ++pBaseName);
		}
		PUTLOG("* Check process: %s\r\n", szBaseName);
		if (!stricmp(szBaseName, procName.c_str())){
			PUTLOG("* %s process: %s, pid=%d\r\n", fSuspend ? "Suspend" : "Resume", szBaseName, dwProcId);
			if (fSuspend)
				SuspendProc(dwProcId);
			else
				ResumeProc(dwProcId);
		}
	}

	return true;
}

bool CCustIETools::OpenFileLog(const std::string & sBankId, const std::string & sTaskKey)
{
	std::string sLogDir = theApp.GetLogDir();
	if (!sLogDir.empty()){
		if (!::PathFileExistsA(sLogDir.c_str())){
			::SHCreateDirectoryExA(NULL, sLogDir.c_str(), NULL);
		}
	}

	char szLogPath [512] = "";
	/*
	* Log file name format:
	* %temp%\LoginBot-20160101.ccb.11112222333344445556666.log
	*
	*/
	SYSTEMTIME now;
	GetLocalTime(&now);
	sprintf(szLogPath, "%s\\LoginBot-%04d-%02d-%02d.%s.%s.log"
		, sLogDir.c_str()
		, now.wYear
		, now.wMonth
		, now.wDay
		, sBankId.c_str()
		, sTaskKey.c_str());

	if (m_logfd != NULL){
		fclose(m_logfd);
		m_logfd = NULL;
	}

	m_logfd = fopen(szLogPath, "a");

	return true;
}

bool CCustIETools::CloseFileLog()
{
	if (m_logfd != NULL){
		fclose(m_logfd);
		m_logfd = NULL;
	}
	return true;
}

std::string CCustIETools::GetUrlDomain(const std::string & url)
{
	std::string::size_type pos1 = url.find("://");
	if (pos1 != std::string::npos){
		std::string::size_type pos2 = url.find("/", pos1 + 3);
		if (pos2 != std::string::npos){
			return url.substr(pos1 + 3, pos2 - (pos1 + 3));
		}else{
			return url.substr(pos1 + 3);
		}
	}
	return "";
}
bool CCustIETools::ClearHistoryCookies(const std::string & domain)
{
	enum {
		MAX_CACHE_ENTRY_INFO_SIZE = 4096,
	};

	DWORD dwEntrySize = MAX_CACHE_ENTRY_INFO_SIZE;
	INTERNET_CACHE_ENTRY_INFOA * entry = (LPINTERNET_CACHE_ENTRY_INFOA)malloc(dwEntrySize);
	entry->dwStructSize = dwEntrySize;

	HANDLE hCacheDir = FindFirstUrlCacheEntryA(NULL, entry, &dwEntrySize);
	if (! hCacheDir ) {
		free(entry); entry = NULL;
		return false;
	}

	do {
		if (entry->lpszLocalFileName != NULL 
			&& (entry->CacheEntryType & COOKIE_CACHE_ENTRY)
			&& entry->lpszSourceUrlName != NULL) {
			if (strstr(entry->lpszSourceUrlName, domain.c_str())){
				PUTLOG("* Cookie Entry: %s for url: %s domain: %s", entry->lpszLocalFileName, entry->lpszSourceUrlName, domain.c_str());
				if (DeleteFileA(entry->lpszLocalFileName)){
					PUTLOG("* Delete history cookie for domain: %s", domain.c_str());
				}
			}
		}
		free(entry); entry = NULL;

		dwEntrySize = MAX_CACHE_ENTRY_INFO_SIZE;
		entry = (LPINTERNET_CACHE_ENTRY_INFOA)malloc(dwEntrySize);
		entry->dwStructSize = dwEntrySize;
	} while ( FindNextUrlCacheEntryA(hCacheDir, entry, &dwEntrySize) );

	free(entry); entry = NULL;

	FindCloseUrlCache(hCacheDir);
	return true;
}

void CCustIETools::ClearSslState()
{
	typedef BOOL (__stdcall * SSL_EMPTY_CACHE_FN_A) (LPSTR, DWORD);
	typedef BOOL (__stdcall * SSL_EMPTY_CACHE_FN_W) (LPWSTR, DWORD);
	typedef BOOL (__stdcall * INCREMENTURLCACHEHEADERDATA_FN) (DWORD, LPDWORD);

	SSL_EMPTY_CACHE_FN_W pfnSslEmptyCacheW = NULL;
	INCREMENTURLCACHEHEADERDATA_FN pfnIncrementUrlCacheHeaderData = NULL;
	HMODULE hSchannel; 
	HMODULE hWinInet; 
	DWORD dwData;
	hSchannel = ::LoadLibrary(_T("schannel.dll"));

	if (hSchannel)
		pfnSslEmptyCacheW = (SSL_EMPTY_CACHE_FN_W) ::GetProcAddress(hSchannel, "SslEmptyCache");
	hWinInet = ::LoadLibrary(_T("wininet.dll"));

	if (hWinInet)
		pfnIncrementUrlCacheHeaderData = (INCREMENTURLCACHEHEADERDATA_FN) ::GetProcAddress(hWinInet, "IncrementUrlCacheHeaderData");

	if (pfnSslEmptyCacheW) 
		pfnSslEmptyCacheW (NULL, 0);

	if (pfnIncrementUrlCacheHeaderData) 
		pfnIncrementUrlCacheHeaderData(14, &dwData);

	if (hSchannel)
		FreeLibrary(hSchannel);

	if (hWinInet)
		FreeLibrary(hWinInet);
}

void CCustIETools::ScreenShot(std::string& strFileName)  
{  
	CWnd *pDesktop = CWnd::GetDesktopWindow();  
	CDC *pdeskdc = pDesktop->GetDC();  
	CRect re;  
	//获取窗口的大小  
	pDesktop->GetClientRect(&re);  
	CBitmap bmp;  
	bmp.CreateCompatibleBitmap(pdeskdc, re.Width(), re.Height());  
	//创建一个兼容的内存画板  
	CDC memorydc;  
	memorydc.CreateCompatibleDC(pdeskdc);  
	//选中画笔  
	CBitmap *pold = memorydc.SelectObject(&bmp);  
	//绘制图像  
	memorydc.BitBlt(0, 0, re.Width(), re.Height(), pdeskdc, 0, 0, SRCCOPY);  
	//获取鼠标位置，然后添加鼠标图像  
	CPoint po;  
	GetCursorPos(&po);  
	HICON hinco = (HICON)GetCursor();  
	memorydc.DrawIcon(po.x - 10, po.y - 10, hinco);  
	//选中原来的画笔  
	memorydc.SelectObject(pold);  
	BITMAP bit;  
	bmp.GetBitmap(&bit);  
	//定义 图像大小（单位：byte）  
	DWORD size = bit.bmWidthBytes * bit.bmHeight;  
	LPSTR lpdata = (LPSTR)GlobalAlloc(GPTR, size);  
	//后面是创建一个bmp文件的必须文件头  
	BITMAPINFOHEADER pbitinfo;  
	pbitinfo.biBitCount = 24;  
	pbitinfo.biClrImportant = 0;  
	pbitinfo.biCompression = BI_RGB;  
	pbitinfo.biHeight = bit.bmHeight;  
	pbitinfo.biPlanes = 1;  
	pbitinfo.biSize = sizeof(BITMAPINFOHEADER);  
	pbitinfo.biSizeImage = size;  
	pbitinfo.biWidth = bit.bmWidth;  
	pbitinfo.biXPelsPerMeter = 0;  
	pbitinfo.biYPelsPerMeter = 0;  
	GetDIBits(pdeskdc->m_hDC, bmp, 0, pbitinfo.biHeight, lpdata, (BITMAPINFO*)  
		&pbitinfo, DIB_RGB_COLORS);  
	BITMAPFILEHEADER bfh;  
	bfh.bfReserved1 = bfh.bfReserved2 = 0;  
	bfh.bfType = ((WORD)('M' << 8) | 'B');  
	bfh.bfSize = size + 54;  
	bfh.bfOffBits = 54;  
	//写入文件  
	CFile file;  
	CString bmpFileName(strFileName.c_str());
	if (file.Open((LPCTSTR)bmpFileName, CFile::modeCreate | CFile::modeWrite))  
	{  
		file.Write(&bfh, sizeof(BITMAPFILEHEADER));  
		file.Write(&pbitinfo, sizeof(BITMAPINFOHEADER));  
		file.Write(lpdata, size);  
		file.Close();  
		//转换成PNG
		CString oldbmpFileName(strFileName.c_str());
		bmpFileName.Replace(_T(".bmp"), _T(".png"));
		if(BMptoPNG(oldbmpFileName,bmpFileName))
		{
			DeleteFile(oldbmpFileName);
			PUTLOG("* Dump png file to [%s]", ToAnsiString(bmpFileName.GetString()).c_str());
		}
		else
		{
			PUTLOG("* Fail to convert bmp to png image format");
		}
	}
	else
	{
		PUTLOG("* Fail to open dump file to store bmp");
	}
	GlobalFree(lpdata);  
}

BOOL CCustIETools::GetEncoderClsid(WCHAR* pFormat,CLSID* pClsid)
{
	UINT num = 0,size = 0;
	ImageCodecInfo* pImageCodecInfo = NULL;
	GetImageEncodersSize(&num,&size);
	if (size == 0)
	{
		return FALSE;
	}
	pImageCodecInfo = (ImageCodecInfo*)(malloc(size));
	if (pImageCodecInfo == NULL)
	{
		return FALSE;
	}
	GetImageEncoders(num,size,pImageCodecInfo);
	BOOL bfound = FALSE;
	for (UINT i = 0;!bfound && i < num;  i++)
	{
		if (_wcsicmp(pImageCodecInfo[i].MimeType,pFormat) == 0)
		{
			*pClsid = pImageCodecInfo[i].Clsid;
			bfound = TRUE;
		}
	}
	free(pImageCodecInfo);
	return bfound;
}

BOOL CCustIETools::BMptoPNG(LPCWSTR StrBMp,LPCWSTR StrPNG)
{
	CLSID encoderClsid;
	Status stat;
	Image* image = NULL;
	image = Bitmap::FromFile(StrBMp,TRUE);
	if (!GetEncoderClsid(L"image/png",&encoderClsid))
	{
		return FALSE;
	}
	stat = image->Save(StrPNG,&encoderClsid,NULL);
	if (stat != Ok)
	{
		return FALSE;
	}
	delete image;
	return TRUE;
}

bool CCustIETools::needLock()
{
    std::string sBankId = theApp.m_userConfig["type"].asString();
	std::string sLoginType = theApp.m_userConfig["logintype"].asString();
	std::string sSubType = theApp.m_userConfig["subtype"].asString();
	if (sBankId == ORG_CCB){
		return false;
	}
	if (sBankId == ORG_ICBC){
		return false;
	}
	if (sBankId == ORG_BCM){
		return false;
	}
	return true;
}

int CCustIETools::GenerateMiniDump(std::string& szPath, HANDLE hFile, PEXCEPTION_POINTERS pExceptionPointers)
{
	BOOL bOwnDumpFile=FALSE;
	HANDLE hDumpFile=hFile;

	typedef BOOL (WINAPI* MiniDumpWriteDump)(HANDLE,DWORD,HANDLE,MINIDUMP_TYPE,PMINIDUMP_EXCEPTION_INFORMATION,
		PMINIDUMP_USER_STREAM_INFORMATION,PMINIDUMP_CALLBACK_INFORMATION);
	MiniDumpWriteDump pfnMiniDumpWriteDump=NULL;
	HMODULE hDbgHelp = LoadLibraryA("DbgHelp.dll");
	if(hDbgHelp)
		pfnMiniDumpWriteDump=(MiniDumpWriteDump)GetProcAddress(hDbgHelp,"MiniDumpWriteDump");

	if(pfnMiniDumpWriteDump)
	{
		if(NULL==hDumpFile || INVALID_HANDLE_VALUE==hDumpFile)
		{
			char szFileName[MAX_PATH]={0};
			SYSTEMTIME stLocalTime;
			GetLocalTime(&stLocalTime);
			CreateDirectoryA(szPath.c_str(),NULL);

			std::string sBankId = theApp.m_userConfig["type"].asString();
			std::string taskeyname = theApp.m_userConfig["reqid"].asString();

			sprintf_s(szFileName,MAX_PATH,"%s//%s.%s-%04d%02d%02d.%u.dmp",
				szPath.c_str(),sBankId.c_str(),taskeyname.c_str(),
				stLocalTime.wYear,stLocalTime.wMonth,stLocalTime.wDay,(unsigned int)time(NULL));
			hDumpFile=CreateFileA(szFileName,GENERIC_READ|GENERIC_WRITE,FILE_SHARE_WRITE|FILE_SHARE_READ,0,CREATE_ALWAYS,0,0);
			bOwnDumpFile=TRUE;
		}

		if(INVALID_HANDLE_VALUE!=hDumpFile){
			MINIDUMP_EXCEPTION_INFORMATION ExpParam;
			ExpParam.ThreadId=GetCurrentThreadId();
			ExpParam.ExceptionPointers=pExceptionPointers;
			ExpParam.ClientPointers=FALSE;
			pfnMiniDumpWriteDump(GetCurrentProcess(),GetCurrentProcessId(),
				hDumpFile,MiniDumpWithDataSegs,(pExceptionPointers ? &ExpParam : NULL), NULL, NULL);
			if(bOwnDumpFile)
				CloseHandle(hDumpFile);
		}
	}

	if(hDbgHelp != NULL)
		FreeLibrary(hDbgHelp);

	return EXCEPTION_EXECUTE_HANDLER;
}

LONG WINAPI CCustIETools::ExceptionFilter(LPEXCEPTION_POINTERS lpExceptionInfo)
{
	std::string sAppPath = CCustIETools::GetAppPath();
	sAppPath += "LoginBot.ini";
	char szKey [MAX_PATH] = "";
	GetPrivateProfileStringA("default", "LoginBotDmpPath", "", szKey, sizeof(szKey), sAppPath.c_str());
	std::string szPath=szKey;
	if(szPath.empty())
		return EXCEPTION_CONTINUE_SEARCH;

	if(IsDebuggerPresent()){
		return EXCEPTION_CONTINUE_SEARCH;
	}

	return GenerateMiniDump(szPath, NULL,lpExceptionInfo);
}

int CCustIETools::GetPasswordLength(const std::string & bankid)
{
	if (bankid == "cebc"){
		//TODO: use EnumWindowEx to find child target window;
		HWND hWnd = ::FindWindowExA(AfxGetMainWnd()->m_hWnd, NULL, "AfxFrameOrView100u", NULL);
		if (hWnd != NULL) hWnd = ::FindWindowExA(hWnd, NULL, NULL, NULL);
		if (hWnd != NULL) hWnd = ::FindWindowExA(hWnd, NULL, NULL, NULL);
		if (hWnd != NULL) hWnd = ::FindWindowExA(hWnd, NULL, NULL, NULL);
		if (hWnd != NULL) hWnd = ::FindWindowExA(hWnd, NULL, NULL, NULL);
		if (hWnd != NULL) hWnd = ::FindWindowExA(hWnd, NULL, NULL, NULL);
		if (hWnd != NULL){
			char szText [MAX_PATH] = "";
			::SendDlgItemMessageA(GetParent(hWnd), GetWindowLong(hWnd, GWL_ID), WM_GETTEXT, MAX_PATH, (LPARAM)szText);
			return strlen(szText);
		}
	}
	return -1;
}

#ifdef USE_DETOURS
DWORD CCustIETools::CustIE_InternetSetCookieExW( LPCWSTR lpszUrl, LPCWSTR lpszCookieName, LPCWSTR lpszCookieData, DWORD dwFlags, DWORD_PTR dwReserved )
{
	if (lpszCookieName){
		PUTLOG("* [%s]: CookieName: [%s]", TOANSI(__FUNCTIONW__), TOANSI(lpszCookieName));
	}
	if (lpszCookieData){
		PUTLOG("* [%s]: Cookie: [%s]", TOANSI(__FUNCTIONW__), TOANSI(lpszCookieData));
	}
	return CCustIETools::Real_InternetSetCookieExW(lpszUrl, lpszCookieName, lpszCookieData, dwFlags, dwReserved);
}

BOOL CCustIETools::CustIE_InternetSetCookieW( LPCWSTR lpszUrl, LPCWSTR lpszCookieName, LPCWSTR lpszCookieData )
{
	return CCustIETools::Real_InternetSetCookieW(lpszUrl, lpszCookieName, lpszCookieData);
}

DWORD CCustIETools::CustIE_InternetSetCookieExA( LPCSTR lpszUrl, LPCSTR lpszCookieName, LPCSTR lpszCookieData, DWORD dwFlags, DWORD_PTR dwReserved )
{
	return CCustIETools::Real_InternetSetCookieExA(lpszUrl, lpszCookieName, lpszCookieData, dwFlags, dwReserved);
}

BOOL CCustIETools::CustIE_InternetSetCookieA( LPCSTR lpszUrl, LPCSTR lpszCookieName, LPCSTR lpszCookieData )
{
	return CCustIETools::Real_InternetSetCookieA(lpszUrl, lpszCookieName, lpszCookieData);
}

BOOL CCustIETools::CustIE_InternetGetCookieExW(LPCWSTR lpszUrl, LPCWSTR lpszCookieName, LPWSTR lpszCookieData, LPDWORD lpdwSize,  DWORD dwFlags,  LPVOID lpReserved )
{
	BOOL fRet = CCustIETools::Real_InternetGetCookieExW(lpszUrl, lpszCookieName, lpszCookieData, lpdwSize, dwFlags, lpReserved);
	if (lpszCookieName){
		PUTLOG("* CookieName: [%s]", TOANSI(lpszCookieName));
	}
	if (lpszCookieData != NULL && lpdwSize){
		PUTLOG("* Cookie: [%s]", TOANSI(lpszCookieData));
	}
	return fRet;
}

BOOL CCustIETools::CustIE_InternetGetCookieExA(LPCSTR lpszUrl, LPCSTR lpszCookieName, LPSTR lpszCookieData, LPDWORD lpdwSize,  DWORD dwFlags,  LPVOID lpReserved )
{
	return CCustIETools::Real_InternetGetCookieExA(lpszUrl, lpszCookieName, lpszCookieData, lpdwSize, dwFlags, lpReserved);
}

int WINAPI CCustIETools::CustIE_MessageBoxW( HWND hWnd,  LPCWSTR lpText,  LPCWSTR lpCaption,  UINT    uType)
{
	PUTLOG("MessageBoxW[%s][%s]", TOANSI(lpText), TOANSI(lpCaption)); 
	return IDOK;

}

int WINAPI CCustIETools::CustIE_MessageBoxA( HWND hWnd,  LPCSTR lpText,  LPCSTR lpCaption,  UINT    uType)
{
	PUTLOG("MessageBoxA[%s][%s]", (lpText), (lpCaption)); 
	return IDOK;
}

HHOOK WINAPI CCustIETools::CustIE_SetWindowsHookExA(  int idHook, HOOKPROC  lpfn, HINSTANCE hMod, DWORD dwThreadId)
{
	PUTLOG("CustIE_SetWindowsHookExA: HookProc: %p", lpfn); 
	HHOOK hhk = Real_SetWindowsHookExA(   idHook,   lpfn,  hMod,  dwThreadId);
	return hhk;
}

HHOOK WINAPI CCustIETools::CustIE_SetWindowsHookExW(  int idHook, HOOKPROC  lpfn, HINSTANCE hMod, DWORD dwThreadId)
{
	PUTLOG("CustIE_SetWindowsHookExW: HookProc: %p", lpfn); 
	HHOOK hhk = Real_SetWindowsHookExW(   idHook,   lpfn,  hMod,  dwThreadId);
	return hhk;
}

#endif
