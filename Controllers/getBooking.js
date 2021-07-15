const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const { resetBookingStatus, addDay, makeCheckInAppResponseBody } = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;
const dynamoDB = require('../AWS/awsDynamoDb.js');
const { RESERVATION_TRACKING, RESERVATION } = SETTINGS.DYNAMODB_TABLE ;
const { winstonLogger } = require('../Logger/loggers.js');

const getBookingFromToken = async (req, res) => {
    try {
        let {token} = req?.query;
        winstonLogger.info(req.query);
        if (!token) throw new Models.EnzoError('no token');
        let decoded = jwt.decode(token);
        winstonLogger.info(decoded);
        let uuidKey = decoded.uuid;
        let verified = jwt.verify(token, uuidKey); 
        let booking = await dynamoDB.getDynamoDBItem(RESERVATION, { reservationID: { S: uuidKey }});
        if (!booking)  throw new Models.NotFound() ;        
        let response = makeCheckInAppResponseBody(booking);
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

const postBooking = async (req, res) => {
    try {
        let bookingUpdt = req?.body;
        if (!bookingUpdt) throw new  Models.EnzoError('no booking nor update');
        let uuidKey = bookingUpdt.uuid ;
        await dynamoDB.putDynamoDBItem(RESERVATION , {reservationID : uuidKey , ...bookingUpdt}) ;
        let updt = await dynamoDB.getDynamoDBItem(RESERVATION , {reservationID : { S : uuidKey}});
        if (!updt) throw new Models.NotFound() ;
        let response = makeCheckInAppResponseBody(booking);
        return res.status(200).send(response);
    } catch(e) {
        console.log(e) ;
        return res.status(400).send(e) ;
    }
}

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
