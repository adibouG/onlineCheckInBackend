const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const {getInDataStore , setInDataStore , findValueInDataStore} = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;

const dynamoDB = require('../AWS/awsDynamoDb.js')


const {RESERVATION , TOKEN} = SETTINGS.DYNAMODB_TABLE ;
const {morgan , winstonLogger} = require('../Logger/loggers.js');
const winston = require('winston/lib/winston/config');

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

const resetBookingState = (book) => {
        
    let newDates ;
    
    if ("status" in book.reservation && book.reservation.status.toUpperCase() === "PRECHECKED") {
        delete  book.reservation.status ;
    }
   
    return book ;
};

const resetBookings = async (req , res) => {

    const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;
    const makeCheckDates = (past = false) => {
        
        let len = Math.floor(Math.random() * 10)   ;
        len = past ? -1 * len : len ;
 
        let today = new Date();
        let otherDate = new Date(new Date().setDate(today.getDate() +  len)) ;

        
        return ({ 
            today: today.toISOString().split('T')[0] ,
            otherDate: otherDate.toISOString().split('T')[0] 
        }) ;
    }

    const resetBookingDate = (book) => {
        
        let newDates ;
        
        if ("arrivalDate" in book.reservation) {
            newDates = makeCheckDates(true) ; 
            book.reservation.arrivalDate = newDates.otherDate ;
            book.reservation.startDate = newDates.otherDate ;
            book.reservation.endDate = newDates.today ;
        }
        else {
            newDates = makeCheckDates(false) ; 
            book.reservation.startDate = newDates.today ;
            book.reservation.endDate = newDates.otherDate ;
        }

        return book ;
    };
 
  
 
    try{

        let success = false ;
        let {email , uuid} = req?.query ;

        if (!email && !uuid ) {
           let originalDb = getInDataStore("backup" , db) ;
           for ( const check in  originalDb.checkins) {
               console.log(check)
                let newBook = resetBookingDate(originalDb.checkins[check]) ;
                //originalDb.checkins[check] = newBook ;    
                await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : check , ...newBook   } )
            }
         //  setInDataStore("checkins" , originalDb.checkins ,  db) ; 
        }
        else if (email || uuid ) {
            let originalDb = getInDataStore("backup" , db) ;
            let booking = findValueInDataStore(email , 'email' , originalDb) ;
           
                console.log(check)
                 let newBook = resetBookingDate(booking) ;
                 //originalDb.checkins[check] = newBook ;    
                 await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : booking.uuid , email : booking.guest.email , ...newBook   } )
        }
          //  setInDataStore("checkins" , originalDb.checkins ,  db) ; 
         
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