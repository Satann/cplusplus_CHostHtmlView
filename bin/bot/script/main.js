/**
* Startup main
*/
if ('undefined' === typeof Main){
///////////////////////////////////////////////////////
	Main = function (pageUrl){
	
	if (typeof pageUrl !== 'string'){
		PUTLOG('Invalid pageUrl, stop login main loop');
		var voucherMap = {};
		voucherMap.errmsg = "Invalid pageUrl, stop login main loop";
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_INVAPAGEURL, Json.stringify(voucherMap));
	}
	
	PUTLOG("initial page url: [" + pageUrl + "]");
	
	if ('undefined' == typeof GlobalSettings.type){
		PUTLOG("undefined GlobalSettings.type");
		var voucherMap = {};
		voucherMap.errmsg = "Undefined type:" + GlobalSettings.type;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDTYPE, Json.stringify(voucherMap));
	}
	
	if ('undefined' == typeof BankConfig){
		PUTLOG("undefined BankConfig");
		var voucherMap = {};
		voucherMap.errmsg = "undefined BankConfig";
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDBANKCON, Json.stringify(voucherMap));
	}
	
	if (!BankConfig.hasOwnProperty(GlobalSettings.type)){
		PUTLOG("Not found: BankConfig[" + GlobalSettings.type +"]");
		var voucherMap = {};
		voucherMap.errmsg = "Not found type:" + GlobalSettings.type;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_NOTFINDTYPE, Json.stringify(voucherMap));
	}
	
	if('icbc' == GlobalSettings.type.toLowerCase()){
		if(pageUrl == ("https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_index.jsp")
			&& document.getElementByClass('icon-4') != null){
				document.getElementByClass('icon-4').click();
				return;
			}
	}
	var BANKTREE = BankConfig[GlobalSettings.type];
	
	if ('undefined' == typeof GlobalSettings.subtype || 'all' == GlobalSettings.subtype){
		GlobalSettings.subtype = "debit";
	}
	
	if (!BANKTREE.hasOwnProperty(GlobalSettings.subtype)){
		PUTLOG("Not found: BANKTREE." + GlobalSettings.subtype);
		var voucherMap = {};
		voucherMap.errmsg = "Not found subtype:" + GlobalSettings.subtype;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_NOTFINDSUBTYPE, Json.stringify(voucherMap));
	}else{
		//PUTLOG("Selected: BANKTREE." + GlobalSettings.subtype);
	}
	

	var result = false;
	if(GlobalSettings.logintype == "phonenum")
	{
		var Num=/^[0-9]*$/;
		if(Num.test(GlobalSettings.user) && GlobalSettings.user.length == 11)
		{
			result = true;
		}
	}
	else if(GlobalSettings.logintype == "cardnum")
	{
		var Num=/^[0-9]*$/;
		if (GlobalSettings.user.length > 13 && GlobalSettings.user.length < 20 && Num.test(GlobalSettings.user)){
			result = true;
		}
	}
	else if(GlobalSettings.logintype == "pidnum")
	{
		if(15==GlobalSettings.user.length){
			result = (/^\d+$/.test(GlobalSettings.user));
		}
		else if(/^[\da-z]{18}$/.test(GlobalSettings.user.toLowerCase())){
			result = true;
		}
	}
	else
	{
		result = !/^ +$/.test(GlobalSettings.user) && (GlobalSettings.user != "")&& (GlobalSettings.user != null);
	}
	
	if(!result)
	{
		var voucherMap = {};
		voucherMap.errmsg = "Username transmission error, username :" + GlobalSettings.user;
		PUTLOG(voucherMap.errmsg);
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
	}
	
	if(GlobalSettings.pass.length < 6)
	{
		var voucherMap = {};
		voucherMap.errmsg = "Password transmission error, password len:" + GlobalSettings.pass.length;
		PUTLOG(voucherMap.errmsg);
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_PASSWORDERR, Json.stringify(voucherMap));
	}
	
	var BANKINFO = BANKTREE[GlobalSettings.subtype];
	
	if (BANKINFO.loginUrl(pageUrl)){
		PUTLOG('Enter login page: ' + pageUrl);
		if ('undefined' === typeof window.loginLock){
			window.loginLock = true;
			GlobalSettings.url = pageUrl;
			var loginState = STATE.LoginPageReady;
			Login(loginState);
		}else{
			PUTLOG("login lock taken, quit");
		}
		return ;
	}else if (BANKINFO.phoneUrl(pageUrl)){
		PUTLOG('Enter phone page: ' + pageUrl);
		window.external.SetOcrCount("1");
		if ('undefined' === typeof window.phoneLock){
			window.phoneLock = true;
			GlobalSettings.url = pageUrl;
			var phoneState = STATE.PhonePageReady;
			Phone(phoneState);		
		}else{
			PUTLOG("phone lock taken, quit");
		}
		return ;	
	}else if(BANKINFO.tokenUrl(pageUrl)){
		PUTLOG('Enter token page: ' + pageUrl);	
		if ('undefined' === typeof window.phoneLock){
			window.phoneLock = true;
			GlobalSettings.url = pageUrl;
			var phoneState = STATE.PhonePageReady;
			Token(phoneState);		
		}else{
			PUTLOG("token lock taken, quit");
		}
		return ;	
	}else if('undefined' !== typeof BANKINFO.phoneRetryOCRUrl && BANKINFO.phoneRetryOCRUrl(pageUrl)){
		PUTLOG('Back to phone page to retry OCR: ' + pageUrl);	
		if ('undefined' === typeof window.phoneRetryOCRLock){
			window.phoneRetryOCRLock = true;
			window.canReportStatus = true;
			GlobalSettings.url = pageUrl;
			var phoneRetryOCRState = STATE.PhoneGetCapt;
			Phone(phoneRetryOCRState);		
		}else{
			PUTLOG("phoneRetryOCRLock lock taken, quit");
		}
		return ;	
	}else{
		PUTLOG("No intrest on " + pageUrl);
		return ; // stop this main loop
	}
}; // endof Main()
/////////////////////////////////////////////////////////////
}; // endof if('undefined' === typeof Main)





