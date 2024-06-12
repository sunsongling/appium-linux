const request  = require('request');
const crypto = require('crypto');
const logger = require('./logger.js');
const shell = require('shelljs');
const fs = require('fs');

const token = 'X3QCBMRK5BOT5KM4SLJPUJDX5VN9USSZ';                     //代理ip token
const ipweb = 'http://api.ipweb.cc:8004/api/agent/release?account=';  //代理ip 切换ip api
const ipweb2 = 'http://changeip.proxylink.net/changeAccountSession?sn=d3c33d5bc0438731e2021f6cf7fe4e1e&account=';  //代理ip 切换ip api
const AK = '206adee0788f6e0e614260592f2cd0a3';    //云机秘钥
const email = '18937153620@163.com';              //云机注册邮箱
const domain = 'https://www.ogcloud.com/api/';         //云机官网

const os = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux'
}[process.platform];

let hostname;

if(os == 'Windows'){
  hostname = process.env.APPIUM_HOST || 'localhost';
}else if (os == 'Linux'){
  hostname = '10.210.210.3';
}

var config = {};

var myLogger = {};

const hash = (data) => {
  // 使用SHA256算法创建哈希对象
  const hash = crypto.createHash('sha256');
  // 更新哈希对象与数据
  hash.update(data);
 
  const signString = hash.digest('hex');

  // 计算 HMAC SHA256 签名  
  const hmac = crypto.createHmac('sha256', AK);  
  hmac.update(signString);  
  // 获取哈希值的十六进制字符串
  const signature = hmac.digest('hex');

  return signature;
};

//切换代理IP
function changeIp(){
  const options = {
    url: ipweb+config.userName,
    headers: {
      'Token': token
    },
    method: 'GET' // 或者使用其他HTTP方法，比如'GET', 'PUT', 'DELETE'
  };
  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      if (error) {
        myLogger.logger.error({'tip':'切换代理IP出错','error':error});
        resolve(0);
        return;
      }
      myLogger.logger.info({'tip':'切换代理IP成功','data':body});
      resolve(1);
    });
  });
}

function changeIp2(){
  console.log(ipweb2+config.userName+'&session='+config.session)
  const options = {
    url: ipweb2+config.userName+'&session='+config.session,
    method: 'GET' // 或者使用其他HTTP方法，比如'GET', 'PUT', 'DELETE'
  };
  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 0){
        myLogger.logger.info({'tip':'切换代理IP成功','data':body});
        resolve(1);
      }else{
        myLogger.logger.error({'tip':'切换代理IP出错','error':error,'data':body});
        resolve(0);
        return;
      }
     
    });
  });
}

function getHeaders(){
  let date = new Date();
  const year = date.getFullYear(); // 获取当前年份，例如：2021
  let month = date.getMonth() + 1; // 获取当前月份，注意需要加1，例如：9
  month = month < 10 ? '0' + month.toString() : month;
  let day = date.getDate(); // 获取当前日期，例如：22
  day = day < 10 ? '0' + day.toString() : day;
  const headers = {
    'account':email,
    'lang':'CN',
    'x-api-key':AK,
    'x-auth-date':year.toString()+month.toString()+day.toString(),
  };

  const sortedObj = Object.fromEntries(Object.entries(headers).sort());
  let keys = Object.keys(sortedObj);
  let vals = Object.values(sortedObj); 
  let keyStr = keys.join(';').toLowerCase();
  let valStr = vals.join(',');
  let signature = hash(keyStr+valStr);
  headers.signature = signature;
  headers['Content-Type'] = 'application/json';

  return headers;
}
//重启
function actionPhone(){
  const headers = getHeaders();
  const data = {
    "action": "reboot",
    "device_ids": [
      config.device_id
    ],
    "availability_zone": config.availability_zone
  };

  const options = {
    url: domain+'apiv1/cloudphone/actionPhone',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'重启云机成功','body':body});
        resolve(1);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'重启云机出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'重启云机出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//获取机型列表
function resourceList(){
  const headers = getHeaders();
  const data = {
    "resource_type":'brand',
    "availability_zone":config.availability_zone
  };

  const options = {
    url: domain+'apiv1/cloudphone/phoneResourceList',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info(body);
        let phoneList = bodyObj.data;
        resolve(phoneList);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'获取机型列表出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'获取机型列表出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//切换设备型号
function changeModel(brand,model,simInfo='美国'){

  const headers = getHeaders();
  const data = {
    "action": "change_model",
    "device_id": config.device_id,
    "brand": brand,
    "model": model,
    "sim_info": simInfo,
    "availability_zone": config.availability_zone
  };

  const options = {
    url: domain+'apiv1/cloudphone/deviceBrand',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'重置机型成功','brand':brand,'model':model,'body':body});
        resolve(1);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'重置机型出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'重置机型出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//打开root
function openRoot(){
  const headers = getHeaders();
  const data = {
    "action": "root",
    "device_ids": [
      config.device_id
    ],
    "enable": "1",
    "availability_zone": config.availability_zone
  };

  const options = {
    url: domain+'apiv1/cloudphone/actionPhone',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'打开root成功','body':body});
        resolve(1);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'打开root出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'打开root出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}
//添加代理
function addProxy(){
  const headers = getHeaders();
  const data = {
    "action": "add",
    "availability_zone": config.availability_zone,
    "mode": "socks5",
    "outbound_ip": "1.2.3.5", //随便填
    "server_ip": config.proxyUrl,
    "server_port": config.proxyPort,
    "username": config.userName,
    "password": config.password,
  };

  const options = {
    url: domain+'apiv1/cloudphone/actionProxy',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'添加proxy列表成功','body':body});
        resolve(1);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'添加proxy列表出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'添加proxy列表出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//获取代理列表
function proxyList(){
  const headers = getHeaders();
  const data = {
    "action": "list",
    "availability_zone": config.availability_zone
  };

  const options = {
    url: domain+'apiv1/cloudphone/actionProxy',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'获取proxy列表成功','body':body});
        resolve(body);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'获取proxy列表出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'获取proxy列表出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//绑定代理
function proxyBind(title){
  const headers = getHeaders();
  const data = {
    "action": "bind",
    "availability_zone": config.availability_zone,
    "title": title,
    "device_id": config.device_id
  }

  const options = {
    url: domain+'apiv1/cloudphone/actionProxy',
    headers: headers,
    method: 'POST',
    body:JSON.stringify(data)
  };

  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      let bodyObj = JSON.parse(body);
      if(bodyObj.code == 200){
        myLogger.logger.info({'tip':'绑定proxy列表成功','body':body});
        resolve(1);
        return;
      }else if (error) {
        myLogger.logger.error({'tip':'绑定proxy列表出错','error':error});
        resolve(0);
        return;
      } else {
        myLogger.logger.error({'tip':'绑定proxy列表出错','body':body});
        resolve(0);
        return;
      }
    });
  });
}

//停止 raw 
function stopRaw (){
  return new Promise((resolve,reject) => {
    // 执行 pm2 stop raw 命令
		let {code,stdout,stderr} = shell.exec('pm2 stop raw');
    myLogger.logger.info('pm2 stop raw Exit code:', code);
		myLogger.logger.info('pm2 stop raw Program output:\n', stdout);
		myLogger.logger.info('pm2 stop raw Program stderr:\n', stderr);
    resolve(1);
  })
}

//启用 raw 
function startRaw (){
  return new Promise((resolve,reject) => {
    // 执行 pm2 restart raw 命令
		let {code,stdout,stderr} = shell.exec('pm2 restart raw');
    myLogger.logger.info('pm2 restart raw Exit code:', code);
		myLogger.logger.info('pm2 restart raw Program output:\n', stdout);
		myLogger.logger.info('pm2 restart raw Program stderr:\n', stderr);
    resolve(1);
  })
}

//检测adb链接状态
function adbStatus(){
  return new Promise((resolve,reject) => {
    // 执行 pm2 restart raw 命令
		let {code,stdout,stderr} = shell.exec('adb devices');
    if(stdout.indexOf(config.deviceName + '  device') == -1){
      myLogger.logger.info('pm2 restart raw Exit code:', code);
		  myLogger.logger.info('pm2 restart raw Program output:\n', stdout);
		  myLogger.logger.info('pm2 restart raw Program stderr:\n', stderr);
      resolve(0);
    }else{
      resolve(1);
    }
  })
}

function wait(milliSeconds) {
  var startTime = new Date().getTime();
  while (new Date().getTime() < startTime + milliSeconds);
}

function redisAdd() {
  return new Promise((resolve, reject) => {
      redis.get(config.project+'ErrorNum').then(function(result){
          result = Number(result);
          if(result <= 0){
            result = 0;
          }
          result++;
          redis.set(config.project+'ErrorNum',result);
          if(result > config.allowError){
              (async () => {
                  await actionPhone(); //重启云机
                  wait(120000);
                  await stopRaw();
                  wait(5000);
                  await startRaw();
                  wait(30000);
                  redis.set(config.project+'ErrorNum',0);
                  resolve(1);
              })(); 
          }else{
              resolve(1);
          }
      });
  });
}

function init(_config) {
  config = _config;
  //创建日志
  myLogger.logger = new logger(config.project,'script');
}

module.exports = {
    logger:myLogger,
    hostname:hostname,
    actionPhone:actionPhone,
    changeIp:changeIp,
    changeIp2:changeIp2,
    resourceList:resourceList,
    changeModel:changeModel,
    openRoot:openRoot,
    proxyList:proxyList,
    proxyBind:proxyBind,
    addProxy:addProxy,
    redisAdd:redisAdd,
    adbStatus:adbStatus,
    init:init
}