const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const {resetBookingStatus, addDay, makeCheckInAppResponseBody} = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;
const dynamoDB = require('../AWS/awsDynamoDb.js');
const {RESERVATION_TRACKING, RESERVATION} = SETTINGS.DYNAMODB_TABLE ;
const {winstonLogger} = require('../Logger/loggers.js');

const getBookingFromToken = async (req , res) => {
    try{
        let {token} = req?.query;
        winstonLogger.info(req.query);
        if (!token) throw new Models.EnzoError('no token');
        let decoded = jwt.decode(token);
        winstonLogger.info(decoded);
        let uuidKey = decoded.uuid;
        let verified = jwt.verify(token, uuidKey); 
        let booking = await dynamoDB.getDynamoDBItem(RESERVATION, {reservationID : {S : uuidKey} });
        if (!booking)  throw new Models.NotFound() ;        
        let response = makeCheckInAppResponseBody(booking);
        return res.status(200).send(response);
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError)  error = new Models.ExpiredLink() ;
        else error = e ;
        console.log(error) ;
        winstonLogger.error(error) ;
        return res.status(error.code || 401).send(error) ;
    }
}

const postBooking = async (req , res) => {

    try{
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

const resetBookings = async (req , res) => {
    try{
        let {email , uuid} = req?.query ;
        await resetBookingStatus(email||null ,uuid||null) ;
        return res.status(200).send();
    } catch(e) {
        console.log(e)
        return res.status(500).end();
    }
}

const getNewReservations = async () => {
    try{
       // let hotelRequest = await dynamoDB.findDynamoDBItems(HOTEL) 
       // let pmsRequest = await dynamoDB.findDynamoDBItems(PMS) 
       // let hotelList =  hotelRequest.data 
       // let pmsData = pmsRequest.data
       // for (let hotel in hotelList ) {
        let hotelPms = hotel.pmsId ;
        let pmsCheckInDateName = 'startDate';
        let pmsBookingIdName = 'reservationID';
        let pmsBookingRefName = 'uuid';
        let pmsGuestEmailName = 'email';
        let results = await dynamoDB.findDynamoDBItems(RESERVATION) ;
        //}
        //get the reservations
        results.Items.forEach(async (item) => {
            let reservation = unmarshall(item) ; 
            //compare the date if checkIn can be offer
            if ( preCheckInDateIsValid(reservation, pmsCheckInDateName)){ 
                //if yes then get the email address, the booking ref , and the hotel ref ( also for the pms id) 
                let reservationID  = reservation[pmsBookingIdName]
                let checkInDate  = reservation[pmsCheckInDateName]
                let bookingRef  = reservation[pmsBookingRefName]
                let guestEmail  = reservation[pmsGuestEmailName]
                //add this booking to the list of email to send 
                let results = await dynamoDB.putDynamoDBItem(RESERVATION_TRACKING, { }) ;
            }
        })
    } catch(e) {
        console.log(e)
    }
}

 //compare the date if checkIn can be offer take a booking and the param name to check
 const preCheckInDateIsValid = (booking, dateParam) => {
    let canBePreCheck = false ;
    let startDate = new Date(booking[dateParam]);
    if ( startDate >= new Date() && startDate <= addDay(new Date(), SETTINGS.CHECKIN_REQUEST_START_DAY_OFFSET))
    { 
        canBePreCheck = true ;
    }
    return canBePreCheck ;
}

module.exports = {
    getNewReservations ,
    getBookingFromToken ,
    postBooking ,
    resetBookings  
}
