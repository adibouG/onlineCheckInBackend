require('dotenv').config();
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

const TITLES = {
    QR : 'Email confirmation with QR-code for online pre-check-in' ,
    START : 'Email invitation for online pre-check-in' ,
};
const mailFormat = (type, message, mail, messageId, attach = null) => {
    let TITLE = '';
    let MESSAGE = '';
    let FILE = '';
    console.log(attach.toString())
    let ATTACHMENTS = attach ? [{"content" : `${attach.toString()}`, "name": "image_attached.jpg"}] : '';
    if (type === MAILTYPES.QR) {
        TITLE = TITLES.QR;
        MESSAGE = message ;
        return {
            "attachments": ATTACHMENTS ,
            "body": {"html": `${MESSAGE}`},
            "from": "no-reply@enzosystems.com",
            "messageId": `${messageId}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['ad.gonzalezoliva@gmail.com']
        } ;
    } else if (type === MAILTYPES.START ) {
        TITLE = TITLES.START;
        MESSAGE = message;
        return {
            "attachments": ATTACHMENTS ,
            "body": {"html": `${MESSAGE}`},
            "from": "no-reply@enzosystems.com",
            "messageId": `${messageId}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['ad.gonzalezoliva@gmail.com']
        }
    }  
}

const sendEmailRequest = async (type, message, email, messageId, attach = null) => {  
    let reservationId;
    try{ 
        reservationId = messageId.length && messageId.includes('#') ? messageId.split('#')[1] : null ;
        let formattedMail = mailFormat(type, message, email, messageId, attach);
        let result = await axios({ url: EMAIL_SERVICE_URL, method: 'POST', data: formattedMail });
        console.log('ok ', result) ;
        winstonLogger.info(`Email type ${type} was sent to ${email} for reservationID ${reservationId} with messageID ${messageId}`);
        return result;
    } catch (err) {  
        console.log('ko ', err) ;
        winstonLogger.error(`Email type ${type} was NOT sent to ${email} for reservationID ${reservationId} with messageID ${messageId}`);
        winstonLogger.error(`Email Error `, err);
        throw err;
    } 
}

module.exports = {
    MAILTYPES,
    sendEmailRequest
}