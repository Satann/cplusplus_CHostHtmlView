/**
* Handle alerts error 
* File Encoding: GBK
*
*/

/**
* LoginErrorCode will be loaded by host too.
* LoginErrorCode = {...};
*/

/**
* Note:
* IHtmlWindow2::execScript() will reload the global objects, e.g. 'Alerts', 'Result';
* and this will make previous script (launched by IHtmlWindow2::execScript()) stop to running;
*/
if ('undefined' === typeof DecodeError){
	DecodeError = function (errmsg){
		if (errmsg == '') return 0;
		var BankAlerts = Alerts[GlobalSettings.type];
		if (typeof BankAlerts === 'undefined')
			return ((LoginErrorCode.LOG_FAILE_UNDEF));

		for (var i = 0; i < BankAlerts.length; i++){
			var Item = BankAlerts[i];
			if (typeof Item.m === 'undefined' || typeof Item.e === 'undefined')
				continue;
				
			var msg = Item["m"];
			if (msg.indexOf(errmsg) != -1 || errmsg.indexOf(msg) != -1)
				return ((Item["e"]));
		}
		return  ((LoginErrorCode.LOG_FAILE_UNDEF));
	};
} // endof if ('undefined' === typeof DecodeError){

