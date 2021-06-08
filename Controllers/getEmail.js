require('dotenv').config();

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



    

const getEmail = async (req , res , next) => {


    try{
        let {email} = req?.query ;

        let booking = getBookingFromEmail(email) ;
       
        if (!booking)  throw new Models.NotFound() ;   
  
        console.log(booking.uuid) ;
        let sign = { 
            expiresIn : SETTINGS.TOKEN.VALIDITY ,
            issuer : 'ENZOSYSTEMS' ,
            subject : 'check-in' ,
            audience : email  
        } ;

        let guestName =  booking.guest.firstName + " " + booking.guest.lastName ;  
        let uuid = booking.uuid
        let secret = uuid //JSON.stringify(booking) ;
        
        let payload = {uuid} ; 
        
        let token = jwt.sign(payload , secret , sign ) ;

        res.locals.booking = booking ;
        res.locals.bookingUuid = booking.uuid ;
        res.locals.guestName =  guestName ;
        res.locals.guestLinkName =  guestName.replaceAll(' ' , '.' ) ;
        res.locals.token = token ;
        res.locals.email = email ;
        res.locals.mailType = MAILTYPES.START ;

        next() ;

    } catch(e) {
        
        let error ;
        error = e ;
        console.log(error) ;
        return res.status(400).send(error) ;
    }
}


const renderAndSendMail = (req , res , next)  => {


    // const port =  process.env.PORT ;
    // const host = process.env.HOST ;
    // const scheme = process.env.SCHEME ;
    
    // const appPort =  process.env.APP_PORT ;
    // const appHost = process.env.APP_HOST ;
    // const appScheme = process.env.APP_SCHEME ;
    // const linkUrl = process.env.LINK_URL ;
    
    // const link_url = `${appScheme}://${appHost}:${appPort}` ;
    // const appUrl = `${appHost}:${appPort}` ;
    
    const hotelName = "Enzo Hotel";
    const hotelAddress = "Test 20";
    const hotelPostcode = "7894 DF";
    const hotelCity = "city";
    const hotelCountry = "TEst";
    const hotelPhone = "TEst";
    const hotelEmail = "TEst";

    const checkDates = "TEst/654 - tesy/255";

    const values = {
        checkDates :checkDates,
        guestLinkName : res.locals.guestLinkName ,
        guestFullName : res.locals.guestName ,
        token : res.locals.token ,
        booking : res.locals.bookingUuid ,
        hotelName : hotelName ,
        hotelAddress : hotelAddress ,
        hotelPostcode : hotelPostcode ,
        hotelCity : hotelCity ,
        hotelCountry : hotelCountry , 
        hotelPhone : hotelPhone ,
        hotelEmail : hotelEmail
      
    }

    

    res.render( 'startMail'  , values , async ( err , content ) => {

        if (err) { 
            console.log(err)
            return res.status(500).send(err) 
        }
   
        try{
            await sendEmailRequest(  res.locals.mailType , content , res.locals.email ,  res.locals.bookingUuid ,  res.locals.guestName );
            return res.status(200).send();
        }catch(e){
            console.log(e)
            return res.status(500).send(e) 
        }
    })
}


module.exports = {
    getEmail, 
    renderAndSendMail
}