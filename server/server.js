const childProcess = require('child_process');
const winston = require('winston');
const config = require('./config.js');
const app  = require('../app.js');
const Redis = require('ioredis');
const now = new Date();
const date = now.toLocaleString().split(" ")[0];  // 获取日期部分
const redis = new Redis({
    host: 'localhost',
    port: 6379
});
// 设置轮询的间隔时间（例如：每5秒钟执行一次）
const pollInterval = 50000; // 单位为毫秒
var intervalId = null;
app.init(config);

function wait(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}


const loggerChild = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename:'./logs/'+date+'/child.log' })
    ]
});

let child = null;

function runChild(){
    if(child != null){
        child.kill();
    }
    //子进程
    child = childProcess.spawn('node',['./scripts/shutugames.js']);

    child.stdout.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        
        // 逐行输出
        
        output.split('\n').forEach((line) => {
            loggerChild.info((new Date()).toLocaleString()+' '+ line);
        });
    
    });

    // 错误
    child.stderr.on("data", function (data) {
        // 因为可能会有多次输出，所以需要将数据转换为字符串
        const output = data.toString();
        
        // 逐行输出
        output.split('\n').forEach((line) => {
            loggerChild.error((new Date()).toLocaleString()+' '+ line);
        });
    });

    child.on("close", function (code) {
        loggerChild.error((new Date()).toLocaleString()+"child exists with code: "+ code);
        // 重启子进程
        runChild();
    });
}

// pm2 stop all
// 定义轮询的函数
function pollTask() {
    redis.get(config.redisKey).then(function(result){
        if(result >= 5){
            loggerChild.info((new Date()).toLocaleString()+' 连续出错'+ result);
            redis.set(config.redisKey,0);
            if(intervalId != null){
                clearInterval(intervalId);
            }
            redis.set('actionPhone',1);
            app.actionPhone();
            wait(600000); //等600秒
            init();
        }
    });
}
 
/*
function init(){
    redis.set('actionPhone',0);
    runChild();

    // 启动轮询任务
    intervalId = setInterval(pollTask, pollInterval);
}
*/

runChild();

