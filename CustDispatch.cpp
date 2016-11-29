/*
 * idispimp.CPP
 * IDispatch for Extending Dynamic HTML Object Model
 *
 * Copyright (c)1995-1999 Microsoft Corporation, All Rights Reserved
 */ 

#include "stdafx.h"
#include "CustDispatch.h"

#include "CustIE.h"

#include "CustIETools.h"
#include "MainFrm.h"

CString cszCB_GetVCodeText = _T("GetVCodeText");
CString cszCB_GetLock = _T("GetLock");
CString cszCB_ReleaseLock = _T("ReleaseLock");
CString cszCB_ActiveWindow = _T("ActiveWindow");
CString cszCB_KeyInput = _T("KeyInput");
CString cszCB_IsKeyInputDone = _T("IsKeyInputDone");
CString cszCB_ReportStatus = _T("ReportStatus");
CString cszCB_QueryVCode = _T("QueryVCode");
CString cszCB_SetOcrFrom = _T("SetOcrFrom");
CString cszCB_SetOcrCount = _T("SetOcrCount");
CString cszCB_SendInputPW = _T("SendInputPW");
CString cszCB_QueryPhoneCode = _T("QueryPhoneCode");
CString cszCB_Exit = _T("Exit");
CString cszCB_SetElementFocus = _T("SetElementFocus");
CString cszCB_GetHttpOnlyCookie = _T("GetHttpOnlyCookie");
CString cszCB_PutLog = _T("PutLog");
CString cszCB_StartBoshTime = _T("StartBoshTime");
CString cszCB_GetPasswordLength = _T("GetPasswordLength");
CString cszCB_StartPsbcTime = _T("StartPsbcTime");


#define DISPID_CB_GetVCodeText 1
#define DISPID_CB_GetLock 2
#define DISPID_CB_ActiveWindow 3
#define DISPID_CB_KeyInput 4
#define DISPID_CB_IsKeyInputDone 6
#define DISPID_CB_ReportStatus 7
#define DISPID_CB_QueryVCode 9
#define DISPID_CB_QueryPhoneCode 10
#define DISPID_CB_Exit 11
#define DISPID_CB_SetElementFocus 12
#define DISPID_CB_GetHttpOnlyCookie 13
#define DISPID_CB_PutLog 14
#define DISPID_CB_ReleaseLock 15
#define DISPID_CB_StartBoshTime 16
#define DISPID_CB_SetOcrFrom 17
#define DISPID_CB_SendInputPW 18
#define DISPID_CB_SetOcrCount 19
#define DISPID_CB_GetPasswordLength 20
#define DISPID_CB_StartPsbcTime 21

/*
 * CImpIDispatch::CImpIDispatch
 * CImpIDispatch::~CImpIDispatch
 *
 * Parameters (Constructor):
 *  pSite           PCSite of the site we're in.
 *  pUnkOuter       LPUNKNOWN to which we delegate.
 */ 

CImpIDispatch::CImpIDispatch( void )
{
    m_cRef = 0;
}

CImpIDispatch::~CImpIDispatch( void )
{
	ASSERT( m_cRef == 0 );
}

/*
 * CImpIDispatch::QueryInterface
 * CImpIDispatch::AddRef
 * CImpIDispatch::Release
 *
 * Purpose:
 *  IUnknown members for CImpIDispatch object.
 */ 

STDMETHODIMP CImpIDispatch::QueryInterface( REFIID riid, void **ppv )
{
    *ppv = NULL;

    if ( IID_IDispatch == riid )
	{
        *ppv = this;
	}
	
	if ( NULL != *ppv )
    {
        ((LPUNKNOWN)*ppv)->AddRef();
        return NOERROR;
    }

	return E_NOINTERFACE;
}


STDMETHODIMP_(ULONG) CImpIDispatch::AddRef(void)
{
    return ++m_cRef;
}

STDMETHODIMP_(ULONG) CImpIDispatch::Release(void)
{
    return --m_cRef;
}


//IDispatch
STDMETHODIMP CImpIDispatch::GetTypeInfoCount(UINT* /*pctinfo*/)
{
	return E_NOTIMPL;
}

STDMETHODIMP CImpIDispatch::GetTypeInfo(
			/* [in] */ UINT /*iTInfo*/,
            /* [in] */ LCID /*lcid*/,
            /* [out] */ ITypeInfo** /*ppTInfo*/)
{
	return E_NOTIMPL;
}

STDMETHODIMP CImpIDispatch::GetIDsOfNames(
			/* [in] */ REFIID riid,
            /* [size_is][in] */ OLECHAR** rgszNames,
            /* [in] */ UINT cNames,
            /* [in] */ LCID lcid,
            /* [size_is][out] */ DISPID* rgDispId)
{
	HRESULT hr = NOERROR;
	UINT	i = 0;
	for ( i = 0; i < cNames; i++) {
		CString cszName  = rgszNames[i];

		if (cszName == cszCB_GetLock)
		{
			rgDispId[i] = DISPID_CB_GetLock;
		}
		/*else if (cszName == cszCB_ReleaseLock)
		{
			rgDispId[i] = DISPID_CB_ReleaseLock;
		}*/
		else if (cszName == cszCB_ActiveWindow)
		{
			rgDispId[i] = DISPID_CB_ActiveWindow;
		}
		else if (cszName == cszCB_KeyInput)
		{
			rgDispId[i] = DISPID_CB_KeyInput;
		}
		else if (cszName == cszCB_IsKeyInputDone)
		{
			rgDispId[i] = DISPID_CB_IsKeyInputDone;
		}
		else if (cszName == cszCB_GetVCodeText)
		{
			rgDispId[i] = DISPID_CB_GetVCodeText;
		}
		else if (cszName == cszCB_ReportStatus)
		{
			rgDispId[i] = DISPID_CB_ReportStatus;
		}
		else if (cszName == cszCB_QueryVCode)
		{
			rgDispId[i] = DISPID_CB_QueryVCode;
		}
		else if (cszName == cszCB_SetOcrFrom)
		{
			rgDispId[i] = DISPID_CB_SetOcrFrom;
		}
		else if (cszName == cszCB_SetOcrCount)
		{
			rgDispId[i] = DISPID_CB_SetOcrCount;
		}
		else if (cszName == cszCB_SendInputPW)
		{
			rgDispId[i] = DISPID_CB_SendInputPW;
		}
		else if (cszName == cszCB_QueryPhoneCode)
		{
			rgDispId[i] = DISPID_CB_QueryPhoneCode;
		}
		else if (cszName == cszCB_Exit)
		{
			rgDispId[i] = DISPID_CB_Exit;
		}
		else if (cszName == cszCB_SetElementFocus)
		{
			rgDispId[i] = DISPID_CB_SetElementFocus;
		}
		else if (cszName == cszCB_GetHttpOnlyCookie)
		{
			rgDispId[i] = DISPID_CB_GetHttpOnlyCookie;
		}
		else if (cszName == cszCB_PutLog)
		{
			rgDispId[i] = DISPID_CB_PutLog;
		}
		else if (cszName == cszCB_StartBoshTime)
		{
			rgDispId[i] = DISPID_CB_StartBoshTime;
		}
		else if (cszName == cszCB_GetPasswordLength)
		{
			rgDispId[i] = DISPID_CB_GetPasswordLength;
		}
		else if (cszName == cszCB_StartPsbcTime)
		{
			rgDispId[i] = DISPID_CB_StartPsbcTime;
		}
		else {
			// One or more are unknown so set the return code accordingly
			hr = ResultFromScode(DISP_E_UNKNOWNNAME);
			rgDispId[i] = DISPID_UNKNOWN;
		}
	}
	return hr;
}

STDMETHODIMP CImpIDispatch::Invoke(
            /* [in] */ DISPID dispIdMember,
            /* [in] */ REFIID /*riid*/,
            /* [in] */ LCID /*lcid*/,
            /* [in] */ WORD wFlags,
            /* [out][in] */ DISPPARAMS* pDispParams,
            /* [out] */ VARIANT* pVarResult,
            /* [out] */ EXCEPINFO* /*pExcepInfo*/,
            /* [out] */ UINT* puArgErr)
{
	HRESULT hr = S_OK;

	if (dispIdMember == DISPID_CB_GetLock)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			bool fStat = CCustIETools::GetKeyInputLock();

			if (pVarResult != NULL) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}

	/*
	if (dispIdMember == DISPID_CB_ReleaseLock)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			bool fStat = CCustIETools::ReleaseKeyInputLock();

			if (pVarResult != NULL) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}
	*/
	
	if (dispIdMember == DISPID_CB_ActiveWindow)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			bool fStat = CCustIETools::ActiveWindow(/*fFocus*/);

			if (pVarResult != NULL) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}

	if (dispIdMember == DISPID_CB_KeyInput)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			//arguments come in reverse order
			//for some reason
			bool isInputVcode = false;
			int nInputInterval;
			CString sValue;
			if(pDispParams->cArgs > 2)
			{
				nInputInterval = pDispParams->rgvarg[2].intVal;
				sValue = pDispParams->rgvarg[1].bstrVal;
				isInputVcode= pDispParams->rgvarg[0].boolVal;
			}else{
				nInputInterval = pDispParams->rgvarg[1].intVal;
				sValue = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy
			}
			bool fStat = true;
			if (nInputInterval == 0){
                PUTLOG("******************** hook*****************************");
				std::string strValue = TOANSI(sValue.GetBuffer());

                std::string sType = "";
                std::string sSubType = "";
                std::string sLoginType = "";
				if (theApp.m_userConfig.isObject() && theApp.m_userConfig.isMember("type")){
					sType = theApp.m_userConfig["type"].asString();
                }
                if (theApp.m_userConfig.isObject() && theApp.m_userConfig.isMember("subtype")){
                    sSubType = theApp.m_userConfig["subtype"].asString();
                }
                if (theApp.m_userConfig.isObject() && theApp.m_userConfig.isMember("logintype")){
                    sLoginType = theApp.m_userConfig["logintype"].asString();
                }
				if (sType == ORG_ABC){
					for (std::string::iterator it = strValue.begin(); it != strValue.end(); it++){
						CCustIETools::HookInput_Abc(*it);
					}
				}else if (sType == ORG_BCM && sSubType != SUBTYPE_CREDIT){
                    CCustIETools::HookInput_Bcm(strValue.c_str(), strValue.length());
				}else if (sType == ORG_BOC){
					for (std::string::iterator it = strValue.begin(); it != strValue.end(); it++){
						if(*it != ' '){
							CCustIETools::HookInput_Boc(*it);
						}
					}
				}else if (sType == ORG_ICBC){
					for (std::string::iterator it = strValue.begin(); it != strValue.end(); it++){
						CCustIETools::HookInput_ICBC(!isInputVcode, *it);
					}
				}else if (sType == ORG_CMB && !(sSubType == SUBTYPE_CREDIT && sLoginType == LOGINTYPE_CARDNUM))
				{
					if (sLoginType == LOGINTYPE_PIDNUM)
					{
						CCustIETools::CmbSelectTab(1);
					}
					if (!CCustIETools::IsHookDone())
					{
						PUTLOG("hook cmb");
						do {
							CCustIETools::Hook_Cmb();
						}while(0);
					}

                    if (!theApp.m_userConfig.isMember("CmbUserInputDone")){
						theApp.m_userConfig["CmbUserInputDone"]="ok";
                        for (std::string::iterator it = strValue.begin(); it != strValue.end(); it++){
                            CCustIETools::HookInput_Cmb(true, *it);
                        }
					}
                    else
                        for (std::string::iterator it = strValue.begin(); it != strValue.end(); it++){
                            CCustIETools::HookInput_Cmb(false, *it);
                        }
						PUTLOG("* CMB Input done");
				}else{
					PUTLOG("* Hook not supported");
				}
				PUTLOG("* Notify KeyInput done");
				CCustIETools::SetKeyInputDone();

				PUTLOG("* Release KeyInput Lock, TID: %u", GetCurrentThreadId());
				CCustIETools::ReleaseKeyInputLock();
			}else{
				fStat = CCustIETools::KeyInput(nInputInterval, TOANSI(sValue.GetBuffer()), true);
			}

			if (pVarResult != NULL) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}

	if (dispIdMember == DISPID_CB_IsKeyInputDone)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			bool fStat = CCustIETools::IsKeyInputDone();
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}

	if (dispIdMember == DISPID_CB_GetVCodeText)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			unsigned int ocrpath =  pDispParams->rgvarg[5].uintVal;
			PUTLOG("Pra ocrpath[%u]",ocrpath);
			CString sBankId = pDispParams->rgvarg[4].bstrVal; // in case you want a CString copy
			PUTLOG("Pra sBankId[%s]",TOANSI(sBankId.GetBuffer()));
			CComQIPtr<IHTMLElement2> spBody = pDispParams->rgvarg[3].pdispVal; // document.getElementById("");
			CComQIPtr<IHTMLElement> spElement = pDispParams->rgvarg[2].pdispVal; // document.getElementById("");

			int width = pDispParams->rgvarg[1].intVal;
			int height = pDispParams->rgvarg[0].intVal;
			PUTLOG("Image width[%d], height[%d]", width, height);

			std::string text = CCustIETools::GetVCodeTextByClip(ocrpath, TOANSI(sBankId.GetBuffer()), spBody, spElement, width, height);
			if (text.empty()){
				text = CCustIETools::GetVCodeText(ocrpath, TOANSI(sBankId.GetBuffer()), spElement, width, height);
			}

			CString strText = TOUNICODE(text.c_str());

			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strText.AllocSysString();
			}
		}
	}
	
	if (dispIdMember == DISPID_CB_ReportStatus)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			unsigned int statusCode = pDispParams->rgvarg[1].uintVal; // in case you want a CString copy
			CString strJsonParams = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			bool fStat = CCustIETools::StatusReport(theApp.m_userConfig, statusCode, TOANSI(strJsonParams.GetBuffer()));

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_QueryVCode)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sReqId = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			PUTLOG("OCR By [%s]", TOANSI(sReqId.GetBuffer()));

			std::string response = CCustIETools::QueryVCode(TOANSI(sReqId.GetBuffer()));

			CString strVCode = TOUNICODE(response.c_str());

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strVCode.AllocSysString();
			}
		}
	}
	if (dispIdMember == DISPID_CB_SetOcrFrom)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sOcrFrom = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			PUTLOG("sOcrFrom [%s]", TOANSI(sOcrFrom.GetBuffer()));

			std::string response = CCustIETools::SetOcrFrom(TOANSI(sOcrFrom.GetBuffer()));

			CString strValue = TOUNICODE(response.c_str());

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strValue.AllocSysString();
			}
		}
	}
	if (dispIdMember == DISPID_CB_SetOcrCount)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sOcrCount = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			PUTLOG("sOcrCount [%s]", TOANSI(sOcrCount.GetBuffer()));

			std::string response = CCustIETools::SetOcrCount(TOANSI(sOcrCount.GetBuffer()));

			CString strValue = TOUNICODE(response.c_str());

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strValue.AllocSysString();
			}
		}
	}
	if (dispIdMember == DISPID_CB_SendInputPW)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sOcrFrom = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			//PUTLOG("SendInputPW [%s]", TOANSI(sOcrFrom.GetBuffer()));

			bool fStat = CCustIETools::SendInputPW(TOANSI(sOcrFrom.GetBuffer()));

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_QueryPhoneCode)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sReqId = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			PUTLOG("Query Phone Code By: %s", TOANSI(sReqId.GetBuffer()));

			std::string response = CCustIETools::QueryPhoneCode(TOANSI(sReqId.GetBuffer()));

			CString strVCode = TOUNICODE(response.c_str());

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strVCode.AllocSysString();
			}
		}
	}
	if (dispIdMember == DISPID_CB_Exit)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			BOOL fForce = pDispParams->rgvarg[0].boolVal; // in case you want a CString copy

			bool fStat = CCustIETools::Exit(fForce ? true : false);

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_SetElementFocus)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sElementTag = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			bool fStat = CCustIETools::SetElementFocus(TOANSI(sElementTag.GetBuffer()));

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = fStat ? TRUE : FALSE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_GetHttpOnlyCookie)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sUrl = pDispParams->rgvarg[1].bstrVal; // in case you want a CString copy
			CString sCookieName = pDispParams->rgvarg[0].bstrVal; // in case you want a CString copy

			std::string sCookie;
			bool fStat = CCustIETools::GetHttpOnlyCookie(TOANSI(sUrl.GetBuffer()), TOANSI(sCookieName.GetBuffer()), sCookie);

			CString strCookie = TOUNICODE(sCookie);

			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BSTR;
				V_BSTR(pVarResult) = strCookie.AllocSysString();
			}
		}
	}
	if (dispIdMember == DISPID_CB_PutLog)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			CString sLog = pDispParams->rgvarg[0].bstrVal; 
			PUTLOG("%s", TOANSI(sLog.GetBuffer()));
			// return 
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_StartBoshTime)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{
			// params
			// return 
			SetTimer(((CMainFrame*)theApp.GetMainWnd())->GetSafeHwnd(), TIMER_ID_BOSH_PHONEURL_CHECK, 5000, NULL);

			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
	}
	if (dispIdMember == DISPID_CB_GetPasswordLength)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{ 
			// params
			CString sBankId = pDispParams->rgvarg[0].bstrVal; 
			int len = CCustIETools::GetPasswordLength(TOANSI(sBankId.GetBuffer()));
			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_INT;
				V_INT(pVarResult) = len;
			}
		}
	}
	if (dispIdMember == DISPID_CB_StartPsbcTime)
	{
		if (wFlags & DISPATCH_PROPERTYGET)
		{
			if (pVarResult != NULL)
			{
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
		if (wFlags & DISPATCH_METHOD)
		{ 
			SetTimer(((CMainFrame*)theApp.GetMainWnd())->GetSafeHwnd(), TIMER_ID_PSBC_CHECK, 3000, NULL);

			if (pVarResult) {
				VariantInit(pVarResult);
				V_VT(pVarResult) = VT_BOOL;
				V_BOOL(pVarResult) = TRUE;
			}
		}
	}
	return hr;
}
