/**
* Definitions of state machine
*/
if  ('undefined' === typeof STATE){
//////////////////////////////////////////////////////////
 STATE = {
	"PageReset"          : 0,
	
	"LoginPageReady"    : 101,
	"LoginInitPage"     : 102,
	"LoginWaitPage"     : 103,
	
	"LoginSetUser"      : 201,
	"LoginWaitUser"     : 202,
	"LoginUserSleep"    : 203,
	
	"LoginSetPass"      : 301,
	"LoginWaitPass"     : 302,
	"LoginPassSleep"    : 303,
	
	"LoginGetCapt"      : 401,
	"LoginQryCapt"      : 402,
	"LoginSendFrontCapt": 4021,
	"LoginWaitFrontCapt": 4022,
	"LoginRefreshCapt"  : 4023,
	"LoginSaveNewCapt"  : 4024,	
	"LoginSetCapt"      : 403,
	"LoginWaitCapt"     : 404,
	"LoginCaptSleep"    : 405,
	
	"LoginBeforeLogin"  : 501,
	"LoginDoLogin"      : 502, 	
	"LoginAfterLogin"   : 503, 	

	
	"PhonePageReady"    : 601,
	"PhoneInitPage"     : 602,
	"PhoneWaitPage"     : 603,
	
	"PhoneGetCode"      : 701,
	"PhoneQryCode"      : 702,
	"PhoneSetCode"      : 703,
	"PhoneWaitCode"     : 704,
	"PhoneCodeSleep"    : 705,
	
	"PhoneGetCapt"      : 801,
	"PhoneQryCapt"      : 802,
	"PhoneSendFrontCapt": 8021,
	"PhoneWaitFrontCapt": 8022,
	"PhoneRefreshCapt"  : 8023,
	"PhoneSaveNewCapt"  : 8024,
	"PhoneSetCapt"      : 803,
	"PhoneWaitCapt"     : 804,
	"PhoneCaptSleep"    : 805,
	
	"PhoneBeforeSubmit" : 901,
	"PhoneSubmit"       : 902,
	"PhoneAfterSubmit"  : 903,

	
	"Shutdown"          : 9999
};
////////////////////////////////////////////////////
};
