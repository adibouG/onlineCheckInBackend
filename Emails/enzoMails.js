require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { winstonLogger } = require('../Logger/loggers.js');
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE;

const attachmentFormat = {              
    "content":  "" ,
    "name": ""
};

const MAILTYPES = {
    QR : 'qrCode' ,
    START : 'startCheckIn' ,
 } ;
const mailFormat =  (type, message, mail, messID, attach = null) => {
    let TITLE = '';
    let MESSAGE = '';
    let FILE = '';
    let ATTACHMENTS =  attach ? [{"content" : `${attach.toString()}`, "name": "image_attached.jpg"}] : null;
    if (type === MAILTYPES.QR) {
        TITLE = 'Email confirmation with QR-code for online pre-check-in' ;
        MESSAGE = message ;
        messID = messID ;
        return ({
            "attachments" : [ATTACHMENTS] ,
            "body": {
                "html": `${MESSAGE}` ,
            },
            "from": "no-reply@enzosystems.com",
            "messageId": `${messID}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['adrien@enzosystems.com']
        }) ;
    } else if (type === MAILTYPES.START ) {
        TITLE = 'Email invitation for online pre-check-in' ;
        MESSAGE = message ;
        try{
            let content = fs.readFileSync('./Views/base64image.txt') ; // TODO replace with setting file path
            ATTACHMENTS = [{"content" : `${content.toString()}`, "name": "image_attached.jpg"}];
        } catch(err) {
            console.log(err) ;
            ATTACHMENTS = '' ;
        } finally {
            return ({
                "attachments": ATTACHMENTS ,
                "body": {
                    "html": `${MESSAGE}` ,
                },
                "from": "no-reply@enzosystems.com",
                "messageId": `${messID}`,
                "subject": `${TITLE}`,
                "to": [mail],
                "cc": ['adrien@enzosystems.com']
            });
        }
    }  
}

const sendEmailRequest = async (type, message, email, messID = null, attach = null) => {  
    try{ 
        let mail = mailFormat( type , message, email  , messID , attach);
        let result = await axios({ url: EMAIL_SERVICE_URL, method: 'POST', data: mail })
        console.log('ok') ;
        winstonLogger.info(`Email type ${type} was sent to ${email} for reservationID ${messID} with messageID ${messID}`);
        return { data: result.data, messageID: messID };
    } catch (err) {  
        console.log('ko') ;
        winstonLogger.error(`Email type ${type} was NOT sent to ${email} for reservationID ${messID} with messageID ${messID}`);
        throw { error: err, messageID: messID };
    } 
}

module.exports = {
    MAILTYPES,
    sendEmailRequest
}