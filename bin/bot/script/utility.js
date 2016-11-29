/**
* Get an element by its class name
*/
if ('undefined' === typeof document.getElementByClass){
/////////////////////////////////////////////////////////////
document.getElementByClass = function(n) {
	if(n==null)
		return null;
	var _el = document.getElementsByTagName('*');
	for (var i=0; i<_el.length; i++ ) {
		if (_el[i].className == n ) {
			return _el[i];
		}
	}
	return null;
};
/////////////////////////////////////////////////////////////
}

if ('undefined' === typeof document.getEletsByClassName){
/////////////////////////////////////////////////////////////
document.getEletsByClassName = function(n) {
	if(n==null)
		return null;
    var ret = [];
	var _el = document.getElementsByTagName('*');
	for (var i=0; i<_el.length; i++ ) {
		if (_el[i].className == n ) {
			ret.push(_el[i]);
		}
	}
	return ret;
};
/////////////////////////////////////////////////////////////
}


if ('undefined' === typeof document.getElementFromIFrame){
/////////////////////////////////////////////////////////////
document.getElementFromIFrame = function(n) { 
	//TODO: not implemented;
	return null;
};
/////////////////////////////////////////////////////////////
}

if ('undefined' === typeof PUTLOG){
	PUTLOG = function(logstr){
		window.external.PutLog("" + logstr);
	}
}

if ('undefined' === typeof LOGSTATE){
	LOGSTATE = function(lstate){
		var voucherMap = {};
		voucherMap.loginState = lstate;
		voucherMap.errmsg = "";
		window.external.ReportStatus(LoginErrorCode.LOG_TRACE, Json.stringify(voucherMap));
	}
}

if ('undefined' === typeof getStringLength){
	getStringLength = function(str){
		var i=0;
		var leth=0;
		while (i < str.length){
			var c = parseInt(str.charCodeAt(i));
			if (c < 256) {
				leth = leth + 1;
			}else {
				leth = leth + 2;
			}
			i=i+1;
		}
		return leth;
	}
}