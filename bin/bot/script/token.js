/**
* Token verify Loop
*/
if ('undefined' === typeof Token){
///////////////////////////////////////////////////////
	Token = function (phoneState){

	if (typeof phoneState !== 'number'){
		PUTLOG('Invalid phoneState, stop Token main loop');
		var voucherMap = {};
		voucherMap.errmsg = "Invalid phoneState, stop Token main loop";
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
			}
		}break;

		case STATE.PhoneInitPage:{
			if (BANKINFO.pPageInit()){
				phoneState ++;	
			}
		}break;
		
		case STATE.PhoneWaitPage:{
			if (BANKINFO.pPageWait()){
				phoneState = STATE.PhoneGetCode;
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
				PUTLOG("Click to send code to customer token");
				BANKINFO.reqPCode();
				PUTLOG("Post request to gateway to retrieve token code");
				window.external.ReportStatus(LoginErrorCode.WAIT_TOKEN_CODE, Json.stringify({}));
				GlobalSettings.pcodeRetry = BANKINFO.pcodeRetry();
			}else{
				GlobalSettings.pcodeRetry = 0;
			}
			phoneState ++;	
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
					PUTLOG("Got Token code: " + GlobalSettings.pcode);
				}else{
					GlobalSettings.pcode = "";
					PUTLOG("Failed to Get Token code");
				}
				if (GlobalSettings.pcode.length > BANKINFO.maxPCodeLength || GlobalSettings.pcode.length==0){
                    var voucherMap = {};
                    voucherMap.errmsg = "Token code error:" + GlobalSettings.pcode;
                    PUTLOG(voucherMap.errmsg);
                    window.external.ReportStatus(LoginErrorCode.LOG_FAILE_TOKENNUMERR, Json.stringify(voucherMap));
                    phoneState = STATE.Shutdown;
                    return ;
                }
				var strpcode = GlobalSettings.pcode.replace(/(^\s*)|(\s*$)/g, "").substr(0, BANKINFO.maxPCodeLength);
					for(var i = strpcode.length; i < BANKINFO.maxPCodeLength; i++){
						strpcode += "0";
				}
				
				GlobalSettings.pcode = strpcode;
				
				phoneState ++;
			}			
		}break;
		
		case STATE.PhoneSetCode:{
			if (!BANKINFO.securePCode()){
				BANKINFO.pcodeBox().focus();
				BANKINFO.pcodeBox().value = GlobalSettings.pcode.toLowerCase();
				phoneState = STATE.PhoneCodeSleep;
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
			PUTLOG("Ready to input Token code");			
			phoneState ++;		
		}break;
		
		case STATE.PhoneWaitCode:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("Token code Input is done");
				phoneState ++;
			}else{
				window.external.ActiveWindow();				
				if (BANKINFO.pcodeBox() != null){
					BANKINFO.pcodeBox().focus();
				}				
				PUTLOG("Inputing Token code");
			}		
		}break;
		
		case STATE.PhoneCodeSleep:{
			phoneState = STATE.PhoneGetCapt;
			if (BANKINFO.pcodeSleep > 0){
				cycleCount = (BANKINFO.pcodeSleep);
			}
		}break;
//=============================================================================	
		case STATE.PhoneGetCapt:{
			if (!BANKINFO.pHasCapt() || null == BANKINFO.pCaptcha()){
				phoneState = STATE.PhoneBeforeSubmit;
				break;
			}
			try{
				GlobalSettings.pVCodeId = window.external.GetVCodeText(
												BANKINFO.ocrtype
												, BANKINFO.pCaptBody()
												, BANKINFO.pCaptcha()
												, BANKINFO.pCaptWidth()
												, BANKINFO.pCaptHeight());
			}catch(e){
				PUTLOG(e.message);
			}
			PUTLOG("OCR request id for Token: " + GlobalSettings.pVCodeId);
			if (GlobalSettings.pVCodeId != ""){
				GlobalSettings.pVCodeRetry = BANKINFO.captRetry(); 
			}else{
				GlobalSettings.pVCodeRetry = 0;
			}
			phoneState ++;
		}break;
		
		case STATE.PhoneQryCapt:{
			if (GlobalSettings.pVCodeRetry == 0){
				GlobalSettings.pVCode = "";
				phoneState ++;
				break;
			}
			cycleCount = (10); // optimize
			PUTLOG("OCR retry: " + GlobalSettings.pVCodeRetry);
			GlobalSettings.pVCodeRetry--;			
			GlobalSettings.pVCode = window.external.QueryVCode(GlobalSettings.pVCodeId);
			if (GlobalSettings.pVCode != ""){
				PUTLOG("OCR result: " + GlobalSettings.pVCode);
				GlobalSettings.pVCodeRetry = 0;
				phoneState ++;
				break;
			}
		}break;
		
		case STATE.PhoneSetCapt:{	
			if (!BANKINFO.pSecureCapt()){// directly set captcha by js, skip KeyInput
				if (BANKINFO.pCaptBox() != null){
					if (BANKINFO.pCaptFocus()){
						BANKINFO.pCaptBox().focus();
					}
					BANKINFO.pCaptBox().value = GlobalSettings.pVCode.toLowerCase();
				}
				phoneState = STATE.PhoneCaptSleep;
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
			window.external.KeyInput(keyInterval, GlobalSettings.pVCode.toLowerCase());
			PUTLOG("Ready to input captcha");
			phoneState ++;
		}break;	
		
		case STATE.PhoneWaitCapt:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("Captcha Input is done");
				phoneState ++;
			}else{
				window.external.ActiveWindow();
				if (BANKINFO.pCaptBox() != null){
					if (BANKINFO.pSecureCapt() || BANKINFO.pCaptFocus()){
						BANKINFO.pCaptBox().focus();
					}
				}
				PUTLOG("Inputing Captcha");
			}
		}break;	

		case STATE.PhoneCaptSleep:{
			phoneState = STATE.PhoneBeforeSubmit;
			if (BANKINFO.captSleep > 0){
				cycleCount = (BANKINFO.captSleep);
			}
		}break;
//=============================================================================			
		case STATE.PhoneBeforeSubmit:{
			phoneState ++;
		}break;
		
		case STATE.PhoneSubmit:{
			BANKINFO.confPCode();
			phoneState ++;
		}break;
		
		case STATE.PhoneAfterSubmit:{
			phoneState = STATE.Shutdown;
			return ; // Stop Main();	
		}break;
//=============================================================================			
	} // endof switch
/////////////////////////////////////////////////////////////
	setTimeout("Token(" + phoneState + ");", baseCycle * cycleCount);
}; // endof Token()
/////////////////////////////////////////////////////////////
}; // endof if('undefined' === typeof Token)




