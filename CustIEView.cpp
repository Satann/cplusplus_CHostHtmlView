
// CustIEView.cpp : implementation of the CCustIEView class
//

#include "stdafx.h"
// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "CustIE.h"
#endif

#include "CustIEDoc.h"
#include "DocHostHtmlView.h"
#include "CustIEView.h"

#include "CustIETools.h"

#include <direct.h>  
#include <io.h>  

// CCustIEView

IMPLEMENT_DYNCREATE(CCustIEView, CDocHostHtmlView)

BEGIN_MESSAGE_MAP(CCustIEView, CDocHostHtmlView)
	ON_WM_PARENTNOTIFY()
	ON_WM_TIMER()
END_MESSAGE_MAP()

// CCustIEView construction/destruction

CCustIEView::CCustIEView()
{
	// TODO: add construction code here
	m_pHtmlDoc = NULL;
}

CCustIEView::~CCustIEView()
{
}

BOOL CCustIEView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	return CDocHostHtmlView::PreCreateWindow(cs);
}

HRESULT CCustIEView::OnShowMessage(HWND hwnd,
	LPOLESTR lpstrText,
	LPOLESTR lpstrCaption,
	DWORD dwType,
	LPOLESTR lpstrHelpFile,
	DWORD dwHelpContext,
	LRESULT * plResult)
{
	if (!lpstrText) return S_OK;
	std::string alertStr = TOANSI(lpstrText);
	PUTLOG("alert content length: %d:", std::wstring(lpstrText).size());
	PUTLOG("Alert: [%s]", alertStr.c_str());
	Json::Value loginState;
	loginState["lstate"] = "LoginBot";
	loginState["Alert"] = alertStr.c_str();
	Json::Value voucherMap;
	voucherMap["errmsg"] = "";
	voucherMap["loginState"] = loginState;
	CCustIETools::StatusReport(theApp.m_userConfig, StatusCode(LOG_TRACE), voucherMap.toStyledString());

	if (dwType & MB_ABORTRETRYIGNORE) *plResult = IDABORT;
	else if ((dwType & MB_YESNO )|| (dwType & MB_YESNOCANCEL)) *plResult = IDYES;
	else *plResult = IDCANCEL;

	// Handle alerts in script
	int statusCode = (CCustIETools::HandleAlerts(theApp.m_userConfig.toStyledString(), alertStr.c_str()));

	if (statusCode){
		PUTLOG("* Catch alert error.");
		Json::Value voucherMap;
		voucherMap["errmsg"] = alertStr.c_str();
		CCustIETools::StatusReport(theApp.m_userConfig, statusCode, voucherMap.toStyledString());
	}

	return S_OK;
}

#pragma warning(disable:4996)
void CCustIEView::OnDocumentComplete(LPCTSTR lpszURL)
{
	InjectScript(lpszURL);
}

void CCustIEView::InjectScript(LPCTSTR lpszURL)
{
	std::string szUrl=TOANSI(lpszURL);
	PUTLOG("* Loading Page, URL: [%s]", szUrl.c_str());
	if(szUrl=="about:blank")
		return;

	m_pHtmlDoc = GetHtmlDocument();
	CComPtr<IHTMLDocument2> spDoc2 = NULL;
	m_pHtmlDoc->QueryInterface(IID_IHTMLDocument, (void **)&spDoc2);

	BSTR bstrStat = NULL;
	std::string strState;
	spDoc2->get_readyState(&bstrStat);
	if (bstrStat){
		PUTLOG("* State: [%s]", TOANSI(bstrStat));
		strState = TOANSI(bstrStat);
		SysFreeString(bstrStat);
	}

	BSTR bstrCookie = NULL;
	spDoc2->get_cookie(&bstrCookie);
	if (bstrCookie){
		//PUTLOG("* Cookie: [%s]", TOANSI(bstrCookie));
		SysFreeString(bstrCookie);
	}

	// TODO: more strict, only load script for LoginUrl, PhoneUrl & WelcomeUrl
	if ( lpszURL && !wcsicmp(lpszURL, L"javascript:false") ){
		PUTLOG("* Skip [%s]", TOANSI(lpszURL));
		return ;
	}

	if ( strState == "complete" ) {
        std::string sBankId = theApp.m_userConfig["type"].asString();
		std::string sLoginType = theApp.m_userConfig["logintype"].asString();
		//PUTLOG("* sBankId=[%s]", sBankId.c_str());
		if(sBankId==ORG_ABC){
			do {
				CCustIETools::Hook_Abc();
			}while(0);
		}
		if(sBankId==ORG_BOC){
			do {
				CCustIETools::Hook_Boc();
			}while(0);
		}
		if(sBankId==ORG_ICBC){
			do {
				CCustIETools::Hook_ICBC();
			}while(0);
		}

		do {
			std::string userConfig = "";
			userConfig += "if ('undefined' === typeof GlobalSettings) { ";
			userConfig += "    GlobalSettings = ";
			userConfig +=      theApp.m_userConfig.toStyledString();
			userConfig += "};";
			// Bug: url is not taken effect in next call;
			// PUTLOG("* Loading script: %s", userConfig.c_str());
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), userConfig, false);
		} while (0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "json.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: json.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "utility.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: utility.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetConfigPath() + "statem.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: statem.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetConfigPath() + "statuscode.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: statuscode.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetConfigPath() + "banks.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: banks.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetConfigPath() + "alert.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: alert.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);	

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "login.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: login.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "phone.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: phone.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "token.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: token.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "handler.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: handler.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "monitor.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: monitor.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		do{
			std::ifstream ifs(CCustIETools::GetScriptPath() + "main.js");
			std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
			int z = str.length();
			PUTLOG("* Loading script: main.js");
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), str, false);
		}while(0);

		if (true){
			std::string strStartupCode = "";
			strStartupCode += "Main('" ;
			strStartupCode += TOANSI(lpszURL);
			strStartupCode += "');";
			PUTLOG("* Loading script: %s", strStartupCode.c_str());
			CCustIETools::LoadScript(CComPtr<IDispatch>(GetHtmlDocument()), strStartupCode, false);
		}
	} 
	return;
}

HRESULT CCustIEView::OnShowContextMenu(DWORD dwID, LPPOINT ppt,
	LPUNKNOWN pcmdtReserved, LPDISPATCH pdispReserved)
{
	return S_OK; // disable context menu to show.
	//return CHtmlView::OnShowContextMenu(dwID, ppt, pcmdtReserved, pdispReserved);
}

void CCustIEView::OnInitialUpdate()
{
	PUTLOG("CCustIEView::OnInitialUpdate()");
	CDocHostHtmlView::OnInitialUpdate();

	Json::Value & userConfig = theApp.m_userConfig;
	std::string sBankId = "";
	if (userConfig.isObject() && userConfig.isMember("type")) {
		sBankId = userConfig["type"].asString();
	}
	std::string sSubType = "";
	if (userConfig.isObject() && userConfig.isMember("subtype")) {
		sSubType = userConfig["subtype"].asString();
	}
	if (sBankId == ORG_BCM && sSubType != SUBTYPE_CREDIT)
	{
        auto i = CCustIETools::Hook_Bcm(CCustIETools::GetHookPath() + "bcm.xy");
        PUTLOG("hook bcm result: %d", i);
	}
	std::string sLoginUrl = theApp.GetUrlSetting(sBankId, "loginUrl", sSubType);
	if (!sLoginUrl.empty()){
		if (sBankId == ORG_CCB){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);
		}
		if (sBankId == ORG_ICBC){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);
		}
		if (sBankId == ORG_BOSH){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);
		}
		if (sBankId == ORG_CGB){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);

			CCustIETools::ClearSslState();
		}
		if (sBankId == ORG_CIB){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);
		}
		if (sBankId == ORG_BCM && sSubType == SUBTYPE_CREDIT){
			std::string sDomain = CCustIETools::GetUrlDomain(sLoginUrl);
			PUTLOG("* Try to clear cookie for domain: %s", sDomain.c_str());
			CCustIETools::ClearHistoryCookies(sDomain);
		}
		if (sBankId == ORG_BOC){
			PUTLOG("* Try to expires boc cookie");
			InternetSetCookieA("https://ebsnew.boc.cn/", NULL, "; expires=Thu, 01-Jan-1970 00:00:01 GMT");
		}
		Navigate2(TOUNICODE(sLoginUrl.c_str()), 0, 0);
	}
	else {
		//PrintHelp();
		Json::Value voucherMap;
		voucherMap["errmsg"] = "Not found type:" +sBankId;
		CCustIETools::StatusReport(theApp.m_userConfig, StatusCode(LOG_FAILE_NOTFINDTYPE), voucherMap.toStyledString());
	}
}

void CCustIEView::PrintHelp()
{
	const std::string strPageContent = "<h1> LoginBot.exe </h1>" \
		"<ul>" \
		"<li>--type:    bank id</li>" \
		"<li>--subtype: sub type</li>" \
		"<li>--user:    username</li>" \
		"<li>--pass:    password</li>" \
		"<li>--taskkey: task key</li>" \
		"<li>--reqid:   request id</li>" \
		"<li>--host:    address of callback host</li>" \
		"<li>--ocrpath: note if use captcha human bypass</li>" \
		"</ul>" 		
		;

	std::string stmp = CCustIETools::GetTempFilePath("loginBot", "html", true);

	std::ofstream fout;
	fout.open(stmp.c_str(), std::ios::out|std::ios::binary);
	fout.write(strPageContent.c_str(), strPageContent.length());
	fout.close();

	Navigate2(TOUNICODE(stmp));
}

HRESULT CCustIEView::OnGetExternal(LPDISPATCH *lppDispatch)
{
	*lppDispatch = theApp.GetExternalDispatch();
	return S_OK;
}

// CCustIEView diagnostics

#ifdef _DEBUG
void CCustIEView::AssertValid() const
{
	CDocHostHtmlView::AssertValid();
}

void CCustIEView::Dump(CDumpContext& dc) const
{
	CDocHostHtmlView::Dump(dc);
}

CCustIEDoc* CCustIEView::GetDocument() const // non-debug version is inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CCustIEDoc)));
	return (CCustIEDoc*)m_pDocument;
}
#endif //_DEBUG


// CCustIEView message handlers


void CCustIEView::OnParentNotify(UINT message, LPARAM lParam)
{
	CDocHostHtmlView::OnParentNotify(message, lParam);

	if ((LOWORD(message) == WM_DESTROY) && ((HWND)lParam == m_wndBrowser))
	{
		GetParentFrame()->PostMessage(WM_CLOSE, 0, 0);
	}
}

void CCustIEView::OnNavigateComplete2(LPCTSTR lpszURL)
{
	// TODO: Add your specialized code here and/or call the base class
	PUTLOG("* Navigate done: [%s]", TOANSI(lpszURL));
	CDocHostHtmlView::OnNavigateComplete2(lpszURL);
}

void CCustIEView::OnBeforeNavigate2(LPCTSTR lpszURL, DWORD nFlags, LPCTSTR lpszTargetFrameName, CByteArray& baPostedData, LPCTSTR lpszHeaders, BOOL* pbCancel)
{
	PUTLOG("* Try to navigate frame [%s] to url [%s]", TOANSI(lpszTargetFrameName), TOANSI(lpszURL));
	// TODO: Add your specialized code here and/or call the base class
	CDocHostHtmlView::OnBeforeNavigate2(lpszURL, nFlags, lpszTargetFrameName, baPostedData, lpszHeaders, pbCancel);
}

bool CCustIEView::GetHtml(bool fRoot, CComPtr<IHTMLDocument2> & spDoc2, std::string & shtml) 
{
	std::string sBankId = theApp.m_userConfig["type"].asString();
	if(sBankId==ORG_CMBC){
		CComPtr<IHTMLElementCollection> elementCollection;
		spDoc2->get_all(&elementCollection);

		long numberOfElements = 0;
		elementCollection->get_length(&numberOfElements);
		for (long i=0;i<numberOfElements;i++)
		{
			_variant_t index = i;
			CComPtr<IHTMLElement> htmlElem;
			CComPtr<IDispatch> htmlElemDisp;
			HRESULT hResult = elementCollection->item( index,index ,(IDispatch **) &htmlElemDisp );
			if (FAILED(hResult) || (!(htmlElemDisp)))
			{
				continue;
			}
			hResult = htmlElemDisp->QueryInterface( IID_IHTMLElement ,(void **) &htmlElem);
			if (FAILED(hResult) || (!(htmlElem)))
			{
				continue;
			}
			BSTR buffer;
			hResult = htmlElem->get_outerHTML(&buffer);

			if (FAILED(hResult) || (!(buffer)))
			{
				continue;
			}
			shtml += TOANSI(buffer);
			LocalFree(buffer);
		}
		return true;
	}
	if (false){
		// Bug: of CHtmlView::GetSource(),
		// which can NOT correctly process UTF-8,
		// as html1 = GetSource() is not equal to curl url -o html2
		CString strSource;
		GetSource(strSource);
		shtml = TOANSI(strSource.GetBuffer());
	}else{
		CComPtr<IHTMLElement> spBody = NULL;
		spDoc2->get_body(&spBody);
		if (spBody == NULL){
			PUTLOG("* Invalid body element");
			return false;
		}
		BSTR bstrHtml = NULL;
		spBody->get_innerHTML(&bstrHtml);
		if (bstrHtml == NULL)
			return false;
		shtml += TOANSI(bstrHtml);
		LocalFree(bstrHtml);
	}

	// Second, Recursively call in all child frames.
	CComPtr<IHTMLFramesCollection2> spFrameCollection;
	spDoc2->get_frames(&spFrameCollection);
	long nFrameCount = 0;
	if (spFrameCollection) {
		spFrameCollection->get_length(&nFrameCount);
	}

	PUTLOG("* Frames Count: %d", nFrameCount);
	if (nFrameCount == 0){
		return false;
	}

	for (long i = 0; i < nFrameCount; i++) {
		CComVariant varFrame; CComVariant varIndex(i);
		if (SUCCEEDED(spFrameCollection->item(&varIndex, &varFrame))
			&& varFrame.vt == VT_DISPATCH
			&& varFrame.pdispVal)
		{
			CComQIPtr<IHTMLWindow2> spFrameWin = varFrame.pdispVal;
			if (spFrameWin == NULL){
				PUTLOG("* Child frame is NULL");
				return false;
			}
			CComPtr<IHTMLDocument2> spFrameHtmlDoc = NULL;
			spFrameWin->get_document(&spFrameHtmlDoc);
			if (!spFrameHtmlDoc) {
				PUTLOG("* ChildFrame document is NULL");
				continue;
			}
			BSTR bstrName = NULL;
			spFrameWin->get_name(&bstrName);
			std::string sFrameName = bstrName ? TOANSI(bstrName) : "";
			if (bstrName){
				LocalFree(bstrName); bstrName = NULL;
			}
			// Recursive
			PUTLOG("* Get Body element of frame[%d]", i);

			shtml += "\n\n\n\n======================";
			shtml += "child frame [";
			shtml += sFrameName;
			shtml += "] content dump";
			shtml += "======================\n\n\n\n";
			
			GetHtml(false, spFrameHtmlDoc, shtml);
		}
	}
	return true;
}

void CCustIEView::DumpHTMLAndSaveScreen()
{
	// TODO: show bot window before screenshot

	// Dump the html file for analyze
	std::string shtml = "";
	CComPtr<IHTMLDocument2> spDoc2 = NULL;
	GetHtmlDocument()->QueryInterface(IID_IHTMLDocument2, (void**) &spDoc2);
	this->GetHtml(true, spDoc2, shtml);
	std::string sPrefix = theApp.GetBankId();
	sPrefix += ".";
	sPrefix += theApp.GetTaskKey();
	std::string savePath = theApp.GetHTMLandScreenShotPath();
	//if the driver specified in config file is not existed, replace the driver to C 
	int res = savePath.find(":");
	if(res != std::string::npos)
	{
		std::string sDriver = savePath.substr(0,res + 1);
		if(_access(sDriver.c_str(), 0))
		{
			savePath.replace(0, res+1, "C:");
		}
	}

	if(!CCustIETools::CreatDir(savePath.c_str()))
	{
		PUTLOG("* Fail to create HTMLandScreenshot folder.");
	}
	std::string sHtmlPath = CCustIETools::GetFilePath(savePath, sPrefix, "html", true);
	FILE * fout = fopen(sHtmlPath.c_str(), "w");
	if (fout != NULL){
		fwrite(shtml.c_str(),1, shtml.length(), fout);
		fclose(fout);
		PUTLOG("* Dump html file to [%s]", sHtmlPath.c_str());
	}else{
		PUTLOG("* Fail to open dump file to store html");
	}
	// Create screenshot;
	std::string sbmpPath = CCustIETools::GetFilePath(savePath, sPrefix, "bmp", true);
	CCustIETools::ScreenShot(sbmpPath);
}
