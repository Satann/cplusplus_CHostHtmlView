/**
* Configuration of all banks
*
*/
if ('undefined' === typeof BankConfig){
//////////////////////////////////////////////////////////////////////////
	BankConfig = {
	"bcm":{
		"debit": {
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login 
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return /^[a-zA-Z0-9._@]+$/.test(username); },
			"checkPasswordValid" : function(pass) { return /^\S{6,20}$/.test(pass); },
			"checkVCodeValid" : function(VCode) { return VCode.length == 5; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 						
							return url == "https://pbank.95559.com.cn/personbank/logon.jsp?show=old";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true;},
			"waitPage" : function (){ return document.getElementById("password") != null;},
			// userbox
			"userBox"  : function (){ return document.getElementById('alias');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return null; },
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.getElementById("login").click(); },
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){ return document.getElementById("input_captcha");},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementByClass("captchas-img-bg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},		
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ 
                            var cap_input = document.getElementById("input_captcha");
                            if(cap_input != null && cap_input.parentNode.parentNode.style.display != "none"){
                                return true;
                            }
                            return false;
            },
			// Phone verification
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){
							if (url == 'https://pbank.95559.com.cn/personbank/system/syVerifyCustomer.do'
								&& document.getElementById('mobileCode') != null){
								return true;
							}
							return false;
						},
			"pPageReady": function (){ return true; },			
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.getElementById('mobileCode');},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ document.getElementById("authSMSSendBtn").click();},
			"confPCode": function(){ document.getElementById("btnConf").click();},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
        "credit": {
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
                            if (GlobalSettings.logintype == "cardnum"){
								return /^625138[0-9]{10}$|622252[0-9]{10}$|622253[0-9]{10}$|458123[0-9]{10}$|458124[0-9]{10}$|521899[0-9]{10}$|520169[0-9]{10}$|628218[0-9]{10}$|628216[0-9]{10}$|522964[0-9]{10}$|434910[0-9]{10}$|622656[0-9]{10}$|622284[0-9]{10}$|622285[0-9]{10}$|406595[0-9]{10}$|405568[0-9]{10}$|518823[0-9]{10}$|552853[0-9]{10}$/.test(username);
                            }else{
								return /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/.test(username) || username.length<65&& /^(?:\w|\.|-)+@(?:\w|-)+(?:\.(?:\w|-)+)+$/.test(username);
                            }
                            return true; 
                        },
			"checkPasswordValid" : function(pass) {
                            if (GlobalSettings.logintype == "cardnum"){
								return /^[0-9]{6}$/.test(pass);
                            }else{
								return /^[a-zA-Z0-9]{6,15}$/.test(pass);
                            }
                        },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){
                            return url == 'https://creditcardapp.bankcomm.com/idm/sso/login.html';
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
                            $(document).ajaxComplete(function( event, xhr, settings ) {
                              PUTLOG('bcm ajax url:' + settings.url);
                              if ( settings.url.indexOf("keyboards.json" ) != -1) {
                                  try{
                                      var resp = Json.parse(xhr.responseText)
                                      if (resp == undefined){
                                          PUTLOG( "bcm ajax keyboard response error: " + xhr.responseText );
                                      }
                                      else{
                                          GlobalSettings.bcm_vkeylist = resp.keys;
                                      }
                                  }catch(e){
                                      PUTLOG( "bcm ajax keyboard response parse error: " + e.message );
                                  }
                              }
                            });
                             if(GlobalSettings.logintype == "cardnum"){
                                document.getElementById('tabCardNo').click();
                            }else{
                                document.getElementById('tabMobileEmail').click();
                            }
                            return true;
                        },
            "waitPage" : function (){ return document.getElementsByName("password") != null;},
            // userbox
            "userBox"  : function (){
                            if(GlobalSettings.logintype == "cardnum"){
                                return document.getElementById('cardNo');
                            }else{
                                return document.getElementById('mobileOrEmail');
                            }
                        },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return false;},
			"passBox"  : function (){
                            if(GlobalSettings.logintype == "cardnum"){
                                if (GlobalSettings.bcm_vkeylist == undefined){
                                    document.getElementById('pwd').click();
                                }else
									PUTLOG('GlobalSettings.bcm_vkeylist == undefined');
                                return null;
                            }else{
                                return document.getElementById('password');
                            }
						},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){
                            if(GlobalSettings.logintype == "cardnum"){
                                var key_map = {};
                                if (GlobalSettings.bcm_vkeylist == undefined){
                                    PUTLOG( "bcm no found key map");
                                    return;
                                }
                                if ( GlobalSettings.bcm_vkeylist.length != 10){
                                    PUTLOG( "bcm no found key map length error" + GlobalSettings.bcm_vkeylist.length);
                                    return;
                                }
                                var itemlist = document.getEletsByClassName('key');
                                if (itemlist == undefined){
                                    PUTLOG( "bcm no found key img dom");
                                    return;
                                }
                                for(var i = 0; i < itemlist.length; i++){
                                    if (itemlist[i] == undefined || itemlist[i].childNodes.length < 1 || itemlist[i].childNodes[0].src.split('=') < 2){
                                        PUTLOG( "bcm key img error: " + itemlist[i].childNodes[0].src);
                                        return;
                                    }
                                    var item = itemlist[i].childNodes[0].src.split('=')[1];
                                    for(var j = 0; j < GlobalSettings.bcm_vkeylist.length; j++){
                                        if (GlobalSettings.bcm_vkeylist[j].indexOf(item) != -1){
                                            t = {}
                                            t.index = i;
                                            t.real_value = j;
                                            t.cryp_str = item;
                                            key_map[j + ''] = t; // not using id, they almost equal
                                            break;
                                        }
                                    }
                                }
                                var keyorder = '';
                                var crypto_str = ''
                                for (var i = 0; i < GlobalSettings.pass.length; i++){
                                    var k = key_map[GlobalSettings.pass[i]];
                                    if (k != undefined){
                                        keyorder += k.index;
                                        crypto_str += k.cryp_str + '|';
                                    }else{
                                        PUTLOG('real value not find map key: ' + GlobalSettings.pass[i]);
                                    }
                                }
                                crypto_str = crypto_str.substring(0, crypto_str.length - 1);
                                document.getElementById('pwd').value = keyorder;
                                document.getElementById('_softkey_pwdseq').value = crypto_str;
                                PUTLOG(keyorder);
                                PUTLOG(crypto_str);
                                document.getElementById('cardLogin').click();
                            }else{
                                document.getElementById('loginBtn').click();
                            }
                        },
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){
                            if(GlobalSettings.logintype == "cardnum"){
                                return document.getElementById("dynamicCode2");
                            }else{
                                return document.getElementById("dynamicCode");
                            }
                        },
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
                            if(GlobalSettings.logintype == "cardnum"){
                                return document.getElementById("dynamicCode2").nextSibling.nextSibling.firstChild;
                            }else{
                                return document.getElementById("dynamicCode").nextSibling.nextSibling.firstChild;
                            }
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},		
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){
                            if(GlobalSettings.logintype == "cardnum"){
                                return document.getElementById("dynamicCode2") != null;
                            }else{
                                return document.getElementById("dynamicCode") != null;
                            }
            },
			// Phone verification
			"tokenUrl" : function (url){
                            return false;
						},
			"phoneUrl" : function (url){
							return url == 'https://creditcardapp.bankcomm.com/idm/sso/auth.html' && document.getElementById('moibleMessages') != null;
						},
			"pPageReady": function (){ return true; },			
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.getElementById('moibleMessages');},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ document.getElementById("send_Button").click();},
			"confPCode": function(){ document.getElementById("submit").click();},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"boc":{
		"debit":{
			"userSleep" : 40,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum")
							{
								var num = /^[0-9]*$/;
								if((username.length == 19 ) && num.test(username))
								{
									return true;
								}
								return false;
							}
							else
							{
								var num = /^[0-9]*$/;
								if((username.length == 15 || username.length == 16 || username.length == 19) && num.test(username))
								{
									return false;
								}
								var length = 0;
								for (var i = 0; i < username.length; i++)
								{
									var c = username.charAt(i);
									if (/^[\u0000-\u00ff]$/.test(c))
									{
										length += 1;
									}
									else
									{
										length += 2;
									}
								}
								if(length>5 && length<21)
								{
									var NumAlph=/^[A-Za-z0-9]+$/;
									var HalfWidth= /[\u0000-\u00FF]/;
									var NoBlank= /^\S+$/;
									var Fullwidth = /[\uFF00-\uFFEF]/;
									//var CHKOJPChar = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
									//if((NumAlph.test(username)||HalfWidth.test(username))&& NoBlank.test(username))
									if(NoBlank.test(username)&&!Fullwidth.test(username))
									{
										return true;
									}
								}
								return false;
							}
							
							//return true; 
						},
			"checkPasswordValid" : function(orgpass) {
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum")
							{
								var num = /^[0-9]*$/;
								return pass.length ==6 && num.test(pass);
							}
							else
							{
								if(pass.length > 5 && pass.length < 21)
								{
									var NumAlph=/^[A-Za-z0-9]+$/;
									var HalfWidth= /[\u0000-\u00FF]/;
									//var NoBlank= /^\S+$/;
									if((NumAlph.test(pass)||HalfWidth.test(pass)))//&& NoBlank.test(pass))
									{
										return true;
									}
								}
							}
							return false;
							//return true; 
						},
			"checkVCodeValid" : function(VCode) { 
							return VCode.length == 4;
							//return true; 
						},
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://ebsnew.boc.cn/boc15/login.html";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){  
							// Always show captcha
							var captchaitem = document.getElementById('captcha-item');
							if (captchaitem != null){
								//document.getElementById('captcha-item').className = 'clearfix';
								return true;
							}
							return false;
						},		
			"waitPage" : function (){
							if (document.getElementById('div_password_79445') != null){
								// Always refresh captcha
								//document.getElementById('captcha').click();
								return true;
							}
							return false;
						},
			// userbox
			"userBox"  : function (){ return document.getElementById("txt_username_79443");},
			"userBoxBlur": function (){ $("#txt_username_79443").trigger("blur");},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if(document.getElementById("txt_50531_740884"))
								{
									return document.getElementById("txt_50531_740884");
								}
								return document.getElementById("div_password_79445_1");
							}
							else{
								return document.getElementById("div_password_79445");
							}
						},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" ){
								if(document.getElementById("btn_49_741014") != null)
								{
									document.getElementById("btn_49_741014").click();
								}
								else if(document.getElementById("btn_49_740887") != null)
								{
									document.getElementById("btn_49_740887").click();
								}
								else if(document.getElementById("btn_login_79676") != null)
								{
									document.getElementById("btn_login_79676").click();
								}
							}
						},
			"docBody"  : function (){ return document.body;},
			"loginRetry": 2,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if(document.getElementById("txt_captcha_740885"))
								{
									return document.getElementById("txt_captcha_740885");
								}
								return document.getElementById("txt_captcha_741012");
							}
							else{
								return document.getElementById("txt_captcha_79449");
							}
						},
			"captcha"  : function () {
							try{
								if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
									if(document.getElementById("captcha_creditCard"))
									{
										return document.getElementById("captcha_creditCard");
									}
									return document.getElementById("captcha_debitCard");
								}
								else{
									return document.getElementById("captcha");
								}
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_debitCard"))
								{
									Img.src = document.getElementById("captcha_debitCard").src;
								}
								else if(document.getElementById("captcha_creditCard"))
								{
									Img.src = document.getElementById("captcha_creditCard").src;
								}
								else{
									return 0;
								}
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.width;
						},		
			"captHeight": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_debitCard"))
								{
									Img.src = document.getElementById("captcha_debitCard").src;
								}
								else if(document.getElementById("captcha_creditCard"))
								{
									Img.src = document.getElementById("captcha_creditCard").src;
								}
								else{
									return 0;
								}
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.height;
						},
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								return true;
							}
							else{
								return document.getElementById('captcha-item').className == 'clearfix';
							}
							//return true;
						},
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
		"credit":{
			"userSleep" : 40,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum")
							{
								var num = /^[0-9]*$/;
								if((username.length == 16 ) && num.test(username))//|| username.length == 16 || username.length == 19 only credit card(16 digits), debit card(19 digits) is not supported.
								{
									return true;
								}
								return false;
							}
							else
							{
								var num = /^[0-9]*$/;
								if((username.length == 15 || username.length == 16 || username.length == 19) && num.test(username))
								{
									return false;
								}
								var length = 0;
								for (var i = 0; i < username.length; i++)
								{
									var c = username.charAt(i);
									if (/^[\u0000-\u00ff]$/.test(c))
									{
										length += 1;
									}
									else
									{
										length += 2;
									}
								}
								if(length>5 && length<21)
								{
									var NumAlph=/^[A-Za-z0-9]+$/;
									var HalfWidth= /[\u0000-\u00FF]/;
									var NoBlank= /^\S+$/;
									var Fullwidth = /[\uFF00-\uFFEF]/;
									//var CHKOJPChar = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
									//if((NumAlph.test(username)||HalfWidth.test(username))&& NoBlank.test(username))
									if(NoBlank.test(username)&&!Fullwidth.test(username))
									{
										return true;
									}
								}
								return false;
							}
							
							//return true; 
						},
			"checkPasswordValid" : function(orgpass) {
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum")
							{
								var num = /^[0-9]*$/;
								return pass.length ==6 && num.test(pass);
							}
							else
							{
								if(pass.length > 5 && pass.length < 21)
								{
									var NumAlph=/^[A-Za-z0-9]+$/;
									var HalfWidth= /[\u0000-\u00FF]/;
									//var NoBlank= /^\S+$/;
									if((NumAlph.test(pass)||HalfWidth.test(pass)))//&& NoBlank.test(pass))
									{
										return true;
									}
								}
							}
							return false;
							//return true; 
						},
			"checkVCodeValid" : function(VCode) { 
							return VCode.length == 4;
							//return true; 
						},
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://ebsnew.boc.cn/boc15/login.html";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){  
							// Always show captcha
							var captchaitem = document.getElementById('captcha-item');
							if (captchaitem != null){
								//document.getElementById('captcha-item').className = 'clearfix';
								return true;
							}
							return false;
						},		
			"waitPage" : function (){
							if (document.getElementById('div_password_79445') != null){
								// Always refresh captcha
								//document.getElementById('captcha').click();
								return true;
							}
							return false;
						},
			// userbox
			"userBox"  : function (){ return document.getElementById("txt_username_79443");},
			"userBoxBlur": function (){ $("#txt_username_79443").trigger("blur");},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if(document.getElementById("txt_50531_740884"))
								{
									return document.getElementById("txt_50531_740884");
								}
								return document.getElementById("div_password_79445_1");
							}
							else{
								return document.getElementById("div_password_79445");
							}
						},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" ){
								if(document.getElementById("btn_49_741014") != null)
								{
									document.getElementById("btn_49_741014").click();
								}
								else if(document.getElementById("btn_49_740887") != null)
								{
									document.getElementById("btn_49_740887").click();
								}
								else if(document.getElementById("btn_login_79676") != null)
								{
									document.getElementById("btn_login_79676").click();
								}
							}
						},
			"docBody"  : function (){ return document.body;},
			"loginRetry": 2,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if(document.getElementById("txt_captcha_740885"))
								{
									return document.getElementById("txt_captcha_740885");
								}
								return document.getElementById("txt_captcha_741012");
							}
							else{
								return document.getElementById("txt_captcha_79449");
							}
						},
			"captcha"  : function () {
							try{
								if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
									if(document.getElementById("captcha_creditCard"))
									{
										return document.getElementById("captcha_creditCard");
									}
									return document.getElementById("captcha_debitCard");
								}
								else{
									return document.getElementById("captcha");
								}
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_debitCard"))
								{
									Img.src = document.getElementById("captcha_debitCard").src;
								}
								else if(document.getElementById("captcha_creditCard"))
								{
									Img.src = document.getElementById("captcha_creditCard").src;
								}
								else{
									return 0;
								}
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.width;
						},		
			"captHeight": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_debitCard"))
								{
									Img.src = document.getElementById("captcha_debitCard").src;
								}
								else if(document.getElementById("captcha_creditCard"))
								{
									Img.src = document.getElementById("captcha_creditCard").src;
								}
								else{
									return 0;
								}
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.height;
						},
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								return true;
							}
							else{
								return document.getElementById('captcha-item').className == 'clearfix';
							}
							//return true;
						},
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
		/*"credit":{
			"userSleep" : 40,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return true; },
			"checkPasswordValid" : function(pass) { return true; },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://ebsnew.boc.cn/boc15/login.html";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){  
							// Always show captcha
							var captchaitem = document.getElementById('captcha-item');
							if (captchaitem != null){
								document.getElementById('captcha-item').className = 'clearfix';
								return true;
							}
							return false;
						},		
			"waitPage" : function (){
							if (document.getElementById('div_password_79445') != null){
								// Always refresh captcha
								//document.getElementById('captcha').click();
								return true;
							}
							return false;
						},
			// userbox
			"userBox"  : function (){ return document.getElementById("txt_username_79443");},
			"userBoxBlur": function (){ $("#txt_username_79443").trigger("blur");},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								return document.getElementById("txt_50531_740884");
							}
							else{
								return document.getElementById("div_password_79445");
							}
						},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" ){
								if(document.getElementById("btn_49_740887") != null)
								{
									document.getElementById("btn_49_740887").click();
								}
								else if(document.getElementById("btn_49_741014") != null)
								{
									document.getElementById("btn_49_741014").click();
								}
								else if(document.getElementById("btn_login_79676") != null)
								{
									document.getElementById("btn_login_79676").click();
								}
							}
						},
			"docBody"  : function (){ return document.body;},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){				
								return document.getElementById("txt_captcha_740885");
							}
							else{
								return document.getElementById("txt_captcha_79449");
							}
						},
			"captcha"  : function () {
							try{
								if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
									return document.getElementById("captcha_creditCard");
								}
								else{
									return document.getElementById("captcha");
								}
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_creditCard")==null)
									return 0;
								Img.src = document.getElementById("captcha_creditCard").src;
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.width;
						},		
			"captHeight": function (){
							var Img = new Image();
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								if (document.getElementById("captcha_creditCard")==null)
									return 0;
								Img.src = document.getElementById("captcha_creditCard").src;
							}
							else{
								if (document.getElementById("captcha")==null)
									return 0;
								Img.src = document.getElementById("captcha").src;
							}
							return Img.height;
						},			
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ return true;},
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}*/
	},
	"icbc":{
		"debit" : {
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if((/^ +$/.test(username)) || (username == ""))
								return false;
							if (username.length==0){
								return false;
							}
							if (!/^[A-Za-z0-9_]{4,20}$/.test(username)){
								return false;
							}
							if((username.length == 16 || username.length == 19) && /^\d*$/.test(username) && !document.frames['ICBC_login_frame_f'].isValidCardAndAcctPublic(username)){
								return false;
							}
							return true;
						},
			"checkPasswordValid" : function(pass) { 
							if(-1 != pass.indexOf(' ') || 0 == pass.length)
								return false;
							if (pass.length < 6 || pass.length > 30){
								return false;
							}
							return true;
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) {
							if(/\D/.test(PCode))
								return false;
							if(6==PCode.length)
								return true;
							return false;
						},
			"loginUrl" : function (url){ 
							if(window.location.href == "https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_guide_nologon.jsp"){
								PUTLOG("wrong page");
								window.navigate('https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_index.jsp');
								return false;
							}
							var isTrue = false;
							try{
								isTrue = ((url == "https://mybank.icbc.com.cn/icbc/newperbank/perbank3/login/loginall.jsp" || url == "https://mybank.icbc.com.cn/servlet/ICBCPERBANKLocationServiceServlet")
								&& typeof document.frames !== 'undefined' && document.frames != null && document.frames.length >= 6
								&& typeof document.frames['ICBC_login_frame_f'].document !== 'undefined' && document.frames['ICBC_login_frame_f'].document != null
								&& document.frames['ICBC_login_frame_f'].document.getElementById('logonNameHolder') != null);
							}catch(exp){}
							if (isTrue){
								PUTLOG("Return true");
								return true;
							}else return false;
						},
			"pageReady": function (){ return true},
			"initPage" : function (){
							document.frames['ICBC_login_frame_f'].document.getElementById('logonNameHolder').click();
							return true;
						},
			"waitPage" : function (){  return document.frames['ICBC_login_frame_f'].document.getElementById('safeEdit1') != null;},
			// userbox
			"userBox"  : function (){ return document.frames['ICBC_login_frame_f'].document.getElementById('logonCardNum');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.frames['ICBC_login_frame_f'].document.getElementById('safeEdit1');},
			"passBoxLength"  : function (){ return document.frames['ICBC_login_frame_f'].document.getElementById('safeEdit1').getLength();},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){
							if (document.frames['ICBC_login_frame_f'].document.getElementById("loginBtn") != null){
								document.frames['ICBC_login_frame_f'].document.getElementById("loginBtn").click();
							}
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){ return document.frames['ICBC_login_frame_f'].document.getElementById("KeyPart");},
			"docBody"  : function (){ return document.frames['ICBC_login_frame_f'].document.frames[0].document.body;},
			"captcha"  : function () {
							try{ 
								return document.frames['ICBC_login_frame_f'].document.frames[0].document.body.firstChild;
							}catch(err){
								alert(err.message);
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return !false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},			
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ return true;},
			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){
							var isTrue = false;
							try{
								isTrue = (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
								&& document.frames[0] != null && document.frames[0].document != null
								&& typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
								&& document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null
								&& typeof document.frames[0].document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames[0].document.frames != null 
								&& document.frames[0].document.frames[0].document.frames.length > 0 && document.frames[0].document.frames[0].document.frames[0] != null 
								&& document.frames[0].document.frames[0].document.frames[0].document != null);
							}catch(exp){}
							if (isTrue){
									var subMenu = document.frames[0].document.frames[0].document.getElementById('ebdp-pc4promote-menu-level1-text-2');
									var userSSVC = document.frames[0].document.frames[0].document.frames[0].document.getElementsByName('userSubmitSignVerifyCode');
									return subMenu != null && subMenu.parentNode != null && subMenu.parentNode.getAttribute('isSelected') == "0"
										&& userSSVC.length == 0 && document.frames[0].document.frames[0].document.getElementById('menu') != null;
							}
							return false;
						},
			"phoneRetryOCRUrl" : function (url){
							var isTrue = false;
							try{
								isTrue = (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
								&& document.frames[0] != null && document.frames[0].document != null
								&& typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
								&& document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null
								&& typeof document.frames[0].document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames[0].document.frames != null 
								&& document.frames[0].document.frames[0].document.frames.length > 0 && document.frames[0].document.frames[0].document.frames[0] != null 
								&& document.frames[0].document.frames[0].document.frames[0].document != null);
							}catch(exp){}
							if (isTrue){
									var userSSVC = document.frames[0].document.frames[0].document.frames[0].document.getElementsByName('userSubmitSignVerifyCode');
									return userSSVC[0] != 'undefined' && userSSVC[0] != null && userSSVC[0].value !== '';
							}
							return false;
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){
							var isTrue = false;
							try{
								isTrue = (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
								&& document.frames[0] != null && document.frames[0].document != null
								&& typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
								&& document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null);
							}catch(exp){}
							if (isTrue){
								var subMenu = document.frames[0].document.frames[0].document.getElementById('ebdp-pc4promote-menu-level1-text-2');
								if (subMenu != null){
									subMenu.click();
									return true;
								}
							}
							return false;
						},
			"pPageWait" : function (){
							var isTrue = false;
							try{
								isTrue = (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
								&& document.frames[0] != null && document.frames[0].document != null
								&& typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
								&& document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null
								&& typeof document.frames[0].document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames[0].document.frames != null 
								&& document.frames[0].document.frames[0].document.frames.length > 0 && document.frames[0].document.frames[0].document.frames[0] != null 
								&& document.frames[0].document.frames[0].document.frames[0].document != null);
							}catch(exp){}
							if (isTrue){
								var subMenu = document.frames[0].document.frames[0].document.getElementById('ebdp-pc4promote-menu-level1-text-2');
								var sendPCodeButton = document.frames[0].document.frames[0].document.frames[0].document.getElementById('sendSMSCode');
								if (subMenu != null && sendPCodeButton != null){
									var subMenuParent = subMenu.parentNode;
									if (subMenuParent != null){
										return subMenuParent.getAttribute('isSelected') == "1";
									}
								}
							}
							return false;							
						},
			"pcodeBox" : function (){
							return document.frames[0].document.frames[0].document.frames[0].document.getElementsByName('userSubmitSignVerifyCode')[0];
						},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){
							var childNodes = document.frames[0].document.frames[0].document.frames[0].document.getElementById('sendSMSCode').childNodes;
							// childNodes changes in different IE version,
							// so, search it and click on the right childNode;
							PUTLOG("Length of childNodes: " + childNodes.length);
							if (childNodes != null && childNodes.length > 0){
								for (i = 0; i < childNodes.length; i ++){
									PUTLOG("Test child: " + i);
									var childNode = childNodes[i];
									if (typeof childNode.href !== 'undefined'){
										PUTLOG("Try to click on child: " + i);
										childNode.click();
									}
								}
							}
						},
			"confPCode": function(){
							document.frames[0].document.frames[0].document.frames[0].document.getElementById('queding').click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 30;},
			// Phone Captcha
			"pHasCapt"   : function (){ return true;},
			"pCaptBox"   : function (){ return document.frames[0].document.frames[0].document.frames[0].document.getElementById('KeyPart');},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return document.frames[0].document.frames[0].document.frames[0].document.frames[0].document.body;},
			"pCaptcha"   : function (){ 
							var captcha = null;
							try{
								captcha = document.frames[0].document.frames[0].document.frames[0].document.frames[0].document.body.firstChild; 
							}catch(e){
								var voucherMap = {};
								voucherMap.errmsg = "ICBC get captcha image fail";
								PUTLOG("ICBC get captcha image fail: " + voucherMap.errmsg);
								window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ORG_SERVICE_ERR, Json.stringify(voucherMap));
							}
							return captcha;
							},
			"pSecureCapt" : function (){ return true;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"abc":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 0,
			"captSleep" : 0,
			"pcodeSleep": 0,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if(-1 != username.indexOf(' ') || 0 == username.length)
								return false;
							if(60<username.length || 2>username.length)
								return false;
							if (GlobalSettings.logintype == "cardnum"){
								if(16<=username.length && username.length<=19)
									return (/^\d+$/.test(username));
								return false;
							}
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "phonenum"){
								var Num=/^1[34578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}
							return true;  
						},
			"checkPasswordValid" : function(pass) { 
							if(-1 != pass.indexOf(' '))
								return false;
							return (/^\S{6,30}$/.test(pass));
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							if(url.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx/netBank/zh_CN/entrance/logonSelf.aspx") != -1 ){
								return true;
							}
							return false;
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true; },
			"waitPage" : function (){ return document.getElementById("powerpass_ie") != null; },	
			// userbox
			"userBox"  : function (){ return document.getElementById("UserBox"); },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false; },
			// passbox
			"securePass": function (){ return true; },
			"passBox"  : function (){ return document.getElementById("powerpass_ie"); },
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){
							if(document.getElementByClass("orangeBtn"))
								document.getElementByClass("orangeBtn").click();
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0; },// use HookInput if 0;
			// captcha
			"captBox"  : function (){ return document.getElementById('PICCODE2'); },
			"docBody"  : function (){ return document.body; },
			"captcha"  : function () { return document.getElementById("img2"); },
			"refreshCaptcha": function () { document.getElementById("changeCode").click(); },		
			"initCapt" : function(){},
			"secureCapt" : function (){ return false; },
			"captWidth": function (){ return 0; },
			"captHeight": function (){ return 0; },
			"captRetry" : function (){ return 100; },
			"focusCapt" : function (){ return true; },
			"hasCapt"   : function (){ return true; },
			// Phone	
			"tokenUrl" : function (url){ return false; },
			"phoneUrl" : function (url){ return false; }, // skip phone currently;
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true; },
			"pPageWait" : function (){ return true; },
			"pcodeBox" : function (){ return null; },
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false; },
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200; },
			"pBeforeSendCodeRetry" : function (){ return 0; },
			// Phone Captcha
			"pHasCapt"   : function (){ return false; },
			"pCaptBox"   : function (){ return null; },
			"pCaptFocus" : function (){ return true; },
			"pCaptBody"  : function (){ return null; },
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false; },
			"pCaptWidth": function (){ return 0; },	
			"pCaptHeight": function (){ return 0; }
		}
	},
	"cmb":{
		"debit":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return /^[^\s\u4E00-\u9FA5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01]{6,32}$/.test(username); },
			"checkPasswordValid" : function(pass) { return /^[a-zA-z0-9]{6,8}$/.test(pass); },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/LoginOLD.aspx";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							try{
								changeLoginType('D');
								return true;
							}catch(e){
								PUTLOG('cmb inner js error:' + e.message);
								return false;
							}
						},
			"waitPage" : function (){  
							if (document.getElementById('NetBankUser_Ctrl') != null
								&& document.getElementById("NetBankPwd_Ctrl") != null
								&& document.getElementById("ExtraPwd") != null){
								//document.getElementById('ExtraPwd').focus();
								document.getElementById("NetBankPwd_Ctrl").focus();
								return true;
							}
							return false;
						},	
			// userbox
			"userBox"  : function (){ return document.getElementById("NetBankUser_Ctrl");},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return true;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("NetBankPwd_Ctrl");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							document.getElementById("LoginBtn").click();
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){
							if(GlobalSettings.logintype == 'cardnum'){
								return 25;
							}else{
								return 0;
							}
						},
			// captcha
			"captBox"  : function (){ return document.getElementById('ExtraPwd');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("ImgExtraPwd");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){
							// nothing
						},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return false;},
			"hasCapt"   : function (){ return true;},			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  url == "https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/GenLoginVerifyM2.aspx";
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ 
							return true;
						},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.getElementById('txtSendCode');},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ 
							document.getElementById('btnSendCode').click();
						},
			"confPCode": function(){ 
							document.getElementById('btnVerifyCode').click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
        "credit":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if (GlobalSettings.logintype == 'cardnum'){
								return /^\d{15,16}$/.test(username);
							}else{
								return /^\d{17}[\dxX]$|^\d{15}$/.test(username);
							}
						},
			"checkPasswordValid" : function(pass) {return /^[0-9]{6}$/.test(pass);},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/LoginOLD.aspx";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							try{
								changeLoginType('C');
							}catch(e){
								PUTLOG('cmb inner js error:' + e.message);
								return false;
							}
                            if(GlobalSettings.logintype == 'cardnum'){
                                document.getElementById('LoginByCreditCardNo').click();
                            }else{   
                                document.getElementById('LoginByPID').click();
                            }
                            return true;
						},
			"waitPage" : function (){
                            if(GlobalSettings.logintype == 'cardnum'){
                                if (document.getElementById('CreditCardNo_Ctrl') != null
                                    && document.getElementById("CreditCardQueryPwd_Ctrl") != null
                                    && document.getElementById("ExtraPwd") != null){
									document.getElementById("CreditCardQueryPwd_Ctrl").focus();
                                    return true;
                                }else{
                                    return false;
                                }
                            }else if(GlobalSettings.logintype == 'pidnum'){
                                document.getElementById("IdType").value = '01';
                            }else if(GlobalSettings.logintype == 'passport'){
                                document.getElementById("IdType").value = '02';
                            }else if(GlobalSettings.logintype == 'othercard'){
                                document.getElementById("IdType").value = '03';
                            }
                            
							if (document.getElementById('IdNo_Ctrl') != null
								&& document.getElementById("CreditCardQueryPwd_Ctrl") != null
								&& document.getElementById("ExtraPwd") != null){
								document.getElementById("CreditCardQueryPwd_Ctrl").focus();
								return true;
							}
							return false;
						},	
			// userbox
			"userBox"  : function (){
                            if(GlobalSettings.logintype == 'cardnum'){
                                return document.getElementById('CreditCardNo_Ctrl');
                            }else{   
                                return document.getElementById('IdNo_Ctrl');
                            }
                        },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return true;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){
                            return document.getElementById('CreditCardQueryPwd_Ctrl');
                        },
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							document.getElementById("LoginBtn").click();
						},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ 
							if (GlobalSettings.logintype == 'cardnum'){
								return 25;
							}
							return 0;
						},
			// captcha
			"captBox"  : function (){ return document.getElementById('ExtraPwd');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("ImgExtraPwd");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){
							// nothing
						},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return false;},
			"hasCapt"   : function (){ return true;},			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  url == "https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/GenLoginVerifyM2.aspx";
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ 
							return true;
						},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.getElementById('txtSendCode');},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ 
							document.getElementById('btnSendCode').click();
						},
			"confPCode": function(){ 
							document.getElementById('btnVerifyCode').click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"ccb":{
		"v5":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return username.replace(/^\s+|\s+$/gm,'').length > 0; },
			"checkPasswordValid" : function(pass) { 
									if (pass.length == 0){
										return false;
									}
									return true; 
								   },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							PUTLOG("CCB check v5 login url");
							if ( url.indexOf("https://ibsbjstar.ccb.com.cn/app/V5/CN/STY1/login.jsp") != -1)
								return true;
							if ( url.indexOf("https://ibsbjstar.ccb.com.cn/app/V5/CN/STY1/login_ad.jsp") != -1)
								return true;
							return false;
						},
			"pageReady": function (){ return true;},
			"initPage" : function (){ return true;},
			"waitPage" : function (){ 
							if (document.getElementById('fclogin') != null 
								&& 'undefined' !== typeof document.getElementById('fclogin').contentWindow 
								&& document.getElementById('fclogin').contentWindow != null 
								&& (document.getElementById('fclogin').contentWindow.document.getElementById('USERID') != null || document.getElementById('fclogin').contentWindow.document.getElementById("USERIDPL"))
								&& document.getElementById('fclogin').contentWindow.document.getElementById('LOGPASS') != null ){
									return true;
							}
							return false;
						},	
			// userbox
			"userBox"  : function (){
							var retObj = document.getElementById('fclogin').contentWindow.document.getElementById("USERIDPL");
							if ( null != retObj){
								return retObj;
							}
							retObj = document.getElementById('fclogin').contentWindow.document.getElementById("USERID");
							if ( null != retObj){
								return retObj;
							}
							return null;
						},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return false;},
			"passBox"  : function (){ return document.getElementById('fclogin').contentWindow.document.getElementById("LOGPASS");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function () {
								//keyJiami(document.getElementById('fclogin').contentWindow.document.getElementById("LOGPASS"));
								document.getElementById('fclogin').contentWindow.document.getElementById("loginButton").click();
							},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('fclogin').contentWindow.document.getElementById("PT_CONFIRM_PWD");},
			"docBody"  : function (){ return document.getElementById('fclogin').contentWindow.document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById('fclogin').contentWindow.document.getElementById("fujiama");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return true;},	
			"hasCapt"   : function (){ return true;},			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  false;
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox"  : function (){ return null;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ },
			"confPCode": function(){ },
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},	
		"debit":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return !/\s+/.test(username) && username.length > 0; },
			"checkPasswordValid" : function(pass) { return !/\s+/.test(pass) && /^\S{6,12}$/.test(pass); },
			"checkVCodeValid" : function(VCode) { return VCode.length == 5; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							PUTLOG("CCB check v6 login url");
							return url == 'https://ibsbjstar.ccb.com.cn/CCBIS/V6/STY1/CN/login.jsp';
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true;},
			"waitPage" : function (){ 
							if (document.getElementById('fclogin') != null 
								&& 'undefined' !== typeof document.getElementById('fclogin').contentWindow 
								&& document.getElementById('fclogin').contentWindow != null 
								&& (document.getElementById('fclogin').contentWindow.document.getElementById('USERIDPL') != null || document.getElementById('fclogin').contentWindow.document.getElementById('USERID') != null )
								&& document.getElementById('fclogin').contentWindow.document.getElementById('LOGPASS') != null ){
									return true;
							}
							return false;
						},	
			// userbox
			"userBox"  : function (){ 
							var retObj = document.getElementById('fclogin').contentWindow.document.getElementById("USERIDPL");
							if ( null != retObj){
								return retObj;
							}
							retObj = document.getElementById('fclogin').contentWindow.document.getElementById("USERID");
							if ( null != retObj){
								return retObj;
							}
							return null;
						},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return false;},
			"passBox"  : function (){ return document.getElementById('fclogin').contentWindow.document.getElementById("LOGPASS");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
										document.getElementById('fclogin').contentWindow.keyJiami(document.getElementById('fclogin').contentWindow.document.getElementById("LOGPASS"));
										document.getElementById('fclogin').contentWindow.document.getElementById("loginButton").click();
									},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('fclogin').contentWindow.document.getElementById("PT_CONFIRM_PWD");},
			"docBody"  : function (){ return document.getElementById('fclogin').contentWindow.document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById('fclogin').contentWindow.document.getElementById("fujiama");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return true;},	
			"hasCapt"   : function (){ return true;},			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  false;
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox"  : function (){ return null;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ },
			"confPCode": function(){ },
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
		"credit":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return !/\s+/.test(username) && /^\S{1,50}$/.test(username); },
			"checkPasswordValid" : function(pass) { return !/\s+/.test(pass) && /^\S{6,16}$/.test(pass); },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							PUTLOG("CCB check credit login url");
							if ( url.indexOf('http://login.ccb.com/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=NHY010&tourl=http://creditcard.ccb.com') != -1){
								return true;
							}
							return false;
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true;},
			"waitPage" : function (){ 
							if (document.getElementById('ifrShow1') != null 
								&& 'undefined' !== typeof document.getElementById('ifrShow1').contentWindow 
								&& document.getElementById('ifrShow1').contentWindow != null 
								&& (document.getElementById('ifrShow1').contentWindow.document.getElementById('custname') != null )
								&& document.getElementById('ifrShow1').contentWindow.document.getElementById('custpwd') != null ){
									return true;
							}
							return false;
						},	
			// userbox
			"userBox"  : function (){ 
							var retObj = document.getElementById('ifrShow1').contentWindow.document.getElementById("custname");
							if ( null != retObj){
								return retObj;
							}
							return null;
						},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return !true;},
			"passBox"  : function (){ return document.getElementById('ifrShow1').contentWindow.document.getElementById("custpwd");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
										document.getElementById('ifrShow1').contentWindow.Calc.password.value = document.getElementById('ifrShow1').contentWindow.document.getElementById("custpwd").value;
										document.getElementById('ifrShow1').contentWindow.keyJiami(document.getElementById('ifrShow1').contentWindow.document.getElementById("custpwd"));
										document.getElementById('ifrShow1').contentWindow.checkpwd(false);
										document.getElementById('ifrShow1').contentWindow.document.getElementById("jhform").submit();
									},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('ifrShow1').contentWindow.document.getElementById("PT_CONFIRM_PWD");},
			"docBody"  : function (){ return document.getElementById('ifrShow1').contentWindow.document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById('ifrShow1').contentWindow.document.getElementById("fujiama");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return true;},	
			"hasCapt"   : function (){ return true;},			
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  false;
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox"  : function (){ return null;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ },
			"confPCode": function(){ },
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"spdb":{
		"debit":{
			"userSleep" : 5,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { 
							if(username == "")
								return false;
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "username"){
								if (getStringLength(username) > 20 || getStringLength(username) < 6){
									return false;
								}
							}
							return true;  
						},
			"checkPasswordValid" : function(pass) {
                            if (!(pass.length == 6 && /^\d+$/.test(pass)))
                                return false;
                            return true;
                        },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) {
							if(6==PCode.length)
								return true;
							return false;
						},
			"loginUrl" : function (url){ 
							return (url == "https://ebank.spdb.com.cn/nbper/prelogin.do#" && document.frames[0].document.getElementById("LoginId") != 'undefined' && document.frames[0].document.getElementById("LoginId") != null);
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true; },
			"waitPage" : function (){ return document.frames[0].document.getElementById("OPassword") != null;},
			// userbox
			"userBox"  : function (){ return document.frames[0].document.getElementById("LoginId");},
			"userBoxBlur": function (){ this.userBox().blur(); },
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.frames[0].document.getElementById("OPassword");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.frames[0].document.getElementById("LoginButton").click();},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.frames[0].document.getElementById("verCodeToken");},
			"docBody"  : function (){ return document.frames[0].document.body;},
			"captcha"  : function () {
							try{ 
								return document.frames[0].document.getElementById("tokenImg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return true;},	
			"hasCapt"   : function (){ return true;},			
			// Phone
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){
							return  (url == 'https://ebank.spdb.com.cn/nbper/logindispatch.do' && document.frames[0].document.getElementById('MobilePasswd') != undefined && document.frames[0].document.getElementById('MobilePasswd') != null);
						},
			"pPageReady": function (){ return (document.frames[0].document.getElementById('MobilePasswd') != undefined && document.frames[0].document.getElementById('MobilePasswd') != null); },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.frames[0].document.getElementById('MobilePasswd');},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ document.frames[0].document.getElementById('SendPasswd').click();},
			"confPCode": function(){ var sendBut = document.frames[0].document.getElementById('sendMsg');
							if(sendBut == null){
								if ('undefined' == typeof document.frames[0].document.getElementByClass){
									document.frames[0].document.getElementByClass = function(n) { 
										var _el = document.frames[0].document.getElementsByTagName('*');
										for (var i=0; i<_el.length; i++ ) {
											if (_el[i].className == n ) {
												return _el[i];
											}
										}
										return ;
									};
								}
								sendBut = document.frames[0].document.getElementByClass('button button-block');
							}
							if(sendBut == null || sendBut == undefined){
								PUTLOG('sendBut is not found');
							}else{
								PUTLOG('sendBut is found');
							}
							sendBut.click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
		"credit":{
			"userSleep" : 0,
			"passSleep" : 0,
			"captSleep" : 0,
			"pcodeSleep": 0,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { 
							if(username == "")
								return false;
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "username"){
								if (getStringLength(username) > 20){
									return false;
								}
							}
							return true;  
						},
			"checkPasswordValid" : function(pass) {
                            if (!(pass.length == 6 && /^\d+$/.test(pass)))
                                return false;
                            return true;
                        },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) {
							if(6==PCode.length)
								return true;
							return false;
						},
			"loginUrl" : function (url){ 
							return url == "https://cardsonline.spdbccc.com.cn/icard/icardlogin.do";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ if(GlobalSettings.logintype == "pidnum"){
					document.getElementsByName("IdType")[0].value = '01';
					return true;
				}else if(GlobalSettings.logintype == "passport"){
					document.getElementsByName("IdType")[0].value = '09';
					return true;
				}else if(GlobalSettings.logintype == "officercard"){
					document.getElementsByName("IdType")[0].value = '03';
					return true;
				}else if(GlobalSettings.logintype == "taipassport"){
					document.getElementsByName("IdType")[0].value = '04';
					return true;
				}else if(GlobalSettings.logintype == "gangaopassport"){
					document.getElementsByName("IdType")[0].value = '05';
					return true;
				}else if(GlobalSettings.logintype == "othercard"){
					document.getElementsByName("IdType")[0].value = '06';
					return true;
				}else{//username and others
					document.getElementsByName("IdType")[0].value = '00';
					return true;
				}
			},	
			"waitPage" : function (){ return document.getElementById("OPassword") != null;},	
			// userbox
			"userBox"  : function (){ return document.getElementsByName("IdNo")[0];},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("OPassword");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.getElementsByName("LoginButton")[0].click();},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementsByName("Token")[0];},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("CaptchaImg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},		
			"captRetry" : function (){ return 100;}, 	
			"focusCapt" : function (){ return true;},	
			"hasCapt"   : function (){ return true;},			
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){return  url == 'https://cardsonline.spdbccc.com.cn/icard/login.do';},
			"pPageReady": function (){ return (document.getElementById('MobilePasswd') != 'undefined' && document.getElementById('MobilePasswd') != null); },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return document.getElementById('MobilePasswd');},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){ /*return resendMobilePwd();*/},
			"confPCode": function(){ document.getElementsByName("Button")[0].click();},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"cebc":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 0,
			"captSleep" : 0,
			"pcodeSleep": 0,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if(-1 != username.indexOf(' ') || 0 == username.length)
								return false;
							if(21<username.length)
								return false;
							if (GlobalSettings.logintype == "cardnum"){
								if(16<=username.length && username.length<=19)
									return (/^\d+$/.test(username));
								return false;
							}
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "phonenum"){
								var Num=/^1[34578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}
							return true; 
						},
			"checkPasswordValid" : function(pass) {
							if(-1 != pass.indexOf(' '))
								return false;
							return (/^\S{8,14}$/.test(pass));
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) {
							if(-1 != PCode.indexOf(' '))
								return false;
							if(6==PCode.length)
								return true;
							return false;
						},
			"loginUrl" : function (url){ 
							if(url.indexOf("https://www.cebbank.com/per/prePerlogin.do?_locale=zh_CN") != -1){
								return true;
							}
							return false;
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true; },	
			"waitPage" : function (){ 
							/*
							var newServerRandom = document.getElementsByTagName("param")[8].value;
							var child=document.getElementsByTagName("ocxid")[0];
							child.parentNode.removeChild(child);
							SecEditAgent.init("PPP","ocxId","powerpassForLogin","186","22",GlobalSettings.pass.length,"20","1","1","#7f9db9","#7F9DB9","^.{1,20}$",newServerRandom,"04b9c9eb7b718f1b7fc1d97306f0b1bc1a387849d4547083f33dad1d59e9cb6a9218b04b0dfbfb8dab14090b8b1eb88deaa888690eba19e9413c1f8c2629193d");	
							checkNavigatorIsInstall("powerpassForLogin","3000101a,3000102,3000103,3000104,3000105");
							PUTLOG("cebc current passbox minlength: " + document.getElementsByTagName("param")[1].value);
							*/
							return document.getElementById("skey") != null; 
						},	
			// userbox
			"userBox"  : function (){ return document.getElementById("skey"); },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false; },
			// passbox
			"securePass": function (){ return true; },
			"passBox"  : function (){ return document.getElementById("powerpassForLogin"); },
			"clearPassBox"  : function (){
							if(SecEditAgent){
								SecEditAgent.clearData('powerpassForLogin');
							}
						},
			"inputPasswordRetry": 5,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							doLogin();
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25; },
			// captcha
			"captBox"  : function (){
							return null;
						},
			"docBody"  : function (){ return document.body; },
			"captcha"  : function () { return null; },
			"initCapt" : function(){},
			"secureCapt" : function (){ return false; },
			"captWidth": function (){ return 0; },		
			"captHeight": function (){ return 0; },			
			"captRetry" : function (){ return 100; }, 
			"focusCapt" : function (){ return true; },
			"hasCapt"   : function (){ return true; },
			// Phone	
			"tokenUrl" : function (url){
				if(-1 != window.location.href.indexOf("https://www.cebbank.com/per/perlogin1.do")){
					if (document.getElementById('skey') != null 
						&& document.getElementById('tipSpan') != null
						&& document.getElementById('TelNo') == null){
						return true;
					}			
				}
				return false;
			},	
			"phoneUrl" : function (url){
							if (window.location.href.indexOf("https://www.cebbank.com/per/perlogin1.do") != -1
								|| window.location.href.indexOf("https://www.cebbank.com/per/perlogin3.do") != -1){
								if (document.getElementById('bbb') != null
								&& document.getElementById('TelNo') != null 
								&& document.getElementById('smsSndSeqNoHtml') != null){
									return true;
								}
							}
							return false;
						},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true; },
			"pPageWait" : function (){ return true; },
			"pcodeBox" : function (){ return document.getElementById('skey'); },
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false; },
			"reqPCode" : function(){},
			"confPCode": function(){
							if(document.getElementByClass("btn_r"))
								document.getElementByClass('btn_r').click();
						},
			"pcodeRetry" : function (){ return 1200; },
			"pBeforeSendCodeRetry" : function (){ return 0; },
			// Phone Captcha
			"pHasCapt"   : function (){ return false; },
			"pCaptBox"   : function (){ return null; },
			"pCaptFocus" : function (){ return true; },
			"pCaptBody"  : function (){ return null; },
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false; },
			"pCaptWidth": function (){ return 0; },
			"pCaptHeight": function (){ return 0; }
		}
	},
	"cncb":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"maxPassBoxLength": 12,
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							else if(GlobalSettings.logintype == "cardnum")
							{
								var Num=/^[0-9]*$/;
								if (username.length > 15 && username.length < 20 && Num.test(username)){
									return true;
								}
								return false;
							}
							return !/^ +$/.test(username) && (username != ""); 
						},
			"checkPasswordValid" : function(orgpass) { 
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							return pass.length>5;// && pass.length <13; 
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://i.bank.ecitic.com/perbank6/signIn.do";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							if (document.getElementById('verifyId') != null){
								document.getElementById('verifyId').style.display = 'block';
							}
							if (document.getElementsByName('verifyCode') != null && document.getElementsByName('verifyCode')[0] != null){
								document.getElementsByName('verifyCode')[0].style.display = 'block';
							}
							return document.getElementById("ocxEdit") != null;
						},	
			"waitPage" : function (){ return document.getElementById("ocxEdit") != null;},
			// userbox
			"userBox"  : function (){ return document.getElementsByName('logonNoCert')[0];},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("ocxEdit");},
			"passBoxLength": function (){
							try{
								return document.getElementById("ocxEdit").output3;
							}catch(err){
								return 0;
							}
						},
			"clearPassBox": function (){ 
							try{
								document.getElementById("ocxEdit").ClearSeCtrl();
							}catch(err){
							}
						},
			"inputPasswordRetry": 3,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.getElementById("logonButton").click(); },
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementsByName('verifyCode')[0];},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("pinImg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ 
							if (document.getElementById('verifyId') != null){
								if (document.getElementById('verifyId').style.display == 'none'){
									PUTLOG("No captcha as verifyId.style.display is none")
									return false;
								}
							}
							if (document.getElementsByName('verifyCode') != null && document.getElementsByName('verifyCode')[0] != null){
								if (document.getElementsByName('verifyCode')[0].style.display == 'none'){
									PUTLOG("No captcha as verifyCode.style.display is none");									
									return false;
								}
							}
							return true;
						},
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},
			"pCaptHeight": function (){
							return 0;
						}
		},
		"credit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"maxPassBoxLength": 12,
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							else if(GlobalSettings.logintype == "cardnum")
							{
								var Num=/^[0-9]*$/;
								if (username.length > 15 && username.length < 20 && Num.test(username)){
									return true;
								}
								return false;
							}
							return !/^ +$/.test(username) && (username != ""); 
						},
			"checkPasswordValid" : function(orgpass) { 
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							return pass.length>5;// && pass.length <13; 
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://i.bank.ecitic.com/perbank6/signIn.do";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							if (document.getElementById('verifyId') != null){
								document.getElementById('verifyId').style.display = 'block';
							}
							if (document.getElementsByName('verifyCode') != null && document.getElementsByName('verifyCode')[0] != null){
								document.getElementsByName('verifyCode')[0].style.display = 'block';
							}
							return document.getElementById("ocxEdit") != null;
						},	
			"waitPage" : function (){ return document.getElementById("ocxEdit") != null;},
			// userbox
			"userBox"  : function (){ return document.getElementsByName('logonNoCert')[0];},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("ocxEdit");},
			"passBoxLength": function (){
							try{
								return document.getElementById("ocxEdit").output3;
							}catch(err){
								return 0;
							}
						},
			"clearPassBox": function (){ 
							try{
								document.getElementById("ocxEdit").ClearSeCtrl();
							}catch(err){
							}
						},
			"inputPasswordRetry": 3,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.getElementById("logonButton").click(); },
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementsByName('verifyCode')[0];},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("pinImg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ 
							if (document.getElementById('verifyId') != null){
								if (document.getElementById('verifyId').style.display == 'none'){
									//PUTLOG("No captcha as verifyId.style.display is none")
									return false;
								}
							}
							if (document.getElementsByName('verifyCode') != null && document.getElementsByName('verifyCode')[0] != null){
								if (document.getElementsByName('verifyCode')[0].style.display == 'none'){
									//PUTLOG("No captcha as verifyCode.style.display is none");									
									return false;
								}
							}
							return true;
						},
			// Phone
			"tokenUrl" : function (url){
				return false;
						},
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"cmbc":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { 
							if (username.length < 3 || username.length > 32){
								return false;
							}
							return true;
						},
			"checkPasswordValid" : function(pass) {
							if (pass.length < 6 || pass.length > 20){
								return false;
							}
							return true;
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://nper.cmbc.com.cn/pweb/static/login.html";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							if (document.getElementById('_tokenImg') != null){
								document.getElementById('_tokenImg').click();
							}
							return true;
						},	
			"waitPage" : function (){ return document.getElementById("_ocx_passwordChar_login") != null;},	
			// userbox
			"userBox"  : function (){ return document.getElementById('writeUserId');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("_ocx_passwordChar_login");},
			"pgeditorChar" : function (){
							return new PGEdit({
								pgeId: "_ocx_passwordChar_login",
								pgeEdittype: 0,
								pgeHasskb:"0",
								pgeType:20,
								pgeTabindex: 2,
								pgeClass: "ocx_style",
								pgeOnkeydown:"authenticateUser()",
								tabCallback:"_vTokenName"
							});
						},
			"passBoxLength"  : function (){
							return this.pgeditorChar().pwdLength();
						},
			"clearPassBox": function (){ 
							try{
								this.pgeditorChar().pwdclear();
							}catch(err){
							}
						},
			"inputPasswordRetry": 3,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ document.getElementById("loginButton").click(); },
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('_vTokenName');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								if(document.getElementById("_tokenImg") != null && document.getElementById("_tokenImg").parentNode.parentNode.style.display != "none")
								{
									return document.getElementById("_tokenImg");
								}
								else {return null;}
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},			
			"captRetry" : function (){ return 100;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ return true;},
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},		
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						},
			"retrySetPassCount": 1,		
			"cycleCountBeforeRetry": 100,		
			"retrySetPass": function (){
							if (window.location.href.indexOf('https://nper.cmbc.com.cn/pweb/static/login.html') != -1){
								if (document.getElementById('jsonError') != null){
									var errmsg = document.getElementById('jsonError').innerText;
									if (errmsg != ""){
										var errorCode = DecodeError(errmsg);
										if((LoginErrorCode.LOG_FAILE_SESSIONINVA == errorCode) || (LoginErrorCode.LOG_FAILE_USERNAME_PWD_ERR == errorCode) ){
											PUTLOG("Retry set pass, catch error jsonError message is: " + errmsg);
											return true;
										}			
									}
								}
							}
							return false;
						},
			"reportStatusAfterRetry": function (){
							if (window.location.href.indexOf('https://nper.cmbc.com.cn/pweb/static/login.html') != -1){
								if (document.getElementById('jsonError') != null){
									var errmsg = document.getElementById('jsonError').innerText;
									if (errmsg != ""){
										PUTLOG("Report status after retry, catch page error, <jsonError>: " + errmsg);
										var voucherMap = {};
										voucherMap.errmsg = errmsg;
										var errorCode = DecodeError(errmsg);
										if(errorCode && ((LoginErrorCode.LOG_FAILE_SESSIONINVA == errorCode) || (LoginErrorCode.LOG_FAILE_USERNAME_PWD_ERR == errorCode))){
											window.external.ReportStatus(errorCode, Json.stringify(voucherMap));
											return;
										}
									}
								}
							}
							return;
						}
		}
	},
	"hxb":{
		"debit":{
			"userSleep" : 1,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return username.replace(/^\s+|\s+$/gm,'').length > 0; },
			"checkPasswordValid" : function(pass) { return !/\s+/.test(pass); },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://sbank.hxb.com.cn/easybanking/jsp/login/login.jsp";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
                            if(GlobalSettings.logintype == "pidnum"){
                                if (document.getElementById('divli2') != null){
                                    document.getElementById('divli2').click();
                                    document.getElementsByName('idType')[0].value = '100';
                                }
                            }else{
                                if (document.getElementById('divli1') != null){
                                    document.getElementById('divli1').click();
                                }
                            }
							return true;
						},	
			"waitPage" : function (){ return document.getElementById("passwd") != null;},	
			// userbox
			"userBox"  : function (){
                            if(GlobalSettings.logintype == "pidnum"){
                                return document.getElementById('idNo');
                            }else{
                                return document.getElementById('alias');
                            }
                        },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("passwd");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementsByName('qy_sut') != null && document.getElementsByName('qy_sut').length > 0){
								document.getElementsByName('qy_sut')[0].click(); 
							}
						},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('validateNo');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("validateNoImage");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},			
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ return true;},
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pcodeBox" : function (){return null;},	
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		},
        "credit":{
			"userSleep" : 1,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return username.replace(/^\s+|\s+$/gm,'').length > 0; },
			"checkPasswordValid" : function(pass) { return !/\s+/.test(pass); },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://sbank.hxb.com.cn/easybanking/jsp/login/login.jsp";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
                            if(GlobalSettings.logintype == "pidnum"){
                                if (document.getElementById('divli2') != null){
                                    document.getElementById('divli2').click();
                                    document.getElementsByName('idType')[0].value = '100';
                                }
                            }else{
                                if (document.getElementById('divli1') != null){
                                    document.getElementById('divli1').click();
                                }
                            }
							return true;
						},	
			"waitPage" : function (){ return document.getElementById("passwd") != null;},	
			// userbox
			"userBox"  : function (){
                            if(GlobalSettings.logintype == "pidnum"){
                                return document.getElementById('idNo');
                            }else{
                                return document.getElementById('alias');
                            }
                        },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("passwd");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementsByName('qy_sut') != null && document.getElementsByName('qy_sut').length > 0){
								document.getElementsByName('qy_sut')[0].click(); 
							}
						},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('validateNo');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("validateNoImage");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},			
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){ return true;},
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},	
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pcodeBox" : function (){return null;},	
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"cib":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(orgusername) { 
							var username = orgusername.replace(/[(^\s*)|(\s*$)]/g, "");
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum"){
								var Num=/^1[3578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								var Num=/^[0-9]*$/;
								if (username.length >= 10 && username.length <= 18 && Num.test(username)){
									return true;
								}
								return false;
							}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "custnum"){
								var NumAlph=/^[A-Za-z0-9]+$/;
								if (username.length != 8 && NumAlph.test(username)){
									return true;
								}
								return false;
							}else{
								if (username.length >= 6 && username.length <= 18){
									return true;
								}
								return false;
							}
							//return true;
						},
			"checkPasswordValid" : function(orgpass) {
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							
							if(window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!queryAccount.do")==-1&& GlobalSettings.logintype == "cardnum" &&(document.getElementById("loginNextBtn")!= null))
							{
								document.getElementById("loginNextBtn").click();
							}
							return pass.length > 5 && pass.length < 9; },
			"checkVCodeValid" : function(VCode) { return true;},//return VCode.length == 4; },
			"checkPCodeValid" : function(PCode) { return true;},//return PCode.length == 6; },
			"loginUrl" : function (url){ 
							return ( url == ("https://personalbank.cib.com.cn/pers/main/login.do") &&document.getElementById('btnSendSms')==null && GlobalSettings.logintype == "phonenum"&& document.getElementById('ui-dialog-title-1')==null )||(url == "https://personalbank.cib.com.cn/pers/main/login.do" &&document.getElementById('ui-dialog-title-1')==null && GlobalSettings.logintype != "phonenum")||(url.indexOf("https://personalbank.cib.com.cn/pers/main/login!verySMS.do")!=-1)||(url.indexOf("https://personalbank.cib.com.cn/pers/main/login!queryAccount.do")!=-1);
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){//custnum 0;name 2; cardnum 1; phoneNo 3
							if(document.getElementById("useControlChkBox")!= null)
							{
								if(document.getElementById("useControlChkBox").checked == true)
								{
									document.getElementById("useControlChkBox").checked = false;
								}
							}
							if( window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login.do")!=-1){
								if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum" ){
									document.getElementById("logintype3").click();
									return true;
								}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
									document.getElementById("logintype1").click();
									return true;
								}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "custnum" ){
								document.getElementById("logintype0").click();
								return true;
							}else{
								document.getElementById("logintype2").click();
								return true;
							}
							}else{
								return true;
							}
						},
			"waitPage" : function (){
							if( window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!verySMS.do?")!=-1)
							{
								return document.getElementById("loginpwd_div").style.visibility != "hidden";
							}
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum" && document.getElementById("loginpwd_div").style.visibility == "hidden"){
								return document.getElementById("mobLogin_sendsms") != null;
							}else{
								return document.getElementById("loginPwd") != null;
							}
						},
			// userbox
			"userBox"  : function (){ return document.getElementById('loginNameTemp');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){
							var pass = GlobalSettings.pass.replace(/[(^\s*)|(\s*$)]/g, "");
							if(document.getElementById('loginPwd')!= null)
							{
								document.getElementById('loginPwd').value = pass;
							}
							return null;
						},//document.getElementById("loginPwd");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementById('loginSubmitBtn') != null){
								document.getElementById('loginSubmitBtn').click(); 
							}
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){
							try{ 
								return document.getElementById("addInYard");
							}catch(err){
								return null;
							}
						},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("yardIMG");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){
							if (document.getElementById('addInYard') != null && document.getElementById('yardIMG') != null){
								return true;
							}
							return false;
						},
			// Phone
			"tokenUrl" : function (url){ return false;},
			"phoneUrl" : function (url){ return url.indexOf("https://personalbank.cib.com.cn/pers/main/login.do")!=-1 &&document.getElementById('btnSendSms')!=null&&GlobalSettings.logintype == "phonenum";},
			"pPageReady": function (){ return document.getElementById('loginNameTemp')!=null;},
			"pPageInit" : function (){
							var Num=/^[0-9]*$/;
							var orgusername = GlobalSettings.user;
							var username = orgusername.replace(/[(^\s*)|(\s*$)]/g, "");
							var result= false;
							if (Num.test(username) && username.length == 11&& GlobalSettings.logintype == "phonenum"){
								$.ajax({
										async : false,
										url : $ctx + "/login!queryPersonal.do",
										type : "POST",
										data : {
											"phoneNo" : orgusername
										},
										success : function (msg) {
											if (!msg.error)
												if (msg.isExistPersonal)
													result = true;
												else if (!msg.isExistAccount)
													result = false;
												else
													result = true;
											else {
												result = false;
											}
										},
										error : function () {
											result = false;
										},
										timeout : 1E4
								});
								
								if(!result)
								{
									var voucherMap = {};
									voucherMap.errmsg = "This phone number not exist. username len:" + username.length;
									window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
									return false;
								}
								else
								{
									document.getElementById('loginNameTemp').focus();
									document.getElementById('loginNameTemp').value = GlobalSettings.user;
									if(document.createEventObject) {
										document.getElementById('loginNameTemp').fireEvent('onblur');
									}
									else
									{
										document.getElementById('loginNameTemp').blur();
									}
									return true;
								}
							}
							else
							{
									var voucherMap = {};
									voucherMap.errmsg = "invalid username,len:" + username.length;
									window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
									return false;
							}
						},
			"pPageWait": function (){return true;},
			"pcodeBox" : function (){return document.getElementById("mobLogin_sendsms");},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){document.getElementById("btnSendSms").click();},
			"confPCode": function(){
							//document.getElementById('loginPwd').value = GlobalSettings.pass;
							//document.getElementById("loginSubmitBtn").click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},
			"pCaptHeight": function (){
							return 0;
						}
		},
		"credit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(orgusername) { 
							var username = orgusername.replace(/[(^\s*)|(\s*$)]/g, "");
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum"){
								var Num=/^1[3578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
								var Num=/^[0-9]*$/;
								if (username.length >= 10 && username.length <= 18 && Num.test(username)){
									return true;
								}
								return false;
							}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "custnum"){
								var NumAlph=/^[A-Za-z0-9]+$/;
								if (username.length != 8 && NumAlph.test(username)){
									return true;
								}
								return false;
							}else{
								if (username.length >= 6 && username.length <= 18){
									return true;
								}
								return false;
							}
							//return true;
						},
			"checkPasswordValid" : function(orgpass) {
							var pass = orgpass.replace(/[(^\s*)|(\s*$)]/g, "");
							
							if(window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!queryAccount.do")==-1&& GlobalSettings.logintype == "cardnum" &&(document.getElementById("loginNextBtn")!= null))
							{
								document.getElementById("loginNextBtn").click();
							}
							return pass.length > 5 && pass.length < 9; },
			"checkVCodeValid" : function(VCode) { return true;},//return VCode.length == 4; },
			"checkPCodeValid" : function(PCode) { return true;},//return PCode.length == 6; },
			"loginUrl" : function (url){ 
							return ( url == ("https://personalbank.cib.com.cn/pers/main/login.do") &&document.getElementById('btnSendSms')==null && GlobalSettings.logintype == "phonenum"&& document.getElementById('ui-dialog-title-1')==null )||(url == "https://personalbank.cib.com.cn/pers/main/login.do" &&document.getElementById('ui-dialog-title-1')==null && GlobalSettings.logintype != "phonenum")||(url.indexOf("https://personalbank.cib.com.cn/pers/main/login!verySMS.do")!=-1)||(url.indexOf("https://personalbank.cib.com.cn/pers/main/login!queryAccount.do")!=-1);
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){//custnum 0;name 2; cardnum 1; phoneNo 3
							if(document.getElementById("useControlChkBox")!= null)
							{
								if(document.getElementById("useControlChkBox").checked == true)
								{
									document.getElementById("useControlChkBox").checked = false;
								}
							}
							if( window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login.do")!=-1){
								if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum" ){
									document.getElementById("logintype3").click();
									return true;
								}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "cardnum"){
									document.getElementById("logintype1").click();
									return true;
								}else if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "custnum" ){
								document.getElementById("logintype0").click();
								return true;
							}else{
								document.getElementById("logintype2").click();
								return true;
							}
							}else{
								return true;
							}
						},
			"waitPage" : function (){
							if( window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!verySMS.do?")!=-1)
							{
								return document.getElementById("loginpwd_div").style.visibility != "hidden";
							}
							if(GlobalSettings.logintype != undefined && GlobalSettings.logintype != "" && GlobalSettings.logintype == "phonenum" && document.getElementById("loginpwd_div").style.visibility == "hidden"){
								return document.getElementById("mobLogin_sendsms") != null;
							}else{
								return document.getElementById("loginPwd") != null;
							}
						},
			// userbox
			"userBox"  : function (){ return document.getElementById('loginNameTemp');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){
							var pass = GlobalSettings.pass.replace(/[(^\s*)|(\s*$)]/g, "");
							if(document.getElementById('loginPwd')!= null)
							{
								document.getElementById('loginPwd').value = pass;
							}
							return null;
						},//document.getElementById("loginPwd");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementById('loginSubmitBtn') != null){
								document.getElementById('loginSubmitBtn').click(); 
							}
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 0;},
			// captcha
			"captBox"  : function (){
							try{ 
								return document.getElementById("addInYard");
							}catch(err){
								return null;
							}
						},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("yardIMG");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},
			"captHeight": function (){
							return 0;
						},
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return true;},
			"hasCapt"   : function (){
							if (document.getElementById('addInYard') != null && document.getElementById('yardIMG') != null){
								return true;
							}
							return false;
						},
			// Phone
			"tokenUrl" : function (url){ return false;},
			"phoneUrl" : function (url){ return url.indexOf("https://personalbank.cib.com.cn/pers/main/login.do")!=-1 &&document.getElementById('btnSendSms')!=null&&GlobalSettings.logintype == "phonenum";},
			"pPageReady": function (){ return document.getElementById('loginNameTemp')!=null;},
			"pPageInit" : function (){
							var Num=/^[0-9]*$/;
							var orgusername = GlobalSettings.user;
							var username = orgusername.replace(/[(^\s*)|(\s*$)]/g, "");
							var result= false;
							if (Num.test(username) && username.length == 11&& GlobalSettings.logintype == "phonenum"){
								$.ajax({
										async : false,
										url : $ctx + "/login!queryPersonal.do",
										type : "POST",
										data : {
											"phoneNo" : orgusername
										},
										success : function (msg) {
											if (!msg.error)
												if (msg.isExistPersonal)
													result = true;
												else if (!msg.isExistAccount)
													result = false;
												else
													result = true;
											else {
												result = false;
											}
										},
										error : function () {
											result = false;
										},
										timeout : 1E4
								});
								
								if(!result)
								{
									var voucherMap = {};
									voucherMap.errmsg = "This phone number not exist. username len:" + username.length;
									window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
									return false;
								}
								else
								{
									document.getElementById('loginNameTemp').focus();
									document.getElementById('loginNameTemp').value = GlobalSettings.user;
									if(document.createEventObject) {
										document.getElementById('loginNameTemp').fireEvent('onblur');
									}
									else
									{
										document.getElementById('loginNameTemp').blur();
									}
									return true;
								}
							}
							else
							{
									var voucherMap = {};
									voucherMap.errmsg = "invalid username,len:" + username.length;
									window.external.ReportStatus(LoginErrorCode.LOG_FAILE_USERNAME_ERR, Json.stringify(voucherMap));
									return false;
							}
						},
			"pPageWait": function (){return true;},
			"pcodeBox" : function (){return document.getElementById("mobLogin_sendsms");},
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){document.getElementById("btnSendSms").click();},
			"confPCode": function(){
							//document.getElementById('loginPwd').value = GlobalSettings.pass;
							//document.getElementById("loginSubmitBtn").click();
						},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return true;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"psbc":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 5,
			"captSleep" : 5,
			"pcodeSleep": 5,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) { return true; },
			"checkPasswordValid" : function(pass) { return true; },
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							return url == "https://pbank.psbc.com/pweb/prelogin.do?_locale=zh_CN&BankId=9999";
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){
							return true;
						},	
			"waitPage" : function (){ return document.getElementById("powerpass") != null;},	
			// userbox
			"userBox"  : function (){ return document.getElementById('textfield');},
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return !false;},
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){ return document.getElementById("powerpass");},
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementById('button') != null){
								document.getElementById('button').click(); 
							}
						},
			"loginRetry": 3,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25;},
			// captcha
			"captBox"  : function (){ return document.getElementById('_vTokenName');},
			"docBody"  : function (){ return document.body;},
			"captcha"  : function () {
							try{ 
								return document.getElementById("_tokenImg");
							}catch(err){
								return null;
							}
						},
			"initCapt" : function(){},
			"secureCapt" : function (){ return false;},
			"captWidth": function (){
							return 0;
						},		
			"captHeight": function (){
							return 0;
						},			
			"captRetry" : function (){ return 200;}, 
			"focusCapt" : function (){ return false;},
			"hasCapt"   : function (){ return true;},
			// Phone	
			"tokenUrl" : function (url){
				return false;
						},		
			"phoneUrl" : function (url){return false;},
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true;},
			"pPageWait" : function (){ return true;},
			"pcodeBox" : function (){return null;},	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false;},
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200;},
			"pBeforeSendCodeRetry" : function (){ return 0;},
			// Phone Captcha
			"pHasCapt"   : function (){ return false;},
			"pCaptBox"   : function (){ return null;},
			"pCaptFocus" : function (){ return false;},
			"pCaptBody"  : function (){ return null;},
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false;},
			"pCaptWidth": function (){
							return 0;
						},		
			"pCaptHeight": function (){
							return 0;
						}
		}
	},
	"cgb":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 0,
			"captSleep" : 0,
			"pcodeSleep": 0,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return true; },
			"checkUsernameValid" : function(username) {
							if(-1 != username.indexOf(' ') || 0 == username.length)
								return false;
							if(30<username.length)
								return false;
							if (GlobalSettings.logintype == "cardnum"){
								if(16<=username.length && username.length<=19)
									return (/^\d+$/.test(username));
								return false;
							}
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "phonenum"){
								var Num=/^1[34578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}							
							return true; 
						},
			"checkPasswordValid" : function(pass) {
							if(-1 != pass.indexOf(' '))
								return false;
							return (/^\S{6,12}$/.test(pass));
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { return true; },
			"loginUrl" : function (url){ 
							if(url.indexOf("https://ebanks.cgbchina.com.cn/perbank/") != -1){
								return true;
							}
							return false;
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true; },
			"waitPage" : function (){ return document.getElementById("loginId") != null; },
			// userbox
			"userBox"  : function (){ return document.getElementById('loginId'); },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false; },
			// passbox
			"securePass": function (){return true;},
			"passBox"  : function (){
							document.getElementById('loginId').focus();
							return document.getElementById("userPassword");
						},
			"passBoxLength"  : function (){
							if($("userPassword")){
								return $("userPassword").GetPL();
							}
							return 0;
						},
			"clearPassBox"  : function (){
							if($("userPassword")){
								$("userPassword").clear();
							}
						},
			"inputPasswordRetry": 5,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if (document.getElementById('loginButton')){
								doSubmit();
							}
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 25; },
			// captcha
			"captcha"  : function () { return document.getElementById("verifyImg"); },
			"captBox"  : function (){ return document.getElementById('captcha'); },
			"docBody"  : function (){ return document.body; },
			"initCapt" : function(){},
			"secureCapt" : function (){ return false; },
			"captWidth": function (){ return 0; },
			"captHeight": function (){ return 0; },
			"captRetry" : function (){ return 100; },
			"focusCapt" : function (){ return true; },
			"hasCapt"   : function (){ return true; },
			// Phone	
			"tokenUrl" : function (url){ return false; },
			"phoneUrl" : function (url){ return false; },
			"pPageReady": function (){ return true; },
			"pPageInit" : function (){ return true; },
			"pPageWait" : function (){ return true; },
			"pcodeBox" : function (){ return null; },	
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false; },
			"reqPCode" : function(){},
			"confPCode": function(){},
			"pcodeRetry" : function (){ return 1200; },
			"pBeforeSendCodeRetry" : function (){ return 0; },
			// Phone Captcha
			"pHasCapt"   : function (){ return false; },
			"pCaptBox"   : function (){ return null; },
			"pCaptFocus" : function (){ return true; },
			"pCaptBody"  : function (){ return null; },
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false; },
			"pCaptWidth": function (){ return 0; },
			"pCaptHeight": function (){ return 0; }
		}
	},
	"bosh":{
		"debit":{
			"userSleep" : 0,
			"passSleep" : 0,
			"captSleep" : 0,
			"pcodeSleep": 0,
			"maxCheck" : 300, // 5 minutes
			"ocrtype"   : "network",
			// Login
			"checkSecureFocus" : function() { return false; },
			"checkUsernameValid" : function(username) { 
							if(-1 != username.indexOf(' ') || 0 == username.length)
								return false;
							if(4>username.length || 20<username.length)
								return false;
							if (GlobalSettings.logintype == "cardnum"){
								if(16<=username.length && username.length<=19)
									return (/^\d+$/.test(username));
								return false;
							}
							if (GlobalSettings.logintype == "pidnum"){
								if(15==username.length){
									return (/^\d+$/.test(username));
								}
								else if(18==username.length){
									return true;
								}
								return false;
							}
							if(GlobalSettings.logintype == "phonenum"){
								var Num=/^1[34578][0-9]*$/;
								if (username.length == 11 && Num.test(username)){
									return true;
								}
								return false;
							}
							return true;  
						},
			"checkPasswordValid" : function(pass) {
							if(-1 != pass.indexOf(' '))
								return false;
							return (/^\S{6,15}$/.test(pass));
						},
			"checkVCodeValid" : function(VCode) { return true; },
			"checkPCodeValid" : function(PCode) { 
							if(-1 != PCode.indexOf(' '))
								return false;
							if(6==PCode.length)
								return true;
							return false;
						},
			"loginUrl" : function (url){ 
							if(url.indexOf("https://ebanks.bankofshanghai.com/pweb/prelogin.do") != -1){
								if(document.getElementById("LoginIdOrAc")){
									return true;
								}
							}
							return false;
						},
			"pageReady": function (){ return true; },
			"initPage" : function (){ return true; },	
			"waitPage" : function (){ return document.getElementById("powerpass1") != null; },
			// userbox
			"userBox"  : function (){ return document.getElementById("LoginIdOrAc"); },
			"userBoxBlur": function (){
							if(document.createEventObject) {
								this.userBox().fireEvent('onblur');
							}
							else
							{
								this.userBox().blur();
							}
						},
			"secureUser" : function (){ return false; },
			// passbox
			"securePass": function (){ return true; },
			"passBox"  : function (){ return document.getElementById("powerpass1"); },
			"passBoxLength"  : function (){
							if(document.getElementById('powerpass1')){
								return document.getElementById('powerpass1').getLength();
							}
							return 0;
						},
			"clearPassBox"  : function (){
							if(document.getElementById('powerpass1')){
								document.getElementById('powerpass1').clear();
							}
						},
			"inputPasswordRetry": 5,
			"focusPassbox" : function(){ if (this.passBox() != null) this.passBox().focus();},
			// login Button
			"loginBtn" : function (){ 
							if(document.getElementById("btnLogin2")){
								m_login(null,document.getElementById('con2'));
								window.external.StartBoshTime();
							}
						},
			"loginRetry": 0,
			"loginRetryTimeout" : 100,
			// keyinput interval
			"interval" : function (){ return 21; },
			// captcha
			"captBox"  : function (){ return document.getElementById('_vToken1'); },
			"docBody"  : function (){ return document.body; },
			"captcha"  : function () { return document.getElementById("form2_tokenImg"); },
			"initCapt" : function(){},
			"secureCapt" : function (){ return false; },
			"captWidth": function (){ return 0; },
			"captHeight": function (){ return 0; },
			"captRetry" : function (){ return 100; },
			"focusCapt" : function (){ return true; },
			"hasCapt"   : function (){ return true; },
			// Phone	
			"tokenUrl" : function (url){ return false; },
			"phoneUrl" : function (url){
							if (window.location.href.indexOf("https://ebanks.bankofshanghai.com/pweb/prelogin.do") != -1){
								if(document.getElementsByName('AuthModRadio') != null 
								&& document.getElementsByName('AuthModRadio').length > 0 
								&& document.getElementsByName('AuthModRadio')[0]){
									if(document.getElementsByName('AuthModRadio')[0].value=='U'){
										if(document.getElementsByName('AuthModRadio') != null 
										&& document.getElementsByName('AuthModRadio').length > 1
										&& document.getElementsByName('AuthModRadio')[1]){
											if(document.getElementsByName('AuthModRadio')[1].value=='O'){
												document.getElementsByName('AuthModRadio')[1].click();
											}
										}
										else{
											return false;
										}
									}
								}
								if (document.getElementById('OtpPWD')){		
									return true;
								}
							}
							return false;
						},
			"pPageReady": function (){ 
							if(document.getElementById('resend')){
								return true;
							}
							return false;
						},
			"pPageInit" : function (){ 
							document.getElementById('resend').click();
							return true;
						},
			"pPageWait" : function (){ return true; },
			"pcodeBox" : function (){ return document.getElementById('OtpPWD'); },
			"maxPCodeLength" : 6,
			"securePCode" : function (){ return false; },
			"reqPCode" : function(){},
			"confPCode": function(){
							if(document.getElementById("doItButton")){
								document.getElementById('doItButton').click();
							}
						},
			"pcodeRetry" : function (){ return 1200; },
			"pBeforeSendCodeRetry" : function (){ return 0; },
			// Phone Captcha
			"pHasCapt"   : function (){ return false; },
			"pCaptBox"   : function (){ return null; },
			"pCaptFocus" : function (){ return true; },
			"pCaptBody"  : function (){ return null; },
			"pCaptcha"   : function (){ return null; },
			"pSecureCapt" : function (){ return false; },
			"pCaptWidth": function (){ return 0; },
			"pCaptHeight": function (){ return 0; }
		}
	},
	"dummy" : {} // dummy
};
////////////////////////////////////////////////
};
