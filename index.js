require('dotenv').config();
const { winstonLogger } = require('./Logger/loggers.js');
const app = require('./app.js') ;
const { newReservationFinder } = require('./Controllers/findNewBooking.js');
const { RESERVATION_LOOKUP_INTERVAL_MINUTES } = require('./settings.json');
const port =  process.env.PORT || 3003 ;
const host = process.env.HOST || '0.0.0.0' ;
const scheme = process.env.SCHEME || 'http' ;
//catch and log crash/stop
function handle(signal) {
    console.log(`*^!@4 => Received event: ${signal}`)
    winstonLogger.info(`*^!@4!!!!! => Received event: ${signal}`)
}
process.on('exit', handle) ;
process.on('beforeExit', handle);
process.on('uncaughtException', handle);
process.on('SIGTERM', handle);
process.on('SIGINT', handle);
process.on('SIGPIPE', handle);
process.on('SIGHUP', handle);
process.on('SIGTERM', handle);
process.on('SIGBREAK', handle);
process.on('SIGWINCH', handle);
process.on('SIGKILL', handle);
process.on('SIGSTOP', handle);
//start the reservation lookup interval
console.log('start setInterval :' + RESERVATION_LOOKUP_INTERVAL_MINUTES * 2 * 1000);
setInterval(newReservationFinder, RESERVATION_LOOKUP_INTERVAL_MINUTES * 2 * 1000)
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
