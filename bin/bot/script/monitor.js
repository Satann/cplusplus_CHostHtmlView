
if ('undefined' === typeof CheckPage) {
	CheckPage = function () {
		if ('undefined' === typeof GlobalSettings.type) {
			PUTLOG('undefined GlobalSettings.type');
			return;
		}

		var bankid = GlobalSettings.type;
		PUTLOG("" + bankid + ".Check: " + window.location.href);

		if (window.location.href.indexOf("res://ieframe.dll/navcancl.htm") != -1
			 || window.location.href.indexOf("res://ieframe.dll/dnserrordiagoff.htm") != -1) {
			var voucherMap = {};
			voucherMap.errmsg = 'query html error';
			PUTLOG(voucherMap.errmsg);
			window.external.ReportStatus(LoginErrorCode.LOG_FAILE_QUERY_HTML_ERR, Json.stringify(voucherMap))
			return;
		}
		if (typeof window.lasturl == 'undefined'
			 || window.lasturl == null
			 || window.lasturl != window.location.href) {
			LOGSTATE({
				'lstate' : "monitor",
				'bankid' : bankid,
				'url' : window.location.href
			});
			window.lasturl = window.location.href;
		}

		if (bankid == "boc") {
			if (window.location.href.indexOf("https://ebsnew.boc.cn/boc15/login.html") != -1) {
				if (document.getElementById('msgBox') != null) {
					if (document.getElementById('msgBox').className == 'editfail') {
						var errmsg = document.getElementById('msgBox').innerText;
						if (errmsg != '') {
							PUTLOG("Catch page error, <msgBox>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementById('info-con') != null) {
					var errmsg = document.getElementById('info-con').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error, <info-con>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementByClass('input warning') != null) {
					var errmsg = "input warning";
					if (document.getElementByClass('input warning').id == "txt_captcha_79449") {
						errmsg = "input inputfm warning";
					}

					PUTLOG("Catch page error, <info-con>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if ((document.getElementByClass('SecEditCtrl warning') != null) || (document.getElementByClass('item-con SecEditCtrl warning') != null)) {
					var errmsg = "SecEditCtrl warning";
					if (document.getElementByClass('item-con SecEditCtrl warning') != null) {
						errmsg = "item-con SecEditCtrl warning";
					}
					PUTLOG("Catch page error, <info-con>: " + errmsg);
					if (
						((GlobalSettings.logintype == "cardnum") && ((document.getElementById("btn_49_740887") == null) && (document.getElementById("btn_49_741014") == null)))
						 ||
						((GlobalSettings.logintype != "cardnum") && ((document.getElementById("btn_49_741014") != null) || (document.getElementById("btn_49_740887") != null)))
						//||((GlobalSettings.subtype == "credit")&&(GlobalSettings.logintype == "cardnum")&&(document.getElementById("btn_49_740887")==null))
						//||((GlobalSettings.subtype == "credit")&&(GlobalSettings.logintype != "cardnum")&&((document.getElementById("btn_49_741014")!= null)||(document.getElementById("btn_49_740887")!= null)))
					) {
						errmsg = "Login type matching error";
					}
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if ((document.getElementByClass('input inputfm warning') != null) && (document.getElementByClass('input warning') == null) && (document.getElementByClass('SecEditCtrl warning') == null)) {
					var errmsg = "input inputfm warning";
					PUTLOG("Catch page error, <info-con>: " + errmsg);
					if (
						((GlobalSettings.logintype != "cardnum") && ((document.getElementById("btn_49_741014") != null) || (document.getElementById("btn_49_740887") != null)))
						 ||
						((GlobalSettings.logintype == "cardnum") && ((document.getElementById("btn_49_740887") == null) && (document.getElementById("btn_49_741014") == null)))
						//((GlobalSettings.subtype != "credit")&&(GlobalSettings.logintype == "cardnum")&&(document.getElementById("btn_49_741014")==null))
						//||
						//((GlobalSettings.subtype != "credit")&&(GlobalSettings.logintype != "cardnum")&&((document.getElementById("btn_49_741014")!= null)||(document.getElementById("btn_49_740887")!= null)))
						//||((GlobalSettings.subtype == "credit")&&(GlobalSettings.logintype == "cardnum")&&(document.getElementById("btn_49_740887")==null))
						//||((GlobalSettings.subtype == "credit")&&(GlobalSettings.logintype != "cardnum")&&((document.getElementById("btn_49_741014")!= null)||(document.getElementById("btn_49_740887")!= null)))
					) {
						errmsg = "Login type matching error";
					}
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('stool-selector') != null) {
					var errmsg = document.getElementById('stool-selector').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error, <info-con>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('psw_repeat_new_password_15887') != null || document.getElementById('txt_enter_new_username_new') != null || document.getElementById('psw_enter_old_password_15689') != null || document.getElementById('psw_enter_new_password_15691') != null || document.getElementById('psw_enter_new_password_15885') != null || document.getElementById('psw_enter_old_password_15881') != null || document.getElementById('psw_repeat_new_password_15693') != null) {
					var errmsg = "Need reset username or password";
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('rd_choose_security_tool_17637_4') != null || document.getElementById('rd_choose_security_tool_17637_1') != null || document.getElementById('rd_choose_security_tool_17637_5') != null) {
					var errmsg = "Need reset username or password,";
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (document.getElementById('btn_ok_15890') != null && document.getElementById('btn_reset_15886') != null && getElementById('div_old_username_15884') != null) {
				var errmsg = "Need reset username or password";
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (document.getElementById('btn_accept_agreement_15187') != null && document.getElementByClass('title tac mb10') != null) {
				var errmsg = "Need accept online bank service agreement";
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://ebsnew.boc.cn/boc15/welcome_vip.html") != -1) {
				if (document.getElementById('welcome-customerName').innerText != null) {
					var errmsg = document.getElementById('welcome-customerName').innerText;
					PUTLOG("Catch page SUCCESS, <welcome-customerName>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://ebsnew.boc.cn/boc15/welcome_ele.html") != -1) {
				if (document.getElementById('welcome-customerName').innerText != null) {
					var errmsg = document.getElementById('welcome-customerName').innerText;
					PUTLOG("Catch page SUCCESS, <welcome-customerName>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://ebsnew.boc.cn/boc15/welcome.html") != -1) {
				if (document.getElementById('welcome-customerName').innerText != null) {
					var errmsg = document.getElementById('welcome-customerName').innerText;
					PUTLOG("Catch page SUCCESS, <welcome-customerName>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "JSESSIONID");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
		} else if (bankid == "bcm") {
			// Error 500--Internal Server Error
			if (document.title.indexOf('HTTP 500') != -1) {
				var errmsg = document.title;
				PUTLOG("Catch title error, <title>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (document.getElementById('http404') != null) {
				var errmsg = document.getElementById('http404');
				PUTLOG("Catch http404 error, <http404>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (document.getElementById('token') != null && document.getElementById('cvv2') != null) {
				var errmsg = document.getElementByClass('header-title').innerText;
				PUTLOG("Catch header-title error, <header-title>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (document.getElementById('mainTitle') != null && document.getElementById('notConnectedTasks') != null) {
				var errmsg = document.getElementById('mainTitle').innerText;
				PUTLOG("Catch div error, <mainTitle>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/card/activation/index.html") != -1) {
				if (document.getElementByClass('title') != null) {
					var errmsg = document.getElementByClass('title').innerText;
					PUTLOG("Catch page error, <title>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				} else {
					PUTLOG("no card page, can't get error");
				}
			}
			if (window.location.href.indexOf("https://pbank.95559.com.cn/personbank/system/syVerifyCustomer.do") != -1) {
				// The promption page, click it and skip;
				if (document.getElementById('btnConf') != null
					 && document.getElementById("mobileCode") == null) {
					document.getElementById("btnConf").click();
				};
			}

			// first match success flag
			if (window.location.href.indexOf("https://pbank.95559.com.cn/personbank/system/syLogin.do") != -1
				 || window.location.href.indexOf("https://pbank.95559.com.cn/personbank/system/syVerifyCustomer.do") != -1) {

				if ('undefined' != typeof document.frames
					 && document.frames != null
					 && document.frames.length > 1
					 && document.frames[1] != null
					 && document.frames[1].document.getElementById('userName') != null) {
					var errmsg = document.frames[1].document.getElementById('userName').innerText;
					PUTLOG("Catch page SUCCESS, <userName>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");

					if (document.frames[1].document.getElementsByName('PSessionId').length > 1) {
						params.PSessionId = document.frames[1].document.getElementsByName('PSessionId')[1].value;
					} else {
						PUTLOG('BCM dom unexpected: PSessionId');
					}
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
				if (document.getElementByClass('lanse-12-b') != null) {
					var errmsg = document.getElementByClass('lanse-12-b').innerText;
					PUTLOG("Catch page error, <lanse-12-b>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}

				// pid error
				if (document.getElementById('certMask') != null
					 && document.getElementById('certMask').innerText != ''
					 && document.getElementById('certMask').style.display != 'none') {
					var errmsg = document.getElementById('certMask').innerText;
					PUTLOG("Catch div error, <certMask>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if ('undefined' != typeof document.frames
					 && document.frames != null
					 && document.frames.length > 1
					 && document.frames[1].document.querySelectorAll != undefined
					 && document.frames[1].document.querySelectorAll('span').length > 0) {
					var errmsg = document.frames[1].document.querySelectorAll('span')[0].innerText;
					PUTLOG("Catch page error, <lanse-12-b>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://pbank.95559.com.cn/personbank/logon.jsp#") != -1
				 || window.location.href.indexOf("https://pbank.95559.com.cn/personbank/logon.jsp?show=old#") != -1
				 || window.location.href.indexOf("https://pbank.95559.com.cn/personbank/system/syVerifyCustomer.do") != -1) {
				if (document.getElementById('ui-id-1') != null && document.getElementById('ui-id-1').innerText != '') {
					var errmsg = document.getElementById('ui-id-1').innerText;
					PUTLOG("Catch page error, <ui-id-1>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('captchaErrMsg') != null
					 && document.getElementById('captchaErrMsg').innerText != ''
					 && document.getElementById('captchaErrMsg').style.display != 'none') {
					var errmsg = document.getElementById('captchaErrMsg').innerText;
					PUTLOG("Catch div error, <captchaErrMsg>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('ui-id-2') != null) {
					var errmsg = document.getElementById('ui-id-2').innerText;
					PUTLOG("Catch page error, <ui-id-2>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}

			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/idm/sso/login.html") != -1
				 || window.location.href.indexOf("https://creditcardapp.bankcomm.com/idm/sso/auth.html") != -1) {
				if (document.getElementByClass('pagePoint') != null) {
					var voucherMap = {};
					voucherMap.errmsg = 'bcm bank update';
					PUTLOG(voucherMap.errmsg);
					window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ORG_SERVICE_ERR, Json.stringify(voucherMap));
					return; // Stop Check
				}
				if (document.getElementById('moibleMessages') != null
					 && document.getElementById('moibleMessages').value != ''
					 && document.getElementByClass('inputError') != null
					 && document.getElementByClass('inputError').innerText != ''
					 && document.getElementByClass('inputError').style.display != 'none') {
					if (typeof document.firstFlag == 'undefined') {
						document.firstFlag = true;
					} else {
						var voucherMap = {};
						voucherMap.errmsg = document.getElementByClass('inputError').innerText;
						PUTLOG(voucherMap.errmsg);
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				// Service Unavailable
				if (document.getElementsByTagName('H1').length == 1 && document.getElementsByTagName('H1')[0].innerText == 'Service Unavailable') {
					var errmsg = document.getElementsByTagName('H1')[0].innerText;
					PUTLOG("Service Unavailable");
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap));
				}
				if (document.getElementByClass('input-wrong-panel') != null) {
					var errmsg = document.getElementByClass('input-wrong-panel').innerText;
					PUTLOG("Catch page error, input-wrong-panel: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementByClass('dashed') != null) {
					var errmsg = '';
					if (document.getElementByClass('dashed').childNodes.length > 1)
						errmsg = document.getElementByClass('dashed').childNodes[1].innerText;
					PUTLOG("Catch page error, calulate wrong pwd: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap));
				}

				if (document.getEletsByClassName('Validform_checktip Validform_wrong errTitle').length > 0) {
					var div_arr = document.getEletsByClassName('Validform_checktip Validform_wrong errTitle');
					for (var i = 0; i < div_arr.length; i++) {
						if (div_arr[i].innerText != '') {
							PUTLOG("Catch page error, <Validform_checktip Validform_wrong errTitle>: " + div_arr[i].innerText);
							var voucherMap = {};
							voucherMap.errmsg = div_arr[i].innerText;
							if (DecodeError(div_arr[i].innerText)
								 && window.external.ReportStatus(DecodeError(div_arr[i].innerText), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getEletsByClassName('Validform_checktip Validform_wrong errTitle errormsg').length > 0) {
					var div_arr = document.getEletsByClassName('Validform_checktip Validform_wrong errTitle errormsg');
					for (var i = 0; i < div_arr.length; i++) {
						if (div_arr[i].innerText != '') {
							PUTLOG("Catch page error, <Validform_checktip Validform_wrong errTitle>: " + div_arr[i].innerText);
							var voucherMap = {};
							voucherMap.errmsg = div_arr[i].innerText;
							if (DecodeError(div_arr[i].innerText)
								 && window.external.ReportStatus(DecodeError(div_arr[i].innerText), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
			}

			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/overlayapp.html") != -1) {
				if (document.getElementByClass('btn') != null) {
					document.getElementByClass('btn').click();
					PUTLOG('before success, click btn');
				} else {
					PUTLOG('before success, html blocked');
				}
			}

			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/sac/public/findqrypwd/index.html") != -1) {
				var voucherMap = {};
				voucherMap.errmsg = 'need reset query password';
				PUTLOG(voucherMap.errmsg);
				window.external.ReportStatus(LoginErrorCode.LOG_FAILE_NOTSETLOGINPW, Json.stringify(voucherMap));
				return; // Stop Check
			}

			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/app/layer.html") != -1) {
				if (document.getElementByClass('appload-goon') != null && document.getElementByClass('appload-goon').childNodes.length > 0) {
					document.getElementByClass('appload-goon').childNodes[0].click();
					PUTLOG('2 before success, click btn');
				} else if (document.getElementByClass('app_goon') != null) {
					document.getElementByClass('app_goon').click();
					PUTLOG('3 before success, click btn');
				} else {
					PUTLOG('23 before success, html blocked');
				}
			}

			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/member/home/index.html") != -1
				 || window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/member/main.html") != -1
				 || window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/member/cardcheck/welcome.html") != -1
				 || window.location.href.indexOf("https://creditcardapp.bankcomm.com/member/member/activity/activityList.html") != -1) {
				if (document.getElementByClass('name') != null
					 && document.getElementByClass('name').innerText != ''
					 && document.getElementByClass('title') != null) {
					var errmsg = document.getElementByClass('name').innerText;
					PUTLOG("Catch page SUCCESS, <name>: " + errmsg);
					var params = {};
					var cardno = document.getElementByClass('title').innerText.split(' ').join('');
					PUTLOG('bcm card no: ' + cardno);
					params.cardNo = cardno;
					params.cookie = document.cookie;
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
				if (document.getElementByClass('index-addcard tc') != null) {
					var errmsg = document.getElementByClass('index-addcard tc').innerText;
					PUTLOG("Catch page SUCCESS, <index-addcard tc>: " + errmsg);
					var params = {};
					PUTLOG('bcm no find card');
					params.cardNo = '';
					params.errmsg = 'bcm no find card';
					params.cookie = document.cookie;
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				} else if (document.getElementByClass('pagePoint') != null) {
					var voucherMap = {};
					voucherMap.errmsg = 'bcm bank update';
					PUTLOG(voucherMap.errmsg);
					window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ORG_SERVICE_ERR, Json.stringify(voucherMap));
					return; // Stop Check
				} else if (document.body.children.length == 1 && document.body.children[0].tagName.toLowerCase() == 'img') {
					var voucherMap = {};
					voucherMap.errmsg = 'bcm bank update';
					PUTLOG(voucherMap.errmsg);
					window.external.ReportStatus(LoginErrorCode.LOG_FAILE_ORG_SERVICE_ERR, Json.stringify(voucherMap));
					return; // Stop Check
				} else {
					PUTLOG('bcm no find success flag');
					return; // Stop Check
				}
			}

			// maidanba(mdb) success https://creditcardapp.bankcomm.com/mdb/service/home/index.html
			if (window.location.href.indexOf("https://creditcardapp.bankcomm.com/mdb/home/index.html") != -1) {
				if (document.getElementByClass('user-name') != null) {
					var errmsg = document.getElementByClass('user-name').innerText;
					PUTLOG("Catch page SUCCESS, <name>: " + errmsg);
					var params = {};
					params.cookie = document.cookie;
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				} else {
					PUTLOG('bcm no find success flag');
				}
			}
		} else if (bankid == "icbc") {
			if (window.location.href.indexOf("https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_index.jsp") != -1) {
				// Catch Success
				if (document.getElementByClass('icon-4') != null && document.getElementByClass('icon-4').tagName.toUpperCase() == "A"
					 && (document.getElementByClass('icon-4').href == '' || document.getElementByClass('icon-4').href == 'javascript:void(0);')
					 && document.getElementByClass('icon-3') != null) {
					var errmsg = document.getElementByClass('icon-4').innerText;
					PUTLOG("Catch page SUCCESS, <icon-4>: " + errmsg);
					var params = {};
					var sids = document.getElementsByName('dse_sessionId');
					if(sids.length > 0 && undefined != sids[0] && null != sids[0] && '' != sids[0].value){
						params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
						params.dse_sessionId = sids[0].value;
						if(undefined == window.isReported){
							window.isReported = true;
							window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
						}
						return ; // Stop Check       
					}
				}
				if (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length >= 6
					 && typeof document.frames['ICBC_login_frame_f'].document !== 'undefined' && document.frames['ICBC_login_frame_f'].document != null
					 && document.frames['ICBC_login_frame_f'].document.getElementById('errorstext') != null) {
					var errmsg = document.frames['ICBC_login_frame_f'].document.getElementById('errorstext').innerText;
					PUTLOG("Catch page error <errorstext>: " + errmsg);
					if(errmsg && errmsg != ' '){
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))){
							return ; // Stop Check
						}
					}
				}
				var isTrue2 = false;
				try {
					isTrue2 = (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
						 && document.frames[0] != null && document.frames[0].document != null
						 && typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
						 && document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null
						 && typeof document.frames[0].document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames[0].document.frames != null
						 && document.frames[0].document.frames[0].document.frames.length > 0 && document.frames[0].document.frames[0].document.frames[0] != null
						 && document.frames[0].document.frames[0].document.frames[0].document != null);
				} catch (exp) {}
				if (isTrue2) {
					if (undefined != document.frames[0].document.frames[0].document.frames[0].document.getElementById("yaoshengjifuwu")
						 && null != document.frames[0].document.frames[0].document.frames[0].document.getElementById("yaoshengjifuwu")
						 && undefined != document.frames[0].document.frames[0].document.frames[0].document.getElementById("justNetx")
						 && null != document.frames[0].document.frames[0].document.frames[0].document.getElementById("justNetx")) {
						document.frames[0].document.frames[0].document.frames[0].document.getElementById("justNetx").click();
					}
					if (undefined == document.frames || null == document.frames) {
						if (undefined == document.getElementsByTagName('div') && document.getElementsByTagName('div').length == 1 &&
							undefined == document.getElementsByTagName('img') && document.getElementsByTagName('img').length == 1 && document.getElementsByTagName('img')[0].src.indexOf('icbc/coolpad/images/result-error.png') != -1)
							var errmsg = ddocument.getElementsByTagName('div')[0].innerText;
						PUTLOG("Catch page error <div and error_img>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://mybank.icbc.com.cn/icbc/newperbank/perbank3/includes/icbcerrorp3.jsp?logoffstat=3") != -1) {
				var strongNode = document.getElementsByTagName("strong")[0];
				if (undefined != strongNode && null != strongNode && undefined != strongNode.childNodes[0]
					 && null != strongNode.childNodes[0] && "font" == strongNode.childNodes[0].nodeName.toLowerCase()) {
					var errmsg = strongNode.childNodes[0].innerText;
					PUTLOG("Catch page error <tag font>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_index_no_credible.jsp?dse_sessionId=") != -1) {
				var isTrue3 = false;
				try {
					isTrue3 = typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
						 && document.frames[0] != null && document.frames[0].document != null
						 && typeof document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames != null && document.frames[0].document.frames.length > 0
						 && document.frames[0].document.frames[0] != null && document.frames[0].document.frames[0].document != null
						 && typeof document.frames[0].document.frames[0].document.frames !== 'undefined' && document.frames[0].document.frames[0].document.frames != null
						 && document.frames[0].document.frames[0].document.frames.length > 0 && document.frames[0].document.frames[0].document.frames[0] != null
						 && document.frames[0].document.frames[0].document.frames[0].document != null;
				} catch (exp) {}
				if (isTrue3) {
					var h4Nodes = document.frames[0].document.frames[0].document.frames[0].document.getElementsByTagName('h4');
					var quedingBut = document.frames[0].document.frames[0].document.frames[0].document.getElementById('queding');
					var saveDeNames = document.frames[0].document.frames[0].document.frames[0].document.getElementsByName('saveDeName');
					var saveDeNametips = document.frames[0].document.frames[0].document.frames[0].document.getElementById('saveDeNametips');
					if (undefined != h4Nodes && null != h4Nodes && 1 == h4Nodes.length && quedingBut != null && quedingBut != undefined
						&& undefined != saveDeNames && null != saveDeNames && 2 == saveDeNames.length) {
						var balancehidden = document.frames[0].document.frames[0].document.frames[0].document.getElementById('balancehidden');
						if(balancehidden != null && balancehidden != undefined && balancehidden.childNodes.length == 1
							&& balancehidden.childNodes[0].tagName.toUpperCase() == "FONT"
							&& (balancehidden.childNodes[0].color == 'red' || balancehidden.childNodes[0].color == '#ff0000')){
							var errmsg = balancehidden.childNodes[0].innerText;
							PUTLOG("Catch page error <h4 with child node fond having color red>: " + errmsg);
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}else{
							if(saveDeNames[0].checked == false && saveDeNames[1].checked == true 
									&& saveDeNametips.style.display == 'none'){
								var errmsg = h4Nodes[0].innerText;
								PUTLOG("Catch page error <h4>: " + errmsg);
								if (!DecodeError(errmsg)){
									quedingBut.click();
									return;
								}
							}
							if('undefined' === typeof window.saveDeNames1Clicked){
								if(saveDeNames[0].checked == true && saveDeNames[1].checked == false 
									&& (saveDeNametips.style.display == 'list-item' || saveDeNametips.style.display == '')
									&& 'undefined' === typeof window.saveDeNames1Clicked){
									PUTLOG("Click  saveDeNames1");
									window.saveDeNames1Clicked = true;
									saveDeNames[1].click();
								}
							}
						}
					}

					var tagsSpan = document.frames[0].document.frames[0].document.frames[0].document.getElementsByTagName("span");
					var tagsA = document.frames[0].document.frames[0].document.frames[0].document.getElementsByTagName("a");
					if (tagsSpan != undefined && tagsSpan.length >= 4 && tagsA != undefined && tagsA.length >= 1
						 && undefined != tagsA[0] && null != tagsA[0] && undefined != tagsA[0].href
						 && tagsA[0].href.indexOf('javascript:history.go(-1)') != -1) {
						var errmsg = tagsSpan[3].innerText;
						PUTLOG("Catch page error <tag span>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						var code = DecodeError(errmsg);
						if (LoginErrorCode.LOG_FAILE_PHONEOCR == code) {
							if('undefined' === typeof window.phoneRetryOCRCount)
							{
								window.phoneRetryOCRCount = 1;
								window.phoneRetryOCRLock = true;
								PUTLOG("ini phoneRetryOCRCount and phoneRetryOCRLock");
							}
							if (window.phoneRetryOCRLock != undefined) //window.phoneRetryOCRCount < 7 &&
							{
								window.autoOcrTotal = 4;
								PUTLOG("window.phoneRetryOCRCount: " + window.phoneRetryOCRCount);

								if(window.phoneRetryOCRCount>= window.autoOcrTotal)
								{
									PUTLOG("window.phoneRetryOCRCount: " + window.phoneRetryOCRCount + " Set OCrFrom to back");
									window.external.SetOcrFrom("back");//ini ocr from
								}

								window.phoneRetryOCRCount ++;
								if(window.phoneRetryOCRCount <= window.autoOcrTotal)
								{
									PUTLOG("Set OCrCount to: " + window.phoneRetryOCRCount);
									window.external.SetOcrCount(window.phoneRetryOCRCount.toString());
								}
								window.phoneRetryOCRLock = undefined;
								PUTLOG("Click back button.");
								//window.external.ReportStatus(LoginErrorCode.LOG_FAILE_PFOCRERR, Json.stringify(voucherMap));
								tagsA[0].click();
								return; // Stop Check
							} 
							/*else if(window.phoneRetryOCRCount > 6 && window.phoneRetryOCRLock != undefined)//if ('undefined' !== typeof window.canReportStatus && true == window.canReportStatus && 
							{
								window.external.ReportStatus(code, Json.stringify(voucherMap));
								return; // Stop Check
							}*/
						} else if (code && window.external.ReportStatus(code, Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if(typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
					&& undefined != document.frames['perbank-content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['mainFrame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['mainFrame'].document){
					PUTLOG("Enter mainFrame page");
					var mainFrameDocument = document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['mainFrame'].document;
					if (undefined != mainFrameDocument.getElementsByTagName("p")[1]
						 && null != mainFrameDocument.getElementsByTagName("p")[1]
						 && null != mainFrameDocument.getElementsByTagName("p")[1].childNodes
						 && undefined != mainFrameDocument.getElementsByTagName("p")[1].childNodes
						 && 'b' == mainFrameDocument.getElementsByTagName("p")[1].childNodes[0].nodeName.toLowerCase()) {
						var errmsg = mainFrameDocument.getElementsByTagName("p")[1].innerText;
						PUTLOG("Catch page error <tag p with childNode b>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
					&& undefined != document.frames['perbank-content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document
					&& null != document.frames['perbank-content-frame'].document.frames['content-frame'].document.getElementsByTagName("b") 
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document.getElementsByTagName("b")
					&& document.frames['perbank-content-frame'].document.frames['content-frame'].document.getElementsByTagName("b").length > 0) {
					PUTLOG("Enter content-frame page");
					var contentFrameDocument = document.frames['perbank-content-frame'].document.frames['content-frame'].document;
					var bNode = contentFrameDocument.getElementsByTagName("b")[0];
					var flag = false;
					var childNodes = contentFrameDocument.getElementsByTagName("b")[0].childNodes;
					if (childNodes != null && childNodes.length > 0) {
						for (i = 0; i < childNodes.length; i++) {
							var childNode = childNodes[i];
							if (childNode.nodeName != undefined && childNode.nodeName != null
								 && childNode.nodeName.toLowerCase() == 'font' && (childNode.color == 'red' || childNode.color == '#ff0000')) {
								flag = true;
							}
						}
					}
					if (undefined != bNode && null != bNode && flag == true) {
						var errmsg = bNode.innerText;
						PUTLOG("Catch page error <tag b with childNode font having color with red>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if(typeof document.frames !== 'undefined' && document.frames != null && document.frames.length > 0
					&& undefined != document.frames['perbank-content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['integratemainFrame']
					&& undefined != document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['integratemainFrame'].document){
					PUTLOG("Enter integratemainFrame page");
					var integratemainFrameDocument = document.frames['perbank-content-frame'].document.frames['content-frame'].document.frames['integratemainFrame'].document;
					if (undefined != integratemainFrameDocument.getElementsByTagName("div")[1]
						 && null != integratemainFrameDocument.getElementsByTagName("div")[1]
						 && integratemainFrameDocument.getElementsByTagName("div")[1].align == "left") {
						var errmsg = integratemainFrameDocument.getElementsByTagName("div")[1].innerText;
						PUTLOG("Catch page error <tag div with align = left>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
					var tagsSpan = integratemainFrameDocument.getElementsByTagName("span");
					if (tagsSpan != undefined && tagsSpan.length == 2 && tagsSpan[0].childNodes.length == 1
						&& tagsSpan[0].childNodes[0].tagName.toUpperCase() == "IMG"
						&& tagsSpan[0].childNodes[0].src.indexOf('images/failure-block.png') != -1
						&& tagsSpan[1].innerText != '') {
						var errmsg = tagsSpan[1].innerText;
						PUTLOG("Catch page error <tag span with childNode img with src = images/failure-block.png>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://mybank.icbc.com.cn/icbc/newperbank/perbank3/frame/frame_guide.jsp?dse_sessionId=") != -1) {
				document.form.submit();
				return;
			}
		} else if (bankid == "abc") {
			if (window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonSelf.aspx") != -1 ||
				window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx") != -1 ||
				window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx/netBank/zh_CN/entrance/logonSelf.aspx") != -1 ||
				window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx?errorCode=") != -1) {
				if (document.getElementById('usernamev') != null
					 && document.getElementById('usernamev').parentNode != null
					 && document.getElementById('usernamev').parentNode.className == 'noNull') {
					var errmsg = document.getElementById('usernamev').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <usernamev>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('passwordv') != null
					 && document.getElementById('passwordv').parentNode != null
					 && document.getElementById('passwordv').parentNode.className == 'noNull') {
					var errmsg = document.getElementById('passwordv').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <passwordv>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('validatecodev') != null
					 && document.getElementById('validatecodev').parentNode != null
					 && document.getElementById('validatecodev').parentNode.className == 'noNull') {
					var errmsg = document.getElementById('validatecodev').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <validatecodev>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (null != document.getElementsByTagName("h2")
					 && null != document.getElementsByTagName("h2")[0]
					 && null != document.getElementsByTagName("p")
					 && null != document.getElementsByTagName("p")[0]) {
					var h2Text = document.getElementsByTagName("h2")[0].innerText;
					if (h2Text == "Service Unavailable") {
						var errmsg = document.getElementsByTagName("p")[0].innerText;
						if (errmsg) {
							PUTLOG("Catch page error, <p>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
			}
			if (-1 != window.location.href.indexOf("http://www.95599.cn/errors/StopService.htm")) {
				if (null != document.getElementsByTagName("p")
					 && null != document.getElementsByTagName("p")[0]
					 && null != document.getElementsByTagName("p")[1]) {
					var errmsg = document.getElementsByTagName("p")[1].innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <p1>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx/netBank/zh_CN/entrance/UPstartUpHtmlSessionAction.ebf") != -1) {
				// TODO: just skip phone verification,
				PUTLOG("Catch page SUCCESS");
				var params = {};
				params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
				if (-1 == params.cookie.indexOf('WT_FPC')) {
					var strs = new Array();
					strs = window.document.cookie.split(';');
					for (var i = 0; i < strs.length; ++i) {
						if (-1 != strs[i].indexOf('WT_FPC')) {
							if (params.cookie) {
								params.cookie += ";";
								params.cookie += strs[i];
							}
							break;
						}
					}
				}
				window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				return; // Stop Check
			}
			if (window.location.href.indexOf("https://perbank.abchina.com/SelfBank/netBank/zh_CN/entrance/logonself.aspx/netBank/zh_CN/entrance/SelfHelpVerifySmsCodeAct.ebf") != -1) {
				if (document.getElementByClass('errorlistline') != null) {
					var errmsg = document.getElementByClass('errorlistline').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <errorlistline>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (window.location.href) {
					var errmsg = window.location.href;
					if (errmsg) {
						PUTLOG("Catch page error, <errorlistline>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("http://www.abchina.com/cn/common/notice/stopservice.htm") != -1) {
				if (document.getElementByClass('newsTitle') != null) {
					var errmsg = document.getElementByClass('newsTitle').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <newsTitle>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
		} else if (bankid == "cmb") {
			if (window.location.href.indexOf("https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/LoginOLD.aspx") != -1
				 || window.location.href.indexOf("https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/GenIndex.aspx") != -1) {
				// Service Unavailable
				if (document.getElementsByTagName('H2').length == 1 && document.getElementsByTagName('H2')[0].innerText == 'Service Unavailable') {
					var errmsg = document.getElementsByTagName('H2')[0].innerText;
					PUTLOG("Service Unavailable");
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap));
				}
			}
			if (window.location.href.indexOf("https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/GenIndex.aspx") != -1) {
				if ('undefined' !== typeof document.frames && null != document.frames && document.frames.length > 0
					 && document.frames[0].document.getElementById('LblTop') != null) {
					var errmsg = document.frames[0].document.getElementById('LblTop').innerText;
					PUTLOG("Catch page SUCCESS, <LblTop>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					if (document.getElementsByName('ClientNo') != null
						 && document.getElementsByName('ClientNo').length > 0) {
						params.ClientNo = document.getElementsByName('ClientNo')[0].value;
					}
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}

			if (window.location.href.indexOf("https://pbsz.ebank.cmbchina.com/CmbBank_GenShell/UI/GenShellPC/Login/GenLoginVerifyM2.aspx") != -1) {
				if (document.getElementByClass('control-explain error') != null) {
					var errmsg = document.getElementByClass('control-explain error').innerText;
					PUTLOG("Catch page error, <control-explain error>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('lbMessage') != null && document.getElementById('lbMessage').innerText != '') {
					var errmsg = document.getElementById('lbMessage').innerText;
					if (document.getElementById('lbTitle') != null && document.getElementById('lbTitle').innerText != '') {
						errmsg = document.getElementById('lbTitle').innerText + errmsg;
					}
					PUTLOG("Catch page error, <lbMessage>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}

				if (document.getElementByClass('control-explain') != null) {
					var errmsg = document.getElementByClass('control-explain').innerText;
					PUTLOG("Catch page error, <control-explain>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				// phone page, server error
				if (document.getElementById('ErrorPage') != null
					 && document.getElementById('ErrorPage').style.display != 'none'
					 && document.getElementByClass('page-success-message-wrap') != null) {
					var errmsg = document.getElementByClass('page-success-message-wrap').innerText;
					PUTLOG("Catch phone page error, <page-success-message-wrap>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
		} else if (bankid == "ccb") {
			// network error
			if (document.getElementById('contentContainer') != null&&document.getElementById('mainTitle') != null
				&&document.getElementById('cantDisplayTasks') != null&&document.getElementById('notConnectedTasks') != null) {
				var errmsg = document.getElementById('contentContainer').innerText;
				PUTLOG("Catch page error, <contentContainer>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			// Error 404--Not Found ||| Error 500--Internal Server Error
			if (document.title.indexOf('Error') != -1) {
				var errmsg = document.title;
				PUTLOG("Catch title error, <title>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}

			//Failure of server APACHE bridge:
			//No backend server available for connection: timed out after 10 seconds or idempotent set to OFF
			if(document.body.children.length > 0
				&& document.body.children[0].tagName.toLowerCase()=='h2'
				&& document.body.children[0].innerText.indexOf('Failure') != -1){
				var errmsg = document.body.children[0].innerText;
				PUTLOG("Catch h2 error, <h2>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))){
					return ; // Stop Check
				}
			}
            
			// service busy
			if(document.body.children.length == 3
                && document.getElementsByClassName('area_title').length == 1
                && document.getElementsByClassName('area_content').length == 1
                && document.getElementsByClassName('area_content')[0].innerText != ''
                && document.getElementsByClassName('text_big text_bold').length == 1
                && document.getElementsByClassName('area_content')[0].children.length == 2
                && document.getElementsByClassName('text_big text_bold')[0].innerText.substr(0,4) == document.getElementsByClassName('area_title')[0].innerText.substr(0,4)){
				var errmsg = document.getElementsByClassName('area_content')[0].innerText;
				PUTLOG("Catch area_content error, <area_content>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))){
					return ; // Stop Check
				}
			}
            
			//504 Gateway Time-out:
			if(document.body.children.length ==1
				&& document.body.children[0].tagName.toLowerCase()=='h1'
				&& document.body.children[0].innerText.indexOf('504') != -1){
				var errmsg = document.body.children[0].innerText;
				PUTLOG("Catch h1 error, <h1>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))){
					return ; // Stop Check
				}
			}
			// active page
			if (document.getElementByClass('pbd_step_item pbd_step_1 on') != null && document.getElementByClass('second_td') != null) {
				var errmsg = document.getElementByClass('pbd_step_item pbd_step_1 on').innerText;
				PUTLOG("Catch span error, <pbd_step_item pbd_step_1 on>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}

			// private question page
			if (document.getElementByClass('pbd_tle_tx') != null && document.getElementByClass('aborder_span') != null) {
				var errmsg = document.getElementByClass('aborder_span').innerText;
				PUTLOG("Catch aborder_span error, <aborder_span>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			// login iframe: service unavailable
			if (document.getElementById('fclogin') != null
				 && 'undefined' != typeof document.getElementById('fclogin').contentWindow
				 && 'undefined' != typeof document.getElementById('fclogin').contentWindow.document
				 && null != document.getElementById('fclogin').contentWindow.document
				 && document.getElementById('fclogin').contentWindow.document.getElementsByClassName('text_notice').length > 0
				 && document.getElementById('fclogin').contentWindow.document.getElementsByClassName('text_notice')[0].innerText != '') {
				var errmsg = document.getElementById('fclogin').contentWindow.document.getElementsByClassName('text_notice')[0].innerText;
				PUTLOG("Catch div error, <text_notice>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://ibsbjstar.ccb.com.cn/app/B2CMainPlatV5") != -1
				 || window.location.href.indexOf("https://ibsbjstar.ccb.com.cn/CCBIS/B2CMainPlat") != -1) {

				if (document.getElementById('txmainfrm') != null
					 && document.getElementById('txmainfrm').contentWindow.document.getElementsByClassName('warning_span').length > 0) {
					var errmsg = document.getElementById('txmainfrm').contentWindow.document.getElementsByClassName('warning_span')[0].innerText;
					PUTLOG("Catch warning_span error, <warning_span>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementByClass('pbd_h2_txt') != null && document.getElementByClass('pbd_h2_txt').innerText != ''
					 && document.getElementByClass('pbd_table_step_title') != null && document.getElementByClass('pbd_table_step_title').innerText != '') {
					var errmsg = document.getElementByClass('pbd_h2_txt').innerText;
					PUTLOG("Catch warning_span error, <pbd_h2_txt>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				// need set password
				// usr/pwd error
				if (document.getElementByClass('pbd_h2_txt') != null && document.getElementByClass('pbd_h2_txt').innerText != ''
					 && document.getElementById('pbd') != null && document.getElementById('pbd').children.length >= 3) {
					var errmsg = document.getElementById('pbd').innerText;
					PUTLOG("Catch pbd error, <pbd>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('error_main') != null) {
					// first login, need set password
					if (document.getElementByClass('text_big text_bold') != null
						 && document.getElementByClass('text_big text_bold').children
						 && document.getElementByClass('text_big text_bold').children.length == 2) {
						var errmsg = document.getElementByClass('text_big text_bold').children[1].firstChild.textContent;
						PUTLOG("Catch p error, <text_big text_bold>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
					if (document.getElementByClass('text_big text_bold') != null
						 && document.getElementByClass('text_big text_bold').children
						 && document.getElementByClass('text_big text_bold').children.length == 1
						 && document.getElementByClass('text_notice') != null) {
						var errmsg = document.getElementByClass('text_notice').innerText;
						PUTLOG("Catch div error, <text_notice>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
					var errmsg = document.getElementById('error_main').innerText;
					PUTLOG("Catch page error, <error_main>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('Page_content') != null
					 && document.getElementById('Page_content').parentNode.name == 'jhform') {
					var errmsg = document.getElementById('Page_content').innerText;
					PUTLOG("Catch page error, <Page_content>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementByClass('msg_welcome fl') != null || document.getElementByClass('fr tnav_right') != null) {
					var errmsg = '';
					if (document.getElementByClass('msg_welcome fl') != null) {
						errmsg = document.getElementByClass('msg_welcome fl').innerText;
					} else if (document.getElementByClass('fr tnav_right') != null) {
						errmsg = document.getElementByClass('fr tnav_right').innerText;
					}
					PUTLOG("Catch page SUCCESS, <msg_welcome|tnav_right>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");

					if (document.getElementsByName("BRANCHID") != null
						 && document.getElementsByName("BRANCHID").length > 0) {
						params.BRANCHID = document.getElementsByName("BRANCHID")[0].value;
					}
					if (document.getElementsByName("SKEY") != null
						 && document.getElementsByName("SKEY").length > 0) {
						params.SKEY = document.getElementsByName("SKEY")[0].value;
					}
					if (document.getElementsByName("USERID") != null
						 && document.getElementsByName("USERID").length > 0) {
						params.USERID = document.getElementsByName("USERID")[0].value;
					}
					if (document.getElementsByName("TXCODE") != null
						 && document.getElementsByName("TXCODE").length > 0) {
						params.TXCODE = document.getElementsByName("TXCODE")[0].value;
					}

					if ('undefined' !== typeof strCustName && strCustName != null) {
						params.cust_name = strCustName;
					}

					params.CCB_IBSVersion = "V6";

					var matchObjects = window.location.href.match(/SERVLET_NAME=[^&]*/);
					if (matchObjects != null && matchObjects.length > 0) {
						params.SERVLET_NAME = matchObjects[0].substr(13);
					}

					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				}
				if (document.getElementById('mainframe') != null
					 && 'undefined' !== typeof document.getElementById('mainframe').contentWindow
					 && null != document.getElementById('mainframe').contentWindow
					 && 'undefined' !== typeof document.getElementById('mainframe').contentWindow.document
					 && null != document.getElementById('mainframe').contentWindow.document
					 && document.getElementById('mainframe').contentWindow.document.getElementById('jhform') != null) {
					var errmsg = document.getElementById('mainframe').contentWindow.document.getElementById('jhform').innerText;
					PUTLOG("Catch page SUCCESS, <jhform>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");

					if (document.getElementsByName("BRANCHID") != null
						 && document.getElementsByName("BRANCHID").length > 0) {
						params.BRANCHID = document.getElementsByName("BRANCHID")[0].value;
					}
					if (document.getElementsByName("SKEY") != null
						 && document.getElementsByName("SKEY").length > 0) {
						params.SKEY = document.getElementsByName("SKEY")[0].value;
					}
					if (document.getElementsByName("USERID") != null
						 && document.getElementsByName("USERID").length > 0) {
						params.USERID = document.getElementsByName("USERID")[0].value;
					}
					if (document.getElementsByName("COOKIES") != null
						 && document.getElementsByName("COOKIES").length > 0) {
						params.COOKIES = document.getElementsByName("COOKIES")[0].value;
					}
					if (document.getElementsByName("USERNAME") != null
						 && document.getElementsByName("USERNAME").length > 0) {
						params.USERNAME = document.getElementsByName("USERNAME")[0].value;
					}
					if (document.getElementsByName("TXCODE") != null
						 && document.getElementsByName("TXCODE").length > 0) {
						params.TXCODE = document.getElementsByName("TXCODE")[0].value;
					}

					if (document.getElementById('mainframe') != null
						 && document.getElementById('mainframe').contentWindow != null
						 && document.getElementById('mainframe').contentWindow.document.getElementById('cust_name') != null) {
						params.cust_name = document.getElementById('mainframe').contentWindow.document.getElementById('cust_name').innerText;
					}

					params.CCB_IBSVersion = "V5";

					var matchObjects = window.location.href.match(/SERVLET_NAME=[^&]*/);
					if (matchObjects != null && matchObjects.length > 0) {
						params.SERVLET_NAME = matchObjects[0].substr(13);
					}

					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				}
				for (var ifi = 0; ifi < document.frames.length; ifi++) {
					var docc = document.frames[ifi].document;
					if (document.frames[ifi].document.getElementsByClassName('warning_span').length > 0
						 && document.frames[ifi].document.getElementsByClassName('warning_span')[0].innerText != ''
						 && document.frames[ifi].document.getElementsByClassName('pbd_table_step_title').length > 0
						 && document.frames[ifi].document.getElementsByClassName('pbd_table_step_title')[0].innerText != '') {
						var errmsg = document.frames[ifi].document.getElementsByClassName('warning_span')[0].innerText;
						PUTLOG("Catch warning_span error, <warning_span>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
					if (docc.getElementById('error_main') != null
						 && docc.getElementById('error_main').style.display != 'none'
						 && docc.getElementsByClassName('content_fankui_message').length > 0
						 && docc.getElementsByClassName('content_fankui_message')[0].innerText != '') {
						//delete scripts
						var delete_script = function (node) {
							if (node && node.children && node.children.length > 0) {
								for (var ni = 0; ni < node.children.length; ni++) {
									PUTLOG(node.children[ni].tagName.toLowerCase())
									if (node.children[ni].tagName != undefined
										 && node.children[ni].tagName.toLowerCase() == 'script'
										 && node.children[ni].removeNode != undefined) {
										node.removeChild(node.children[ni]);
									} else {
										delete_script(node.children[ni]);
									}
								}
							}
						}
						var node = docc.getElementsByClassName('content_fankui_message')[0];
						try {
							delete_script(node);
						} catch (err) {
							PUTLOG('delete_script exception');
						}
						var errmsg = node.innerText;
						PUTLOG("Catch content_fankui_message error, <content_fankui_message>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			
			// system error, no client info
			if (window.location.href.indexOf("https://ca3.ccb.com.cn/B2C/checkApplyURL_B2C.do") != -1) {
				if (document.getElementById('Page_left') != null) {
					var errmsg = document.getElementById('Page_left').innerText;
					PUTLOG("Catch system error, <Page_left>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://ca3.ccb.com.cn/resultpage/USBKEYInErr.jsp") != -1) {
				if (document.getElementById('select_acc1') != null) {
					var errmsg = document.getElementById('select_acc1').innerText;
					PUTLOG("Catch USBKEYInErr error, <select_acc1>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://ibsbjstar.ccb.com.cn/app/V5/CN/STY1/login.jsp") != -1) {
				if (document.getElementById('fujiamaerror') != null) {
					var errmsg = document.getElementById('fujiamaerror').innerText;
					PUTLOG("Catch page error, <fujiamaerror>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("http://login.ccb.com/tran/WCCMainPlatV5") != -1) {
				if (document.getElementById('ifrShow1') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_confirm_pwd_err') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_confirm_pwd_err').style.display != "none"
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_confirm_pwd_err').innerText != "") {
					var errmsg = document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_confirm_pwd_err').innerText;
					PUTLOG("Catch page error, <pt_confirm_pwd_err>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('ifrShow1') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_cust_err') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_cust_err').style.display != "none"
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_cust_err').innerText != "") {
					var errmsg = document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_cust_err').innerText;
					PUTLOG("Catch page error, <pt_cust_err>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementById('ifrShow1') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_pwd_err') != null
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_pwd_err').style.display != "none"
					//&& document.getElementById('ifrShow1').contentWindow.document.getElementById('custpwd').value != ""
					 && document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_pwd_err').innerText != "") {
					var errmsg = document.getElementById('ifrShow1').contentWindow.document.getElementById('pt_pwd_err').innerText;
					PUTLOG("Catch page error, <pt_pwd_err>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("http://creditcard.ccb.com/") != -1) {
				if (document.getElementById('signFrm') != null
					 && document.getElementById('signFrm').contentWindow.document.getElementById('liModifyInfo') != null) {
					var errmsg = document.getElementById('signFrm').contentWindow.document.getElementById('liModifyInfo').innerText;
					PUTLOG("Catch page SUCCESS, <liModifyInfo>: " + errmsg);
					var params = {};
					params.USERNAME = GlobalSettings.user;
					params.cookie = document.cookie;
					params.cookie += window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				}

				if (document.getElementByClass('name_widyh') != null) {
					var errmsg = document.getElementByClass('name_widyh').innerText;
					PUTLOG("Catch page SUCCESS, <name_widyh>: " + errmsg);
					var params = {};
					params.USERNAME = GlobalSettings.user;
					params.cookie = document.cookie;
					params.cookie += window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				}
				if (document.getEletsByClassName('logined_box') != null) {
					var errmsg = document.getEletsByClassName('logined_box').innerText;
					PUTLOG("Catch page SUCCESS, <logined_box>: " + errmsg);
					var params = {};
					params.USERNAME = GlobalSettings.user;
					params.cookie = document.cookie;
					params.cookie += window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
				}
			}
			if (window.frames.length > 0
				 && window.frames[0].window.location.href.indexOf('tourl=http://creditcard.ccb.com&flag=&ext=&rid=&sid=&errcode=') != -1) {
				var errmsg = decodeURIComponent(window.frames[0].window.location.href.substr(window.frames[0].window.location.href.indexOf('errInfo=') + 8));
				PUTLOG("Catch iframe error, <window.location.href>: " + errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
		} else if (bankid == "spdb") {
			if (window.location.href.indexOf("https://cardsonline.spdbccc.com.cn/icard/checkMobilePwd.do") != -1) {
				if (document.getElementById('errorbox') != null) {
					var errmsg = document.getElementById('errorbox').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error <errorbox>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if ('undefined' != typeof document.frames && document.frames != null && document.frames.length > 2
					 && undefined != document.frames[2] && document.frames[2].document.getElementsByName('enter') != null
					 && document.frames[2].document.getElementsByName('enter').length > 0) {
					var errmsg = document.frames[2].document.getElementsByName('enter')[0].value;
					if (errmsg != "") {
						PUTLOG("Catch page error with name <enter>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				} else {
					if ('undefined' != typeof document.frames && document.frames != null && document.frames.length > 1) {
						if (document.frames[1].document.getElementsByTagName("a").length > 0) {
							var arr = document.frames[1].document.getElementsByTagName("a");
							for (var i = 0; i < arr.length; i++) {
								if (arr[i].href == "https://cardsonline.spdbccc.com.cn/icard/logout.do") {
									var errmsg = arr[i].innerText;
									PUTLOG("Catch page SUCCESS <tag a>: " + errmsg);
									var params = {};
									params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
									window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
									return; // Stop Check
								}
							}
						}
					}
				}
				if (document.getElementById('error_box') != null) {
					var errmsg = document.getElementById('error_box').innerText;
					if (errmsg != "") {
						PUTLOG("Element error_box in page https://cardsonline.spdbccc.com.cn/icard/checkMobilePwd.do");
						PUTLOG("Catch page error <error_box>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://cardsonline.spdbccc.com.cn/icard/login.do") != -1) {
				if (document.getElementById('error_box') != null) {
					var errmsg = document.getElementById('error_box').innerText;
					if (errmsg != "") {
						PUTLOG("Element error_box in page https://cardsonline.spdbccc.com.cn/icard/login.do");
						PUTLOG("Catch page error <error_box>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/per/main?transName=NoLoginPageDisplay&ResultPage=/basic/MobFirstLoginCheckPwd1.jsp") != -1) {
				if (document.getElementByClass('ft-fenlan-title') != null) {
					var errmsg = document.getElementByClass('ft-fenlan-title').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error <ft-fenlan-title>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/prelogin.do#") != -1) {
				if ('undefined' != typeof document.frames && document.frames != null
					 && undefined != document.frames[0] && document.frames[0].document.getElementById('errInfo') != null) {
					var errmsg = document.frames[0].document.getElementById('errInfo').innerText;
					if (errmsg.indexOf('$(document)') != -1) {
						errmsg = errmsg.substring(0, errmsg.indexOf('$(document)'));
					}
					if (errmsg != "") {
						PUTLOG("Catch page error <errInfo>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/index.do#") != -1) {
				if (document.getElementById('user-hover') != null) {
					var errmsg = document.getElementById('user-hover').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page success <user-hover>: " + errmsg);
						var params = {};
						params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
						window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
						return; // Stop Check
					}
				}
			}
			//https://ebank.spdb.com.cn/nbper/NoLoginPageDisplay.do?_viewReferer=topdefault%2Cbasic%2FPubFirstLoginAgreement
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/NoLoginPageDisplay.do?") != -1) {
				if (document.getElementById('agreementSubmit') != null) {
					PUTLOG("Catch page button <agreementSubmit>");
					document.getElementById('agreementSubmit').click();
					return;
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/NoLoginPageDisplay.do?_viewReferer=topdefault%2Cbasic%2FCheckIdCardNo1") != -1) {
				if (document.getElementByClass('firstHead') != null) {
					var errmsg = document.getElementByClass('firstHead').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page reminder element <firstHead>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/NoLoginPageDisplay.do?_viewReferer=topdefault%2Cbasic%2FMobFirstLoginCheckPwd1") != -1) {
				if (document.getElementByClass('firstHead') != null) {
					var errmsg = document.getElementByClass('firstHead').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page reminder element <firstHead>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://ebank.spdb.com.cn/nbper/NoLoginPageDisplay.do?_viewReferer=topdefault%2Cbasic%2FSelectActivateType") != -1) {
				if (document.getElementByClass('remit-regist-remak') != null) {
					var errmsg = document.getElementByClass('remit-regist-remak').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page reminder element <remit-regist-remak>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
		} else if (bankid == "cncb") {
			if ((window.location.href.indexOf("https://i.bank.ecitic.com/perbank6/signIn.do") != -1) || (window.location.href.indexOf("https://i.bank.ecitic.com/perbank6/commonSignIn.do") != -1)) {
				//if (document.getElementByClass('errorCode') != null){
				//var errmsg = document.getElementByClass('errorCode').innerText;
				//PUTLOG("Catch page error, <errorCode>: " + errmsg);
				//var voucherMap = {};
				//voucherMap.errmsg = errmsg;
				//DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap));
				//return ; // Stop Check
				//}
				if (document.getElementByClass('errorReason') != null) {
					var errmsg = document.getElementByClass('errorReason').innerText;
					PUTLOG("Catch page error, <errorReason>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				if (document.getElementByClass('tradingCon') != null) {
					if (document.getElementsByTagName("h2")[0] != null) {
						var errmsg = document.getElementsByTagName("h2")[0].innerText;
						PUTLOG("Catch page error, <errorReason>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap));
					}

					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://i.bank.ecitic.com/perbank6/checkRepeatCtfNo.do") != -1) {
				if (document.getElementById('showCheckId') != null) {
					var errmsg = "Need set username";
					PUTLOG("Catch page error, <showCheckId>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				} else {
					PUTLOG("Enter page checkRepeatCtfNo.do, but cann't find error.");
				}
			}
			if (window.location.href.indexOf("https://i.bank.ecitic.com/perbank6/gotomain.do") != -1) {
				if (document.getElementById('m1_1') != null) {
					//var errmsg = document.getElementById('personID').parentNode.parentNode.innerText;
					//PUTLOG("Catch page SUCCESS, <personID>: " + errmsg);
					PUTLOG("Catch page SUCCESS");

					if (undefined == GlobalSettings.WaitSessionReadyRetry) {
						GlobalSettings.WaitSessionReadyRetry = 3;
					}
					PUTLOG("cncb wait session retry count: " + GlobalSettings.WaitSessionReadyRetry);
					--GlobalSettings.WaitSessionReadyRetry;
					if (GlobalSettings.WaitSessionReadyRetry == 0) {
						var params = {};
						if (document.getElementsByName('EMP_SID') != null && document.getElementsByName('EMP_SID').length > 0) {
							var EMP_SID = document.getElementsByName('EMP_SID')[0].value;
							PUTLOG("EMP_SID:" + EMP_SID);
							params.EMP_SID = EMP_SID;
						}
						params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
						window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
						return; // Stop Check
					}
				} else {
					PUTLOG("Waiting Page Loading...");
				}
			}
		} else if (bankid == "cmbc") {
			if (window.location.href.indexOf('https://nper.cmbc.com.cn/pweb/static/login.html') != -1) {
				if (document.getElementById('jsonError') != null) {
					var errmsg = document.getElementById('jsonError').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error, <jsonError>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						var errorCode = DecodeError(errmsg);
						if (errorCode && (LoginErrorCode.LOG_FAILE_SESSIONINVA != errorCode) && (LoginErrorCode.LOG_FAILE_USERNAME_PWD_ERR != errorCode)) {
							window.external.ReportStatus(errorCode, Json.stringify(voucherMap));
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf('https://nper.cmbc.com.cn/pweb/static/main.html') != -1) {
				if (document.getElementByClass("zlogo_tc") != null && document.getElementByClass("zlogo_tc").childNodes[0] != null
					 && document.getElementByClass("zlogo_tc").childNodes[0].nodeName == 'A') {
					var errmsg = document.getElementByClass("zlogo_tc").childNodes[0].innerText;
					if (errmsg != "") {
						PUTLOG("Catch page SUCCESS, <zlogo_tc>: " + errmsg);
						var params = {};
						params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
						window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf('https://nper.cmbc.com.cn/pweb/static/firstloginmain.html') != -1) {
				if (document.getElementById('userId') != null) {
					var errmsg = '';
					function findh3(node) {
						for (var i = 0; i < node.childNodes.length; i++) {
							if (node.childNodes[i] != undefined && node.childNodes[i].nodeType != 3
								 && node.childNodes[i].tagName != undefined && node.childNodes[i].tagName != null && node.childNodes[i].tagName.toLowerCase() == 'h3') {
								errmsg += node.childNodes[i].innerText;
							}
							if (node.childNodes[i].childNodes.length > 0) {
								findh3(node.childNodes[i], errmsg);
							}
						}
					}
					findh3(document.body);
					if (errmsg != "") {
						PUTLOG("Catch page error, <h3>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
		} else if (bankid == "hxb") {
			if (window.location.href.indexOf('https://sbank.hxb.com.cn/easybanking/login.do') != -1) {
				if (document.getElementById('mess') != null) {
					var errmsg = document.getElementById('mess').innerText;
					PUTLOG("Catch page error, <mess>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}

				// page for reset password
				if (document.getElementByClass('mainTishi updatePwdtishi') != null) {
					var errmsg = document.getElementByClass('mainTishi updatePwdtishi').innerText;
					PUTLOG("Catch page error, <updatePwdtishi>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf('https://sbank.hxb.com.cn/easybanking/PAccountWelcomePage/') != -1) {
				if (document.getElementByClass('weltext18') != null) {
					var errmsg = document.getElementByClass('weltext18').innerText;
					PUTLOG("Catch page SUCCESS, <weltext18>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf('https://sbank.hxb.com.cn/easybanking/PAccountWelcomePage/FormParedirectAction.do?actionType=entry&OLN_top_activeNode') != -1) {
				if (document.getElementByClass('centerarea') != null) {
					var errmsg = document.getElementByClass('centerarea').innerText;
					PUTLOG("Catch page error, <centerarea>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
		} else if (bankid == "cib") {
			if (window.location.href.indexOf('https://personalbank.cib.com.cn/pers/main/login') != -1) {
				if (document.getElementByClass('ui-widget-overlay') != null) {
					if (document.getElementByClass('ui-widget-overlay').previousSibling != null) {
						var errmsg = document.getElementByClass('ui-widget-overlay').previousSibling.innerText;
						PUTLOG("Catch page error, <ui-widget-overlay>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('acctLoginPageNo_tips') != null) {
					var errmsg = document.getElementById('acctLoginPageNo_tips').innerText;
					PUTLOG("Catch page error, <acctLoginPageNo_tips>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!queryAccount.do") != -1) {
				if (document.getElementByClass("ui-form-explain") != null) {
					var errmsg = document.getElementByClass("ui-form-explain").innerText;
					PUTLOG("Catch page error, <ui-form-explain>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!loginFailed.do") != -1) {
				if (document.getElementByClass("cib-dialog-msg") != null) {
					var errmsg = document.getElementByClass("cib-dialog-msg").innerText;
					PUTLOG("Catch page error, <cib-dialog-msg>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/login!verySMS.do") != -1) {
				if (document.getElementById('mLoginPageNo_3') != null) {
					var childNodes = document.getElementById('mLoginPageNo_3').childNodes;
					var errmsg;
					if (childNodes != null && childNodes.length > 1) {
						var orgmsg = document.getElementById('mLoginPageNo_3').childNodes[0].innerText;
						orgmsg = orgmsg + document.getElementById('mLoginPageNo_3').childNodes[1].innerText;
						errmsg = orgmsg.replace(/[0-9]/g, "X");
					}
					PUTLOG("Catch page error, <mLoginPageNo_3>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf("https://personalbank.cib.com.cn/pers/main/index.do") != -1) {
				if (document.getElementById('top-wel') != null) {
					var errmsg = document.getElementById('top-wel').innerText;
					PUTLOG("Catch page SUCCESS, <top-wel>: " + errmsg);
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
				if (document.getElementByClass('cib-icon cib-icon-alert') != null) {
					var errmsg = document.getElementByClass('cib-icon cib-icon-alert').parentNode.innerText;
					PUTLOG("Catch page Error, <cib-icon cib-icon-alert>: " + errmsg);
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
				//else{PUTLOG("Catch page null, <top-wel>: ");}
			}
		} else if (bankid == "psbc") {
			if (window.location.href.indexOf('https://pbank.psbc.com/pweb/prelogin.do') != -1) {
				if (document.getElementById('EEE') != null) {
					var errmsg = document.getElementById('EEE').innerText;
					if (errmsg != "") {
						PUTLOG("Catch page error, <EEE>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
		} else if (bankid == "cgb") {
			if (document.getElementById('certNoText') != null
				 && document.getElementById('jinru') != null
				 && document.getElementById('mobileSetbox') != null) {
				var errmsg = "Please complete your personal information";
				PUTLOG(errmsg);
				var voucherMap = {};
				voucherMap.errmsg = errmsg;
				if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf('https://ebanks.cgbchina.com.cn/perbank/OT0001.do') != -1) {
				if (document.getElementById('errorMessage') != null) {
					var errmsg = document.getElementById('errorMessage').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <errorMessage>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('closeErrorMessage') != null) {
					var errmsg = document.getElementById('closeErrorMessage').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <closeErrorMessage>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementByClass('subTitle') != null
					 && document.getElementById('mobileVerifyCode') != null
					 && document.getElementById('telPhone') != null) {
					var errmsg = document.getElementByClass('subTitle').innerText;
					if (errmsg) {
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementByClass('subTitle') != null
					 && document.getElementById('button2') != null
					 && document.getElementById('button3') != null) {
					var errmsg = document.getElementByClass('subTitle').innerText;
					if (errmsg) {
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (window.location.href) {
					var errmsg = window.location.href;
					var voucherMap = {};
					voucherMap.errmsg = errmsg;
					if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
						return; // Stop Check
					}
				}
			}
			if (window.location.href.indexOf('https://ebanks.cgbchina.com.cn/perbank') != -1) {
				if (document.getElementById('errorMessage') != null) {
					var errmsg = document.getElementById('errorMessage').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <errorMessage>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementByClass('area5') != null) {
					var errmsg = document.getElementByClass('area5').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <area5>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf('https://ebanks.cgbchina.com.cn/perbank/welcome.do') != -1) {
				if (document.getElementById('errorMessage') != null) {
					var errmsg = document.getElementById('errorMessage').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <errorMessage>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementByClass('customerName') != null) {
					var strCusname = document.getElementByClass('customerName').innerText;
					PUTLOG("Catch page SUCCESS, <customerName>: " + strCusname);
					var params = {};
					//var cookieStr = document.cookie;
					var cookieStr = window.external.GetHttpOnlyCookie(window.location.href, "");
					var starti = cookieStr.indexOf("JSESSIONID");
					var endi = cookieStr.lastIndexOf("JSESSIONID");
					if (-1 != starti && starti != endi) {
						cookieStr = cookieStr.substr(0, endi - 2);
					}
					params.cookie = cookieStr;
					params.cust_name = strCusname;
					params.emp_sid = _emp_sid; // _emp_sid is a variable defined in page '/welcome.do'
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
		} else if (bankid == "cebc") {
			if (window.location.href.indexOf("http://ebank.cebbank.com/time.html") != -1){
				if (document.getElementByClass("txt_h") != null) {
					var errmsg = document.getElementByClass("txt_h").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <txt_h>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://www.cebbank.com/per/modLogInfo.do") != -1){
				if (document.getElementByClass("txt_h size01") != null) {
					var errmsg = document.getElementByClass("txt_h size01").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <txt_h size01>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getEletsByClassName('back_down')[0]){
					var errmsg = document.getEletsByClassName('back_down')[0].innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <back_down>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://www.cebbank.com/per/perlogin1.do") != -1) {
				if (document.getEletsByClassName("txt01 size01") != null
					&& document.getEletsByClassName("txt01 size01")[0] != null
					&& document.getEletsByClassName("txt01 size01")[1] != null) {
					if (document.getEletsByClassName("mar01") != null
						 && document.getEletsByClassName("mar01")[1] != null) {
						var errmsg = document.getEletsByClassName("mar01")[1].innerText;
						if (errmsg) {
							if (-1 != errmsg.indexOf("\u8d26\u6237\u6dfb\u52a0\u5230\u7f51\u94f6")) {
								PUTLOG("Catch page error, <mar01>:" + errmsg);
								var voucherMap = {};
								voucherMap.errmsg = errmsg;
								if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
									return; // Stop Check
								}
							}
						}
					}
					if (document.getEletsByClassName("size01 txt02")[0] != null) {
						var errmsg = document.getEletsByClassName("size01 txt02")[0].innerText;
						if (errmsg) {
							if (-1 != errmsg.indexOf("\u7f51\u94f6\u767b\u5f55\u5bc6\u7801\u4fee\u6539")) {
								if (document.getEletsByClassName("size01 txt02")[6] != null) {
									var msg = document.getEletsByClassName("size01 txt02")[6].innerText;
									if (-1 != msg.indexOf("\u9632\u4f2a\u4fe1\u606f")) {
										PUTLOG("Catch page error, <size01 txt02>:" + msg);
										var voucherMap = {};
										voucherMap.errmsg = msg;
										if (DecodeError(msg) && window.external.ReportStatus(DecodeError(msg), Json.stringify(voucherMap))) {
											return; // Stop Check
										}
									}
								}
								PUTLOG("Catch page error, <size01 txt02>:" + errmsg);
								var voucherMap = {};
								voucherMap.errmsg = errmsg;
								if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
									return; // Stop Check
								}
							}
							if (-1 != errmsg.indexOf("\u767b\u5f55\u5bc6\u7801\u8fc7\u671f\u63d0\u793a")) {
								PUTLOG("Catch page error, <size01 txt02>:" + errmsg);
								var voucherMap = {};
								voucherMap.errmsg = errmsg;
								if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
									return; // Stop Check
								}
							}
							if (-1 != errmsg.indexOf("\u7f51\u94f6\u767b\u5f55\u540d\u4fee\u6539")) {
								if (document.getEletsByClassName("size01 txt02")[4] != null) {
									var msg = document.getEletsByClassName("size01 txt02")[4].innerText;
									if (-1 != msg.indexOf("\u9632\u4f2a\u4fe1\u606f")) {
										PUTLOG("Catch page error, <size01 txt02>:" + msg);
										var voucherMap = {};
										voucherMap.errmsg = msg;
										if (DecodeError(msg) && window.external.ReportStatus(DecodeError(msg), Json.stringify(voucherMap))) {
											return; // Stop Check
										}
									}
									if (-1 != msg.indexOf("\u8bf7\u53ca\u65f6\u66f4\u6362\u7f51\u94f6\u767b\u5f55\u5bc6\u7801")) {
										if (document.getEletsByClassName("size01 txt02")[8] != null){
											var msg = document.getEletsByClassName("size01 txt02")[8].innerText;
											if(-1 != msg.indexOf("\u7f51\u94f6\u534f\u8bae\u786e\u8ba4")){
												if (document.getElementById('agreementCheck')){
													document.getElementById('agreementCheck').click();
													doLogin();
												}
											}
										}
										else{
											if (document.getElementByClass('btn_r') != null){
												doLogin();
											}
											else{
												PUTLOG("Catch page error, <size01 txt02>:" + msg);
												var voucherMap = {};
												voucherMap.errmsg = msg;
												if (DecodeError(msg) && window.external.ReportStatus(DecodeError(msg), Json.stringify(voucherMap))) {
													return; // Stop Check
												}
											}
										}
									}
								}
							}
						}
					}
					if (document.getEletsByClassName('back_down')[0]){
						var errmsg = document.getEletsByClassName('back_down')[0].innerText;
						if (errmsg) {
							PUTLOG("Catch page error, <back_down>:" + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}	
				}
				if (document.getElementByClass("shouzhi") != null
					&& document.getElementByClass("txt05 size01 txt_b") != null) {
					document.getElementByClass("shouzhi").onclick();
					return; // Stop Check
				}
				if (document.getElementByClass("errbox mar01") != null) {
					var errmsg = document.getElementByClass("errbox mar01").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <errbox mar01>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById("mainFrame") != null && document.getElementById("mainFrame").src == "perwelcome.do") {
					PUTLOG("Catch page SUCCESS, <mainFrame>: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
				if (document.getElementByClass("txt_b") != null) {
					if (document.getElementByClass("txt_h size01") != null) {
						var errmsg = document.getElementByClass("txt_h size01").innerText;
						if (errmsg) {
							PUTLOG("Catch page error, <txt_h size01>:" + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
					var errmsg = document.getElementByClass("txt_b").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <txt_b>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('skey') == null &&
					document.getElementById('tipSpan') == null){
					var errmsg = window.location.href;
					if (errmsg) {
						PUTLOG("Catch page error, <window.location.href>:" + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
			if (window.location.href.indexOf("https://www.cebbank.com/per/perlogin3.do") != -1) {
				if (document.getEletsByClassName("size01 txt02")[0] != null) {
					var errmsg = document.getEletsByClassName("size01 txt02")[0].innerText;
					if (errmsg){
						if (-1 != errmsg.indexOf("\u767b\u5f55\u5bc6\u7801\u8fc7\u671f\u63d0\u793a")) {
							PUTLOG("Catch page error, <size01 txt02>:" + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
						if (-1 != errmsg.indexOf("\u7f51\u94f6\u767b\u5f55\u540d\u4fee\u6539")) {
							if (document.getEletsByClassName("size01 txt02")[4] != null) {
								var msg = document.getEletsByClassName("size01 txt02")[4].innerText;
								if (-1 != msg.indexOf("\u7f51\u94f6\u767b\u5f55\u5bc6\u7801")) {
									PUTLOG("Catch page error, <size01 txt02>:" + msg);
									var voucherMap = {};
									voucherMap.errmsg = msg;
									if (DecodeError(msg) && window.external.ReportStatus(DecodeError(msg), Json.stringify(voucherMap))) {
										return; // Stop Check
									}
								}
							}
						}
					}
				}
				if (document.getElementById("mainFrame") != null && document.getElementById("mainFrame").src == "perwelcome.do") {
					PUTLOG("Catch page SUCCESS, <mainFrame>: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://www.cebbank.com/per/perlogin4.do") != -1) {
				if (document.getElementById('expMsgTable') != null) {
					var errmsg = document.getElementById('expMsgTable').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <expMsgTable>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById("mainFrame") != null && document.getElementById("mainFrame").src == "perwelcome.do") {
					PUTLOG("Catch page SUCCESS, <mainFrame>: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf("https://www.cebbank.com/per/perlogin5.do") != -1) {
				if (document.getElementByClass('line_h txt_red') != null) {
					var errmsg = document.getElementByClass('line_h txt_red').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <expMsgTable>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById("mainFrame") != null && document.getElementById("mainFrame").src == "perwelcome.do") {
					PUTLOG("Catch page SUCCESS, <mainFrame>: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
		} else if (bankid == "bosh") {
			if (window.location.href.indexOf('https://ebanks.bankofshanghai.com/pweb/prelogin.do') != -1) {
				if (document.getElementByClass('headtitle') != null
					 && document.getElementById('OtpPWD') == null
					 && document.getElementByClass('tdValue') != null
					 && document.getElementById('goBackButton') != null
					 && document.getElementById('AuthModRadio') != null
					 && document.getElementById('doItButton') != null) {
					var errmsg = document.getElementByClass('tdValue').innerText;
					if (errmsg) {
						if (DecodeError(errmsg)) {
							PUTLOG("Catch page error, <tdValue>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementByClass('errors_def') != null
					 && document.getElementById('button') != null
					 && document.getElementByClass('padButton') != null) {
					var errmsg = document.getElementByClass('errors_def').innerText;
					if (errmsg) {
						if (DecodeError(errmsg)) {
							PUTLOG("Catch page error, <errors_def>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementByClass('tdValue') != null
					 && document.getElementById('OtpPWD') == null
					 && document.getElementById('button') != null
					 && document.getElementByClass('padButton') != null) {
					var errmsg = document.getElementByClass('tdValue').innerText;
					if (errmsg) {
						if (DecodeError(errmsg)) {
							PUTLOG("Catch page error, <tdValue>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementByClass('headtitle') != null
					 && document.getElementByClass('tdTitle') != null
					 && document.getElementById('SecretNotice') != null
					 && document.getElementById('UserName') != null
					 && document.getElementById('TelePhoneNo') != null) {
					var errmsg = document.getElementByClass('headtitle').innerText;
					if (errmsg) {
						if (DecodeError(errmsg)) {
							PUTLOG("Catch page error, <headtitle>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementById('form2_EEE') != null) {
					var errmsg = document.getElementById('form2_EEE').innerText;
					if (errmsg) {
						if (DecodeError(errmsg)) {
							PUTLOG("Catch page error, <form2_EEE>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementById('CCC') != null) {
					var errmsg = document.getElementById('CCC').innerText;
					if (errmsg) {
						if (DecodeError(errmsg) != LoginErrorCode.LOG_FAILE_UNDEF) {
							PUTLOG("Catch page error, <CCC>: " + errmsg);
							var voucherMap = {};
							voucherMap.errmsg = errmsg;
							if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
								return; // Stop Check
							}
						}
					}
				}
				if (document.getElementById('EEE') != null) {
					var errmsg = document.getElementById('EEE').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <EEE>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('businessfrm') != null
					 && document.getElementById('businessfrm').contentWindow != null
					 && document.getElementById('businessfrm').contentWindow.document.getElementById("zh") != null) {
					var errmsg = document.getElementById('businessfrm').contentWindow.document.getElementById("zh").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <zh>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById("zh") != null) {
					var errmsg = document.getElementById("zh").innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <zh>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
				if (document.getElementById('businessfrm') != null
					 && document.getElementById('businessfrm').contentWindow != null
					 && document.getElementById('businessfrm').contentWindow.document.getElementById("hourStr") != null) {
					PUTLOG("Catch page SUCCESS: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
				if (document.getElementById('mainfrm') != null
					 && document.getElementById("mainfrm").href.indexOf('https://ebanks.bankofshanghai.com/pweb/welcome.do') != -1) {
					PUTLOG("Catch page SUCCESS: ");
					var params = {};
					params.cookie = window.external.GetHttpOnlyCookie(window.location.href, "");
					window.external.ReportStatus(LoginErrorCode.LOG_SUCCESS, Json.stringify(params));
					return; // Stop Check
				}
			}
			if (window.location.href.indexOf('https://ebanks.bankofshanghai.com/pweb/SelfRegistrationNewPre.do') != -1) {
				if (document.getElementByClass('headtitle') != null) {
					var errmsg = document.getElementByClass('headtitle').innerText;
					if (errmsg) {
						PUTLOG("Catch page error, <headtitle>: " + errmsg);
						var voucherMap = {};
						voucherMap.errmsg = errmsg;
						if (DecodeError(errmsg) && window.external.ReportStatus(DecodeError(errmsg), Json.stringify(voucherMap))) {
							return; // Stop Check
						}
					}
				}
			}
		} else {}
		//PUTLOG("========check page========");
		setTimeout("CheckPage();", 1000);
	};
}

/**
 * Main loop
 */
setTimeout("CheckPage();", 1000);
