const filename = __filename.split("\\").pop();

const log4js = require('log4js');
const fs = require("fs");
const path = require("path");


// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}
var logdir = DogConfig != undefined && DogConfig.logdir != undefined ? DogConfig.logdir : process.env.APPDATA;
logdir += "\\nodelog\\";
checkAndCreateDir(logdir);
console.log('log dir: ' + logdir);

log4js.configure({
    "appenders": [
        {
            "type": "clustered",
            "appenders": [
                {
                    "type": "console"
                },
                {
                    "type": "dateFile",
                    "filename": logdir + "app.log",
                    "pattern": "-yyyy-MM-dd",
                    "absolute": true
                },
                {
                    "type": "logLevelFilter",
                    "level": "ERROR",
                    "appender": {
                        "type": "dateFile",
                        "filename": logdir + "errors.log",
                        "pattern": "-yyyy-MM-dd",
                        "absolute": true
                    }
                }
            ]
        }
    ]
    ,replaceConsole: true
});

function getlog(name){
    var logger = log4js.getLogger(name);
    logger.setLevel('INFO');
    return logger;
}
exports.logger = getlog;
