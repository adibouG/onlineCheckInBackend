require('dotenv').config();
const { PaymentLinkRequestBody, PaymentResult } = require('../Models/EnzoPayApi.js');
const helpers = require('../Helpers/helpers.js');
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const { verifyToken } = require('../Utilities/utilities.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SETTINGS = require('../settings.json');
const {winstonLogger} = require('../Logger/loggers.js');

var paymentSessions = null ;
var paymentResultCheckIntervalId = null ;

const getPaymentLinkFromToken = async (req, res) => {
  
    const { authorization } = req?.headers ;
    const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
    const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
    winstonLogger.info('received token :' + token);
    try{
        if (!token) throw new Errors.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        
        const booking = await helpers.getReservations(hotelId, reservationId);
        const roomStay = booking[0].roomStays[0];
        if (!booking.length) throw new Errors.NotFound() ;        
        //token was signed using the reservation state in order to make it only 1 time use 
        const folioToPay = 0;
        for (let f of roomStay.folios) {
            if (f.type === Enzo.EnzoFolio.FOLIO_TYPES.GUEST && 
                f.remainingToPay > 0) 
            { 
                folioToPay = f.remainingToPay;
                break;
            }
        }    
        const { guestName, language, guestEmail, amount, currency, bank, method } = req?.body ;
        verifyToken(token, roomStay); 
        //check amuount match against folio account
        if (folioToPay != amount) throw new Error('amount not correct with the folio total')   
       
       //check if a session already exist and in process 
        let hasSession = false;
        const sessions = await helpers.getPaymentSession(hotelId, reservationId);
        if (sessions.length) {
            for (let s of sessions) {
                if (s.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.STARTED) {
                    hasSession = true;
                  return res.status(200).send({ message: 'payment processing', transactionId : s.transactionId });
                }
            }
        }
        const PAYAPIURL = process.env.PAYMENT_API_URL;
        const GETPAYMENTLINK = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_LINK;
        const hotelInfo = await helpers.getHotelInfo(hotelId) ;
        const applicationId = "onlinecheckin";
        const hotelName = hotelInfo.hotel_name;
        console.log(hotelInfo)
        const payload = new PaymentLinkRequestBody({ 
            merchantId: hotelName,
            customerId: reservationId, 
            customerName: guestName,
            customerEmail: guestEmail,
            description: `Payment Link request from Enzo Online Precheckin, hotelId :${hotelId}, reservationId : ${reservationId}` ,
            amountTotal: String(amount),  
            languageCode: language || "en-US",
            currency: currency || "EUR",
            method: method || "VISA" ,
            issuerId: bank || "RABOBANK"  
        }) ;


        const payrequest = await axios.post(`${PAYAPIURL}${GETPAYMENTLINK}`, payload) ;
        //add payment session 
        if (payrequest.status !== 200) throw new Error('paymentLink not retrieved')
        
        const transactionId = payrequest.data.transactionId;
        const paySession = new Models.PaymentSession({ 
            reservationId, 
            hotelId, 
            transactionId,  
            status: Models.PaymentSession.PAYMENT_SESSION_STATUS.CREATED
        }) ;
        await helpers.addPaymentSession(paySession);
        return res.send(payrequest.data);
    }catch(e){
        console.log(e);
        return res.status(e.code || 400).send(e.message || JSON.stringify(e));
    }
}



const getPaymentResultById = async (req, res) => {
    const { transactionId } = req?.query ; 
    const { authorization } = req?.headers ;
    const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
    const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
    winstonLogger.info('received token :' + token);
    try {
        if (!token) throw new Errors.EnzoError('no token');
        if (!transactionId) throw new Errors.EnzoError('no transactionId');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;

        const paySessions = await helpers.getPaymentSession(hotelId, reservationId, transactionId);
        if (!paySession.length) throw new Errors.EnzoError('no payment session started was found')
        const paySession = paySessions[0];
        if (paySession.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.FINISHED) { throw new Errors.EnzoError('payment session  found but finished')}
        if (paySession.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.CREATED) {
            paySession.status = Models.PaymentSession.PAYMENT_SESSION_STATUS.STARTED;
            payStatus.updatedAt = Date.now() ;
        }
        const result = await helpers.getPaymentResult({ transactionId, hotelId });
        let code ;
        let paymentEnded = false ;
        let paymentSuccess = false ;
        if (result.status.toUpperCase() === 'PAID') {
            code = 200;
            paymentEnded = true ;
            paymentSuccess = true;
        } else if (result.status.toUpperCase() === 'CREATED') {
            code = 200;
        } else if (result.status.toUpperCase() === 'DECLINED' || result.status.toUpperCase() === 'ABORTED' || result.status.toUpperCase() === 'EXPIRED' || result.status.toUpperCase() === 'FAILED') {
            code = 400; 
            paymentEnded = true ;
        } else {
            code = 500;
            paymentEnded = true ;
        }
        if (paymentEnded) {
            paySession.status = Models.PaymentSession.PAYMENT_SESSION_STATUS.FINISHED;
            payStatus.updatedAt = Date.now() ;
            await helpers.updatePaymentSession(paySession);
            if (paymentSuccess) {
                //get and update the reservation  
                const bookings = await helpers.getReservations(hotelId, reservationId);
                const booking = bookings[0];
                const roomStay = booking.roomStays[0];
                const payItem = new Enzo.EnzoFolioItem({ 
                    name: new Enzo.LocalText({ "en": "PayByLink Payment" }), 
                    type: Enzo.EnzoFolioItem.FOLIO_ITEM_TYPES.PAYMENT , 
                    totalAmount: result.amountPaid, 
                    unitAmount: result.amountPaid, 
                    numberOfUnits: 1, 
                    dateTime: Date.now()
                });

                for (let f of  roomStay.folios) {
                    if (f.type === Enzo.EnzoFolio.FOLIO_TYPES.GUEST) { 
                        f.addFolioItem(payItem);
                        break;
                    }
                }
                roomStay.status = Enzo.EnzoRoomStay.STAY_STATUS.PRECHECKEDIN;
                booking.roomStays = [roomStay];
                //trigger the qrCode email
                let base64qrcode = await helpers.makeQrCodeEmail(hotelId, booking);
                //save update roomstay to the pms
                await helpers.postReservations(hotelId, reservationId, roomStay);
            }
        } 
        return res.status(code).send(result);
    } catch (e){
        console.log(e);
       return  res.send(e.message)
    }
}
const getPaymentLink = async (req, res) => {
  
    const { hotelId, reservationId } = req?.params ;
    try{
        const PAYAPIURL = process.env.PAYMENT_API_URL;
        const GETPAYRESULT = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_LINK;
        const hotelInfo = await helpers.getHotelInfo(hotelId) 
        const applicationId = "checkin";
        const hotelName = hotelInfo.hotel_name;
        console.log(hotelInfo)
        const payload = new PaymentLinkRequestBody({ 
            merchantId: hotelName,
            customerId: reservationId, 
            customerName: guestName,
            customerEmail: guestEmail,
            description: `Payment Link request from Enzo Online Precheckin, hotelId :${hotelId}, reservationId : ${reservationId}` ,
            amountTotal: String(amount),  
            languageCode: "en-US",
            currency: currency,
            method: "VISA" ,
            issuerId: "RABOBANK"  
        }) ;
        console.log(payload)
        const payrequest = await axios.post(`${PAYAPIURL}${GETPAYRESULT}`, payload);
        return res.send(payrequest.data);
    }catch(e){
        console.log(e);
       return  res.send(e.message);
    }
}

const postPaymentResult = (req, res) => {


}

/*
const getPaymentResult = async ({ transactionId, hotelId }, db = null ) => {
    try{
        const payApiUrl = process.env.PAYMENT_API_URL;
        const api = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_RESULT;
        const hotelInfo = await helpers.getHotelInfo(hotelId, db); 
        const applicationId = "checkin";
        const hotelName = hotelInfo.hotel_name;
        console.log(hotelInfo)
        const payload = { 
            merchantId: hotelName,
            transactionId: transactionId, 
        } ;
        console.log(payload)
        const payResultRequest = await axios.post(`${payApiUrl}${api}`, payload) ;
        const payResult = new PaymentResult(payResultRequest.data);
        return payResult;
    }catch(e){
        console.log(e);
        throw e;
    }
}


const startPaymentSession = async ({ transactionId, hotelId }) => {
    if (!paymentSessions) paymentSessions = {} ;
    if (paymentSessions[transactionId]) throw new Error('a session with this transaction Id already exist');
    paymentSessions[transactionId] =  {
        startedAt: Date.now(),
        hotelId: hotelId, 
        status: 'CREATED'
    }
    startCheckPayResult();
}

const updatePaymentSession = ({ transactionId, status }) => {
    if (!paymentSessions) throw new Error('no session');
    if (!paymentSessions[transactionId]) throw new Error('no session with this transaction Id exist');
    const session = paymentSessions[transactionId];
    session.updatedAt = Date.now();
    session.status = status;  
    paymentSessions[transactionId] = session;
    if (status === 'PAID') {
        
        //let hasSession = false;
        for (let i in paymentSessions) {
            if (paymentSessions[i].startedAt < (Date.now() - 24 * 60 * 60 * 1000)) { 
                delete paymentSessions[i] ;
                continue;
            }
            if (paymentSessions[i].status === 'CREATED' && paymentSessions[i].startedAt > new Date().setHours(0,0,0,0)) { 
                hasSession = true; 
                break;
            }
        }
       // if (!hasSession) stopCheckPayResult();
    }
}*/
//set the getPaymentResultIntervalCheckId variable, to start the payment session result lookup process
//const startCheckPayResult = () => {
//    if (!paymentResultCheckIntervalId) paymentResultCheckIntervalId = setInterval(getPaymentsResult, SETTINGS.PAYMENT_RESULT_LOOKUP_INTERVAL * 1000);
//   console.log('check payment result Interval ID ', paymentResultCheckIntervalId);
//}
//
////unset the intervalCheckID to stop the the email error lookup and resend process
//const stopCheckPayResult = () => {
//if (paymentResultCheckIntervalId) clearInterval(paymentResultCheckIntervalId);
//    console.log('no payment sessions: clear check payment result Interval ID ', paymentResultCheckIntervalId);
//    paymentResultCheckIntervalId = null;
//}
module.exports = {
    
    getPaymentResultById,
    getPaymentLinkFromToken,
    getPaymentLink,
    postPaymentResult

}
