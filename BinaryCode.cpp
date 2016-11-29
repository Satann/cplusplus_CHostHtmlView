#include "StdAfx.h"
#include "BinaryCode.h"

CBinaryCode::CBinaryCode(void)
{
}

CBinaryCode::~CBinaryCode(void)
{
}

CString CBinaryCode::m_cfg_return_filename(CString m)
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
HMODULE CBinaryCode::Process_GetModule(DWORD th32ProcessId, LPCTSTR lpModuleFileName)
{
	HMODULE hModule = NULL;
	MODULEENTRY32 me32 = { 0 };
	CString sModuleFileName(_T(""));
	CString sDllFileName(_T(""));

	// 在进程中拍一个所有模块的快照
	HANDLE hProcess = ::CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, th32ProcessId);
	if(hProcess != INVALID_HANDLE_VALUE)
	{
		// 遍历快照中记录的模块
		me32.dwSize = sizeof(MODULEENTRY32);
		if(::Module32First(hProcess, &me32))
		{
			sModuleFileName = (CString )lpModuleFileName;
			do {
				sDllFileName = m_cfg_return_filename(me32.szExePath);
				if (0 == sModuleFileName.CompareNoCase(sDllFileName))
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

BOOL CBinaryCode::SearchBinaryCodeBytes(IN HMODULE hModule, IN BYTE* pSearch, IN int nSize, int nOffset, IN TBinaryType _binaryType, OUT DWORD &dwValue)
{
#pragma region	// statement
	BOOL bFlag = FALSE;
	_IMAGE_DOS_HEADER* pDosHeader = NULL;
	_IMAGE_NT_HEADERS* pNtHeaders = NULL;
	_IMAGE_FILE_HEADER* pFileHeader = NULL;
	_IMAGE_OPTIONAL_HEADER* pOptionalHeader = NULL;
	_IMAGE_SECTION_HEADER* pSectionHeader = NULL;
	WORD k = 0;
	int i = 0, j = 0;
	BYTE* pMemory = NULL;
	DWORD dwVA = 0;
	DWORD dwContent = 0;
#pragma endregion
#pragma region	// check param
	if (NULL == hModule || nSize <= 0)
	{
		TRACE(_T("err param"));
		goto exit;
	}
#pragma endregion
#pragma region	// pe headers
	pDosHeader = (_IMAGE_DOS_HEADER* )hModule;
	pNtHeaders = (_IMAGE_NT_HEADERS* )((DWORD )pDosHeader + pDosHeader->e_lfanew);
	pFileHeader = (_IMAGE_FILE_HEADER* )((DWORD )pNtHeaders + sizeof(pDosHeader->e_lfanew));
	pOptionalHeader = (_IMAGE_OPTIONAL_HEADER* )((DWORD )pFileHeader + sizeof(_IMAGE_FILE_HEADER));
	pSectionHeader = (_IMAGE_SECTION_HEADER* )((DWORD )pOptionalHeader + pFileHeader->SizeOfOptionalHeader);

	if (IMAGE_DOS_SIGNATURE != pDosHeader->e_magic
		|| 0 == pDosHeader->e_lfanew
		|| IMAGE_NT_SIGNATURE != pNtHeaders->Signature
		|| 0 == pFileHeader->SizeOfOptionalHeader
		|| pFileHeader->NumberOfSections <= 0
		|| pFileHeader->SizeOfOptionalHeader <= 0
		|| pOptionalHeader->SizeOfImage <= 0
		)
	{
		TRACE(_T("err module"));
		goto exit;
	}
#pragma endregion

	for (k = 0; k < pFileHeader->NumberOfSections; k++)
	{
		if ((pSectionHeader[k].Characteristics & IMAGE_SCN_MEM_READ) == IMAGE_SCN_MEM_READ && pSectionHeader[k].VirtualAddress > 0 && pSectionHeader[k].Misc.VirtualSize > 0)
		{
			//查找指定字节集
			j = 0;
			for(i = pSectionHeader[k].VirtualAddress; i <= (int) pSectionHeader[k].Misc.VirtualSize - nSize; i++)
			{
				pMemory = (BYTE* )((DWORD )hModule + i);
				for(j = 0; j < nSize; j++)
				{
					if ('?' == pSearch[j])
					{
						continue;
					}
					if(pMemory[j] !=   pSearch[j])
					{
						break;
					}
				}
#pragma region	// i find the binary codes
				if(j == nSize)
				{
					dwVA = (DWORD )pMemory;
					dwVA += (DWORD )nOffset;
					dwContent = *(DWORD* )dwVA;

					switch (_binaryType)
					{
					case TBinaryType_Base:
						dwValue = dwContent;
						bFlag = TRUE;
						break;
					case TBinaryType_Call:
						dwValue = (dwVA + 4) + dwContent;
						bFlag = TRUE;
						break;
					case TBinaryType_VirtualAddress:
						dwValue = dwVA;
						bFlag = TRUE;
						break;
					default:
						goto exit;
						break;
					}

					break;
				}
#pragma endregion
			}
			if (bFlag)
			{
				break;
			}
		}
	}

exit:
	return bFlag;
}
BOOL CBinaryCode::TChar2Hex(IN TCHAR tcValue, OUT BYTE &byRet)
{
	if (tcValue >= _T('0') && tcValue <= _T('9'))
	{
		byRet = tcValue - _T('0');
	}
	else if (tcValue >= _T('a') && tcValue <= _T('f'))
	{
		byRet = tcValue - _T('a') + 0xA;
	}
	else if (tcValue >= _T('A') && tcValue <= _T('F'))
	{
		byRet = tcValue - _T('A') + 0xA;
	} else
	{
		return FALSE;
	}
	return TRUE;
}
BOOL CBinaryCode::SearchBinaryCodeString(IN HMODULE hModule, IN LPCTSTR lpSearch, int nOffset, IN TBinaryType _binaryType, OUT DWORD &dwValue)
{
	BOOL bFlag = FALSE;
	BYTE* pData = NULL;
	int nDataSize = 0;
	int iSearch = 0;
	int iData = 0;
	TCHAR* pSearch = NULL;
	int nLen = 0;

	pSearch = (TCHAR* )lpSearch;
	if (lpSearch != NULL) nLen = _tcslen(lpSearch);
	if (NULL == hModule && nLen > 0)
	{
		goto exit;
	}
	if (NULL == (pData = (BYTE* )malloc(nLen)))
	{
		goto exit;
	}
	memset(pData, 0, nLen);

	BYTE byValue1 = 0;
	BYTE byValue2 = 0;
	for (iSearch = 0; iSearch < nLen; iSearch++)
	{
		if (pSearch[iSearch] == _T('?'))
		{
			pData[iData] = (BYTE )pSearch[iSearch];
			iData++;
			iSearch+=2;
		}
		else if (TChar2Hex(pSearch[iSearch], byValue1) && TChar2Hex(pSearch[iSearch + 1], byValue2))
		{
			pData[iData] = byValue1 * 0x10 + byValue2;
			iData++;
			iSearch+=2;
		}
		else
		{
			iSearch++;
		}
	}
	nDataSize = iData;
	bFlag = SearchBinaryCodeBytes(hModule, pData, nDataSize, nOffset, _binaryType, dwValue);
exit:
	if (pData!=NULL)
	{
		free(pData);
	}
	return bFlag;
}





