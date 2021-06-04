require('dotenv').config();

const { randomUUID } = require('crypto');

const SETTINGS = require('./settings.json') ;

const express = require('express');

const app = express();

const cors = require('cors');

const {morgan , winstonLogger} = require('./Logger/loggers.js');

const api = require('./Routes/routes.js');


console.log(process.env.NODE_ENV)
app.use(morgan(process.env.NODE_ENV)) ;
 
const myStream = {
  write: (text) => {
    winstonLogger.info(text)
  }
}

app.use(morgan('combined', { stream: myStream }));


const port =  process.env.PORT ;
const host = process.env.HOST ;
const scheme = process.env.SCHEME ;

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
//app.use(express.static('public')); 

app.use(api);

const {START_CHECK_IN , GET_QRCODE} = SETTINGS.API_ENDPOINT ;
const LINK_URL = process.env.LINK_URL;


app.engine('html', (filePath, options, callback) => { // define a template engine to update the form submit to the correct host 
    fs.readFile(filePath,  (err, content) => {

      if (err) return callback(err)
      // this is an extremely simple template engine
      
        let minify = content.toString().replace(/[\n\r\t]/g,"");
        let uricompatible = minify.replace('%','%25');
        let rendered = uricompatible
                      //.replace('#scheme#', scheme)
                      //.replace('#host#', host)
                      //.replace('#port#', port)
      return callback(null, rendered)
    })
  })
  
  app.set('views', './Views') // specify the views directory
  app.set('view engine', 'html') // register the template engine
  

//start the app server on defined port 
app.listen(port , () => {

    console.log(randomUUID());
    
    console.log('enzo checkin backendAPI is running at %s://%s:%s' , scheme, host , port);

});
