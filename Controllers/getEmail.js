require('dotenv').config();

const Models = require('../Models/index.js');
const jwt = require('jsonwebtoken') ;
const { makeQrCode, isPreCheckedBooking, isBookingValid , setCheckBooking , getBookingFromEmail, dateDiffInDays} = require('../Utilities/utilities.js');

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const SETTINGS = require('../settings.json') ;
const HOTEL = require('../hotel.settings.json') ;

const dynamoDB = require('../AWS/awsDynamoDb.js')

const {RESERVATION , TOKEN , EMAIL_TRACKING} = SETTINGS.DYNAMODB_TABLE ;
const { MAILTYPES , sendEmailRequest } = require('../Emails/enzoMails.js');
const { resetBookingStatus } = require('../Utilities/utilities.js');



const TEMPLATES = {
    START : "" ,
    QR : "" 
} 


const { ID , NAME , ADDRESS , POSTCODE , CITY , COUNTRY , PHONE ,EMAIL , CHECKINTIME} = HOTEL ;

const hotelID = ID ; 
const hotelName = NAME ; 
const hotelAddress = ADDRESS ; 
const hotelPostcode = POSTCODE ;
const hotelCity =  CITY; 
const hotelCountry = COUNTRY; 
const hotelPhone = PHONE ; 
const hotelEmail = EMAIL ; 

const hotelValues = {
    hotelName : hotelName ,
    hotelAddress : hotelAddress ,
    hotelPostcode : hotelPostcode ,
    hotelCity : hotelCity ,
    hotelCountry : hotelCountry , 
    hotelPhone : hotelPhone ,
    hotelEmail : hotelEmail
}


const getEmail = async (req , res , next) => {


    try{

        let {email} = req?.query ;

        let booking = await getBookingFromEmail(email) ;
       
        if (!booking)  throw new Models.NotFound() ;   
  
        console.log(booking.uuid) ;
        let sign = { 
            expiresIn : SETTINGS.TOKEN.VALIDITY ,
            issuer : 'ENZOSYSTEMS' ,
            subject : 'check-in' ,
            audience : email  
        } ;

        let guestName =  booking.guest.firstName + " " + booking.guest.lastName ;  
        let uuid = booking.uuid ;
        let secret = uuid ;
        
        let payload = {uuid , ID} ; 
        
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



const renderAndSendQrCode = async (req , res , next)  => {

    let booking = req.body ;

    let guestName = booking.guest.firstName + " " + booking.guest.lastName ;
    let bookingUuid = booking.uuid ;
    
    if (isPreCheckedBooking(booking)) {

        console.log('routes to reset : RESET RESERVATION ')
        
        await resetBookings(booking.guest.email , booking.uuid)

        try{

            await resetBookingStatus(booking.guest.email , bookingUuid) ;
    
        }
        catch(e) {
            console.log(e)
            return res.status(500).end();
        }
    }
    
    console.log('routes to makeQrCode')

    const url = await makeQrCode(booking) ;

    await setCheckBooking(booking);
  
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
        
        let mailTrackingObj = Models.EmailTrackingObject(bookingUuid , mailType);

        try{

            await sendEmailRequest(  mailType , content , email  );
           
            
            dynamoDB.putDynamoDBItem(EMAIL_TRACKING , mailTrackingObj )
           
            return res.status(200).send();
        }catch(e){
         
            console.log(e)
        
            mailTrackingObj.sentDate = null ;
        
            dynamoDB.putDynamoDBItem(EMAIL_TRACKING , mailTrackingObj )
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
    
    //TODO replace render by one func using `${MAILTYPE}Mail`

    return res.render( 'startCheckInMail'  , values , async ( err , content ) => {

        if (err) { 
            console.log(err)
            return res.status(500).send(err) 
        }
   
        let mailTrackingObj = Models.EmailTrackingObject(res.locals.bookingUuid , res.locals.mailType);

        try{
            await sendEmailRequest(  res.locals.mailType , content , res.locals.email ,  res.locals.bookingUuid ,  res.locals.guestName );
            
            dynamoDB.putDynamoDBItem(EMAIL_TRACKING , mailTrackingObj )
            
            return res.status(200).send();
            
        }catch(e){
            console.log(e)

            mailTrackingObj.sentDate = null ;
            
            dynamoDB.putDynamoDBItem(EMAIL_TRACKING , mailTrackingObj )

            return res.status(500).send(e) 
        }
    })
}




module.exports = {
    getEmail, 
    renderAndSendMail ,
    renderAndSendQrCode
}