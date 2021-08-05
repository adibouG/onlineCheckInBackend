const app = require('../app.js');
const Models = require('../Models/index.js');
const { MAILTYPES, sendEmailRequest } = require('../Emails/enzoMails.js');
const db = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js');
const { makeEmailValues } = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;

var intervalCheckID;
// get a valid booking, generate token and trigger the 1rst start-pre-checkin email.
const renderAndSendEmail = async (type, values, mailTracking = null)  => {
   // try {
        console.log('renderAndSendEmail start ...' , type);
        let template = type === MAILTYPES.START ? 'startCheckInMail' : 'qrCodeMail';
        let mailTrackingObj = mailTracking || new Models.EmailTracking({ 
            reservationID: values.reservationId, 
            hotelID: values.hotelId, 
            emailType: type 
        });

        return app.render(template, values, async (err, content) => {
            let manager;
            try {
                manager = new db.HotelPmsDB();
                if (err) throw err ;
                if (values.email && values.email.toLowerCase().includes('adrien@enzosystems.com')) {
                    await sendEmailRequest(type, content, values.email, mailTrackingObj.messageID, values.guestName);
                }
                if (mailTracking) await manager.updateEmailTrackingInfo(mailTrackingObj) ;
                else await manager.addEmailTrackingInfo(mailTrackingObj);
            } catch (e) {
                mailTrackingObj.sentDate = null ;
                if (mailTracking) await manager.updateEmailTrackingInfo(mailTrackingObj) ;
                else await manager.addEmailTrackingInfo(mailTrackingObj);
                //start the checksrs
                console.log('renderAndSendEmail error ...', type);
                if (!intervalCheckID) return startCheckMailErrors() ;
                throw e ;
            }
        });
}

const getEmailErrors = async () => {
    console.log('check email error table for emails to resend...')
    try{
        let manager = new db.HotelPmsDB();
        let results = await manager.getEmailError();  
        if (!results.length) return stopCheckMailErrors();
        results.map(async (item) => {
            let emailSentObject = new Models.EmailTracking({ 
                reservationID: item.reservation,
                hotelID: item.hotel, 
                emailType: item.email_type, 
                sentDate: item.email_sent_date,
                sendingDate: item.email_sending_date, 
                messageID: item.message_id,
                attempts: item.attempts 
            }); 
            let result = await helpers.getReservations(emailSentObject.hotelID, emailSentObject.reservationID);
            let hotel = await manager.getHotelDetails(emailSentObject.hotelID);
            let values = await makeEmailValues(emailSentObject.emailType, result[emailSentObject.hotelID].reservations[0] , hotel)
            emailSentObject.attempts = ++emailSentObject.attempts ;
            await renderAndSendEmail(emailSentObject.emailType, values, emailSentObject);          
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}


const startGetMailError = () => setInterval(getEmailErrors, SETTINGS.EMAIL_RETRY_DELAY_MINUTES * 60 * 1000);
    
const startCheckMailErrors = () => {
    intervalCheckID = startGetMailError() ;
    console.log('check email error  Interval ID ', intervalCheckID);
}

const stopCheckMailErrors = () => {
    if (intervalCheckID) clearInterval(intervalCheckID);
    console.log('no error: clear email error Interval ID ', intervalCheckID);
    intervalCheckID = null;
}

module.exports = {
    renderAndSendEmail, 
    getEmailErrors,
    startCheckMailErrors,
    stopCheckMailErrors,
    intervalCheckID
}
