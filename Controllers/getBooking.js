const Errors = require('../Models/errors.js');
const CheckInApp = require('../Models/checkInApp.js');
const helpers = require('../Helpers/helpers.js');
const jwt = require('jsonwebtoken') ;
const { makeCheckInAppResponseBody } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');
const { secretKey } = require('../Crypto/crypto.js');

//Request a booking route controller (from token contained in email link acyually)
const getBookingFromToken = async (req, res) => {
    let enzoBookingExist = false;
    let enzoBooking = null;
    let hotelAppSettings = null;
    try {
        //get the token
        const { token } = req?.query;
        winstonLogger.info(req.query);
        if (!token) throw new Errors.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token, secretKey); 
        const { uuid, hotel_id, reservation_id, email } = decoded;
        const bookingData = await helpers.getReservations(hotel_id, reservation_id);
        hotelAppSettings = await helpers.getHotelSettings(hotel_id);
        if (!bookingData || !bookingData[hotel_id]['reservations'].length) throw new Errors.NotFound() ;        
        enzoBooking = bookingData[hotel_id]['reservations'][0] ; 
        if (enzoBooking) enzoBookingExist = true;
        //token was signed using the reservation state in order to make it only 1 time use 
        const verified = jwt.verify(token, secretKey + enzoBooking.state); 
        //if (!verified) throw new Errors.EnzoError('invalid token');
               //TODO add token in the response to allow the next request
        const response = makeCheckInAppResponseBody(enzoBooking, hotel_id, hotelAppSettings);
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Errors.ExpiredLink() ;
        else if (e instanceof jwt.JsonWebTokenError && e.message === 'invalid signature' && enzoBookingExist)  {
            const response = makeCheckInAppResponseBody(enzoBooking, enzoBooking.hotelId, hotelAppSettings);
            return res.status(200).send(response);
        } else error = e ;
        winstonLogger.error(error) ;
        return res.status(error.code || 401).send(error.message) ;
    }
}

//Update booking route controller (received from the checkinApp for now) 
const postBooking = async (req, res) => {
    try {
        const payload = req?.body;
        const { token, checkin, hotel_id, step } = payload;
        if (!checkin) throw new  Errors.EnzoError('no booking nor update');
        const checkinApp = new CheckInApp.Checkin(checkin);
        const enzoCheckin = checkinApp.toEnzoCheckIn();
        const reservation_id = enzoCheckin.reservationId ;
        const result = await helpers.postReservations(hotel_id, reservation_id, enzoCheckin);
        const updtBookingData = await helpers.getReservations(hotel_id, reservation_id);
        if (!updtBookingData) throw new Errors.NotFound() ;
        const hotelAppSettings = await helpers.getHotelSettings();
        const enzoBooking = updtBookingData[hotel_id]['reservations'][0];
         //TODO add token in the response to allow the next request
        const response = makeCheckInAppResponseBody(enzoBooking, hotel_id, hotelAppSettings);
        return res.status(200).send(response);
    } catch(e) {
        console.log(e) ;
        return res.status(400).send(e) ;
    }
}

//Reset booking route controller (received from the checkinApp for now) 
const resetBookings = async (req, res) => {
    try {
        let { email, uuid } = req?.query;
        await helpers.resetBookingStatus(email||null, uuid||null) ;
        return res.status(200).send();
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
