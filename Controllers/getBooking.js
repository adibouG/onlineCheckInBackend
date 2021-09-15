const Errors = require('../Models/errors.js');
const Enzo = require('../Models/Enzo.js');
const helpers = require('../Helpers/helpers.js');
const jwt = require('jsonwebtoken') ;
const { makeCheckInAppResponseBody, makeSecureRequestToken, verifyToken, verifySecureToken, setCheckBooking } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');
const { FINAL_STEP } = require('../settings.json');
//Request a booking route controller (from token contained in email link acyually)
const getBookingFromToken = async (req, res) => {
    
    let booking = null;
    let hotelAppSettings = null;
    try {
        //get the token
        const { token } = req?.query;
        winstonLogger.info('received token :' + token);
        if (!token) throw new Errors.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        booking = await helpers.getReservations(hotelId, reservationId);
        const roomStay = booking[0].roomStays[0];
        hotelAppSettings = await helpers.getHotelSettings(hotelId);
        const hotelStayData = await helpers.getHotelStays(hotelId, roomStay.expectedArrival, roomStay.expectedDeparture);
        if (!booking.length) throw new Errors.NotFound() ;        
        //token was signed using the reservation state in order to make it only 1 time use 
        
        verifyToken(token, roomStay); 
        //let allowedScreens = hotelAppSettings.screens ? hotelAppSettings.screens : null;
        //get HotelPolicies screens values into the  booking
        const response = makeCheckInAppResponseBody(roomStay, token);
        
        //const stay = new Enzo.EnzoStay() 
        
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Errors.ExpiredLink() ;
        else if (e instanceof jwt.JsonWebTokenError && e.message === 'invalid signature' && booking.length)  {
            const response = makeCheckInAppResponseBody(booking[0].roomStays[0]);
            return res.status(200).send(response);
        } else {
            error = e;
        }
        winstonLogger.error(error) ;
        return res.status(error.code || 401).send(error.message) ;
    }
}

//Update booking route controller (received from the checkinApp for now) 
const postBooking = async (req, res) => {
    try {
         const { data, token, step } = req?.body;
        if (!data) throw new Errors.EnzoError('no booking nor update');
        if (!token) throw new Errors.EnzoError('no token');
        
        const stay = new Enzo.EnzoRoomStay(data);
        const decoded = verifySecureToken(token, stay.reservation.roomStays[0]); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        if (step == FINAL_STEP) enzoCheckin = setCheckBooking(enzoCheckin);
        await helpers.postReservations(hotelId, reservationId, stay);
        const updtBookingData = await helpers.getReservations(hotelId, reservationId);
        if (!updtBookingData) throw new Errors.NotFound() ;
        const response = makeCheckInAppResponseBody(updtBookingData[0].roomStays[0], hotelId);
        return res.status(200).send(response);
    } catch(e) {
        console.log(e) ;
        return res.status(400).send(e) ;
    }
}

//Reset booking route controller (received from the checkinApp for now) 
const resetBookings = async (req, res) => {
    try {
        const { email, reservationId } = req?.query;
        await helpers.resetBookingStatus(email||null, reservationId||null) ;
        return res.status(200).send("OK");
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
}

module.exports = {
    getBookingFromToken ,
    postBooking ,
    resetBookings  
}
