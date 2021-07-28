require('dotenv').config();
const Models = require('../Models/index.js');
const { HotelPmsDB } = require('../Models/database.js');
const { getReservations, postReservations } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, resetBookingStatus, makeQrCode, isPreCheckedBooking, setCheckBooking, getBookingFromEmail, dateDiffInDays } = require('../Utilities/utilities.js');

// GET /email route controller function, get a valid booking, generate token and trigger the 1rst start-pre-checkin email.
const getEmail = async (req, res, next) => {
//TODO replace the email trigger by the loop search process
    try{
        let { email } = req?.query;
        let booking = await getBookingFromEmail(email) ;
        if (!booking)  throw new Models.NotFound() ;  
        booking.hotelId = 1 ; //trigger from email means this is the demo app hotel Id e.g. 1
        let checkin = await getReservations(booking.hotelId, booking.reservationId);
        await sendEmail(MAILTYPES.START, checkin);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const sendEmail = async (type, booking) => {

    try {
        const dbManager = new HotelPmsDB();
        const hotelDetails = await dbManager.getHotelDetails(booking.hotelId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        return renderAndSendEmail(type, values);

    }catch (err) {
        console.log(err);
        throw err;
    }
}
   
const renderAndSendQrCode = async (req, res, next)  => {
    let booking = req.body;
    let guestName = booking.guest.firstName + " " + booking.guest.lastName;
    let bookingUuid = booking.uuid;
 
    try{
        if (isPreCheckedBooking(booking)) {
            console.log('routes to reset : RESET RESERVATION');
            await resetBookingStatus(booking.guest.email, bookingUuid);

        } else {  
        
            const dbManager = new HotelPmsDB(booking.hotelId);
            const hotelDetails = await dbManager.getHotelDetails(booking.hotelId);
            if (!booking)  throw new Models.NotFound() ;   
            console.log('routes to makeQrCode')
            booking = setCheckBooking(booking);
            //TO DO : convert to enzo stay first
            await postReservations(booking.hotelId, booking.reservationID, booking);
            await sendEmail(MAILTYPES.START, checkin);
            const url = await makeQrCode(booking);
            return res.status(200).send(url);
        } 
    } catch (e) {
        console.log(e);
        return res.status(500).end();
    }
}
        
        /*const url = await makeQrCode(booking);
            const d1 = booking.reservation.startDate;
            const d2 = booking.reservation.endDate;
            const date1 = new Date(d1);
            const date2 = new Date(d2);
            const numNights = dateDiffInDays(date1, date2)
            const checkDates =  d1 + " - " + d2 ;
            const roomType =  booking.reservation.roomType;
            const numGuests = booking.reservation.guestCount;
            const checkInTime = hotelDetails.hotel_checkin_time;
           
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
        const values = { ...guestValues, ...hotelDetails};
        let mailType = MAILTYPES.QR; 
        let email = booking.guest.email;
        res.render('qrCodeMail', values, async (err, content) => {
            if (err) return res.status(500).send(err);
            let mailTrackingObj = Models.EmailTrackingObject(bookingUuid, mailType);
            try{
                await sendEmailRequest(mailType, content, email);
                dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                return res.status(200).send();
            } catch(e) {
                console.log(e);
                mailTrackingObj.sentDate = null ;
                dynamoDB.putDynamoDBItem(EMAIL_TRACKING, mailTrackingObj);
                //start the checks
                if (!intervalCheckID) startCheckMailErrors() ;
                return res.status(500).send(e) ;
            }
        })
    }
}
*/


/*
const cleanEmailErrors = async () => {
    console.log('check email error table for cleaning emails resend successfully...')
    try{
        let manager = new db.HotelPmsDB();
        let results = await manager.getEmailTrackingInfo();  //.findDynamoDBItems(EMAIL_TRACKING) ;
        if (!results.length) return stopCheckMailErrors();
        results.forEach( async (item) => {
            let emailSentObject = new Models.EmailTracking({ reservationID: item.reservation, hotelID: item.hotel, emailType: item.email_type, sentDate: item.email_sent_date, sendingDate: item.email_sending_date, messageID: item.messageID, attempts: item.attempts }); ;
            console.log(emailSentObject) ;
            if (emailSentObject.sentDate) { 
                let reservationID = emailSentObject.reservationID ;
                await dynamoDB.deleteDynamoDBItem(EMAIL_TRACKING, { reservationID : reservationID });
            }
        });
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const makeEmails = (booking, hotelDetails) => {}
const resendStartEmail = async (emailSentObject) => {
    let uuid = emailSentObject.reservationID;
    try{
         const hotelWithPmsAccessList = await db.getHotelPmsInfo(emailSentObject.hotelID); //retrieve all the hotels with their pms inf
        const pmsApi = new PmsModuleApi(emailSentObject.hotelID); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        let hotel = hotelWithPmsAccessList[0];
        const hotelDetails = await dbManager.getHotelDetails(emailSentObject.hotelID);
        let reservationObj = await pmsApi.getReservationData({ reservationId: emailSentObject.reservationID, hotelId: emailSentObject.hotelID, pmsId: hotel.pms, pmsUrl: hotel.url, pmsLogin: hotel.login,  pmsPwd: hotel.pwd });
        let reservation = reservationObj.reservations[0]; 
        reservation.hotelId = hotel.id;
        reservation.pmsId =  hotel.pms;
        let booking = new Enzo.EnzoStay(reservation);
        if (booking.email) makeEmails(booking, hotelDetails);
       
        let d1 = new Date(booking.startDate).toLocaleDateString();
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
}*/


module.exports = {
    getEmail,
    sendEmail,
    renderAndSendQrCode
}