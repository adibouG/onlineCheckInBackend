const Models = require('../Models/index.js');
const Errors = require('../Models/errors.js');
const PmsApi = require('../Models/PmsModuleApi.js');
const CheckInApp = require('../Models/checkInApp.js');
const Enzo = require('../Models/enzoBooking.js');
const { HotelPmsDB } = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js')
const jwt = require('jsonwebtoken') ;
const { resetBookingStatus, makeCheckInAppResponseBody } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');
const { secretKey } = require('../Crypto/crypto.js');

//Request a booking route controller (from token contained in email link acyually)
const getBookingFromToken = async (req, res) => {
    try {
        //get the token
        const { token } = req?.query;
        winstonLogger.info(req.query);
        if (!token) throw new Errors.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const verified = jwt.verify(token, secretKey); 
        const { uuid, hotel_id, reservation_id, email } = verified;
        const bookingData = await helpers.getReservations(hotel_id, reservation_id); // pmsData.getReservationData();        
        if (!bookingData)  throw new Errors.NotFound() ;        
        const enzoBooking = new Enzo.EnzoCheckInRequest(bookingData[hotel_id]['reservations'][0]);
        console.log(enzoBooking)
        const checkInAppBooking = CheckInApp.Checkin.fromEnzoCheckIn(enzoBooking);
        const response = makeCheckInAppResponseBody(hotel_id, checkInAppBooking);
        //TO DO:  add the email tracking here or via middleware 
        console.log(response)
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Errors.ExpiredLink() ;
        else error = e ;
        winstonLogger.error(error) ;
        console.log('message: ', error.message) ;
        return res.status(error.code || 401).send(error.message) ;
    }
}

//Update booking route controller (received from the checkinApp for now) 
const postBooking = async (req, res) => {
    try {
        const payload = req?.body;
        const { checkin, hotel_id } = payload;
        if (!checkin) throw new  Errors.EnzoError('no booking nor update');
        const uuidKey = checkin.uuid ;
        const reservation_id = checkin.reservationID ;
        const result = await helpers.postReservations(hotel_id, reservation_id, checkin);
        /*const pmsData = new PmsApi.PmsModuleApi(hotel_id, reservation_id);
        const bookingData = await pmsData.updateReservationData(hotel_id, reservation_id, checkin);     
        */
        const updtBookingData = await helpers.getReservations(hotel_id, reservation_id);
        console.log('updtBookingData' , updtBookingData) //  pmsData.getReservationData(hotel_id, reservation_id, checkin);     
        if (!updtBookingData) throw new Errors.NotFound() ;
        const enzoBooking = new Enzo.EnzoCheckInRequest(updtBookingData[hotel_id]['reservations'][0]);
        console.log(enzoBooking)
        const checkInAppBooking = CheckInApp.Checkin.fromEnzoCheckIn(enzoBooking);
        const response = makeCheckInAppResponseBody(hotel_id, checkInAppBooking);
        //TO DO:  add the email tracking here or via middleware 
        console.log(response)
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
        await resetBookingStatus(email||null, uuid||null) ;
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
