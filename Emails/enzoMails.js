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
    
    const ATTACHMENTS = attach ? [{"content" : `${attach.toString()}`, "name": "image_attached.jpg"}] : null ;
    if (type === MAILTYPES.QR) {
        TITLE = TITLES.QR;
        MESSAGE = message ; 
    } else if (type === MAILTYPES.START ) {
        TITLE = TITLES.START;
        MESSAGE = message;
    }
    return ATTACHMENTS ? 
        ({
            "attachments": ATTACHMENTS  ,
            "body": {"html": `${MESSAGE}`},
            "from": "no-reply@enzosystems.com",
            "messageId": `${messageId}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['adrien@enzosystems.com']
        }) :
        ({
            "body": {"html": `${MESSAGE}`},
            "from": "no-reply@enzosystems.com",
            "messageId": `${messageId}`,
            "subject": `${TITLE}`,
            "to": [mail],
            "cc": ['adrien@enzosystems.com']
        }); 
    
}

const sendEmailRequest = async (type, message, email, messageId, attach = null) => {  
    let reservationId;
    try{ 
        console.log('*** sendEmailRequest : .... ****' ) ;
        winstonLogger.info(`Try sending email type ${type} to ${email} for reservationId ${reservationId} with messageId ${messageId}`);
        reservationId = messageId.length && messageId.includes('#') ? messageId.split('#')[1] : null ;
        let formattedMail = mailFormat(type, message, email, messageId, attach);
        let result = await axios({ url: EMAIL_SERVICE_URL, method: 'POST', data: formattedMail });
        console.log('ok ', result.data) ;
        winstonLogger.info(`Email type ${type} was sent to ${email} for reservationId ${reservationId} with messageId ${messageId}`);
        return result;
    } catch (err) {  
        console.log('ko ', err) ;
        winstonLogger.error(`Email type ${type} was NOT sent to ${email} for reservationId ${reservationId} with messageId ${messageId}`);
        winstonLogger.error(`Email Error `, err);
        throw err;
    } 
}

module.exports = {
    MAILTYPES,
    sendEmailRequest
}