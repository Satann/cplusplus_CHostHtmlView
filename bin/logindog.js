const OS = require('os');
const ASSERT = require('assert');
const FS = require('fs');
const CHILD_PROCESS = require('child_process');
const HTTPS = require('https');
const HTTP = require("http");
const URL = require("url");
const PATH = require("path");
const CRYPTO = require("crypto");
const ICONV = require("iconv-lite");

// Initialize
(function(){
	/**
	* Process initialize
	*/
	process.title = "LoginDog";
	process.chdir(PATH.dirname(module.filename));
	process.on('SIGINT', ()=>{
			console.error("Signal <interrupt>");
			process.exit(0);
		});
	process.on('SIGBREAK', ()=>{
			console.error("Signal <Ctrl-Break>");
			process.exit(0);
	});
	process.on('SIGKIL', ()=>{
			console.error("Signal <User Kill>");
			process.exit(0);
		});		
	process.on('SIGHUP', ()=>{
			console.error("Signal <Console colosed>");
			process.exit(0);
	});	
	process.on('SIGPIPE', ()=>{
			console.error("Signal <Socket IO>");
	});
	process.on('SIGTERM', ()=>{
		console.error("Signal <SIGTERM>");
	});

	process.on('exit', (code) => {
		console.error('About to exit with code:', code);
	});

	process.on('uncaughtException', function (err) {
		console.error( "[Inside 'uncaughtException' event] " + err.stack || err.message );
	});

	console.log(`Current directory: [${process.cwd()}]`);
	console.log(`Server pid: ${process.pid}`);
	console.log(`startup timestamp: ${new Date()}`);
})();


// Load libraries
eval(FS.readFileSync("./lib/httpclient.js").toString());
eval(FS.readFileSync("./lib/httpserver.js").toString());
eval(FS.readFileSync("./config/statuscode.js").toString());
eval(FS.readFileSync("./config/config.js").toString());
eval(FS.readFileSync("./config/statuscontrol.js").toString());
eval(FS.readFileSync("./lib/log.js").toString());
eval(FS.readFileSync("./lib/strcodec.js").toString());

// Startup
(function(){
	/**
	* Startup http server
	*/
	(new HttpServer(DogConfig.dogport)).start(onRequest);
	
	/**
	* Interval check bot status
	*/
	setTimeout(BotCheck, DogConfig.botCheckInterval);
})();


// Handlers dispatch
function onRequest(req, resp) {
	var reqBody = "";
	req.on('data', function (chunk){
		//console.log("" + chunk);
		try{
			reqBody += chunk;
		}catch(e){
			console.error("failed to read: " + e);
		}
		
	});
	req.on('end', function(){
		//console.log(reqBody);
		try{
			return onProcess(req, reqBody, resp);
		}catch(e){
			console.error("failed to process: " + e);
		}
	});
};

var HttpStatus = {
	"Ok" : 200,
	"BadRequest": 400,
	"NotFound" : 404,
	"InternalError" : 500
};	

// Dispatch 
function onProcess(req, body, resp){
	var context = URL.parse(req.url).pathname;
	console.log(`Request [${context}]`);
	//console.log(`Request [${body}]`);
	
	var httpRespCode = HttpStatus.Ok;
	
	// For client request
	if (context == DogConfig.statusReq){
		httpRespCode = handleStatus(req, JSON.parse(body), resp);
	}
	
	// For upstream server request
	if (context == DogConfig.commandReq){
		httpRespCode = handleCommand(req, JSON.parse(body), resp);
	}
	
	// For upstream server keep alive request
	if (context == DogConfig.kaReq){
		// Just do ECHO as following
	}
	// For upstream server keep alive request
	if (context == DogConfig.serviceStop){
		// send quit to tomcat
		// ...
		resp.writeHead(200, { 'Content-Type': 'text/plain' });
		resp.end('server stop.');
		process.exit(0);
	}
	// do response
	resp.writeHead(httpRespCode
						, { 
							'Content-Type': 'Application/Json', 
							'Accept' : 'text/plain'
						});
	//resp.write(body);
	resp.end();
	return ;
};

function handleStatus(req, reqobj, resp){
	//console.log(`status : \r\n ${JSON.stringify(reqobj)}`);
	
	/**
	* Log and return;
	*/
	if (reqobj.status == 0){
		console.log(`status : \r\n ${JSON.stringify(reqobj)}`);
		return HttpStatus.Ok;
	}
	/**
	* Retry
	*/
	if(!StatusControl.isMediacy(reqobj.status))
	{
		if(DogConfig.getBot(reqobj.taskey))
		{
			DogConfig.getBot(reqobj.taskey).step = 1;
		}
	}
	/**
	* Forward status to Gateway
	*/
	if(!handleRetry(reqobj)){
		sendHttpRequest(reqobj);
	}
	
	return HttpStatus.Ok;
}

function sendHttpRequest(reqobj){
	if(StatusControl.ifReport(reqobj.status))
	{
		if(!StatusControl.ifKeepStatus(reqobj.status))
		{
			reqobj.status = 401;
		}
		console.log(`Forward status to url: ${DogConfig.upstream}`);
		console.log(`Report status : org=${reqobj.org}`);
		console.log(`Report status : reqId=${reqobj.reqId}`);
		console.log(`Report status : status=${reqobj.status}`);
		console.log(`Report status : taskey=${reqobj.taskey}`);
		// Report Bot ID, if exist;
		if ('undefined' != typeof reqobj.voucherMap && 'undefined' != typeof reqobj.voucherMap.botid){
			try{
					console.log(`Report status : botid=${reqobj.voucherMap.botid}`);	
			}catch(e){
			
			}
		}
		
		var request = {
			url : DogConfig.upstream,
			body: reqobj,
			callback : function (url, headers, body){
							console.log(`Upstream: ${url}`);
							console.log(`Response: \r\n ${body}\r\n\r\n`);
						}
		};
		(new HttpClient()).httpRequest(request);
	}
}

function handleRetry(reqobj){
	var getStatus = reqobj.status;
	if (StatusControl.ifRetry(getStatus)){ 
		var newreqobj = null;
		if(StatusControl.getReqcom(reqobj.taskey))
		{
			newreqobj = StatusControl.getReqcom(reqobj.taskey).reqobj;
		}
		if(newreqobj)
		{
			if(!StatusControl.getRetry(reqobj.taskey))
			{
				StatusControl.setRetry(reqobj.taskey,StatusControl.retrycount);
				console.log("Set retry count done");
			}
			var ifretry = StatusControl.retryDecrement(reqobj.taskey);
			if(ifretry)
			{
				console.log("Start retry");
				var taskstarttime= DogConfig.getBot(reqobj.taskey).createtime;
				setTimeout(function(){Command_CreateBot(newreqobj,taskstarttime);},StatusControl.botRetryInterval);
				//console.log("Not send statue");
				return true;
			}
			else{
				return false;
			}
		}
		else{
			console.log("cannot retry again");
			return false;
		}
	}
	else{
		if (getStatus != '101'){ 
			StatusControl.setRetry(reqobj.taskey,null);
		}
		else{
			if(StatusControl.getRetry(reqobj.taskey))
			{
				//console.log("Not send statue");
				return true;
			}
		}
	}
	return false;
}

function handleCommand(req, reqobj, resp){

	/**
	* Feature: fund123
	*/
	if (typeof reqobj.org !== 'undefined' 
		&& reqobj.org != null 
		&& reqobj.org == "fund123"){
		// Spawn a fund task
		var request = {
			url : DogConfig.fundServerUrl,
			//body: "", /*HTTP GET*/
			callback : function (url, headers, body){
						console.log(`Upstream: ${url}`);
						console.log(`Response: \r\n ${body}\r\n\r\n`);
					}
		};
		
		request.url += "?reqId=" + reqobj.reqId;
		request.url += "&username=" + encodeURIComponent(DogConfig.aesDecrypt(reqobj.login, DogConfig.secretKey));
		request.url += "&password=" + encodeURIComponent(DogConfig.aesDecrypt(reqobj.password, DogConfig.secretKey));
		request.url += "&org=" + reqobj.org;
		request.url += "&option=" + encodeURIComponent(JSON.stringify(reqobj));
		
		console.log(`Fund Task: ${request.url}`);
		
		(new HttpClient()).httpRequest(request);
		
		return HttpStatus.Ok;
	}

	/**
	* Feature: Cancel a task
	*/
	if(typeof reqobj.name !== 'undefined' && 
		reqobj.name != null && 
		reqobj.name == "cancel")
	{
		console.log("Cancel bot, taskey:" + reqobj.taskey);
		var bot = DogConfig.getBot(reqobj.taskey);
		
		if(typeof bot !== 'undefined' 
			&& bot != null 
			&& typeof bot.pid !== 'undefined'
			&& bot.pid != null
			&& StatusControl.getReqcom(reqobj.taskey) != null )
		{
			bot.step = 2;
			console.log("Try to kill bot, with pid:" + bot.pid);			
			try{
				process.kill(bot.pid, signal='SIGTERM');
			}catch(e){
				console.error("Failed to kill bot, with pid:" + bot.pid);				
				return HttpStatus.InternalError;
			}
			return HttpStatus.Ok;
		}
		else
		{
			console.error("Failed to get bot, taskey:" + reqobj.taskey);			
			return HttpStatus.Ok;//HttpStatus.NotFound;
		}
	}

	/**
	* Normal bot process routines
	*/
	if (typeof reqobj.extraParams === 'undefined' 
			|| reqobj.extraParams == null)
	{
		console.log("JsonRpc: undefined reqobj.extraParams, default reqobj.extraParams.type to 1000");
        reqobj.extraParams = {type : 1000};
	}
	if (typeof reqobj.extraParams.type === 'undefined' 
			|| reqobj.extraParams.type == null)
	{
		console.log("JsonRpc: undefined reqobj.extraParams.type, default reqobj.extraParams.type to 1000");
		reqobj.extraParams.type = 1000;
	}
	
	var type = reqobj.extraParams.type;
	
	if (type == '1000'){ 
		console.log("JsonRpc: newtask");
		StatusControl.addReqcom(reqobj);
		return Command_CreateBot(reqobj,DogConfig.getCurrTime());
	}
	
	if (type == '1001'){
		console.log("JsonRpc: phonecode");
		return Command_SetPhoneCode(reqobj);
	}

	console.error("JsonRpc: unknown");
	
	return HttpStatus.Ok;
}

function Command_CreateBot(reqobj,taskstarttime){
	var arglist = [];
	arglist.push("-t");
	arglist.push(reqobj.org);
	console.log(`org: ${reqobj.org}`);
	
	arglist.push("-s");
	arglist.push(reqobj.name);
	console.log(`name: ${reqobj.name}`);
	
	arglist.push("-u");
	arglist.push(reqobj.login);
	arglist.push("-p");
	arglist.push(reqobj.password);
	arglist.push("-k");
	arglist.push(reqobj.taskey);
	console.log(`taskey: ${reqobj.taskey}`);
	
	arglist.push("-r");
	arglist.push(reqobj.reqId);
	console.log(`reqId: ${reqobj.reqId}`);
	
	arglist.push("-l");
	arglist.push(reqobj.logintype);
	console.log(`logintype: ${reqobj.logintype}`);
	
	arglist.push("-h");
	arglist.push(DogConfig.getStatusUrl());
	
	//console.log(JSON.stringify(arglist));

	const bot = CHILD_PROCESS.spawn(DogConfig.loginbot(reqobj.org)
									, arglist
									, DogConfig.forkOptions);
	
	console.log(`Bot Created OK, pid=${bot.pid}`);
	
	bot.createtime = taskstarttime;
	bot.taskey = reqobj.taskey;
	bot.org = reqobj.org;
	bot.reqId = reqobj.reqId;
	bot.step = 0;
	
	DogConfig.addBot(bot);

	if (typeof bot.stdout !== 'undefined' && bot.stdout != null){
			bot.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
	}

	if (typeof bot.stderr !== 'undefined' && bot.stderr != null){
			bot.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});	
	}

	bot.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	  
	  var pcodefile = DogConfig.getPhoneCodeFile(reqobj.taskey.substr(5));
	  console.log("Phone code file path:" + pcodefile);
	  if(FS.existsSync(pcodefile)){
		  FS.unlink(pcodefile, function(err){
			  if(err)
			  {
				console.log(err);
			  }
		  });
	  }
	  
	  if(bot.step == 0)
	  {
		var voucherMap = new Object();
		voucherMap.botid = bot.pid;
		voucherMap.errmsg = "loginbot Aborted.";
		sendHttpRequest(SetBotStatus(bot, 603, voucherMap));
	  }
	  
	  DogConfig.remBot(bot);
	  StatusControl.remReqcom(bot.taskey);
	});
	return HttpStatus.Ok;
}

function Command_SetPhoneCode(reqobj){
	if (typeof reqobj.extraParams === 'undefined'){
		console.log("invalid request parameters");
		return HttpStatus.BadRequest;
	}
	if (typeof reqobj.extraParams.smsCode === 'undefined' ){
		console.log("smsCode not found");
		return HttpStatus.BadRequest;
	}
	if (reqobj.extraParams.smsCode != null){
		console.log(`phone code: ${reqobj.extraParams.smsCode}`);
	}
	if (typeof reqobj.taskey === 'undefined'){
		console.error("taskey not found");
		return HttpStatus.BadRequest;
	}
	if (reqobj.taskey == null || reqobj.taskey.indexOf("TASK:") == -1){
		console.error("invalid task key");
		return HttpStatus.BadRequest;
	}
	try{
		var pcodefile = DogConfig.getPhoneCodeFile(reqobj.taskey.substr(5));
		FS.writeFileSync(pcodefile, JSON.stringify(reqobj));
		//console.log(`write phone code to ${pcodefile}`);
	}catch(e){
		console.error("Failed to write phone cdoe to temporary file : " + e);
	}
	return HttpStatus.Ok;
}

function BotCheck(){
	//console.log(`bot queue size: ${DogConfig.botq.length}`);	
	for (i = 0; i < DogConfig.botq.length; i++){
		var bot = DogConfig.botq[i];
		if (typeof bot !== 'undefined' 
			&& bot != null 
			&& typeof bot.pid !== 'undefined' 
			&& typeof bot.createtime !== 'undefined')
		{
			var currTime = DogConfig.getCurrTime();
			if (currTime >= bot.createtime + DogConfig.bottimeout){
				console.log(`bot [${bot.pid}] timeout, kill it`);
				bot.step = 1;
				bot.kill('SIGTERM');
				
				var voucherMap = new Object();
				voucherMap.botid = bot.pid;
				voucherMap.errmsg = "Timeout, logindog killed bot";
				sendHttpRequest(SetBotStatus(bot, 504, voucherMap));
				
				DogConfig.remBot(bot);
				StatusControl.setRetry(bot.taskey,0);
				StatusControl.remReqcom(bot.taskey);
			}else{
				//console.log(`bot pid: [${bot.pid}]`);
				//console.log(`bot createtime: [${bot.createtime}]`);
			}
		}
	}	
	setTimeout(BotCheck, DogConfig.botCheckInterval);
}

function SetBotStatus(bot, status, voucherMap){
	var botStatus = new Object();
	botStatus.org = bot.org;
	botStatus.reqId = bot.reqId;
	botStatus.status = status;
	botStatus.taskey = bot.taskey;
	botStatus.voucherMap = voucherMap;
	return botStatus;
}