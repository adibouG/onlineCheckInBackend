require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const { morgan, winstonLogger } = require('./Logger/loggers.js');
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

const appPort =  process.env.APP_PORT ;
const appHost = process.env.APP_HOST ;
const appScheme = process.env.APP_SCHEME ;
const linkUrl = process.env.LINK_URL ;
const app_link_baseUrl = `${appScheme}://${appHost}:${appPort}` ;

// define a template engine for the emails rendering and value customizations 
// this template rendering engine will work with the .htm file extensions 
app.engine('htm', (filePath, options, callback) => { 
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);
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
            .replaceAll('#hotelEmail#', options.hotelEmail);
        return callback(null, rendered);
    });
});

app.set('views', './Views'); // specify the views directory where the htm files are stored 
app.set('view engine', 'htm'); // register the template engine to use  

module.exports = app ;