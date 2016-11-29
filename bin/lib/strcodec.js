if ('undefined' === typeof GBK2UTF8){
	GBK2UTF8 = function(buf){
		if (ICONV.encodingExists("gb2312")){
			return ICONV.decode(buf, "gb2312");
		}
		return "";
	}
}