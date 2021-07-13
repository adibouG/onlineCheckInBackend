
const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const { makeQrCode, dateDiffInDays} = require('../Utilities/utilities.js');
const dynamoDB = require('../AWS/awsDynamoDb.js')
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const app = require('../app.js') ;
const SETTINGS = require('../settings.json') ;
const HOTEL = require('../hotel.settings.json') ;
const { RESERVATION, TOKEN, EMAIL_TRACKING} = SETTINGS.DYNAMODB_TABLE ;
const { MAILTYPES, sendEmailRequest } = require('../Emails/enzoMails.js');
const { ID , NAME , ADDRESS , POSTCODE , CITY , COUNTRY , PHONE ,EMAIL , CHECKINTIME} = HOTEL ;

var intervalCheckID;
var intervalCleanID;

const hotelID = ID ; 
const hotelName = NAME ; 
const hotelAddress = ADDRESS ; 
const hotelPostcode = POSTCODE ;
const hotelCity =  CITY; 
const hotelCountry = COUNTRY; 
const hotelPhone = PHONE ; 
const hotelEmail = EMAIL ; 
const hotelValues = {
    hotelName : hotelName ,
    hotelAddress : hotelAddress ,
    hotelPostcode : hotelPostcode ,
    hotelCity : hotelCity ,
    hotelCountry : hotelCountry , 
    hotelPhone : hotelPhone ,
    hotelEmail : hotelEmail
}
const  getEmailErrors = async () => {
    console.log('check email error table for emails to resend...')
    try{
        let results = await dynamoDB.findDynamoDBItems(EMAIL_TRACKING) ;
        if (!results.Items.length) return stopCheckMailErrors();
        results.Items.forEach((item) => {
            let emailSentObject = unmarshall(item) ;
            console.log(emailSentObject) ;
            if (emailSentObject.sentDate) return ;
            emailSentObject.attempts = ++ emailSentObject.attempts ;
            if (emailSentObject.emailType === MAILTYPES.START)  return resendStartEmail(emailSentObject);
            else if (emailSentObject.emailType === MAILTYPES.QR)  return resendQrEmail(emailSentObject);
        })
    } catch (e) {
       throw e;
    }
}

const cleanEmailErrors = async () => {
    console.log('check email error table for cleaning emails resend successfully...')
    try{
        let results = await dynamoDB.findDynamoDBItems(EMAIL_TRACKING) ;
        if (!results.Items.length) return stopCheckMailErrors();
        results.Items.forEach( async (item) => {
            let emailSentObject = unmarshall(item) ;
            if (emailSentObject.sentDate && emailSentObject.sentDate.length) { 
                let reservationID = emailSentObject.reservationID ;
                await dynamoDB.deleteDynamoDBItem(EMAIL_TRACKING, { reservationID : reservationID });
            }
        });
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const resendStartEmail = async (emailSentObject) => {
    let uuid = emailSentObject.reservationID;
    try{
        let booking = await dynamoDB.getDynamoDBItem(RESERVATION, { reservationID : {S : uuid }});
        let d1 = new Date(booking.reservation.startDate).toLocaleDateString();
        let d2 = new Date(booking.reservation.endDate).toLocaleDateString();
        const checkDates =  d1 + " - " + d2 ;
        const guestLinkName = booking.guest.firstName + "." + booking.guest.lastName ;
        const guestName = guestLinkName.replaceAll(".", " ");
        let sign = { 
            expiresIn : SETTINGS.TOKEN.VALIDITY ,
            issuer : 'ENZOSYSTEMS' ,
            subject : 'check-in' ,
            audience : booking.email  
        };
        let secret = uuid ;
        let payload = {uuid, ID} ; 
        let token = jwt.sign(payload, secret, sign ) ;
        const guestValues = {
            checkDates : checkDates,
            guestLinkName : guestLinkName ,
            guestFullName : guestName ,
            token : token ,
            booking : uuid 
        };
        const values = {...guestValues, ... hotelValues}  ;
        //TODO replace render by one func using `${MAILTYPE}Mail`
        return app.render('startCheckInMail', values, async (err, content) => {
            if (err) { 
                console.log(err);
                return res.status(500).send(err) ;
            }
            let mailTrackingObj = emailSentObject ;
            try{
                await sendEmailRequest(res.locals.mailType, content, res.locals.email, res.locals.bookingUuid, res.locals.guestName);
                mailTrackingObj.sentDate(Date.now());         
                mailTrackingObj.messageID = result.messageID;
                await dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                return res.status(200).send();
            } catch(e) {
                console.log(e);
                mailTrackingObj.sentDate = null ;
                mailTrackingObj.messageID = e.messageID;
                await dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                return res.status(500).send(e);
            }
        })
    } catch(e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

const resendQrEmail = async (emailSentObject) => {
    let uuid = emailSentObject.reservationID;
    try{
        let booking = await dynamoDB.getDynamoDBItem(RESERVATION, { reservationID: { S : uuid }});
        let guestName = booking.guest.firstName + " " + booking.guest.lastName;
        let bookingUuid = uuid ;
        const url = await makeQrCode(booking) ;
        const d1 = booking.reservation.startDate;
        const d2 = booking.reservation.endDate;
        const date1 = new Date(d1) ;
        const date2 = new Date(d2) ;
        const numNights = dateDiffInDays(date1, date2)
        const checkDates =  d1 + " - " + d2 ;
        const roomType =  booking.reservation.roomType ;
        const numGuests = booking.reservation.guestCount ;
        const checkInTime = CHECKINTIME ;
        const guestValues = {
            checkInDate : d1 ,
            checkInTime : checkInTime,
            base64qrCode : url ,
            guestFullName : guestName ,
            booking : bookingUuid ,
            roomType : roomType ,
            numNights : numNights ,
            numGuests : numGuests
        };
        const values = { ...guestValues, ...hotelValues };
        let mailType = MAILTYPES.QR; 
        let email = booking.guest.email ;
        res.render('qrCodeMail' ,values , async (err, content) => {
            if (err) { 
                console.log(err);
                return res.status(500).send(err) ;
            }
            let mailTrackingObj = emailSentObject;
            try{    
                let result = await sendEmailRequest(mailType, content, email);
                mailTrackingObj.sentDate(Date.now());           
                mailTrackingObj.messageID = result.messageID;
                await dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                return res.status(200).send();
            } catch(e){ 
                console.log(e);
                mailTrackingObj.sentDate = null ;
                mailTrackingObj.messageID = e.messageID;
                dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                return res.status(500).send(e); 
            }
        })
    } catch (e){
        console.log(e);
        return res.status(500).send(e); 
    }
}

const startGetMailError = () => setInterval(getEmailErrors, SETTINGS.EMAIL_RETRY_DELAY_MINUTES * 60 * 1000);
    
const startCleanMailError = () =>  setInterval(cleanEmailErrors, SETTINGS.EMAIL_RETRY_DELAY_MINUTES * 60 * 1000);

const startCheckMailErrors = () => {
    intervalCheckID = startGetMailError() ;
    intervalCleanID = startCleanMailError();
}

const stopCheckMailErrors = () => {
    clearInterval(intervalCheckID);
    clearInterval(intervalCleanID);
}

module.exports = {
    getEmailErrors,
    cleanEmailErrors,
    startCheckMailErrors,
    stopCheckMailErrors,
    intervalCheckID,
    intervalCleanID
}



