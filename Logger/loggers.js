
const morgan  = require('morgan');
const winston = require('winston');

const winstonLogger =  winston.createLogger();

morgan(process.env.NODE_ENV) ;
 
const myStream = {
  write: (text) => {
    winstonLogger.info(text)
  }
}

morgan('combined', { stream: myStream });

module.exports = {
    morgan,
    winstonLogger
 }