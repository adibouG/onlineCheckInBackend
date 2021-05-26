require('dotenv').config();

const { randomUUID } = require('crypto');

const express = require('express');

const app = express();

const cors = require('cors');

const {morgan , winstonLogger} = require('./Logger/loggers.js');

const api = require('./Routes/routes.js');



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

//start the app server on defined port 
app.listen(port , () => {

    console.log(randomUUID());
    
    console.log('enzo checkin backendAPI is running at %s://%s:%s' , scheme, host , port);

});
