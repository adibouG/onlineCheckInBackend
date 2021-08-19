const Errors = require('../Models/errors.js');
const CheckInApp = require('../Models/checkInApp.js');
const helpers = require('../Helpers/helpers.js');
const jwt = require('jsonwebtoken') ;
const axios = require('axios') ;
const { makeCheckInAppResponseBody, makeSecureRequestToken, verifyToken, verifySecureToken, setCheckBooking } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');
const { FINAL_STEP } = require('../settings.json');
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
        const decoded = jwt.decode(token); 
        const { uuid, hotel_id, reservation_id, email, steps } = decoded;
        const bookingData = await helpers.getReservations(hotel_id, reservation_id);
        hotelAppSettings = await helpers.getHotelSettings(hotel_id);
        if (!bookingData || !bookingData[hotel_id]['reservations'].length) throw new Errors.NotFound() ;        
        enzoBooking = bookingData[hotel_id]['reservations'][0] ; 
        if (enzoBooking) enzoBookingExist = true;
        //token was signed using the reservation state in order to make it only 1 time use 
        verifyToken(token, enzoBooking); 
        let allowedScreens = hotelAppSettings.screens ? hotelAppSettings.screens : null;
        //get HotelPolicies screens values into the  booking
        if (allowedScreens && allowedScreens['hotelPolicies']){
            for (let policy in allowedScreens['hotelPolicies']) {
                let rule;
                if (allowedScreens['hotelPolicies'][policy]['url']) {
                    let req = await axios.get(allowedScreens['hotelPolicies'][policy]['url'])
                    rule = req.data; 
                } else if (allowedScreens['hotelPolicies'][policy]['content']) {
                    rule = allowedScreens['hotelPolicies'][policy]['content'];
                }
                if (!enzoBooking.hotelPolicies) enzoBooking.hotelPolicies = {};
                if (!enzoBooking.hotelPolicies[policy]) enzoBooking.hotelPolicies[policy] = {} ;
                if (!enzoBooking.hotelPolicies[policy]['accepted']) enzoBooking.hotelPolicies[policy]['accepted'] = false ;
                enzoBooking.hotelPolicies[policy]['content'] = rule;
                enzoBooking.hotelPolicies[policy]['accepted'] = enzoBooking.hotelPolicies[policy]['accepted'];
            }
        }
        let securityToken = makeSecureRequestToken(enzoBooking.reservationId, hotel_id, allowedScreens);
        const response = makeCheckInAppResponseBody(enzoBooking, hotel_id, hotelAppSettings, securityToken);
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Errors.ExpiredLink() ;
        else if (e instanceof jwt.JsonWebTokenError && e.message === 'invalid signature' && enzoBookingExist)  {
            const response = makeCheckInAppResponseBody(enzoBooking, enzoBooking.hotelId, hotelAppSettings, security = null);
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
        const payload = req?.body;
        const { request_token, checkin, hotel_id, step } = payload;
        if (!checkin) throw new Errors.EnzoError('no booking nor update');
        if (!request_token) throw new Errors.EnzoError('no token');
        const checkinApp = new CheckInApp.Checkin(checkin);
        let enzoCheckin = checkinApp.toEnzoCheckIn();
        verifySecureToken(request_token, enzoCheckin); 
        const reservation_id = enzoCheckin.reservationId ;
        if (step == FINAL_STEP) enzoCheckin = setCheckBooking(enzoCheckin);
        await helpers.postReservations(hotel_id, reservation_id, enzoCheckin);
        const updtBookingData = await helpers.getReservations(hotel_id, reservation_id);
        if (!updtBookingData) throw new Errors.NotFound() ;
        const enzoBooking = updtBookingData[hotel_id]['reservations'][0];
        const response = makeCheckInAppResponseBody(enzoBooking, hotel_id);
        return res.status(200).send(response);
    } catch(e) {
        console.log(e) ;
        return res.status(400).send(e) ;
    }
}

//Reset booking route controller (received from the checkinApp for now) 
const resetBookings = async (req, res) => {
    try {
        let { email, reservationId } = req?.query;
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
