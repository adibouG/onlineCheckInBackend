
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const {morgan , winstonLogger} = require('../Logger/loggers.js');
const api = require('../Routes/routes.js');

const SETTINGS = require('./settings.json') ;



const {START_CHECK_IN , GET_QRCODE} = SETTINGS.API_ENDPOINT ;
const LINK_URL = process.env.LINK_URL;

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


const appPort =  process.env.APP_PORT ;
const appHost = process.env.APP_HOST ;
const appScheme = process.env.APP_SCHEME ;
const linkUrl = process.env.LINK_URL ;

const link_url = `${appScheme}://${appHost}:${appPort}` ;



app.engine('html', (filePath, options, callback) => { // define a template engine to update the form submit to the correct host 
    fs.readFile(filePath,  (err, content) => {

        if (err) return callback(err)
      // this is a simple template engine
        let minifyText = content.toString().replace(/[\n\r\t]/g,"");
        let uriCompatible = minifyText.replace('%','%25');
        let rendered = uriCompatible
                      .replace('#scheme#', scheme)
                      .replace('#host#', host)
                      .replace('#port#', port)
        return callback(null, rendered)
    })
})
  
app.set('views', './Views') // specify the views directory
app.set('view engine', 'html') // register the template engine
  
   
app.use(express.json()) ;// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
   //app.use(express.static('public')); 
   
app.use(api);

module.exports = app ;