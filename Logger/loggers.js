const morgan  = require('morgan');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const SETTINGS = require('../settings.json') ;

const { splat, combine, timestamp, printf } = winston.format;
const logFormat = printf(({ timestamp, level, message }) => (level, `${timestamp}::${level}::${message}`));

const winstonLogger = winston.createLogger({
  level:'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    splat(),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: `CheckInAPI-${process.env.HOST}-%DATE%.log`,
      dirname:  `${process.cwd()}${SETTINGS.LOG_STORAGE.PATH}`,
      level: process.env.LOGGER_LEVEL ? process.env.LOGGER_LEVEL : 'info' ,
      handleExceptions: true,
      colorize: true,
      json: false,
      zippedArchive: true,
      maxFiles: '100d'
    })
  ]
});

module.exports = {
    morgan,
    winstonLogger
 }