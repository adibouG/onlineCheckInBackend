require('dotenv').config();
const {winstonLogger} = require('./Logger/loggers.js');
const app = require('./app.js') ;

const port =  process.env.PORT || 3003 ;
const host = process.env.HOST || '0.0.0.0' ;
const scheme = process.env.SCHEME || 'http' ;
//catch and log crash/stop
function handle(signal) {
    console.log(`*^!@4 => Received event: ${signal}`)
    winstonLogger.info(`*^!@4!!!!! => Received event: ${signal}`)
}
process.on('SIGHUP', handle);
//start the app server on defined port 
app.listen(port, host, () => {
    console.log('enzo checkin backendAPI is running at %s://%s:%s', scheme, host, port);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
    winstonLogger.info(`+                                                                        +`);
    winstonLogger.info(`+   Enzo checkin backendAPI is running at ${scheme}://${host}:${port}    +`);
    winstonLogger.info(`+                                                                        +`);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
});
