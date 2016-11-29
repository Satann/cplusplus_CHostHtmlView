/**
* Login Loop
*/
if ('undefined' === typeof Login){
///////////////////////////////////////////////////////
	Login = function (loginState){
	
	if (typeof loginState !== 'number'){
		PUTLOG('Invalid loginState, stop login main loop');
		var voucherMap = {};
		voucherMap.errmsg = "Invalid loginState, stop login main loop";
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_INVASTATE, Json.stringify(voucherMap));
	}
	
	PUTLOG("LoginState: [" + loginState + "]");

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
	
    if ('undefined' === typeof GlobalSettings.user){
		PUTLOG("undefined GlobalSettings.type");
		var voucherMap = {};
		voucherMap.errmsg = "Undefined type:" + GlobalSettings.type;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDTYPE, Json.stringify(voucherMap));
	}
    if ('undefined' === typeof GlobalSettings.pass){
		PUTLOG("undefined GlobalSettings.type");
		var voucherMap = {};
		voucherMap.errmsg = "Undefined type:" + GlobalSettings.type;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDTYPE, Json.stringify(voucherMap));
	}
   /* if ('undefined' === typeof GlobalSettings.ocrpath){
		PUTLOG("undefined GlobalSettings.ocrpath");
		var voucherMap = {};
		voucherMap.errmsg = "Undefined ocrpath:" + GlobalSettings.ocrpath;
		window.external.ReportStatus(LoginErrorCode.LOG_FAILE_UNDEFINEDTYPE, Json.stringify(voucherMap));
	}*/
    
	var baseCycle = 100; // 100ms
	var cycleCount = 1;  // timeout = (baseCycle * cycleCount )

	switch(loginState){
//=============================================================================
		case STATE.LoginPageReady:{
			if (BANKINFO.pageReady()){
				loginState ++;
				LOGSTATE({'lstate': loginState, 'username length:': GlobalSettings.user.length, 'pwd length':GlobalSettings.pass.length});
			}
		}break;

		case STATE.LoginInitPage:{
			if (BANKINFO.initPage()){
				loginState ++;
				LOGSTATE({'lstate': loginState});
			}
		}break;
		
		case STATE.LoginWaitPage:{
			if (BANKINFO.waitPage()){
				loginState = STATE.LoginSetUser;
				LOGSTATE({'lstate': loginState});
			}
		}break;
//=============================================================================
		case STATE.LoginSetUser:{
            if (!BANKINFO.checkUsernameValid(GlobalSettings.user)){
                var voucherMap = {};
				var userLength = GlobalSettings.user.length;
				if(GlobalSettings.type == 'spdb'){
					userLength = getStringLength(GlobalSettings.user);
				}
                voucherMap.errmsg = "invalid username,len:" + userLength;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
                loginState = STATE.Shutdown;
				LOGSTATE({'lstate': loginState});
                break;
            }
			if (!BANKINFO.secureUser()){// directly set username by js, skip KeyInput
				if(BANKINFO.userBox() != null)
				{
					if(BANKINFO.checkSecureFocus()){
						BANKINFO.userBox().focus();
					}
					BANKINFO.userBox().value = GlobalSettings.user;
					BANKINFO.userBoxBlur();
				}

				loginState = STATE.LoginUserSleep;
				LOGSTATE({'lstate': loginState});
				break;
			}
			if(typeof document.hookwaituser != 'undefined'){
				PUTLOG("cmb user hook already.");
			} else if (!window.external.GetLock()){
				PUTLOG("Waiting for keyinput lock");
				break;
			}
			window.external.ActiveWindow();
			if (BANKINFO.userBox() != null){
				BANKINFO.userBox().focus();
			}
			if(GlobalSettings.type == 'cmb' && typeof document.hookwaituser == 'undefined'){
				document.hookwaituser = 0;
				cycleCount = 20;
				break;
			}
			var keyInterval = 25;
			if (BANKINFO.interval() != 0 || (GlobalSettings.type == 'cmb' && GlobalSettings.logintype != 'cardnum')){
				keyInterval = BANKINFO.interval();
			}
			window.external.KeyInput(keyInterval, GlobalSettings.user);
			PUTLOG("Ready to input username");

			loginState ++;
			LOGSTATE({'lstate': loginState});
		}break;	
		
		case STATE.LoginWaitUser:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("Username Input is done");
				if (BANKINFO.userBox() != null){
					BANKINFO.userBox().blur();
				}

				loginState ++;
				LOGSTATE({'lstate': loginState});
			}else{
				window.external.ActiveWindow();
				if (BANKINFO.userBox() != null){
					BANKINFO.userBox().focus();
				}
				PUTLOG("Inputing username");
			}
		}break;	
		
		case STATE.LoginUserSleep:{
			if(GlobalSettings.type == 'abc' /*|| GlobalSettings.type == 'bosh' ||
				GlobalSettings.type == 'cgb'*/){
				loginState = STATE.LoginGetCapt;
			}
			else
				loginState = STATE.LoginSetPass;
			LOGSTATE({'lstate': loginState});
			if (BANKINFO.userSleep > 0){
				cycleCount = (BANKINFO.userSleep);
			}
			
			if (('undefined' === typeof BANKINFO.inputPasswordRetry)){
				GlobalSettings.inputPasswordRetry = 0;	
			}else{
				GlobalSettings.inputPasswordRetry = BANKINFO.inputPasswordRetry;			
			}
		}break;
//=============================================================================	
		case STATE.LoginSetPass:{
            if (!BANKINFO.checkPasswordValid(GlobalSettings.pass)){
                var voucherMap = {};
                voucherMap.errmsg = "invalid password,len:" + GlobalSettings.pass.length;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_PASSWORDERR, Json.stringify(voucherMap));
				loginState = STATE.Shutdown;
				LOGSTATE({'lstate': loginState});
                break;
            }
			if (!BANKINFO.securePass()){// directly set password by js, skip KeyInput
				if(BANKINFO.passBox() != null){
					if(GlobalSettings.type == "cncb")
					{
						window.external.ActiveWindow();
						BANKINFO.passBox().focus();
						window.external.SendInputPW(GlobalSettings.pass);
					}
					else
					{
						BANKINFO.passBox().focus();
						BANKINFO.passBox().value = GlobalSettings.pass;
					}
					
					if(document.createEventObject) {
						BANKINFO.passBox().fireEvent('onblur');
					}
					else
					{
						BANKINFO.passBox().blur();
					}
				}
				loginState = STATE.LoginPassSleep;
				LOGSTATE({'lstate': loginState});
				break;
			}
			if (typeof document.hookwaitpwd != 'undefined'){
				PUTLOG("cmb pwd hook already.");
			} else if (!window.external.GetLock()){
				PUTLOG("Waiting for keyinput lock");
				break;
			}
			window.external.ActiveWindow();
			if (BANKINFO.passBox() != null){
				BANKINFO.passBox().focus();
			}
			if(GlobalSettings.type == 'cmb' && typeof document.hookwaitpwd == 'undefined'){
				document.hookwaitpwd = 0;
				cycleCount = 20;
				break;
			}
            var keyInterval = BANKINFO.interval();
			window.external.KeyInput(keyInterval, GlobalSettings.pass);
			PUTLOG("Ready to input password");
			
			if(GlobalSettings.type == "abc"){
				var powerpass = document.getElementById("powerpass_ie");
				var nresult = powerpass.verify();
				if (nresult == -1 || nresult == -2 || nresult == -3) {
					var voucherMap = {};
					voucherMap.errmsg = "invalid password,len:" + GlobalSettings.pass.length;
					PUTLOG(voucherMap.errmsg);
					window.external.ReportStatus(LoginErrorCode.LOG_FAILE_PASSWORDERR, Json.stringify(voucherMap));
					loginState = STATE.Shutdown;
					LOGSTATE({'lstate': loginState});
					break;
				}
			}

			loginState ++;
			LOGSTATE({'lstate': loginState});
		}break;	
		
		case STATE.LoginWaitPass:{
			if (window.external.IsKeyInputDone()){
				if(GlobalSettings.type == "icbc"){
					if ('undefined' !== typeof BANKINFO.passBoxLength && BANKINFO.passBoxLength() != null){
						LOGSTATE({'InputedPasswordLength': BANKINFO.passBoxLength()});
					}
				}				
				
				PUTLOG("Password Input is done");

				loginState ++;
				LOGSTATE({'lstate': loginState});
			}else{
				window.external.ActiveWindow();
				if (BANKINFO.passBox() != null){
					BANKINFO.passBox().focus();
				}
				PUTLOG("Inputing Password");
			}
		}break;		
		
		case STATE.LoginPassSleep:{
			//if inut password error, retry
			if((GlobalSettings.type == "cncb" && BANKINFO.passBoxLength() < BANKINFO.maxPassBoxLength) || GlobalSettings.type == "cgb" || GlobalSettings.type == "bosh" || GlobalSettings.type == "cmbc"){
				if ('undefined' !== typeof BANKINFO.passBoxLength && BANKINFO.passBoxLength() != null){
					LOGSTATE({'InputedPasswordLength': BANKINFO.passBoxLength()});
					var filterPass = GlobalSettings.pass.replace(/[(^\s*)|(\s*$)]/g, "");
					if(filterPass.length != BANKINFO.passBoxLength())
					{
						if(GlobalSettings.inputPasswordRetry-- >0)
						{
							PUTLOG("Password length: " + filterPass.length + " PassBox Length: " + BANKINFO.passBoxLength());
							if ('undefined' !== typeof BANKINFO.clearPassBox && BANKINFO.clearPassBox() != null)
							{
								BANKINFO.clearPassBox();
							}
							loginState = STATE.LoginSetPass;
							LOGSTATE({'lstate': loginState, 'passBoxLength:':BANKINFO.passBoxLength(), 'pwd length':filterPass.length});
							PUTLOG("Re-input password. Time: " + GlobalSettings.inputPasswordRetry);
							break;
						}
						else
						{
							var voucherMap = {};
							voucherMap.errmsg = "Faild to input password correctly after retry " + BANKINFO.inputPasswordRetry +" times";
							PUTLOG(voucherMap.errmsg);
							window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ERRORINPUT, Json.stringify(voucherMap));
							loginState = STATE.Shutdown;
							LOGSTATE({'lstate': loginState});
							break;
						}
					}
				}
			}
			
			// cebc retry
			if(GlobalSettings.type=="cebc"){
				var filterPass = GlobalSettings.pass.replace(/[(^\s*)|(\s*$)]/g, "");
				var passwordlen = window.external.GetPasswordLength("cebc");
				if (passwordlen != filterPass.length){
					if(GlobalSettings.inputPasswordRetry-- >0){
						BANKINFO.clearPassBox();
						PUTLOG("cebc retry and clearPassBox");
						loginState = STATE.LoginSetPass;
						PUTLOG("Re-input password. Time: " + GlobalSettings.inputPasswordRetry);
						break;
					}
					else{
						var voucherMap={};
						voucherMap.errmsg = "Failed to input password correctly after retry " + BANKINFO.inputPasswordRetry + " times";
						PUTLOG(voucherMap.errmsg);
						window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ERRORINPUT,Json.stringify(voucherMap));
						loginState = STATE.Shutdown;
						LOGSTATE({'lstate': loginState});
						break;
					}
				}
				/*
				var x = SecEditAgent.getLengthIntensity('powerpassForLogin').val;
				PUTLOG("start check cebc password: " + x);
				if(SecEditAgent && SecEditAgent.getLengthIntensity('powerpassForLogin')
					&& !SecEditAgent.getLengthIntensity('powerpassForLogin').val){
					if(GlobalSettings.inputPasswordRetry-- >0){
						if ('undefined' !== typeof BANKINFO.clearPassBox && BANKINFO.clearPassBox() != null)
						{
							BANKINFO.clearPassBox();
							PUTLOG("cebc retry and clearPassBox");
						}
						loginState = STATE.LoginSetPass;
						PUTLOG("Re-input password. Time: " + GlobalSettings.inputPasswordRetry);
						break;
					}
					else{
						var voucherMap={};
						voucherMap.errmsg = "Failed to input password correctly after retry " + BANKINFO.inputPasswordRetry + " times";
						PUTLOG(voucherMap.errmsg);
						window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ERRORINPUT,Json.stringify(voucherMap));
						loginState = STATE.Shutdown;
						LOGSTATE({'lstate': loginState});
						break;
					}
				}
				*/
			}

			if(GlobalSettings.type == 'abc' /*|| GlobalSettings.type == 'bosh' ||
				GlobalSettings.type == 'cgb'*/){
				loginState = STATE.LoginBeforeLogin;
			}
			else
				loginState = STATE.LoginGetCapt;
			LOGSTATE({'lstate': loginState});
			if (BANKINFO.passSleep > 0){
                cycleCount = BANKINFO.passSleep;
            }
		}break;
//=============================================================================	
		case STATE.LoginGetCapt:{
			if (!BANKINFO.hasCapt() || null == BANKINFO.captcha()){
				loginState = STATE.LoginBeforeLogin;
				LOGSTATE({'lstate': loginState});
				break;
			}else{
				BANKINFO.initCapt();
			}
			
			//GlobalSettings.ocrpath = 1;//here defult value should be delete.
			
			if('undefined' == typeof GlobalSettings.ocrpath)//the first time that bot be called by tomcat.
			{
				GlobalSettings.ocrpath = 0;
				GlobalSettings.focrerrmsgflag = 0;
			}
			else if( GlobalSettings.ocrpath == 1)//bot restarted by tomcat after get 50101.
			{
				GlobalSettings.focrerrmsgflag = 1;
			}
			else if( GlobalSettings.ocrpath == 2)//bot restarted by tomcat after get 4016, and the first time to send 5010 to front.
			{
				GlobalSettings.ocrpath = 1;
				GlobalSettings.focrerrmsgflag = 0;
			}
			
			PUTLOG("Value of GlobalSettings.ocrpath:" + GlobalSettings.ocrpath);
			
			try{
				var vcodeinfo = window.external.GetVCodeText(
												GlobalSettings.ocrpath
												, BANKINFO.ocrtype
												, BANKINFO.docBody()
												, BANKINFO.captcha()
												, BANKINFO.captWidth()
												, BANKINFO.captHeight());
				
				PUTLOG("Get ocr Image vcodeinfo:" + vcodeinfo);								
				GlobalSettings.vcodeinfo = Json.parse(vcodeinfo);
				GlobalSettings.vcodeId = GlobalSettings.vcodeinfo.hash;
				GlobalSettings.vcodeinfo.image = GlobalSettings.vcodeinfo.image.replace(/\n/g,"");
			}catch(e){
				var voucherMap = {};
				voucherMap.errmsg = "Get ocr Image error:" + e.message;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_GETOCRIMAGEERROR, Json.stringify(voucherMap));
			}
			PUTLOG("OCR request id: " + GlobalSettings.vcodeId);
			if (GlobalSettings.vcodeId != ""){
				GlobalSettings.vcodeRetry = BANKINFO.captRetry(); 
			}else{
				GlobalSettings.vcodeRetry = 0;
			}
			loginState ++;
			LOGSTATE({'lstate': loginState});
		}break;
		
		case STATE.LoginQryCapt:{
			if (GlobalSettings.vcodeRetry == 0){
				GlobalSettings.vcode = "";
				loginState ++;
				LOGSTATE({'lstate': loginState});
				break;
			}
			cycleCount = (10);// optimize
			PUTLOG("LoginQryCapt OCR retry: " + GlobalSettings.vcodeRetry);
			GlobalSettings.vcodeRetry--;			
			GlobalSettings.vcode = window.external.QueryVCode(GlobalSettings.vcodeId);
			if(GlobalSettings.vcode == "?front")
			{
				var flag = "front";
				window.external.SetOcrFrom(flag);
				PUTLOG("Get org ocrfrom:" + window.external.SetOcrFrom("?") );
				
				//loginState = STATE.LoginSendFrontCapt;
				loginState = STATE.LoginRefreshCapt;
				LOGSTATE({'lstate': loginState});
				break;
			}
			else if (GlobalSettings.vcode != ""){
				PUTLOG("OCR result: " + GlobalSettings.vcode);
				GlobalSettings.vcodeRetry = 0;
				loginState ++;
				LOGSTATE({'lstate': loginState, 'ocr': GlobalSettings.vcode});
				break;
			}
		}break;
		
		case STATE.LoginSendFrontCapt:{
			if(GlobalSettings.focrerrmsgflag == 1)
			{
				GlobalSettings.vcodeinfo.errmsg = "Login step, Front OCR error";
			}
			else
			{
				GlobalSettings.vcodeinfo.errmsg = "Login step, send Front OCR image.";
			}
			
			window.external.ReportStatus(LoginErrorCode.WAIT_OCR, Json.stringify(GlobalSettings.vcodeinfo));
			LOGSTATE({'vcodeinfoImage': GlobalSettings.vcodeinfo.image});
			
			loginState = STATE.LoginWaitFrontCapt;
			PUTLOG("* Send OCR image to front.");
			LOGSTATE({'lstate': loginState});
		}break;
		
		case STATE.LoginWaitFrontCapt:{
			if (GlobalSettings.vcodeId != ""){
				GlobalSettings.vcodeRetry = BANKINFO.captRetry(); 
			}else{
				GlobalSettings.vcodeRetry = 0;
			}
		
			if (GlobalSettings.vcodeRetry == 0){
				GlobalSettings.vcode = "";
				//loginState ++;
				//LOGSTATE({'lstate': loginState});
				break;
			}
			cycleCount = (10);// optimize
			PUTLOG("OCR retry: " + GlobalSettings.vcodeRetry);
			GlobalSettings.vcodeRetry--;			
			GlobalSettings.vcode = window.external.QueryVCode(GlobalSettings.vcodeId);
			if(GlobalSettings.vcode.indexOf("?refresh") != -1)
			{	
				GlobalSettings.focrerrmsgflag = 0;
				
				GlobalSettings.vcodeRetry = 0;
				loginState = STATE.LoginRefreshCapt;
				LOGSTATE({'lstate': loginState});
			}
			else if(GlobalSettings.vcode != "" && GlobalSettings.vcode != "?front")
			{
				PUTLOG("Front OCR result: " + GlobalSettings.vcode);
				GlobalSettings.vcodeRetry = 0;
				loginState = STATE.LoginSetCapt;
				LOGSTATE({'lstate': loginState, 'ocr': GlobalSettings.vcode});
				break;
			}
		}break;
		
		case STATE.LoginRefreshCapt:{
			PUTLOG("Begain to refresh ocr image.");
			try{
				if(GlobalSettings.type != 'abc' && 'undefined' != typeof BANKINFO.captcha)
				{
					BANKINFO.captcha().click();
				}
				else if('undefined' != typeof BANKINFO.refreshCaptcha)
				{
					BANKINFO.refreshCaptcha();
				}
				else
				{
					LOGSTATE({'Eroor': "Cann't refresh Captcha."});
				}
			}
			catch(e){
				PUTLOG("Refresh ocr image error: " + e.message);
			}
			
			var waitrefreshTime = 30;
			GlobalSettings.waitRefreshRetry = waitrefreshTime;//waiting refresh
			loginState = STATE.LoginSaveNewCapt;
			LOGSTATE({'lstate': loginState});
		}break;
		
		case STATE.LoginSaveNewCapt:{
			if(GlobalSettings.waitRefreshRetry >0)
			{
				PUTLOG("Waiting refresh.");
				GlobalSettings.waitRefreshRetry--;
				break;
			}
			
			if(!BANKINFO.captcha().complete)
			{
				PUTLOG("Waiting captcha image loading.");
				LOGSTATE({'lstate': loginState});
				break;
			}
			PUTLOG("Get BANKINFO.captcha().complete:" + BANKINFO.captcha().complete);
			
			GlobalSettings.ocrpath = 1;

			try{
				PUTLOG("Get ocr image vcodeID before refresh. vcodeID:" + GlobalSettings.vcodeinfo.hash);
				var vcodeinfo = window.external.GetVCodeText(
												1//GlobalSettings.ocrpath
												, BANKINFO.ocrtype
												, BANKINFO.docBody()
												, BANKINFO.captcha()
												, BANKINFO.captWidth()
												, BANKINFO.captHeight());
				GlobalSettings.vcodeinfo = Json.parse(vcodeinfo);
				PUTLOG("Get GlobalSettings.vcodeinfo.hash:" + GlobalSettings.vcodeinfo.hash + " BANKINFO.captcha().complete:" + BANKINFO.captcha().complete);

				if(GlobalSettings.vcodeId != "" && GlobalSettings.vcodeinfo.hash != "")
				{
					var vcodeIdhash = GlobalSettings.vcodeId.split("-")[0];
					var newhash = GlobalSettings.vcodeinfo.hash.split("-")[0];	
					PUTLOG("vcodeIdhash:" + vcodeIdhash + " newhash:" + newhash);
					if(vcodeIdhash == newhash)
					{
						PUTLOG("Waiting captcha refresh.");
						//loginState = STATE.LoginSaveNewCapt;
						GlobalSettings.waitRefreshRetry = waitrefreshTime;//waiting refresh
						LOGSTATE({'lstate': loginState});
						break;
					}
				}
				
				GlobalSettings.vcodeId = GlobalSettings.vcodeinfo.hash;
				GlobalSettings.vcodeinfo.image = GlobalSettings.vcodeinfo.image.replace(/\n/g,"");
				PUTLOG("Get ocr image vcodeID after refresh. vcodeID:" + GlobalSettings.vcodeinfo.hash);
			}catch(e){
				var voucherMap = {};
				voucherMap.errmsg = "LoginSaveNewCapt, Get ocr Image error:" + e.message;
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_GETOCRIMAGEERROR, Json.stringify(voucherMap));
			}

			loginState = STATE.LoginSendFrontCapt;
			LOGSTATE({'lstate': loginState});
		}break;	
		
		case STATE.LoginSetCapt:{
            if (!BANKINFO.checkVCodeValid(GlobalSettings.vcode)){
                var voucherMap = {};
                voucherMap.errmsg = "invalid ocr code:" + GlobalSettings.vcode;
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_OCR, Json.stringify(voucherMap));
				loginState = STATE.Shutdown;
				LOGSTATE({'lstate': loginState});
                break;
            }
			if (!BANKINFO.secureCapt()){// directly set captcha by js, skip KeyInput
				if (BANKINFO.captBox() != null){
					if(BANKINFO.checkSecureFocus()){
						if (BANKINFO.focusCapt()){
							BANKINFO.captBox().focus();
						}
					}
					BANKINFO.captBox().value = GlobalSettings.vcode.toLowerCase();
					if(GlobalSettings.type == 'bcm' && GlobalSettings.subtype != 'credit')
					{
						var o = document.createEvent('UIEvents');
						o.initUIEvent( 'keyup', true, true, window, 1 );
						o.keyCode = 13;
						BANKINFO.captBox().dispatchEvent(o);
						cycleCount=10;
					}
					BANKINFO.captBox().blur();
					
					if(GlobalSettings.type == 'boc' && BANKINFO.captBox().value != GlobalSettings.vcode.toLowerCase())
					{
						loginState = STATE.LoginSetCapt;
						LOGSTATE({'lstate': loginState, 'BANKINFO.captBox().value': BANKINFO.captBox().value});
						break;
					}
					// ccb first login, do ocr check despite of bank 
					if(GlobalSettings.type == 'ccb' && GlobalSettings.subtype != 'credit')
					{
						var o = document.createEvent('UIEvents');
						o.initUIEvent( 'keyup', true, true, window, 1 );
						o.keyCode = 13;
						BANKINFO.captBox().dispatchEvent(o);
						cycleCount=10;
						document.ccb_capt_retry = 10;
					}
				}
				loginState = STATE.LoginCaptSleep;
				LOGSTATE({'lstate': loginState});
				break;
			}		
			if (!window.external.GetLock()){
				PUTLOG("Waiting for keyinput lock");
				break;
			}	
			window.external.ActiveWindow();
			if (BANKINFO.captBox() != null){
				if (BANKINFO.secureCapt() || BANKINFO.focusCapt()){
					BANKINFO.captBox().focus();
				}
			}
			var keyInterval = 25;
			if (BANKINFO.interval() != 0){
				keyInterval = BANKINFO.interval();
			}
			if(GlobalSettings.type == 'icbc'){
				keyInterval = 0;
			}
			window.external.KeyInput(keyInterval, GlobalSettings.vcode.toLowerCase(), true);
			PUTLOG("Ready to input captcha");
			loginState ++;
			LOGSTATE({'lstate': loginState});
		}break;	
		
		case STATE.LoginWaitCapt:{
			if (window.external.IsKeyInputDone()){
				PUTLOG("Captcha Input is done");
				if (BANKINFO.captBox() != null){
					BANKINFO.captBox().blur();
				}
				loginState ++;
				LOGSTATE({'lstate': loginState});
			}else{
				window.external.ActiveWindow();
				if (BANKINFO.captBox() != null){
					if (BANKINFO.secureCapt() || BANKINFO.focusCapt()){
						BANKINFO.captBox().focus();
					}
				}
				PUTLOG("Inputing Captcha");
			}
		}break;	

		case STATE.LoginCaptSleep:{
			if(GlobalSettings.type == 'abc' /*|| GlobalSettings.type == 'bosh' ||
				GlobalSettings.type == 'cgb'*/){
				loginState = STATE.LoginSetPass;
			}
			// ccb first login, do ocr check despite of bank 
			else if(GlobalSettings.type == 'ccb' && GlobalSettings.subtype != 'credit')
			{
				var orcWrapSpan = document.getElementById('fclogin').contentWindow.document.getElementById("fujiaerr").children;
				if(orcWrapSpan.length > 0)
				{
					if(orcWrapSpan[0].id.indexOf('correct') == -1)
					{
						var voucherMap = {};
						voucherMap.errmsg = "invalid ocr code:" + GlobalSettings.vcode;
						window.external.ReportStatus(LoginErrorCode.LOG_FAILE_OCR, Json.stringify(voucherMap));
						loginState = STATE.Shutdown;
						break
					}
					else
					{
						loginState = STATE.LoginBeforeLogin;
					}
				}
				else
				{
					cycleCount=10;
					document.ccb_capt_retry--;
					// check ocr timeout come to 100
					if (document.ccb_capt_retry > 0 && document.ccb_capt_retry % 5 ==0 ){
						PUTLOG('ccb orc check retry');
						var o = document.createEvent('UIEvents');
						o.initUIEvent( 'keyup', true, true, window, 1 );
						o.keyCode = 13;
						BANKINFO.captBox().dispatchEvent(o);
					}else if(document.ccb_capt_retry > 0){
						PUTLOG('ccb wait orc check result');
					}else{
						loginState = STATE.LoginBeforeLogin;
					}
					break;
				}
			}
			else
				loginState = STATE.LoginBeforeLogin;
			LOGSTATE({'lstate': loginState});
			if (BANKINFO.captSleep > 0){
				cycleCount = (BANKINFO.captSleep);
			}
		}break;
//=============================================================================	
		case STATE.LoginBeforeLogin:{
			if (('undefined' === typeof BANKINFO.loginRetry)){
				GlobalSettings.loginRetry = 0;	
			}else{
				GlobalSettings.loginRetry = BANKINFO.loginRetry;			
			}
			if (('undefined' === typeof BANKINFO.cycleCountBeforeRetry)){
				GlobalSettings.cycleCountBeforeRetry = 0;	
			}else{
				GlobalSettings.cycleCountBeforeRetry = BANKINFO.cycleCountBeforeRetry;
			}
			if (('undefined' === typeof GlobalSettings.retrySetPassCount)){
				if (('undefined' === typeof BANKINFO.retrySetPassCount)){
					GlobalSettings.retrySetPassCount = 0;	
				}else{
					GlobalSettings.retrySetPassCount = BANKINFO.retrySetPassCount;
				}
			}
			loginState ++;
			LOGSTATE({'lstate': loginState});
		}break;
		
		case STATE.LoginDoLogin:{
			if(GlobalSettings.type == "icbc"){
				if ('undefined' !== typeof BANKINFO.passBoxLength && BANKINFO.passBoxLength() != null){
					LOGSTATE({'InputedPasswordLengthAtLogin': BANKINFO.passBoxLength()});
				}
			}
			BANKINFO.loginBtn();
			loginState++;
			LOGSTATE({'lstate': loginState});
		}break;	
		
		case STATE.LoginAfterLogin:{				
			if (GlobalSettings.loginRetry-- > 0){
				cycleCount = 100; // retry after 10s;
				loginState = STATE.LoginDoLogin;
				if(GlobalSettings.type == "boc"){
					loginState = STATE.LoginGetCapt;
				}
				LOGSTATE({'lstate': loginState});
			}else if(GlobalSettings.cycleCountBeforeRetry > 0)
			{
				PUTLOG("GlobalSettings.cycleCountBeforeRetry is: " + GlobalSettings.cycleCountBeforeRetry);
				--GlobalSettings.cycleCountBeforeRetry;
				PUTLOG("GlobalSettings.retrySetPassCount is: " + GlobalSettings.retrySetPassCount);
				if(BANKINFO.retrySetPass() && (0 < GlobalSettings.retrySetPassCount)){
					loginState = STATE.LoginUserSleep;
					LOGSTATE({'lstate': loginState});
					
					--GlobalSettings.retrySetPassCount;
					PUTLOG("Retry to set password");
				}else if(BANKINFO.retrySetPass() && (0 == GlobalSettings.retrySetPassCount)){
					PUTLOG("Report error status after retry");
					BANKINFO.reportStatusAfterRetry();
				}
			}else{
				loginState = STATE.Shutdown;
				LOGSTATE({'lstate': loginState});
				if("cncb" == GlobalSettings.type){
					setTimeout("refresh()",20000);
				}
			}
		}break;	
//=============================================================================	
	} // endof switch
/////////////////////////////////////////////////////////////
	setTimeout("Login("+ loginState +");", baseCycle * cycleCount);
}; // endof Login()
/////////////////////////////////////////////////////////////
}; // endof if('undefined' === typeof Login)

if ('undefined' === typeof refresh){
	refresh = function (){
		PUTLOG("refresh");
		window.navigate(location); 
	};
};
