passkey=S000000412316799
password='R`J=3W)v({'

echo "TXCODE=N00001&CCB_PWD_MAP_GIGEST=$passkey%7CLOGPASS&errURL=%2FCCBIS%2FV6%2FSTY1%2FCN%2Flogin.jsp%3FUKEYSERIALNUM%3D&CCB_IBSVersion=&PT_STYLE=&PT_LANGUAGE=&resType=&PRIVATEINFO=&DESKTOP=0&EXIT_PAGE=login.jsp&UKEYSERIALNUM=&WANGZHANGLOGIN=&CCB_PWD_ENCKEY=&NAVIGATORNAME=1&FORMEPAY=2&CHECK_USERALIAS_FLAG=0&COPY_USERID=gait123&USERID=gait123&LOGPASS=$password" 


curl -k --verbose \
	-b ccb.cookie.0 \
	-c ccb.cookie.1 \
	-o ccb.welcome.html \
	'https://ibsbjstar.ccb.com.cn/CCBIS/B2CMainPlat_12?SERVLET_NAME=B2CMainPlat_12&CCB_IBSVersion=V6&PT_STYLE=1' \
	-H 'Pragma: no-cache' \
	-H 'Origin: https://ibsbjstar.ccb.com.cn' \
	-H 'Accept-Encoding: gzip, deflate, br' \
	-H 'Accept-Language: zh-CN,zh;q=0.8' \
	-H 'Upgrade-Insecure-Requests: 1' \
	-H 'User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.7 Safari/537.36' \
	-H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' \
	-H 'Cache-Control: no-cache' -H 'Referer: https://ibsbjstar.ccb.com.cn/CCBIS/B2CMainPlat_13?SERVLET_NAME=B2CMainPlat_13&CCB_IBSVersion=V6&PT_STYLE=1&CUSTYPE=0&TXCODE=CLOGIN&DESKTOP=0&EXIT_PAGE=login.jsp&WANGZHANGLOGIN=&FORMEPAY=2' \
	-H $'Cookie: udc_ckintactdat={FORM_NAME:\'jhform\',FORM_ID:\'jhform\',TEXT_CONTENT:\'[{"name":"TXCODE","value":"N00001"},{"name":"CCB_PWD_MAP_GIGEST","value":"S000000412316799|LOGPASS"},{"name":"errURL","value":"/CCBIS/V6/STY1/CN/login.jsp?UKEYSERIALNUM="},{"name":"CCB_IBSVersion","value":""},{"name":"PT_STYLE","value":""},{"name":"PT_LANGUAGE","value":""},{"name":"resType","value":""},{"name":"PRIVATEINFO","value":""},{"name":"DESKTOP","value":"0"},{"name":"EXIT_PAGE","value":"login.jsp"},{"name":"UKEYSERIALNUM","value":""},{"name":"WANGZHANGLOGIN","value":""},{"name":"CCB_PWD_ENCKEY","value":""},{"name":"NAVIGATORNAME","value":"1"},{"name":"FORMEPAY","value":"2"},{"name":"CHECK_USERALIAS_FLAG","value":"0"},{"name":"COPY_USERID","value":"gait123"},{"name":"USERID","value":"gait123"}]\',COMBOX_CONTENT:\'[]\',CHECK_BOX:\'[{"name":"ALIASCHECK","value":"on"},]\',BUTTON_ID:\'[{"id":"loginButton","name":"","value":"\xe7\x99\xbb \xe5\xbd\x95"}]\',BUTTON_NAME:\'[]\',ANCHOR_NAME:\'\',ANCHOR_HREF:\'\',TARGET_HREF_NAME:\'\'}' \
	-H 'Connection: keep-alive' \
	--data "TXCODE=N00001&CCB_PWD_MAP_GIGEST=$passkey%7CLOGPASS&errURL=%2FCCBIS%2FV6%2FSTY1%2FCN%2Flogin.jsp%3FUKEYSERIALNUM%3D&CCB_IBSVersion=&PT_STYLE=&PT_LANGUAGE=&resType=&PRIVATEINFO=&DESKTOP=0&EXIT_PAGE=login.jsp&UKEYSERIALNUM=&WANGZHANGLOGIN=&CCB_PWD_ENCKEY=&NAVIGATORNAME=1&FORMEPAY=2&CHECK_USERALIAS_FLAG=0&COPY_USERID=gait123&USERID=gait123&LOGPASS=$password" \
	--compressed