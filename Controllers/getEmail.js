
const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;

const {findValueInDataStore , isBookingValid} = require('../Utilities/utilities.js');

const SETTINGS = require('../settings.json') ;
const { MAILTYPES , sendEmailRequest } = require('../Emails/enzoMails.js');

const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;

const TEMPLATES = {
    START : "" ,
    QR : "" 
} 

const getBookingFromEmail = (email) => {
    
    let booking ;
    let bookings = [] ; 
    let validEmail = email.length > 0 || false ;
    if (!email || !validEmail) throw new Models.EnzoError('no email or invalid email') ;
    
    for (let k in db.checkins) {
       if (db.checkins[k]["guest"]["email"] === email) bookings.push(db.checkins[k]) ;
    }
    console.log(bookings) ;
    // bookings = findValueInDataStore(email , 'email' , db.checkins) ;
   
    if (!bookings.length)  throw new Models.NotFound('no reservation with this email') ; 

    for (let b of  bookings) {

        if (isBookingValid(b)) {
            booking = b ;
            break;
        }
    }

    return booking ;
}



    

const getEmail = async (req , res) => {


    try{
        let {email} = req?.query ;

        let booking = getBookingFromEmail(email) ;
       
        if (!booking)  throw new Models.NotFound() ;   

        let sign = { 
            expiresIn : SETTINGS.TOKEN.VALIDITY ,
            issuer : 'ENZOSYSTEMS' ,
            subject : 'check-in' ,
            audience : email  
        } ;

        let secret = JSON.stringify(booking) ;
        
        let payload = {booking} ; 
        
        let token = jwt.sign(payload , secret , sign ) ;

        await sendEmailRequest( MAILTYPES.START , email , token );

        return res.status(200).send();


    } catch(e) {
        
        let error ;
        error = e ;
        console.log(error) ;
        return res.status(400).send(error) ;
    }

}




module.exports = {
    getEmail,
  
}