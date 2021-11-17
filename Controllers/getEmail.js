require('dotenv').config();
const jwt = require('jsonwebtoken');
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const { getEmailTracking, getHotelDetails, getReservations } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, makeQrCode, makeUnlimitedToken } = require('../Utilities/utilities.js');

const sendEmail = async (type, booking, hotelId) => {
    try {
        const hotelDetails = await getHotelDetails(hotelId);
        const eh = new Enzo.EnzoHotel({
            hotelId: hotelId,
            name: hotelDetails.hotel_name, 
            email: hotelDetails.hotel_email, 
            phone: hotelDetails.hotel_phone,  
            website: hotelDetails.hotel_email, 
            address: new Enzo.Address({ 
                address1:   hotelDetails.hotel_address, 
                postCode: hotelDetails.hotel_postcode, 
                city: hotelDetails.hotel_city,
                country: hotelDetails.hotel_country,
            }),
            logo: hotelDetails.hotel_logo, 
        });
        const values = await makeEmailValues(type, booking, eh);
        const emailTrack = await getEmailTracking(hotelId, booking.pmsId, type);
        let mailObject = emailTrack.length ? emailTrack[0] : null;
        return await renderAndSendEmail(type, values, mailObject, true);
    }catch (err) {
        console.log(err);
        throw err;
    }
}
const getEmailType = async (req, res, next) => {
    
    const {type, bookingId, hotelId} = req?.query;
    try {
        const hotelDetails = await getHotelDetails(hotelId);
        const booking = await getReservations(hotelId, bookingId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        const emailTrack = await getEmailTracking(hotelId, booking.pmsId, type);
        let mailObject = emailTrack ? emailTrack[0] : null;
        await renderAndSendEmail(type, values, mailObject, true);
        return res.status(200).send(values.token)
    }catch (err) {
        console.log(err);
        return res.status(500).end();
    }
}
//render and send a qrcode email and return a generated qrcode as base64 url encoded string
const renderAndSendQrCode = async (req, res, next)  => {
  
    try{
        const { authorization } = req?.headers ;
       
        const { hotelId } = req?.params;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
        const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
        if (!token) throw new Error('no token') ; 
        const decoded = jwt.decode(token);
        let reservation, roomStay;
        const booking = await getReservations(decoded.hotelId, decoded.bookingId);
        if (!booking) throw new Models.NotFound() ;
        if (booking.length) reservation = new Enzo.EnzoReservation(booking[0]);
        roomStay = reservation.roomStays[0];
       
        if (roomStay) booking =  new Enzo.EnzoRoomStay(roomStay);
        if (!booking) throw new Models.NotFound() ;
        if (!token) throw new Error('no token') ; 
        //TO DO  verification on token  
        let firstName = roomStay.guests.length && roomStay.guests[0].firstName ? roomStays.guests[0].firstName : reservation.booker.firstName;
        let lastName = roomStay.guests.length && roomStay.guests[0].lastName ? roomStays.guests[0].lastName : reservation.booker.lastName;
      
        await sendEmail(MAILTYPES.QR, booking, hotelId);
        const dataUrl = await makeQrCode(hotelId, booking.pmsId, firstName, lastName);
        return res.status(200).send(dataUrl);   
    } catch (e) {
        console.log(e);
        return res.status(500).end();
    }
}
     
const getToken = async (req, res, next) => {
   let {reservationId, hotelId} = req?.query ;
   let booking;
   try {
        if (!reservationId) {
            reservationId ="688fbfc5-1c43-42de-a1cf-f1f2c7a73c6f";
            hotelId = 1;
        } 
        booking = await getReservations(hotelId, reservationId);
        if (!booking) { throw new Models.NotFound() ; }
        const token = makeUnlimitedToken(reservationId, hotelId);
            //reservationId, hotelId, booking[0].roomStays[0].status);
        return res.status(200).send(token);
    }catch (err) {
        console.log(err);
        return res.status(400).end();  
    } 
}
     
const getQrFromToken = async (req, res, next) => {
    try{
        const { authorization } = req?.headers ;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query?.token;
        const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
        if (!token) throw new Error('no token') ; 
        const decoded = jwt.decode(token);
        let reservation, roomStay;
        const booking = await getReservations(decoded.hotelId, decoded.bookingId);
        if (!booking) throw new Models.NotFound() ;
        if (booking.length) reservation = new Enzo.EnzoReservation(booking[0]);
        roomStay = reservation.roomStays[0];
        //TO DO  verification on token  
        let email = roomStay.guests.length  && roomStay.guests[0].email ? roomStay.guests[0].email : reservation.booker.email;
        let firstName = roomStay.guests.length && roomStay.guests[0].firstName ? roomStay.guests[0].firstName : reservation.booker.firstName;
        let lastName = roomStay.guests.length && roomStay.guests[0].lastName ? roomStay.guests[0].lastName : reservation.booker.lastName;
       
        await sendEmail(MAILTYPES.QR, reservation, decoded.hotelId);
        const dataUrl = await makeQrCode(decoded.hotelId, reservation.pmsId, firstName, lastName);
        return res.send(dataUrl);
    }catch (err) {
        console.log(err);
        return res.status(400).end();  
    } 
}

module.exports = {
    sendEmail,
    renderAndSendQrCode,
    getEmailType,
    getToken,
    getQrFromToken
}