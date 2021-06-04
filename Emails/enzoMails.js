require('dotenv').config();
const SETTINGS = require('../settings.json') ;

const axios = require('axios');
const Logger = require('../Logger/loggers.js');



const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE;

const attachmentFormat = {
                        
    "content":  "" ,
    "name": ""

};

const MAILTYPES = {

    QR : 'qrCode' ,
    START : 'startCheckIn' ,

 } ;

const mailFormat = (  type ,   mail , message , token  ) => {

let TITLE = '';

if (type === 'qrCode') {
    
    TITLE = 'Email confirmation with QR-code for online pre-check-in' ;
    MESSAGE = message ;
  
 }   
 
else if (type === 'startCheckIn' ) {
    TITLE = 'Email invitation for online pre-check-in' ;
    MESSAGE = message ;
  
 }   




return ({
    "attachments": [],
    "body": {
        "html": `{${MESSAGE}}` ,
    },
    "from": "no-reply@enzosystems.com",
    "messageId": `{${token}}`,
    "subject": `{${TITLE}}`,
    "to": [mail],
     "cc": ['adrien@enzosystems.com']
})

}


function sendEmailRequest( type ,   email , token , user = null ) {   
  
  
    let mail = mailFormat( type ,   email , token , user) ;
   
     return axios({ url : EMAIL_SERVICE_URL , method : 'POST' , data : mail })
       .then(res => {  return res ;} ) 
       .catch(res => {  return res ;} ) 
  }



module.exports = {
    
    MAILTYPES,
    sendEmailRequest
}