const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

function createLogger(project,fileName) {
  // 创建一个DailyRotateFile的transport
  const transport = new winston.transports.DailyRotateFile({
    filename: path.join('logs', project ,'%DATE%', fileName+'.log'),  // 日志文件的路径和命名格式
    datePattern: 'YYYY-MM-DD',  // 日志文件的日期模式
    zippedArchive: true,  // 是否压缩日志
    maxSize: '500m',  // 日志文件的最大尺寸
    maxFiles: '15d',  // 日志文件的最大保留时间
  });

  // 创建一个winston的logger
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        if(typeof message == 'object'){
          let messageStr = JSON.stringify(message);
          return `${timestamp} ${level}: ${messageStr}`;
        }else{
          return `${timestamp} ${level}: ${message}`;
        }
      })
    ),
    transports: [
      transport,
    ],
  });

  return logger;
}

module.exports = createLogger;
