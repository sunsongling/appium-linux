const {remote} = require('webdriverio');
const request  = require('request');
const winston = require('winston');
const XLSX = require('xlsx');
//const url = 'https://supernewgame.com/';
const url = 'https://m.baidu.com/';
const token = 'ASRN570R0UMNE5ZJUZ2696X2E39GI86K';
const ipweb = 'http://api.ipweb.cc:8004/api/agent/account2';
const StateCitys = []; //城市表
const frequency = 4;   //点击率
const headers = {
  'Token': token
};
const now = new Date();
const date = now.toLocaleString().split(" ")[0];  // 获取日期部分

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.android.browser',
  'appium:appActivity': 'com.android.browser.BrowserActivity',
  //'browserName':'electron',
  // 'wdio:chromedriverOptions':{
  //   binary:'D:/sdk/tools/chromedrivers/91.0.4472' 
  // }
  proxy:{
    proxyType: "manual",
    httpProxy: "192.168.7.31:8888",
    socksProxy:'192.168.7.31:8888',
    socksUsername: "",
    socksPassword: "",
    noProxy: "127.0.0.1,localhost"
  }
};

//const chromedriver_path = 'D:/sdk/tools/chromedrivers/chromedriver.91.0.4472.exe';
//capabilities.chromedriverExecutable = chromedriver_path;

// 读取城市表数据
const workbook = XLSX.readFile('./StateCity.xlsx');
const sheetNames = workbook.SheetNames;
for(let name of sheetNames){
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet);
  for(let row of data){
    StateCitys.push(row);
  }
}

//创建日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename:date+'.log' })
  ]
});
logger.info('开始：'+now.toLocaleString());

const options = {
  url: ipweb,
  headers: headers,
  method: 'GET' // 或者使用其他HTTP方法，比如'GET', 'PUT', 'DELETE'
};

//新建代理IP
function createIp(){
  //随机生成城市配置
  let StateCity = StateCitys[Math.floor(Math.random()*StateCitys.length)];
  let country = StateCity.countryCode;
  let times = 5;
  let limit = 1;
  logger.info({'tip':'新建代理IP参数','data':{country:country,times:times,limit:limit}});
  options.url = ipweb+`?&country=${country}&times=${times}&limit=${limit}`;
  return new Promise((resolve, reject) => {
    return request(options, function(error, response, body) {
      if (error) {
        logger.error({'tip':'新建代理IP出错','error':error});
        resolve(error);
        return;
      }
      logger.info({'tip':'新建代理IP成功','data':body});
      resolve(body);
    });
  });
}

//webdriver 链接配置
const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  //path:'/wd/hub',
  logLevel: 'info',
  capabilities,
};

async function runTest() {
  //const ipData = await createIp();
  const browser = await remote(wdOpts);
  try {
    //获取当前上下文
    const contexts = await browser.getContexts();
    console.log('contexts',contexts);

    //切换上下文到webview
    await browser.switchContext('WEBVIEW_com.android.browser');
    await browser.url(url);

    await browser.waitUntil(async function () {
      return (await browser.$('html body'));
    },{timeout:10000,timeoutMsg:'网站打开超时'});

    const body = await browser.$('html body');

    /*
    await body.waitUntil(async function () {
      return (await body.$('#seattle-ad-10001'));
    },{timeout:10000,timeoutMsg:'广告加载超时'});

    const seattle = await body.$('#seattle-ad-10001');
    seattle.scrollIntoView();
    const iframe = await seattle.$$('iframe')[0];

    // 获取当前窗口句柄
    const currentWindowHandle = await browser.getWindowHandle();
    console.log('currentWindowHandle',currentWindowHandle);

    //滚动到可视区域
    await iframe.scrollIntoView();

    //切换到 iframe
    await browser.switchToFrame(iframe);

    await browser.waitUntil(async function () {
      return (await browser.$('html body'));
    },{timeout:20000,timeoutMsg:'广告iframe加载超时'});

    const iframeBody = await browser.$('html body');
    
    await browser.waitUntil(async function () {
      return (await iframeBody.$$('a')[0]);
    },{timeout:20000,timeoutMsg:'获取a 标签超时'});

    const a = await iframeBody.$$('a')[0];
    await a.waitForStable({ timeout: 10000 }); //等待稳定
    */
   
    if(Math.floor(Math.random()*100) < 0){
      //返回父级
      await browser.switchToParentFrame();

      //切换上下文到浏览器app
      await browser.switchContext('NATIVE_APP');

      const seattleAd = await browser.$('//android.view.View[@resource-id="seattle-ad-10001"]');
      seattleAd.click();

      //切换上下文到webview
      await browser.switchContext('WEBVIEW_com.android.browser');

      //等待一段时间确保新窗口已打开
      await browser.pause(2000);

      // 获取所有窗口句柄
      const windowHandles = await browser.getWindowHandles();
    
      //在所有窗口句柄中查找新窗口句柄
      const newWindowHandle = windowHandles.find(handle =>handle !== currentWindowHandle);

      //切换到新窗口
      await browser.switchToWindow(newWindowHandle);

      //等待网页加载完成
      await browser.waitUntil(async function () {
        return (await browser.$('html body'));
      },{timeout:20000,timeoutMsg:'广告网站加载超时'});

      let wait = Math.floor(Math.random()*6) + 10; //10-15s 
      await browser.pause(wait);

      await browser.deleteAllCookies();
      //关闭当前窗口
      await browser.closeWindow()

      //切换回原来的窗口
      await browser.switchToWindow(currentWindowHandle);
    }

    await browser.pause(1000);
    await browser.deleteAllCookies();
    //await browser.forward(); //下一页面
    await browser.back(); //返回
    await browser.pause(1000);
    //await browser.refresh(); //刷新页面
  } finally {
    await browser.pause(1000);
    await browser.deleteSession();
  }
}

runTest().catch(console.error);