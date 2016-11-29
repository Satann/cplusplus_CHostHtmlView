curl -k --verbose \
	-c ccb.cookie.0 \
	-o ccb.login.html \
	'https://ibsbjstar.ccb.com.cn/CCBIS/B2CMainPlat_13?SERVLET_NAME=B2CMainPlat_13&CCB_IBSVersion=V6&PT_STYLE=1&CUSTYPE=0&TXCODE=CLOGIN&DESKTOP=0&EXIT_PAGE=login.jsp&WANGZHANGLOGIN=&FORMEPAY=2' \
	-H 'Pragma: no-cache' \
	-H 'Accept-Encoding: gzip, deflate, sdch, br' -H 'Accept-Language: zh-CN,zh;q=0.8' -H 'Upgrade-Insecure-Requests: 1' \
	-H 'User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.7 Safari/537.36' \
	-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Cache-Control: no-cache' \
	-H $'Cookie: udc_ckintactdat={FORM_NAME:\'jhform\',FORM_ID:\'jhform\',TEXT_CONTENT:\'[{"name":"TXCODE","value":"N00001"},{"name":"CCB_PWD_MAP_GIGEST","value":""},{"name":"errURL","value":"/CCBIS/V6/STY1/CN/login.jsp?UKEYSERIALNUM="},{"name":"CCB_IBSVersion","value":""},{"name":"PT_STYLE","value":""},{"name":"PT_LANGUAGE","value":""},{"name":"resType","value":""},{"name":"PRIVATEINFO","value":""},{"name":"DESKTOP","value":"0"},{"name":"EXIT_PAGE","value":"login.jsp"},{"name":"UKEYSERIALNUM","value":""},{"name":"WANGZHANGLOGIN","value":""},{"name":"CCB_PWD_ENCKEY","value":""},{"name":"NAVIGATORNAME","value":""},{"name":"FORMEPAY","value":"2"},{"name":"CHECK_USERALIAS_FLAG","value":"0"},{"name":"COPY_USERID","value":""},{"name":"USERID","value":""}]\',COMBOX_CONTENT:\'[]\',CHECK_BOX:\'[{"name":"ALIASCHECK","value":"on"},]\',BUTTON_ID:\'[{"id":"loginButton","name":"","value":"\xe7\x99\xbb \xe5\xbd\x95"}]\',BUTTON_NAME:\'[]\',ANCHOR_NAME:\'\',ANCHOR_HREF:\'\',TARGET_HREF_NAME:\'\'}' \
	-H 'Connection: keep-alive' \
	--compressed