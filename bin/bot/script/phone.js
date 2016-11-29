/**
* Phone verify Loop
*/
if ('undefined' === typeof Phone){
///////////////////////////////////////////////////////
	Phone = function (phoneState){

	if (typeof phoneState !== 'number'){
		PUTLOG('Invalid phoneState, stop phone main loop');
		var voucherMap = {};
		voucherMap.errmsg = "Invalid phoneState, stop phone main loop";
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_INVASTATE, Json.stringify(voucherMap));
	}
	
	PUTLOG("phoneState: [" + phoneState + "]");
	
	if ('undefined' === typeof GlobalSettings.type){
		PUTLOG("undefined GlobalSettings.type");
		var voucherMap = {};
		voucherMap.errmsg = "Undefined type:" + GlobalSettings.type;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDTYPE, Json.stringify(voucherMap));
	}
	
	if ('undefined' === typeof BankConfig){
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
	
	var BANKTREE = BankConfig[GlobalSettings.type];
	
	if ('undefined' === typeof GlobalSettings.subtype || 'all' == GlobalSettings.subtype){
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
	
	var BANKINFO = BANKTREE[GlobalSettings.subtype];
	
	var baseCycle = 100; // 100ms
	var cycleCount = 1;  // timeout = (cycleCount * baseCycle);

	switch(phoneState){
//=============================================================================			
		case STATE.PhonePageReady:{
			if (BANKINFO.pPageReady()){
				phoneState ++;	
				LOGSTATE({'pstate': phoneState});
			}
		}break;

		case STATE.PhoneInitPage:{
			if (BANKINFO.pPageInit()){
				phoneState ++;	
				LOGSTATE({'pstate': phoneState});
			}
		}break;
		
		case STATE.PhoneWaitPage:{
			if (BANKINFO.pPageWait()){
				phoneState = STATE.PhoneGetCode;
				LOGSTATE({'pstate': phoneState});
				GlobalSettings.pBeforeSendCodeRetry = BANKINFO.pBeforeSendCodeRetry();
			}
		}break;
//=============================================================================			
		case STATE.PhoneGetCode:{
			if (GlobalSettings.pBeforeSendCodeRetry > 0){
				GlobalSettings.pBeforeSendCodeRetry --;
				break;
			}
			if ('undefined' !== typeof GlobalSettings.taskkey){
				PUTLOG("Click to send code to customer mobile phone");
				BANKINFO.reqPCode();
				PUTLOG("Post request to gateway to retrieve phone code");
				window.external.ReportStatus(LoginErrorCode.WAIT_VCODE, Json.stringify({}));
				GlobalSettings.pcodeRetry = BANKINFO.pcodeRetry();
			}else{
				GlobalSettings.pcodeRetry = 0;
			}
			phoneState ++;	
			LOGSTATE({'pstate': phoneState});
		}break;

		case STATE.PhoneQryCode:{
			if (GlobalSettings.pcodeRetry > 0){
				cycleCount = (10); // optimize
				GlobalSettings.pcodeRetry --;
				GlobalSettings.pcode = window.external.QueryPhoneCode(GlobalSettings.taskkey);
				
				if (GlobalSettings.pcode != ""){
					GlobalSettings.pcodeRetry = 0;
				}
			}
			
			if (GlobalSettings.pcodeRetry == 0){
				if ('undefined' !== typeof GlobalSettings.pcode 
					&& GlobalSettings.pcode != null 
					&& GlobalSettings.pcode != ""){
					PUTLOG("Got phone code: " + GlobalSettings.pcode);
				}else{
					GlobalSettings.pcode = "";
					PUTLOG("Failed to Get phone code");
				}
				if (GlobalSettings.pcode.length > BANKINFO.maxPCodeLength || !BANKINFO.checkPCodeValid(GlobalSettings.pcode) ){
                    var voucherMap = {};
                    voucherMap.errmsg = "phone code error:" + GlobalSettings.pcode;
                    PUTLOG(voucherMap.errmsg);
                    window.external.ReportStatus(LoginErrorCode.LOG_FAILE_VCODEERR, Json.stringify(voucherMap));
                    phoneState = STATE.Shutdown;
					LOGSTATE({'pstate': phoneState});
                    return ;
                }
				var strpcode = GlobalSettings.pcode.replace(/(^\s*)|(\s*$)/g, "").substr(0, BANKINFO.maxPCodeLength);
					for(var i = strpcode.length; i < BANKINFO.maxPCodeLength; i++){
						strpcode += "0";
				}
				
				GlobalSettings.pcode = strpcode;
				
				phoneState ++;
				LOGSTATE({'pstate': phoneState});
			}			
		}break;
		
		case STATE.PhoneSetCode:{
			if (!BANKINFO.securePCode()){
				BANKINFO.pcodeBox().focus();
				BANKINFO.pcodeBox().value = GlobalSettings.pcode.toLowerCase();
				if(document.createEventObject){
					BANKINFO.pcodeBox().fireEvent('onkeyup');
				}
				phoneState = STATE.PhoneCodeSleep;
				LOGSTATE({'pstate': phoneState});
				break;
			}
			if (!window.external.GetLock()){
				PUTLOG("Waiting for keyinput lock");
				break;
			}
			window.external.ActiveWindow();			
			if (BANKINFO.pcodeBox() != null){
				BANKINFO.pcodeBox().focus();
			}	
			var keyInterval = 25;
			if (BANKINFO.interval() != 0){
				keyInterval = BANKINFO.interval();
			}			
			window.external.KeyInput(keyInterval, GlobalSettings.pcode.toLowerCase());
			PUTLOG("Ready to input phone code");			
			phoneState ++;		
			LOGSTATE({'pstate': phoneState});
		}break;
		
		case STATE.PhoneWaitCode:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("Phone code Input is done");
				phoneState ++;
				LOGSTATE({'pstate': phoneState});
			}else{
				window.external.ActiveWindow();				
				if (BANKINFO.pcodeBox() != null){
					BANKINFO.pcodeBox().focus();
				}				
				PUTLOG("Inputing phone code");
			}		
		}break;
		
		case STATE.PhoneCodeSleep:{
			phoneState = STATE.PhoneGetCapt;
			LOGSTATE({'pstate': phoneState});
			if (BANKINFO.pcodeSleep > 0){
				cycleCount = (BANKINFO.pcodeSleep);
			}
		}break;
//=============================================================================	
		case STATE.PhoneGetCapt:{
			if (!BANKINFO.pHasCapt() || null == BANKINFO.pCaptcha()){
				phoneState = STATE.PhoneBeforeSubmit;
				LOGSTATE({'pstate': phoneState});
				break;
			}
			
			if('undefined' == typeof GlobalSettings.ocrpath)
			{
				GlobalSettings.ocrpath = 0;//here defult value should be 0.
			}
			
			if(window.external.SetOcrFrom("?") == "back")
			{
				GlobalSettings.ocrpath = 1;
				if(GlobalSettings.focrerrmsgflag != 20 && GlobalSettings.focrerrmsgflag != 21)
				{
					GlobalSettings.focrerrmsgflag = 20;
				}
				else
				{
					GlobalSettings.focrerrmsgflag = 21;
				}
			}
			else
			{
				GlobalSettings.ocrpath = 0;
			}
			PUTLOG("Phone, value of GlobalSettings.ocrpath: " + GlobalSettings.ocrpath);

			try{
				var vcodeinfo = window.external.GetVCodeText(
												GlobalSettings.ocrpath
												, BANKINFO.ocrtype
												, BANKINFO.pCaptBody()
												, BANKINFO.pCaptcha()
												, BANKINFO.pCaptWidth()
												, BANKINFO.pCaptHeight());
				GlobalSettings.vcodeinfo = Json.parse(vcodeinfo);
				GlobalSettings.pVCodeId = GlobalSettings.vcodeinfo.hash;
				GlobalSettings.vcodeinfo.image = GlobalSettings.vcodeinfo.image.replace(/\n/g,"");
			}catch(e){
				var voucherMap = {};
				voucherMap.errmsg = "PhoneGetCapt, Get ocr Image error:" + e.message;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_GETOCRIMAGEERROR, Json.stringify(voucherMap));
			}
			PUTLOG("OCR request id for phone: " + GlobalSettings.pVCodeId);
			if (GlobalSettings.pVCodeId != ""){
				GlobalSettings.pVCodeRetry = BANKINFO.captRetry(); 
			}else{
				GlobalSettings.pVCodeRetry = 0;
			}
			phoneState ++;
			LOGSTATE({'pstate': phoneState});
		}break;
		
		case STATE.PhoneQryCapt:{
			if (GlobalSettings.pVCodeRetry == 0){
				GlobalSettings.pVCode = "";
				phoneState ++;
				LOGSTATE({'pstate': phoneState});
				break;
			}
			cycleCount = (10); // optimize
			PUTLOG("Phone, OCR retry: " + GlobalSettings.pVCodeRetry);
			GlobalSettings.pVCodeRetry--;			
			GlobalSettings.pVCode = window.external.QueryVCode(GlobalSettings.pVCodeId);
			
			PUTLOG("Phone,GlobalSettings.pVCode: " + GlobalSettings.pVCode + "window.external.SetOcrFrom(?): " + window.external.SetOcrFrom("?"));
			if(GlobalSettings.pVCode == "?front" && window.external.SetOcrFrom("?") != "back")// At the first time, if ocr platform faild, refresh a new image
			{
				//phoneState = STATE.PhoneSendFrontCapt;
				GlobalSettings.focrerrmsgflag = 20;//the first 5010 should with errmsg =""
				window.phoneRetryOCRCount = 4;
				window.phoneRetryOCRLock = true;
				PUTLOG("phone after get ?front. phoneRetryOCRCount:"+ window.phoneRetryOCRCount+" and phoneRetryOCRLock:" +window.phoneRetryOCRLock);
				phoneState = STATE.PhoneRefreshCapt;
				LOGSTATE({'lstate': phoneState});
				break;
			}
			else if(GlobalSettings.pVCode == "?front" && window.external.SetOcrFrom("?") == "back")//after the first time, back alreday be setted. send current image to front.
			{
				phoneState = STATE.PhoneSendFrontCapt;
				//loginState = STATE.PhoneRefreshCapt;
				LOGSTATE({'lstate': phoneState});
				break;
			}
			else if (GlobalSettings.pVCode != "?front" && GlobalSettings.pVCode != "" && GlobalSettings.pVCode.indexOf("?refresh")<0){
				window.external.SetOcrFrom("auto");
				PUTLOG("Phone, auto OCR result: " + GlobalSettings.pVCode);
				GlobalSettings.pVCodeRetry = 0;
				phoneState  = STATE.PhoneSetCapt;
				LOGSTATE({'pstate': phoneState, 'pocr': GlobalSettings.pVCode});
				break;
			}
			else
			{
				PUTLOG("Failed to match. Phone, OCR result: " + GlobalSettings.pVCode);
			}
		}break;
		
		case STATE.PhoneSendFrontCapt:{
			PUTLOG("GlobalSettings.focrerrmsgflag: " + GlobalSettings.focrerrmsgflag);
			if(GlobalSettings.focrerrmsgflag == 21)
			{
				GlobalSettings.vcodeinfo.errmsg = "Phone step, Front OCR error";
			}
			else
			{
				GlobalSettings.vcodeinfo.errmsg = "Phone step, send Front OCR image first time.";
			}
			LOGSTATE({'lstate': phoneState, 'pisrefresh': GlobalSettings.pisrefresh});
			if(GlobalSettings.pisrefresh)
			{
				GlobalSettings.pisrefresh = false;
				GlobalSettings.vcodeinfo.errmsg = GlobalSettings.vcodeinfo.errmsg + "refresh image."
			}
			window.external.ReportStatus(LoginErrorCode.WAIT_OCR, Json.stringify(GlobalSettings.vcodeinfo));
			phoneState = STATE.PhoneWaitFrontCapt;
			PUTLOG("* Phone, Send OCR image to front.");
			LOGSTATE({'lstate': phoneState});
		}break;
		
		case STATE.PhoneWaitFrontCapt:{
			if (GlobalSettings.pVCodeId != ""){
				GlobalSettings.pVCodeRetry = BANKINFO.captRetry(); 
			}else{
				GlobalSettings.pVCodeRetry = 0;
			}
		
			if (GlobalSettings.pVCodeRetry == 0){
				GlobalSettings.pVCode = "";
				//phoneState ++;
				//LOGSTATE({'lstate': phoneState});
				break;
			}
			cycleCount = (10);// optimize
			PUTLOG("Phone, OCR retry: " + GlobalSettings.pVCodeRetry);
			GlobalSettings.pVCodeRetry--;
			GlobalSettings.pVCode = window.external.QueryVCode(GlobalSettings.pVCodeId);
			if(GlobalSettings.pVCode.indexOf("?refresh") != -1)
			{
				GlobalSettings.pisrefresh = true;// use for differentiating 5010 is refresh or not.
				GlobalSettings.pVCodeRetry = 0;
				phoneState = STATE.PhoneRefreshCapt;
				LOGSTATE({'lstate': phoneState});
			}
			else if(GlobalSettings.pVCode != "" && GlobalSettings.pVCode != "?front")
			{
				PUTLOG("Phone, Front OCR result: " + GlobalSettings.pVCode);
				GlobalSettings.pVCodeRetry = 0;
				phoneState = STATE.PhoneSetCapt;
				LOGSTATE({'lstate': phoneState, 'ocr': GlobalSettings.pVCode});
				break;
			}
		}break;
		
		case STATE.PhoneRefreshCapt:{
			PUTLOG("Phone, Begain to refresh ocr image.");
			if(GlobalSettings.type != 'abc' && 'undefined' != typeof BANKINFO.pCaptcha)
			{
				BANKINFO.pCaptcha().click();
			}
			else if('undefined' != typeof BANKINFO.refreshpCaptcha)
			{
				BANKINFO.refreshpCaptcha();
			}
			else
			{
				LOGSTATE({'Error': "Phone, Cann't refresh pCaptcha."});
			}
			
			var waitrefreshTime = 30;
			GlobalSettings.waitRefreshRetry = waitrefreshTime;//waiting refresh
			phoneState = STATE.PhoneSaveNewCapt;
			LOGSTATE({'lstate': phoneState});
		}break;
		
		case STATE.PhoneSaveNewCapt:{
			if(GlobalSettings.waitRefreshRetry >0)
			{
				PUTLOG("Waiting refresh.");
				GlobalSettings.waitRefreshRetry--;
				break;
			}
			
			if(!BANKINFO.pCaptcha().complete)
			{
				PUTLOG("Waiting phone pCaptcha image loading.");
				LOGSTATE({'lstate': loginState});
				break;
			}
			PUTLOG("Get BANKINFO.pCaptcha().complete:" + BANKINFO.pCaptcha().complete);
			
			GlobalSettings.ocrpath = 1;

			try{
				PUTLOG("Phone, Get ocr image pVCodeID before refresh. pVCodeID:" + GlobalSettings.vcodeinfo.hash);

				var vcodeinfo = window.external.GetVCodeText(
												1//GlobalSettings.ocrpath
												, BANKINFO.ocrtype
												, BANKINFO.pCaptBody()
												, BANKINFO.pCaptcha()
												, BANKINFO.pCaptWidth()
												, BANKINFO.pCaptHeight());
				GlobalSettings.vcodeinfo = Json.parse(vcodeinfo);
				PUTLOG("Get GlobalSettings.vcodeinfo.hash:" + GlobalSettings.vcodeinfo.hash + " BANKINFO.pcaptcha().complete:" + BANKINFO.pCaptcha().complete);
				if(GlobalSettings.pVCodeId == GlobalSettings.vcodeinfo.hash)
				{
					PUTLOG("Phone, Waiting pCaptcha refresh.");
					GlobalSettings.waitRefreshRetry = waitrefreshTime;//waiting refresh
					phoneState = STATE.PhoneSaveNewCapt;
					LOGSTATE({'lstate': phoneState});
					break;
				}
				GlobalSettings.pVCodeId = GlobalSettings.vcodeinfo.hash;
				GlobalSettings.vcodeinfo.image = GlobalSettings.vcodeinfo.image.replace(/\n/g,"");
				PUTLOG("Phone, Get ocr image pVCodeId after refresh. pVCodeId:" + GlobalSettings.vcodeinfo.hash);
			}catch(e){
				var voucherMap = {};
				voucherMap.errmsg = "PhoneSaveNewCapt, Get ocr Image error:" + e.message;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_GETOCRIMAGEERROR, Json.stringify(voucherMap));
			}

			phoneState = STATE.PhoneSendFrontCapt;
			LOGSTATE({'lstate': phoneState});
		}break;
		
		case STATE.PhoneSetCapt:{	
			if (!BANKINFO.pSecureCapt()){// directly set pcaptcha by js, skip KeyInput
				if (BANKINFO.pCaptBox() != null){
					if (BANKINFO.pCaptFocus()){
						BANKINFO.pCaptBox().focus();
					}
					BANKINFO.pCaptBox().value = GlobalSettings.pVCode.toLowerCase();
				}
				phoneState = STATE.PhoneCaptSleep;
				LOGSTATE({'pstate': phoneState});
				break;
			}		
			if (!window.external.GetLock()){
				PUTLOG("Waiting for keyinput lock");
				break;
			}	
			window.external.ActiveWindow();
			if (BANKINFO.pCaptBox() != null){
				if (BANKINFO.pSecureCapt() || BANKINFO.pCaptFocus()){
					BANKINFO.pCaptBox().focus();
				}
			}
			var keyInterval = 25;
			if (BANKINFO.interval() != 0){
				keyInterval = BANKINFO.interval();
			}	
			if(GlobalSettings.type == 'icbc'){
				keyInterval = 0;
			}
			window.external.KeyInput(keyInterval, GlobalSettings.pVCode.toLowerCase(), true);
			PUTLOG("Ready to input pcaptcha");
			phoneState ++;
			LOGSTATE({'pstate': phoneState});
		}break;	
		
		case STATE.PhoneWaitCapt:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("pCaptcha Input is done");
				phoneState ++;
				LOGSTATE({'pstate': phoneState});
			}else{
				window.external.ActiveWindow();
				if (BANKINFO.pCaptBox() != null){
					if (BANKINFO.pSecureCapt() || BANKINFO.pCaptFocus()){
						BANKINFO.pCaptBox().focus();
					}
				}
				PUTLOG("Inputing pCaptcha");
			}
		}break;	

		case STATE.PhoneCaptSleep:{
			phoneState = STATE.PhoneBeforeSubmit;
			LOGSTATE({'pstate': phoneState});
			if (BANKINFO.captSleep > 0){
				cycleCount = (BANKINFO.captSleep);
			}
		}break;
//=============================================================================			
		case STATE.PhoneBeforeSubmit:{
			phoneState ++;
			LOGSTATE({'pstate': phoneState});
		}break;
		
		case STATE.PhoneSubmit:{
			BANKINFO.confPCode();
			phoneState ++;
			LOGSTATE({'pstate': phoneState});
		}break;
		
		case STATE.PhoneAfterSubmit:{
			if("spdb" == GlobalSettings.type && 'undefined' == typeof GlobalSettings.phoneConfirmRetry){
				GlobalSettings.phoneConfirmRetry = 3;
			}
			if ('undefined' != typeof GlobalSettings.phoneConfirmRetry && GlobalSettings.phoneConfirmRetry-- > 0){
				cycleCount = 50; // retry after 5s;
				phoneState = STATE.PhoneSubmit;
				LOGSTATE({'pstate': phoneState});
			}else{
				phoneState = STATE.Shutdown;
				LOGSTATE({'pstate': phoneState});
				return ; // Stop Main();	
			}
		}break;
//=============================================================================			
	} // endof switch
/////////////////////////////////////////////////////////////
	setTimeout("Phone(" + phoneState + ");", baseCycle * cycleCount);
}; // endof Phone()
/////////////////////////////////////////////////////////////
}; // endof if('undefined' === typeof Phone)




