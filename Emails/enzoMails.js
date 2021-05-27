require('dotenv').config();
const SETTINGS = require('../settings.json') ;
const axios = require('axios');
const Logger = require('../Logger/loggers.js');



const {START_CHECK_IN , GET_QRCODE} = SETTINGS.API_ENDPOINT ;
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE;
const LINK_URL = process.env.LINK_URL;

const attachmentFormat = {
                        
    "content":  "" ,
    "name": ""

};

const MAILTYPES = {

    QR : 'qrCode' ,
    START : 'startCheckIn' ,

 } ;

const mailFormat = (  type ,   mail , token , user = null  ) => {

let TITLE = '';
let MESSAGE = '' ;


if (type === 'qrCode' && user ) {
    
    TITLE = 'CheckIn successful : QR code for checkin and key pickup at the kiosk' ;
    MESSAGE = `<p>QRCODE</p>` ;
  
 }   
 
else if (type === 'startCheckIn' ) {
    TITLE = 'Your can start checkin' ;
    MESSAGE = `<p>Click the link below to  start checkin</p> <p><a href="${LINK_URL}${START_CHECK_IN}?token=${token}">Start my check-in</a></p>` ;
  
 }   




return ({
    "attachments": [],
    "body": {
        "html":`<h2>${TITLE}</h2> ${MESSAGE}` ,
    },
    "from": "no-reply@enzosystems.com",
    "messageId": `{${token}}`,
    "subject": `Check IN`,
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