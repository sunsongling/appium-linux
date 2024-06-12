module.exports = {
    appiumPort: 4725,                                               //appium 端口
    deviceName:'127.0.0.1:1112',                                    //adb映射地址
    appPackage:'com.android.chrome',                                
    appActivity:'com.google.android.apps.chrome.Main',
    proxyPort:7778,                                                  //代理IP端口
    userName : '101143916431-kaHpxyQP',                            //代理ip 用户名
    password : 'bceb0509e211eefb88c9c74381ace971',                 //代理ip 密码
    proxyUrl : 'gate1.ipweb.cc',                                   //代理ip 服务器地址
    // userName :'plu18156',
    // session :'2q6vkcrvh5us',
    //userName:'plu18156',                                          
    //session:'h6eqpgmhmjus',
    url      :'https://gameluminous.top' ,                       //跑广告网站地址
    frequency: 5,                                                //点击率
    openChild: 70,                                                  //打开二级页面概率
    device_id: 'VM010010010092',                                   //云机ID
    availability_zone: 5,                                          //云机所在区
    phoneList:[
        {
            brand: 'google',
            model: [ 'Pixel 4a', 'pixel3a', 'pixel5', 'Pixel 6' ]
        }
    ],
    project:'gameluminous'
}