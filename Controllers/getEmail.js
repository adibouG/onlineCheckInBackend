require('dotenv').config();

const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
let QRCode = require('qrcode') ;

const {findValueInDataStore , isBookingValid , dateDiffInDays, makeDate, getDay} = require('../Utilities/utilities.js');

const SETTINGS = require('../settings.json') ;
const HOTEL = require('../hotel.settings.json') ;

const { MAILTYPES , sendEmailRequest } = require('../Emails/enzoMails.js');

const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;

const TEMPLATES = {
    START : "" ,
    QR : "" 
} 


const makeQrCode = async (booking) => {
    
   // let qr = QRCode.create(JSON.stringify(booking));
    
    let code = {
        bookingId:booking.uuid, 
        guest:booking.guest, 
        reservation:booking.reservation
    };

    return await QRCode.toDataURL(JSON.stringify(code))

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



const { NAME , ADDRESS , POSTCODE , CITY , COUNTRY , PHONE ,EMAIL , CHECKINTIME} = HOTEL ;

const hotelName = NAME ; //"EnzoHotel";
const hotelAddress = ADDRESS ; //"Camerastraat 2";
const hotelPostcode = POSTCODE ;//"1322 BC";
const hotelCity =  CITY; //"Almere";
const hotelCountry = COUNTRY; //"The Netherlands";
const hotelPhone = PHONE ; //" +31 36 546 1040";
const hotelEmail = EMAIL ; //"info@enzosystems.com";

const hotelValues = {
    hotelName : hotelName ,
    hotelAddress : hotelAddress ,
    hotelPostcode : hotelPostcode ,
    hotelCity : hotelCity ,
    hotelCountry : hotelCountry , 
    hotelPhone : hotelPhone ,
    hotelEmail : hotelEmail
}

const renderAndSendQrCode = async (req , res , next)  => {


    let booking = req.body ;

    let guestName = booking.guest.firstName + " " + booking.guest.lastName ;
    let bookingUuid = booking.uuid ;

    const url = await makeQrCode(booking) ;
    
   
    const d1 = booking.reservation.startDate;
    const d2 = booking.reservation.endDate;
 
    const date1 = new Date(d1) ;
    const date2 = new Date(d2) ;

    const numNights = dateDiffInDays(date1 , date2)

    const checkDates =  d1 + " - " + d2 ;

    const roomType =  booking.reservation.roomType ;
    const numGuests = booking.reservation.guestCount ;
    const checkInTime = CHECKINTIME ;

    const guestValues = {
        checkInDate : d1 ,
        checkInTime : checkInTime,
        base64qrCode : url ,
        guestFullName : guestName ,
        booking : bookingUuid ,
        roomType : roomType ,
        numNights : numNights ,
        numGuests : numGuests
    }

    const values = { ...guestValues , ...hotelValues }

    let mailType = MAILTYPES.QR; 
    let email = booking.guest.email ;
    res.render( 'qrCodeMail'  , values , async ( err , content ) => {

        if (err) { 
            console.log(err)
            return res.status(500).send(err) 
        }
        try{
            await sendEmailRequest(  mailType , content , email  );
            return res.status(200).send();
        }catch(e){
            console.log(e)
            return res.status(500).send(e) 
        }
    })
}



const renderAndSendMail = (req , res , next)  => {

    let d1 = new Date(res.locals.booking.reservation.startDate).toLocaleDateString();
    let d2 = new Date(res.locals.booking.reservation.endDate).toLocaleDateString();
 
    const checkDates =  d1 + " - " + d2 ;

    const guestValues = {
        checkDates : checkDates,
        guestLinkName : res.locals.guestLinkName ,
        guestFullName : res.locals.guestName ,
        token : res.locals.token ,
        booking : res.locals.bookingUuid 
    }
    const values = {...guestValues , ... hotelValues}  ;
    

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
    renderAndSendMail ,
    renderAndSendQrCode
}