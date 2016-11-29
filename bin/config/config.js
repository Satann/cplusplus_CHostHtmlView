/**
* Configuration for login dog
* 
*/
var DogConfig = {
	/**
	* Settings
	*
	*/
    dogproto : "http:",
    
    dogaddr : "127.0.0.1",
    
    dogport : 3337,
    
    statusReq : "/status",
    
    commandReq : "/command",
	
    kaReq : "/keepalive",

    serviceStop : "/stop",
    
    upstream : "http://127.0.0.1:8088/request/callback",
    
    loginbot : function (bankid){
		return './bot.' + bankid + '/LoginBot.exe'
	},
        
    bottimeout: 210, // 3.5 minutes
    
    botq: [],
    
    botCheckInterval : 1000, // 1s
    
    logdir: process.env.APPDATA,
    
    /**
    * Utilities 
    *
    */
    forkOptions: {
        detached : true,
        stdio: 'ignore'
    },
    
    getStatusUrl : function (){
        return "" 
            + this.dogproto 
            + "//" 
            + this.dogaddr 
            + ":" 
            + this.dogport 
            + this.statusReq;
    },
    
    getCommandUrl: function(){
        return "" 
            + this.dogproto 
            + "//" 
            + this.dogaddr 
            + ":" 
            + this.dogport 
            + this.commandReq;
    },
    
    getPhoneCodeFile: function(taskkey){
        return OS.tmpdir() 
				+ "\\"
                + taskkey 
                + ".json";
    },
    
    addBot: function(bot){
        this.botq.push(bot);
        console.log(`* add bot to queue[${this.botq.length}]`);
        console.log(` pid: ${bot.pid}, `);
        console.log(` createtime: ${bot.createtime}`);
    },
    
    remBot: function(bot){
        for (i = 0; i < this.botq.length; i++){
            var testbot = this.botq[i];
            if (testbot.pid == bot.pid){
                this.botq.splice(i, 1);
                console.log(`* remove bot ${bot.pid} from queue`);
                return ;
            }
        }
    },
    
    getBot: function(taskey){
         for (i = 0; i < this.botq.length; i++){
            var testbot = this.botq[i];
            if (testbot.taskey == taskey){
                return testbot;
            }
        }
        return null;
    },
    
    getCurrTime : function(){
        return Math.round(new Date().getTime()/1000.0) ;
    },
	
	/**
	* Secret key
	*/
	secretKey : "meaOCudraXbkNIwo",
	
  	/**
	* fund server url
	*/
	fundServerUrl : "http://127.0.0.1:8888/services", 
	
	/**
	* http get request format
	* Parameters: 
	* (1) reqId: "reqId"
	* (2) username: decrypted "login"
	* (3) password: decrypted "password"
	* (4) org: "org"
	* (5) option: the raw json message string
	* Note:
	* option used in HTTP GET, should be URL encoded!
	*/
	fundRequest : "?reqId=%s&username=%s&password=%s&org=%s&option=%s",
	
	
	/** 
	 * aes Encryption
	 * @param data 
	 * @param secretKey 
	 */  
	aesEncrypt : function(data, secretKey) {  
		var cipher = CRYPTO.createCipheriv('aes-128-ecb', secretKey, "");  
		return cipher.update(data,'utf8','base64') + cipher.final('base64');  
	},

	/** 
	 * aes Decryption
	 * @param data 
	 * @param secretKey 
	 * @returns {*} 
	 */  
	aesDecrypt : function(data, secretKey) {  
		var cipher = CRYPTO.createDecipheriv('aes-128-ecb',secretKey, "");
		return cipher.update(data,'base64', 'utf8') + cipher.final('utf8');  
	}, 
	
    dummy : ""
};
