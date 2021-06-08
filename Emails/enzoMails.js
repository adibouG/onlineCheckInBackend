require('dotenv').config();
const fs = require('fs')
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

const mailFormat =  (  type , message,  mail  , token , user  ) => {

    let TITLE = '';
    let MESSAGE = '';
    let FILE = '';
    let ATTACHMENTS = null;

    if (type === 'qrCode') {

        TITLE = 'Email confirmation with QR-code for online pre-check-in' ;
        MESSAGE = message ;


        return ({
            //"attachments" : [ATTACHMENTS] ,
            "body": {
                "html": `${MESSAGE}` ,
            },
            "from": "no-reply@enzosystems.com",
            "messageId": `${token}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['adrien@enzosystems.com']
        }) 
     }   

    else if (type === 'startCheckIn' ) {
        TITLE = 'Email invitation for online pre-check-in' ;
        MESSAGE = message ;
        try{
            let content = fs.readFileSync('./Views/base64image.txt') ;//  (err, content) => {
            console.log(content.toString())
            ATTACHMENTS = [{"content" : `${content.toString()}`, "name": "image_attached.jpg"}] ;
        }catch (err)  {
            console.log(err) ;
            ATTACHMENTS = '' ;
        }
        finally{
            return ({
                "attachments" : ATTACHMENTS ,
                "body": {
                    "html": `${MESSAGE}` ,
                },
                "from": "no-reply@enzosystems.com",
                "messageId": `${token}`,
                "subject": `${TITLE}`,
                "to": [mail],
                "cc": ['adrien@enzosystems.com']
            })
        }
    }  
}


function sendEmailRequest( type ,  message , email , token , user = null ) {   
  
   
   let mail = mailFormat( type , message,  email , token , user)

   console.log(mail) ;
   console.log('**********************');
     return axios({ url : EMAIL_SERVICE_URL , method : 'POST' , data : mail })
       .then(res => {  console.log(res) ;} ) 
       .catch(res => {  console.log(res) ;
            throw res                
    } ) 
  }



module.exports = {
    
    MAILTYPES,
    sendEmailRequest
}