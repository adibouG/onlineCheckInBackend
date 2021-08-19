require('dotenv').config();
const Models = require('../Models/index.js');
const CheckInApp = require('../Models/CheckInApp.js');
const EnzoBooking = require('../Models/EnzoBooking.js');
const { getEmailTracking, getHotelDetails } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, makeQrCode } = require('../Utilities/utilities.js');

const sendEmail = async (type, booking) => {
    try {
        const hotelDetails = await getHotelDetails(booking.hotelId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        const emailTrack = await getEmailTracking(booking.hotelId, booking.reservationId, type);
        let mailObject = emailTrack ? emailTrack[0] : null;
        return await renderAndSendEmail(type, values, mailObject);
    }catch (err) {
        console.log(err);
        throw err;
    }
}
   
//render and send a qrcode email and return a generated qrcode as base64 url encoded string
const renderAndSendQrCode = async (req, res, next)  => {
    try{
        let booking;
        const { token, checkin, reservation, hotel_id } = req.body;
        if (checkin) {
            let checkInApp =  new CheckInApp.Checkin(checkin);
            booking = checkInApp.toEnzoCheckIn();
        } else if (reservation){
            booking =  new EnzoBooking.EnzoStay(reservation);
        }
        if (!booking) throw new Models.NotFound() ;
        if (!token) throw new Error('no token') ; 
        //TO DO  verification on token  
        await sendEmail(MAILTYPES.QR, booking);
        const url = await makeQrCode(booking);
        return res.status(200).send(url);   
    } catch (e) {
        console.log(e);
        return res.status(500).end();
    }
}
        
     

module.exports = {
    sendEmail,
    renderAndSendQrCode
}