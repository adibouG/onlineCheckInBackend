const { randomUUID } = require('crypto');
const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const SETTINGS = require('../settings.json') ;

const dbPath = SETTINGS.DATA_STORAGE.PATH ;
const db = require(`../${dbPath}`) ;



function generateReservation() {



    let uuid = randomUUID() ; 
    return uuid //new Reservation() ;


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

        if (!(uuidKey in db.checkins)) throw new Models.NotFound() ;

        let booking = db.checkins[uuidKey] ;

        let complete = false ;
        let response ;
        if ("arrivalDate" in booking.reservation) complete = true
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

        if (!(uuidKey in db.checkins)) throw new Models.NotFound() 


        db.checkins[uuidKey] = bookingUpdt ;

        let complete = false ;
        let response ;
        
        if ("arrivalDate" in bookingUpdt.reservation) complete = true
        
        if (complete) {
            response = { 
                type: 'success',
                status: 'complete',
                stay: { 
                    arrivalDate: bookingUpdt.reservation.arrivalDate 
                } 
            };
        }
        else {
            response = {
                type: 'success',
                status: 'pending',
                checkin : bookingUpdt 
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


const makeNewBooking = (req , res) => {

    try{

        let {name} = req?.body ;

        if (!bookingUpdt) throw new Models.EnzoError('no booking nor update')





    }
    catch(e) {

        
    }

}

module.exports = {

    getBooking ,
    postBooking ,
    makeNewBooking  
}