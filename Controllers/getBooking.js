const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const {resetBookingStatus, isBookingValid, isPreCheckedBooking} = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;

const dynamoDB = require('../AWS/awsDynamoDb.js')


const {RESERVATION , TOKEN} = SETTINGS.DYNAMODB_TABLE ;
const {winstonLogger} = require('../Logger/loggers.js');


const getBooking = async (req , res) => {

    try{
        let {token} = req?.query ;

        winstonLogger.info(req.query)
        console.log(req.query) ;

        if (!token) throw new Models.EnzoError('no token') ;
        
        let decoded = jwt.decode(token) ;
        console.log(decoded) ;
        winstonLogger.info(decoded)
        let uuidKey = decoded.uuid ;
        console.log(uuidKey)
        winstonLogger.info(uuidKey)

        let verified = jwt.verify(token , uuidKey) ; 
        
        let booking = await dynamoDB.getDynamoDBItem(RESERVATION , { reservationID : {S : uuidKey } } )
  
        console.log(booking)
      
        if (!booking)  throw new Models.NotFound() ;        

        let complete = false ;
        let prechecked = false ;
        let response ;
        
        if ("status" in booking.reservation && booking.reservation.status === 'PRECHECKED') prechecked = true ;
           
        if ("arrivalDate" in booking.reservation ) complete = true
        
        
        if (complete) {
            response = { 
                type: 'success',
                status: 'complete',
                stay: { 
                    arrivalDate: booking.reservation.arrivalDate 
                } 
            };
        }
        else if (prechecked) {
            response = {
                type: 'success',
                status: 'prechecked',
                checkin : booking 
            };
        } 
        
        else {
            response = {
                type: 'success',
                status: 'pending',
                checkin : booking 
            };
        } 

        return res.status(200).send(response);

    } catch(e) {
        
        let error ;
        if (e instanceof jwt.TokenExpiredError)  error = new Models.ExpiredLink() ;
        else error = e ;
        
        console.log(error) ;
        winstonLogger.error(error)
        return res.status(error.code || 401).send(error) ;
    }

}



const postBooking = async (req , res) => {

    try{
        let bookingUpdt = req?.body ;
        console.log(bookingUpdt)
        if (!bookingUpdt) throw new  Models.EnzoError('no booking nor update')
        let uuidKey = bookingUpdt.uuid ;
        await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : uuidKey , ...bookingUpdt   } ) 
        let updt = await dynamoDB.getDynamoDBItem(RESERVATION , { reservationID : {S : uuidKey } } )
        if (!updt) throw new Models.NotFound() ;
        
        let complete = false ;
        let prechecked = false ;
        let response ;

        if ("status" in updt.reservation && updt.reservation.status.toUpperCase() === 'PRECHECKED') prechecked = true ;           

        if ("arrivalDate" in updt.reservation ) complete = true

        if (complete) {
            response = { 
                type: 'success',
                status: 'complete',
                stay: { 
                    arrivalDate: updt.reservation.arrivalDate 
                } 
            };
        }
        else if (prechecked) {
            response = {
                type: 'success',
                status: 'prechecked',
                checkin : updt 
            };
        } 
        else {
            response = {
                type: 'success',
                status: 'pending',
                checkin : updt 
            };
        } 
        console.log(response)
        return res.status(200).send(response);
    }
    catch(e) {
        let error ;
        error = e ;
        console.log(error) ;
        return res.status(400).send(error) ;
    }
}


const resetBookings = async (req , res) => {
  
    try{

        let {email , uuid} = req?.query ;

        await resetBookingStatus(email||null , uuid||null) ;

        return res.status(200).send();
    }
    catch(e) {
        console.log(e)
        return res.status(500).end();
    }
}


module.exports = {

    getBooking ,
    postBooking ,
    resetBookings  
}