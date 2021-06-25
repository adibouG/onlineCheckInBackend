require('dotenv').config();
const fs = require('fs')
const SETTINGS = require('../settings.json') ;

const axios = require('axios');
const {generateUUID} = require('../Utilities/utilities.js');
const {winstonLogger} = require('../Logger/loggers.js');



const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE;

const attachmentFormat = {
                        
    "content":  "" ,
    "name": ""

};

const MAILTYPES = {

    QR : 'qrCode' ,
    START : 'startCheckIn' ,

 } ;

const mailFormat =  (  type , message,  mail  , messID , user  ) => {

    let TITLE = '';
    let MESSAGE = '';
    let FILE = '';
    let ATTACHMENTS = null;

    if (type === 'qrCode') {

        TITLE = 'Email confirmation with QR-code for online pre-check-in' ;
        MESSAGE = message ;
        messID = messID || generateUUID() ;
        
        return ({
            //"attachments" : [ATTACHMENTS] ,
            "body": {
                "html": `${MESSAGE}` ,
            },
            "from": "no-reply@enzosystems.com",
            "messageId": `${messID}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['adrien@enzosystems.com']
        }) 
     }   

    else if (type === 'startCheckIn' ) {
        TITLE = 'Email invitation for online pre-check-in' ;
        MESSAGE = message ;
        
        try{
            let content = fs.readFileSync('./Views/base64image.txt') ; // TODO replace with setting file path
           
            ATTACHMENTS = [{"content" : `${content.toString()}`, "name": "image_attached.jpg"}] ;
        }
        
        catch (err)  {
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
                "messageId": `${messID}`,
                "subject": `${TITLE}`,
                "to": [mail],
                "cc": ['adrien@enzosystems.com']
            })
        }
    }  
}


function sendEmailRequest( type ,  message , email , messID = null , user = null ) {   
  
   
   let mail = mailFormat( type , message, email  , messID , user)

   return axios({ url : EMAIL_SERVICE_URL , method : 'POST' , data : mail })
       .then( res => {  
                console.log('ok') ;
                winstonLogger.info(  `Email type ${type} was sent to ${email} for reservationID ${messID} with messageID ${messID}`)
                return res ;
            }
        ) 
       .catch( err => {  
                console.log('ko') ;
                winstonLogger.error(  `Email type ${type} was NOT sent to ${email} for reservationID ${messID} with messageID ${messID}`)
                throw err                
            } 
        ) 
  }



module.exports = {
    
    MAILTYPES,
    sendEmailRequest
}