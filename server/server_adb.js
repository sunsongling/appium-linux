const shell = require('shelljs');
const fs = require('fs');
//链接 adb
function connectAdb(){
    fs.readFile('./config.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        try {
          // 将文件内容解析为 JSON 对象 conn_map
          const jsonData = JSON.parse(data);
          for(let k in jsonData.conn_map){
            shell.exec('adb connect '+k);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
    });
}

module.exports = {
    connectAdb:connectAdb
}