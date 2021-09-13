require('dotenv').config();
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const { getEmailTracking, getHotelDetails } = require('../Helpers/helpers.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, makeQrCode } = require('../Utilities/utilities.js');

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
   
//render and send a qrcode email and return a generated qrcode as base64 url encoded string
const renderAndSendQrCode = async (req, res, next)  => {
    try{
        let booking;
        const { hotelId } = req?.params;
        const { token, reservation } = req.body;
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
        
     

module.exports = {
    sendEmail,
    renderAndSendQrCode
}