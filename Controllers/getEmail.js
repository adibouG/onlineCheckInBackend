require('dotenv').config();
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const { getEmailTracking, getHotelDetails, getReservations } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, makeQrCode, makeUnlimitedToken } = require('../Utilities/utilities.js');

const sendEmail = async (type, booking, hotelId) => {
    try {
        const hotelDetails = await getHotelDetails(hotelId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        const emailTrack = await getEmailTracking(hotelId, booking.pmsId, type);
        let mailObject = emailTrack ? emailTrack[0] : null;
        return await renderAndSendEmail(type, values, mailObject);
    }catch (err) {
        console.log(err);
        throw err;
    }
}
const getEmailType = async (req, res, next) => {
    
    const {type, bookingId, hotelId} = req?.query ;
    try {
        const hotelDetails = await getHotelDetails(hotelId);
        const booking = await getReservations(hotelId, bookingId);
        const values = await makeEmailValues(type, booking, hotelDetails);
        const emailTrack = await getEmailTracking(hotelId, booking.pmsId, type);
        let mailObject = emailTrack ? emailTrack[0] : null;
        await renderAndSendEmail(type, values, mailObject);
        return res.status(200).send(values.token)
    }catch (err) {
        console.log(err);
        throw err;
    }
}
//render and send a qrcode email and return a generated qrcode as base64 url encoded string
const renderAndSendQrCode = async (req, res, next)  => {
    try{
        const { authorization } = req?.headers ;
        const { reservation } = req.body;
        const { hotelId } = req?.params;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
        const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
 
        if (reservation) booking =  new Enzo.EnzoRoomStay(reservation);
        if (!booking) throw new Models.NotFound() ;
        if (!token) throw new Error('no token') ; 
        //TO DO  verification on token  
        await sendEmail(MAILTYPES.QR, booking, hotelId);
        const dataUrl = await makeQrCode(hotelId, booking);
        return res.status(200).send(dataUrl);   
    } catch (e) {
        console.log(e);
        return res.status(500).end();
    }
}
     
const getToken = async (req, res, next) => {
   // let {reservationId, hotelId} = req?.query ;
   try {
   //     if (!reservationId) {
   //         reservationId ="688fbfc5-1c43-42de-a1cf-f1f2c7a73c6f";
   //         hotelId = 1;
   //     } 
    //    const booking = await getReservations(hotelId, reservationId);
        const token = makeUnlimitedToken();
            //reservationId, hotelId, booking[0].roomStays[0].status);
        return res.status(200).send(token);
    }catch (err) {
        console.log(err);
        throw err;   
    } 
}
     

module.exports = {
    sendEmail,
    renderAndSendQrCode,
    getEmailType,
    getToken,
}