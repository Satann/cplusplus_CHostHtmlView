
// CustIEView.h : interface of the CCustIEView class
//

#pragma once
#include "DocHostHtmlView.h"

class CCustIEDoc;

class CCustIEView : public CDocHostHtmlView
{
private:
	CComPtr<IDispatch> m_pHtmlDoc;

protected: // create from serialization only
	CCustIEView();
	DECLARE_DYNCREATE(CCustIEView)

// Attributes
public:
	CCustIEDoc* GetDocument() const;

// Operations
public:
	bool GetHtml(bool fRoot, CComPtr<IHTMLDocument2> & spDoc2, std::string & shtml) ;
// Overrides
public:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

	virtual HRESULT OnShowMessage(HWND hwnd,
		LPOLESTR lpstrText,
		LPOLESTR lpstrCaption,
		DWORD dwType,
		LPOLESTR lpstrHelpFile,
		DWORD dwHelpContext,
		LRESULT * plResult);

	virtual void OnDocumentComplete(LPCTSTR lpszURL);

	virtual HRESULT OnShowContextMenu(DWORD dwID, LPPOINT ppt, LPUNKNOWN pcmdtReserved, LPDISPATCH pdispReserved);

protected:
	virtual void OnInitialUpdate(); // called first time after construct
	virtual HRESULT OnGetExternal(LPDISPATCH *lppDispatch);//
	virtual void PrintHelp();

public:
	virtual void InjectScript(LPCTSTR lpszURL);

// Implementation
public:
	virtual ~CCustIEView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	DECLARE_MESSAGE_MAP()
public:
	afx_msg void OnParentNotify(UINT message, LPARAM lParam);
	virtual void OnNavigateComplete2(LPCTSTR strURL);
	virtual void OnBeforeNavigate2(LPCTSTR lpszURL, DWORD nFlags, LPCTSTR lpszTargetFrameName, CByteArray& baPostedData, LPCTSTR lpszHeaders, BOOL* pbCancel);
	void DumpHTMLAndSaveScreen();
};

#ifndef _DEBUG  // debug version in CustIEView.cpp
inline CCustIEDoc* CCustIEView::GetDocument() const
   { return reinterpret_cast<CCustIEDoc*>(m_pDocument); }
#endif

