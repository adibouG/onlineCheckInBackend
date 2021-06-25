require('dotenv').config();

const fs = require('fs');
const express = require('express');
const cors = require('cors');

const {morgan , winstonLogger} = require('./Logger/loggers.js');
const api = require('./Routes/routes.js');

const app = express();

console.log(process.env.NODE_ENV)

app.use(morgan(process.env.NODE_ENV)) ;
 
const myStream = {
  write: (text) => {
    winstonLogger.info(text)
  }
}

app.use(morgan('combined', { stream: myStream }));


app.use(cors()) ;

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET , DELETE , OPTIONS"); 
    res.header("Access-Control-Allow-Headers", "Origin , X-Requested-With, Content , Content-Type, Accept, Authorization"); 
    req.setTimeout(0); 
    next();
});

   
app.use(express.json()) ;// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); 
   
app.use(api);

const port =  process.env.PORT ;
const host = process.env.HOST ;
const scheme = process.env.SCHEME ;

const appPort =  process.env.APP_PORT ;
const appHost = process.env.APP_HOST ;
const appScheme = process.env.APP_SCHEME ;
const linkUrl = process.env.LINK_URL ;


const app_link_baseUrl = `${appScheme}://${appHost}:${appPort}` ;

app.engine('htm', (filePath, options, callback) => { // define a template engine to update the form submit to the correct host 
    fs.readFile(filePath,  (err, content) => {

        if (err) return callback(err)
      // this is a simple template engine
        let minifyText = content.toString().replace(/[\n\r\t]/g,"");
        let uriCompatible = minifyText.replaceAll('%','%25');
        let rendered = uriCompatible
                      .replaceAll('#app_url#', app_link_baseUrl)

                      .replaceAll('#checkDates#', options.checkDates)
                      .replaceAll('#checkInDate#', options.checkInDate)
                      .replaceAll('#checkInTime#', options.checkInTime)
                      .replaceAll('#token#', options.token)
                      .replaceAll('#base64qrCode#', options.base64qrCode)
                      .replaceAll('#guestFullName#', options.guestFullName)
                      .replaceAll('#guestLinkName#', options.guestLinkName)
                      .replaceAll('#booking#', options.booking)
                      .replaceAll('#roomType#', options.roomType)
                      .replaceAll('#numNights#', options.numNights)
                      .replaceAll('#numGuests#', options.numGuests)
                      .replaceAll('#booking#', options.booking)
                      .replaceAll('#booking#', options.booking)
                      .replaceAll('#hotelName#', options.hotelName)
                      .replaceAll('#hotelAddress#', options.hotelAddress)
                      .replaceAll('#hotelPostcode#', options.hotelPostcode)
                      .replaceAll('#hotelCity#', options.hotelCity)
                      .replaceAll('#hotelCountry#', options.hotelCountry)
                      .replaceAll('#hotelPhone#', options.hotelPhone)
                      .replaceAll('#hotelEmail#', options.hotelEmail)

        return callback(null, rendered)
    })
})
  
app.set('views', './Views') // specify the views directory
app.set('view engine', 'htm') // register the template engine
  


//start the app server on defined port 
app.listen(port , () => {

    console.log('enzo checkin backendAPI is running at %s://%s:%s' , scheme, host , port);

});
