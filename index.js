require('dotenv').config();
const { winstonLogger } = require('./Logger/loggers.js');
const app = require('./app.js') ;
const { newReservationFinder } = require('./Controllers/findNewBooking.js');
const { getEmailErrors } = require('./Controllers/emails.js');
const SETTINGS = require('./settings.json');
const { RESERVATION_LOOKUP_INTERVAL_MINUTES , API_BASE_URL} = SETTINGS;
const api = require('./Routes/routes.js');
//use the checkin API
app.use(API_BASE_URL, api);

const port =  process.env.PORT || 3003 ;
const host = process.env.HOST || '0.0.0.0' ;
const scheme = process.env.SCHEME || 'http' ;
//catch and log crash/stop
function handle(signal) {
    console.log(`*^!@4 => Received event: ${signal}`)
    winstonLogger.info(`*^!@4!!!!! => Received event: ${signal}`)
    process.exit();
}


//check at start if the tracking contains error from previous runtime that might have crashed unexpectedly
(async () => await getEmailErrors())();
//start the reservation lookup interval
//set the lookup process interval no need to save it as this is the app purpose to run it
console.log('start setInterval :' + ((RESERVATION_LOOKUP_INTERVAL_MINUTES * 60 * 1000)));
setInterval(newReservationFinder, RESERVATION_LOOKUP_INTERVAL_MINUTES * 20 * 1000);
//trigger the reservation lookup function at start , 
newReservationFinder();
//start the app server on defined port for the checkin app or other service using this api
app.listen(port, host, () => {
    console.log('enzo checkin backendAPI is running at %s://%s:%s', scheme, host, port);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
    winstonLogger.info(`+                                                                        +`);
    winstonLogger.info(`+   Enzo checkin backendAPI is running at ${scheme}://${host}:${port}    +`);
    winstonLogger.info(`+                                                                        +`);
    winstonLogger.info(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
});
