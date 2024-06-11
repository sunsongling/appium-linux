const childProcess = require('child_process');
const logger = require('../logger.js');
const minimist = require('minimist');
// 解析参数
const args = minimist(process.argv.slice(2));
let port = args['port'] || '4723';
const loggerAppium  = new logger('appium',port);
port = port.toString();

//运行 appium
let appium = null;

function runAppium(){
    if(appium != null){
        appium.kill();
    }
   
    //子进程
    appium = childProcess.spawn('C:/nodejs/node_global/appium.cmd', ['--port',port]);
    appium.stdout.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        
        // 逐行输出
        output.split('\n').forEach((line) => {
            loggerAppium.info((new Date()).toLocaleString()+' '+ line);
        });
    
    });

    // 错误
    appium.stderr.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        // 逐行输出
        output.split('\n').forEach((line) => {
            loggerAppium.error((new Date()).toLocaleString()+' '+ line);
        });
    });

    appium.on("close", function (code) {
        loggerAppium.error((new Date()).toLocaleString()+' '+ code);
        // 重启子进程
        runAppium();
    });

}


runAppium();
