const childProcess = require('child_process');
const adb = require('./server_adb.js');
const logger = require('../logger.js');
const loggerRawTCP  = new logger('RawTCP','RawTCP');

const os = {
    win32: 'Windows',
    darwin: 'macOS',
    linux: 'Linux'
}[process.platform];

//rawTCP
let rawTCP = null;
function runRawTCP(){
    if(rawTCP != null){
        rawTCP.kill();
    }
    let command;
    //子进程
    if(os == 'Windows'){
        command = 'RawTcpTunnelConnector-amd64-windows.exe';
    }else{
        command = 'RawTcpTunnelConnector-amd64-linux';
    }
    //子进程
    rawTCP = childProcess.spawn(command,['config=./config.json']);
    rawTCP.stdout.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        
        // 逐行输出
        output.split('\n').forEach((line) => {
            //判断字符串中是否包含error
            if(line.indexOf('error') !== -1){
                restartRawTCP();
            }
            loggerRawTCP.info(line);
        });
    
    });

    // 错误
    rawTCP.stderr.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        // 逐行输出
        output.split('\n').forEach((line) => {
            //判断字符串中是否包含error
            if(line.indexOf('error') !== -1){
                restartRawTCP();
            }
            loggerRawTCP.error(line);
        });
    });

    rawTCP.on("close", function (code) {
        loggerRawTCP.error(code);
        if(code != 0){
            // 重启子进程
            restartRawTCP();
        }
    });

    rawTCP.on('exit', (code, signal) => {
        if (code != 0) {
            loggerRawTCP.error(`RawTCP process exited with code ${code}, restarting...`);
            restartRawTCP();
        }
    });
}

function wait(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}

function restartRawTCP (){
    runRawTCP();
    wait(5000); //等待5秒
    adb.connectAdb();
}

restartRawTCP();