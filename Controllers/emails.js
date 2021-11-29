const app = require('../app.js');
const Models = require('../Models/index.js');
const { MAILTYPES, sendEmailRequest } = require('../Emails/enzoMails.js');
const { Database } = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js');
const { makeEmailValues } = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;
const { START_PRECHECK_INVITE, QRCODE_PRECHECK_COMPLETED } = SETTINGS.EMAIL_TEMPLATE_FILE;

//store the intervalID generated by the emailResend process 
//triggered by the sendEmailRequest() function error catch block 
//if set, the lookup to resend emails is triggered at a specified interval 
//until there is no more email sending error 
var intervalCheckId = null; 

//Render and send the email from templates regarding the email type requested and using the values object to fill the placeholders
//in the email error context, a mailtracking object can be provided with the previous email values that weren't sent due to errors  
const renderAndSendEmail = async (type, hotelId, stayData, hotels, mailTracking = null, valueReady = false) => {
    //get the template file name 
    let template = type === MAILTYPES.START ? START_PRECHECK_INVITE : QRCODE_PRECHECK_COMPLETED; 
    let values ;
    try {
        if (!valueReady) values = await makeEmailValues(type, hotelId, stayData, hotels);
        //set the mailTracking object from the passed argument or create a new one for new email
        else values = stayData;
        const mailTrackingObj = mailTracking ? mailTracking : new Models.EmailTracking({ 
            reservationId: values.reservationId, 
            hotelId: values.hotelId, 
            emailType: type
        });
        //call the express rendering engine for htm files define in app.js
        app.render(template, values, async (err, content) => {
            if (err) throw err ;
            let mailTrack,  manager; 
            let noSending = false; 
            try{
                manager = new Database();
                const mailTracking = await manager.getEmailInfo(mailTrackingObj.messageId); 
                //add +1 to sending attempts
                if (mailTracking.length) mailTrack = mailTracking[0];
                else mailTrack = mailTrackingObj;
                if (mailTrack.sentDate) return ; //sent successfully already , maybe another instance
                mailTrack.attempts = mailTrack.attempts + 1;
                //set the email attachment file for the image/qrCode from the base64 string or from the image file
                //TO DO: import the image from the hotel settings 
                const attach = type === MAILTYPES.QR ? [values.base64Logo, values.base64qrCode] : [values.base64Logo, values.base64image] ;
                if (values.email && process.env.NODE_ENV !== 'production' && !values.email.toLowerCase().includes('adrien@enzosystems.com'))  { 
                    noSending = true;
                   return; 
                }
                const result = await sendEmailRequest(type, content, values.email, mailTrackingObj.messageId, attach);
                if (result.status === 200) mailTrack.sentDate = Date.now();
                return mailTrack;
            } catch (e) {
                mailTrack.sentDate = null ;
                console.log('renderAndSendEmail error ...', e);
                //as an error was throw, we start the email errors checks by setting the intervalCheckID variable if it wasn't already
                if (!intervalCheckId) return startCheckMailErrors() ;
                //throw e ; //TODO : Test => not sure we need to re-throw the error as it's handled and the response headers should be already sent 
            } finally {
                //if no db manager anymore, we get a new one. 
                if (noSending) return ;
                if (!manager) manager = new Database(); 
                if (mailTrack.attempts > 1) {
                    console.log('renderAndSendEmail finally ...update emailTrack', mailTrack);
                    await manager.updateEmailTrackingInfo(mailTrack) ;
                } else {
                    console.log('renderAndSendEmail finally ...add emailTrack', mailTrack);
                    await manager.addEmailTrackingInfo(mailTrack);
                }
                return;
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
};

//check email tracking table for error and emails to resend...
const getEmailErrors = async () => {
    console.log('check email error table for emails to resend...');
    try{
        let manager = new Database();
        //get the email errors from the email tracking table
        let results = await manager.getEmailError();  
        //if no result we can unset the intervalID and stop the lookup 
        if (!results.length) return stopCheckMailErrors();
        //otherwise for each email that wasn't sent
        for (let i = 0 ; i < results.length; i++) {
            let emailSentObject = results[i] ;
             //get the reservation  
             const result = await helpers.getReservations(emailSentObject.hotelId, emailSentObject.reservationId);
             //get the hotel details  
             const enzoHotel = await manager.getHotelDetails(emailSentObject.hotelId);
            //render and send the email 
             await renderAndSendEmail(emailSentObject.emailType, emailSentObject.hotelId, result[0], enzoHotel, emailSentObject);
        } 
        return ;
    } catch (e) {
        console.log(e);
        throw e;
    }
};


//set the intervalCheckID variable, to start the email error lookup and resend process
const startCheckMailErrors = () => {
         if (!intervalCheckId) intervalCheckId = setInterval(getEmailErrors, SETTINGS.EMAIL_RETRY_DELAY_MINUTES * 60 * 1000);
        console.log('check email error  Interval Id ', intervalCheckId);
        return;
    };


//unset the intervalCheckId to stop the the email error lookup and resend process
const stopCheckMailErrors = () => {
    if (intervalCheckId) clearInterval(intervalCheckId);
    console.log('no error: clear email error Interval Id ', intervalCheckId);
    intervalCheckId = null;
    return;
};

module.exports = {
    renderAndSendEmail, 
    getEmailErrors,
    startCheckMailErrors,
    stopCheckMailErrors,
    intervalCheckId
};
