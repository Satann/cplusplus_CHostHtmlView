#pragma once

class CBinaryCode
{
public:
	enum TBinaryType
	{
		TBinaryType_Unknown,
		TBinaryType_VirtualAddress,
		TBinaryType_Call,
		TBinaryType_Base,
	};
private:
	CString m_cfg_return_filename(CString m);
	BOOL TChar2Hex(IN TCHAR tcValue, OUT BYTE &byRet);
	BOOL SearchBinaryCodeBytes(IN HMODULE hModule, IN BYTE* pSearch, IN int nSize, int nOffset, IN TBinaryType _binaryType, OUT DWORD &dwValue);
public:
	CBinaryCode(void);
	virtual ~CBinaryCode(void);
	HMODULE Process_GetModule(DWORD th32ProcessId, LPCTSTR lpModuleFileName);
	BOOL SearchBinaryCodeString(IN HMODULE hModule, IN  LPCTSTR lpSearch, int nOffset, IN TBinaryType _binaryType, OUT DWORD &dwValue);
public:
};

