const childProcess = require('child_process');
const fs = require('fs');
const logger = require('./logger.js');
const minimist = require('minimist');
// 解析参数
const args = minimist(process.argv.slice(2));
const project = args['pro'];
const filePath = '../scripts/'+project+'/index.js';

if (!fs.existsSync(filePath)) {
    console.error('File does not exist');
    return;
}

const infoLog  = new logger(project,'server');

let child = null;

function runChild(){
    if(child != null){
        child.kill();
    }
    //子进程
    child = childProcess.spawn('node',[filePath]);

    child.stdout.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        // 逐行输出
        output.split('\n').forEach((line) => {
            infoLog.info((new Date()).toLocaleString()+' '+ line);
        });
    
    });

    // 错误
    child.stderr.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        
        // 逐行输出
        output.split('\n').forEach((line) => {
            infoLog.error((new Date()).toLocaleString()+' '+ line);
        });
    });

    child.on("close", function (code) {
        infoLog.error((new Date()).toLocaleString()+"child exists with code: "+ code);
        runChild(); // 重新启动子进程
    });

    child.on('exit', (code, signal) => {
        if (code !== 0) {
          infoLog.error((new Date()).toLocaleString()+`Child process exited with code ${code}, restarting...`);
            runChild(); // 重新启动子进程
        }
    });
}

runChild();

