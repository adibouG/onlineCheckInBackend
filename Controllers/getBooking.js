const Models = require('../Models/index.js');
const PmsModuleApi = require('../Models/PmsModuleApi.js');
const jwt = require('jsonwebtoken') ;
const { resetBookingStatus, makeCheckInAppResponseBody } = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;
const dynamoDB = require('../AWS/awsDynamoDb.js');
const { RESERVATION_TRACKING, RESERVATION } = SETTINGS.DYNAMODB_TABLE ;
const { winstonLogger } = require('../Logger/loggers.js');
const { encrypt, decrypt, secretKey } = require('../Crypto/crypto.js');

//Request a booking route controller (from token contained in email link acyually)
const getBookingFromToken = async (req, res) => {
    try {
        //get the token
        let { token } = req?.query;
        winstonLogger.info(req.query);
        if (!token) throw new Models.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        let verified = jwt.verify(token, secretKey); 
        let { uuid, hotel_id, reservation_id, email } = verified;
        let pmsData = new PmsModuleApi.PmsModuleApi(hotel_id, reservation_id);
        let bookingData = await pmsData.getReservationData();        
        if (!bookingData)  throw new Models.NotFound() ;        
        let response = makeCheckInAppResponseBody(hotel_id, bookingData);
        //TO DO:  add the email tracking here or via middleware 
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Models.ExpiredLink() ;
        else error = e ;
        console.log(error) ;
        winstonLogger.error(error) ;
        return res.status(error.code || 401).send(error) ;
    }
}

//Update booking route controller (received from the checkinApp for now) 
const postBooking = async (req, res) => {
    try {
        let payload = req?.body;
        let { checkin, hotel_id } = payload;
        if (!checkin) throw new  Models.EnzoError('no booking nor update');
        let uuidKey = checkin.uuid ;
        let reservation_id = checkin.reservationID ;
        let pmsData = new PmsModuleApi.PmsModuleApi(hotel_id, reservation_id);
        let bookingData = await pmsData.updateReservationData(hotel_id, reservation_id, checkin);     
        let updtBookingData = await pmsData.getReservationData(hotel_id, reservation_id, checkin);     
        if (!updtBookingData) throw new Models.NotFound() ;
        let response = makeCheckInAppResponseBody(hotel_id, updtBookingData);
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
