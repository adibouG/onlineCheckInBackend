require('dotenv').config();
const { PaymentLinkRequestBody, PaymentResult } = require('../Models/EnzoPayApi.js');
const helpers = require('../Helpers/helpers.js');
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const Errors = require('../Models/errors.js');
const { verifyToken } = require('../Utilities/utilities.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SETTINGS = require('../settings.json');
const {winstonLogger} = require('../Logger/loggers.js');



const IDEALBANKCODES = {
            "ABN Amro": "ABNANL2A",
            "ASN Bank": "ASNBNL21",
            "Bunq": "BUNQNL2A",
            "ING": "INGBNL2A",
            "Knab": "KNABNL2H",
            "Rabobank": "RABONL2U",
            "RegioBank": "RBRBNL21",
            "SNS": "SNSBNL2A",
            "Triodos Bank": "TRIONL2U",
            "Van Lanschot": "FVLBNL22"
        }
    

const getPaymentLinkFromToken = async (req, res) => {
  
    const { authorization } = req?.headers ;
    const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
    const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
    winstonLogger.info('received token :' + token);
    try{

        if (!token) throw new Errors.EnzoError('no token');
        const { issuerId, method, language, currency } = req?.body
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        const booking = await helpers.getReservations(hotelId, reservationId);
        const hotelInfo = await helpers.getHotelInfo(hotelId) ;
        
        if (!booking.length) throw new Errors.NotFound() ;        
        const roomStay = booking[0].roomStays[0];
        const hotelStay = await helpers.getHotelOffers(hotelId, roomStay.expectedArrival, roomStay.expectedDeparture);
        //token was signed using the reservation state in order to make it only 1 time use 
        verifyToken(token, roomStay); 
        const folioToPay = roomStay.folios.reduce((t, f) => {
            if (f.type === Enzo.EnzoFolio.FOLIO_TYPES.GUEST && f.remainingToPay > 0) 
            { 
                return f.remainingToPay + t;
            }
        } , 0 );   
        //check amuount match against folio account
        /// if (folioToPay != amount) throw new Error('amount not correct with the folio total')   
        
        //check if a session already exist and in process 
        let hasSession = false;
        const sessions = await helpers.getPaymentSession(hotelId, reservationId);
        if (sessions.length) {
            for (let s of sessions) {
                if (s.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.STARTED) {
                    hasSession = true;
                    return res.status(401).send({ message: 'payment processing', transactionId : s.transactionId });
                }
            }
        }
        const guestName = roomStay.guests[0].fullName ;
        const guestEmail = roomStay.guests[0].email;
        const amount = folioToPay;
        const cur =  currency || hotelStay.commonParameters.currency;
        const lang = language || hotelStay.commonParameters.language;
        const PAYAPIURL = process.env.PAYMENT_API_URL;
        const GETPAYMENTLINK = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_LINK;
        const applicationId = "onlinecheckin";
        const hotelName = hotelInfo.name;
        const merchant = hotelInfo.merchantId;

       //if (method && method.toUpperCase() === "IDEAL") {
       //    bank = IDEALBANKCODES[issuerId];
       //}
        
        const payload = new PaymentLinkRequestBody({ 
            merchantId: merchant || hotelName,
            customerId: reservationId, 
            customerName: guestName,
            customerEmail: guestEmail,
            description: `Payment Link for Enzo Online Precheckin, hotelId :${hotelId}, reservationId : ${reservationId}` ,
            amountTotal: String(amount),  
            languageCode: lang || "en-US",
            currency: cur || "EUR",
            method: method , 
            issuerId: method.toUpperCase()  === "IDEAL" ? issuerId : null 
        }) ;
        console.log(payload)
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
        if (!paySessions.length) throw new Errors.EnzoError('no started payment session found')
        const paySession = paySessions[0];
        if (paySession.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.FINISHED) { throw new Errors.EnzoError('payment session  found but finished')}
        if (paySession.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.CREATED) {
            paySession.status = Models.PaymentSession.PAYMENT_SESSION_STATUS.STARTED;
            paySession.updatedAt = Date.now() ;
        }
        const result = await helpers.getPaymentResult({ transactionId, hotelId });
        let code ;
        let paymentEnded = false ;
        let paymentSuccess = false ;
        if (result.status.toUpperCase() === PaymentResult.PAYMENT_RESULTS.PAID) {
            if ((Date.now() - result.updated.getTime()) <= (SETTINGS.PAID_TRANSACTION_EXPIR * 60 * 1000)) paymentSuccess = true;
            
            paymentEnded = true ;
            code = 200;
            
        } else if (result.status.toUpperCase() ===  PaymentResult.PAYMENT_RESULTS.CREATED) {
            code = 200;
        } else if (result.status.toUpperCase() ===  PaymentResult.PAYMENT_RESULTS.DECLINED || result.status.toUpperCase() ===  PaymentResult.PAYMENT_RESULTS.ABORTED || result.status.toUpperCase() ===  PaymentResult.PAYMENT_RESULTS.EXPIRED || result.status.toUpperCase() ===  PaymentResult.PAYMENT_RESULTS.FAILED) {
            code = 400; 
            paymentEnded = true ;
        } else {
            code = 500;
            paymentEnded = true ;
        }
        if (paymentEnded) {
            paySession.status = Models.PaymentSession.PAYMENT_SESSION_STATUS.FINISHED;
            paySession.updatedAt = Date.now() ;
            if (paymentSuccess) {
           
                //get and update the reservation  
                const bookings = await helpers.getReservations(hotelId, reservationId);
                const booking = bookings[0];
                const roomStay = booking.roomStays[0];
                let guestFolioIndex = 0;
                const guestFolio = roomStay.folios.find((f,i) => {
                    if (f.type === Enzo.EnzoFolio.FOLIO_TYPES.GUEST) { 
                        guestFolioIndex = i;
                        return f;
                    }
                });
                guestFolio.addFolioItem(
                    new Enzo.EnzoFolioItem({ 
                        name: new Enzo.LocalText({ "en": "PayByLink Payment" }), 
                        type: Enzo.EnzoFolioItem.FOLIO_ITEM_TYPES.PAYMENT , 
                        totalAmount: Number(result.amountPaid), 
                        unitAmount: Number(result.amountPaid), 
                        numberOfUnits: 1, 
                        dateTime: Date.now()
                    })
                    );
                    roomStay.folios.splice(guestFolioIndex, 1, guestFolio);
                    roomStay.status = Enzo.EnzoRoomStay.STAY_STATUS.PRECHECKEDIN;
                    booking.roomStays = [roomStay];
               //     await helpers.makeQrCodeEmail(hotelId, booking);
                    //trigger the qrCode email
                    //save update roomstay to the pms
                    await helpers.postReservations(hotelId, reservationId, roomStay);
                }
                await helpers.updatePaymentSession(paySession);
            } 
        return res.status(code).send(result);
    } catch (e){
        console.log(e);
       return  res.status(parseInt(e.code) || 500).send(e.message)
    }
}
const getPaymentLink = async (req, res) => {
  
    const { hotelId, reservationId } = req?.params ;
    try{
        const PAYAPIURL = process.env.PAYMENT_API_URL;
        const GETPAYRESULT = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_LINK;
        const hotelInfo = await helpers.getHotelInfo(hotelId) 
        const applicationId = "checkin";
        const hotelName = hotelInfo.name;
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
