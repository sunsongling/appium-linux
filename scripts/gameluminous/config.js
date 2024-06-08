module.exports = {
    appiumPort: 4725,
    deviceName:'127.0.0.1:1112',
    appPackage:'com.android.chrome',
    appActivity:'com.google.android.apps.chrome.Main',
    proxyPort:7778,
    //userName : '101282963125-qswgAwCe',                            //代理ip 用户名
    //password : '6cadc2d321f4878d3c35d3edfe1514bf',                 //代理ip 密码
    //proxyUrl : 'gate1.ipweb.cc',                                   //代理ip 服务器地址
    // userName :'plu18156',
    // session :'2q6vkcrvh5us',
    userName:'plu18156',
    session:'h6eqpgmhmjus',
    url      :'https://gameluminous.top' ,                       //跑广告网站地址
    frequency: 10,                                                //点击率
    openChild: 70,                                                  //打开二级页面概率
    device_id: 'VM010010010092',                                   //云机ID
    availability_zone: 5,                                          //云机所在区
    redisKey:'fillNum1',
    phoneList:[
        {
            brand: 'google',
            model: [ 'Pixel 4a', 'pixel3a', 'pixel5', 'Pixel 6' ]
        }
    ]
}