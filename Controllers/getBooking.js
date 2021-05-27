const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const {getInDataStore , setInDataStore} = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json') ;
const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;



const getInDataStore = (key , store) => {

    if (!(key in store)) return null ;

    return store[key] ;
}


const setInDataStore = (key , upd , store) => {

    if (!getInDataStore(key, store)) return null ;

    store[key] = upd  ;
    
    return store[key] ;

}



const getBooking = (req , res) => {

    try{
        let {token} = req?.query ;

        if (!token) throw new Models.EnzoError('no token') ;
        /*
        let decoded = jwt.verify(token) ;
        
        decoded
        */
        let uuidKey = token ;

        let booking = getInDataStore(uuidKey, db.checkins) ;
       
        if (!booking)  throw new Models.NotFound() ;        

        let complete = false ;
        let response ;

        if ("arrivalDate" in booking.reservation) complete = true ;
        
        if (complete) {
            response = { 
                type: 'success',
                status: 'complete',
                stay: { 
                    arrivalDate: booking.reservation.arrivalDate 
                } 
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
        if (e instanceof jwt.TokenExpiredError)  error = new Models.ExpiredLink(e) ;
        else error = e ;
        console.log(error) ;
        return res.status(400).send(error) ;
    }

}



const postBooking = (req , res) => {

    try{

        let bookingUpdt = req?.body ;

        if (!bookingUpdt) throw new  Models.EnzoError('no booking nor update')

        let uuidKey = bookingUpdt.uuid ;

        
        let updt = setInDataStore(bookingUpdt.uuid , bookingUpdt , db.checkins) 
        
        if (!updt) throw new Models.NotFound() ;

        let complete = false ;
        let response ;
        
        if ("arrivalDate" in updt.reservation) complete = true ;
        
        if (complete) {
            response = { 
                type: 'success',
                status: 'complete',
                stay: { 
                    arrivalDate: updt.reservation.arrivalDate 
                } 
            };
        }
        else {
            response = {
                type: 'success',
                status: 'pending',
                checkin : updt 
            };
        } 

        return res.status(200).send(response);

    }
    catch(e) {

        let error ;
        error = e ;
     
        console.log(error) ;
        return res.status(400).send(error) ;
    }

}


const resetBookings = (req , res) => {

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
        let {name , uuid} = req?.query ;

        if (!name && !uuid ) {

           let originalDb = getInDataStore("backup" , db) ;
           for ( const check in  originalDb.checkins) {
               console.log(check)
                let newBook = resetBookingDate(originalDb.checkins[check]) ;
                originalDb.checkins[check] = newBook ;    
            }
            setInDataStore("checkins" , originalDb.checkins ,  db) ;
            console.log(originalDb)
        }
  
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