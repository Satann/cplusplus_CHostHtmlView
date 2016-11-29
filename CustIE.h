
// CustIE.h : main header file for the CustIE application
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif

#include "resource.h"       // main symbols

class CImpIDispatch;

// CCustIEApp:
// See CustIE.cpp for the implementation of this class
//

class CCustIEApp : public CWinApp
{
public:
	CCustIEApp();
	~CCustIEApp();

protected:
	CImpIDispatch * m_pCustDisp;
	ULONG_PTR m_gdiplusToken;

public:
	IDispatch * GetExternalDispatch();
	BOOL EnableDebugPrivilege();

// Overrides
public:
	virtual BOOL InitInstance();
	virtual int ExitInstance();

// Implementation
	afx_msg void OnAppAbout();
	DECLARE_MESSAGE_MAP()

protected:
	virtual bool ParseArgs(int argc, LPWSTR * argv);
	virtual bool LoadConfiguration();
public:
	virtual std::string GetUrlSetting(const std::string & bankid, const std::string & type, const std::string & subType);
	virtual bool IsLoginUrl(const std::string & bankid, const std::string & url);
	virtual bool IsPhoneUrl(const std::string & bankid, const std::string & url);
	virtual bool IsErrorUrl(const std::string & bankid, const std::string & url);
	virtual bool IsMainUrl(const std::string & bankid, const std::string & url);
	virtual std::string GetKey() const;
	virtual bool ShowScriptError() const;
	virtual bool MinimizeWindow() const;
	virtual bool EnableWindow() const;
	virtual std::string GetHTMLandScreenShotPath() const;
	virtual unsigned int GetKeyInputWait() const;
	virtual unsigned int GetDama2ListenPort() const;
	virtual unsigned int GetDefaultTimeout() const;
	virtual unsigned int ReportTimeout() const;
	virtual std::string GetKeyInputName() const;
	virtual bool SuspendFlag() const;
	virtual std::string GetBankId() const;
	virtual std::string GetTaskKey() const;
	virtual std::string GetProxyString() const;
	virtual std::string GetLogDir() const;
public:
	Json::Value m_sysConfig;
	Json::Value m_userConfig;
	virtual void AddToRecentFileList(LPCTSTR lpszPathName);
	afx_msg void OnUpdateFileMruFile1(CCmdUI *pCmdUI);
private:
	std::string m_sKey;
	bool m_fShowScriptError;
	bool m_fSuspendFlag;
	bool m_fMinimizeWindow;
	bool m_fEnableWindow;
	unsigned int m_nKeyInputWait;
	unsigned int m_nDama2ListenPort;
	std::string m_sKeyInputName;
	std::string m_sHTMLandScreenShotPath;
	std::string m_sProxyString;
	std::string m_sLogDir;
	unsigned int m_nTimeOut;
	unsigned int m_nReportTimeout;
};

extern CCustIEApp theApp;
