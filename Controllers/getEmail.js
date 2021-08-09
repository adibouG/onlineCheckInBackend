require('dotenv').config();
const Models = require('../Models/index.js');
const CheckInApp = require('../Models/CheckInApp.js');
const { getEmailTracking, getHotelDetails, getReservations, postReservations, resetBookingStatus, getBookingFromEmail } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, makeQrCode, isPreCheckedBooking, setCheckBooking } = require('../Utilities/utilities.js');

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
        const hotelDetails = await getHotelDetails(booking.hotelId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        const emailTrack = await getEmailTracking(booking.hotelId, booking.reservationId, type);
        return await renderAndSendEmail(type, values, emailTrack);
    }catch (err) {
        console.log(err);
        throw err;
    }
}
   
const renderAndSendQrCode = async (req, res, next)  => {
    try{
        const { token, checkin, hotel_id, step } = req.body;
        let booking = checkin;
        if (!booking) throw new Models.NotFound() ;   
        booking =  new CheckInApp.Checkin(booking);
        booking = booking.toEnzoCheckIn();
        if (isPreCheckedBooking(booking)) {
            console.log('routes to reset : RESET RESERVATION');
            await resetBookingStatus(booking.email, booking.reservationId);
        } else {  
            booking = setCheckBooking(booking);
            console.log('routes to makeQrCode')
            await postReservations(booking.hotelId, booking.reservationId, booking);
            await sendEmail(MAILTYPES.QR, booking);
        }
        const url = await makeQrCode(booking);
        return res.status(200).send(url);   
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}
        
     

module.exports = {
    getEmail,
    sendEmail,
    renderAndSendQrCode
}