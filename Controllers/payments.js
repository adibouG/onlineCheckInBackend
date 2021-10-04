require('dotenv').config();
const PaymentLinkRequestBody = require('../Models/EnzoPayApi.js');
const helpers = require('../Helpers/helpers.js');
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
    if (!token) throw new Errors.EnzoError('no token');
    //get data and verify the token
    //TODO make a token verification function security check : algo, sign, iss ...
    const decoded = jwt.decode(token); 
    const { uuid, hotelId, reservationId, email, steps } = decoded;
  
    /*
    const booking = await helpers.getReservations(hotelId, reservationId);
    const roomStay = booking[0].roomStays[0];
    if (!booking.length) throw new Errors.NotFound() ;        
    //token was signed using the reservation state in order to make it only 1 time use 
    verifyToken(token, roomStay); 
    */

    
    const { guestName, language, guestEmail, amount, currency, bank, method } = req?.body ;
   
    try{
        const PAYAPIURL = process.env.PAYMENT_API_URL;
        const GETPAYRESULT = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_LINK;
        const hotelInfo = await helpers.getHotelInfo(hotelId) ;
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
        const payrequest = await axios.post(`${PAYAPIURL}${GETPAYRESULT}`, payload) ;
        //add payment session 
        const transactionId = payrequest.data.transactionId;

        //if (!paymentSessions) paymentSessions = {};
        //if (paymentSessions[transactionId]) return res.status(400).send({ 
        //    message: "payment already processing",
        //    data: paymentSessions[transactionId]  
        //});
        //if (!paymentSessions[transactionId]) startPaymentSession({ transactionId, hotelId }) ;
    
        res.send(payrequest.data);
    }catch(e){
        console.log(e);
        res.send(e.message);
    }
}



const getPaymentResultById = async (req, res) => {
    const { transactionId } = req?.query ; 
    const { authorization } = req?.headers ;
    const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
    const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
    winstonLogger.info('received token :' + token);
    if (!token) throw new Errors.EnzoError('no token');
    //get data and verify the token
    //TODO make a token verification function security check : algo, sign, iss ...
    const decoded = jwt.decode(token); 
    const { uuid, hotelId, reservationId, email, steps } = decoded;
    const result = await getPaymentResult({ transactionId, hotelId });
    if (result.status.toUpperCase() === 'PAID') {
        return res.status(200).send(result);
    }
    else if (result.status.toUpperCase() === 'CREATED') {
        return res.status(200).send(result);
    }
    else if (result.status.toUpperCase() === 'DECLINED') {
        return res.status(400).send(result);
    }
    else if (result.status.toUpperCase() === 'ABORTED') {
        return res.status(400).send(result);
    }
    else if (result.status.toUpperCase() === 'EXPIRED') {
        return res.status(400).send(result);
    }
    else if (result.status.toUpperCase() === 'FAILED') {
        return res.status(400).send(result);
    }
    else return res.status(400).send(result)
}
const getPaymentLink = async (req, res) => {
  
    const { hotelId, reservationId } = req?.params ;
    const { guestName, guestEmail, language, amount, currency, bank, method } = req?.query ;
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
        res.send(payrequest.data);
    }catch(e){
        console.log(e);
        res.send(e.message);
    }
}

const postPaymentResult = (req, res) => {


}

class PaymentResult {
    constructor({ 
            transactionId = null,
            merchantId = null,
            status = null, 
            amountPaid = null, 
            currency = null, 
            method = null, 
            issuerId = null, 
            providerId = null, 
            cardNumber = null 
    	} = {}) 
    {
        this.transactionId = transactionId;
        this.merchantId = merchantId;
        this.status = status;
        this.amountPaid = amountPaid;
        this.currency = currency;
        this.method = method;
        this.issuerId = issuerId;
        this.providerId = providerId;
        this.cardNumber = cardNumber;
    }
    //get status() { return this.status.toUpperCase(); }
    
}

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
/*
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
    getPaymentResult,
    getPaymentResultById,
    getPaymentLinkFromToken,
    getPaymentLink,
    postPaymentResult,
    getPaymentResult

}
