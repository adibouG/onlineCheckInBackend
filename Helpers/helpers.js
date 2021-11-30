require('dotenv').config();
const { Database } = require('../Models/database.js');
const { PmsModuleApi } = require('../Models/pmsModuleApi.js');
const { findValidBooking, resetBookingDate } = require('../Utilities/utilities.js');
const Errors = require('../Models/errors.js');
const Models = require('../Models/index.js');
const {PaymentResult} = require('../Models/EnzoPayApi.js');
const Enzo = require('../Models/Enzo.js');

const axios = require('axios');
const SETTINGS = require('../settings.json');


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getReservations = async (hotelId = null, reservationId = null, conf = null, hotelPms = null) => { 
    console.log(`Start helper process: get hotel ${hotelId} Reservations ${reservationId}`);
    try{
        const results = [];                       
        //Call the db to get the list of hotel clients and their pmsData
        const pmsApi =  conf && ( conf instanceof PmsModuleApi) ? conf : new PmsModuleApi(); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        const db = conf && ( conf instanceof Database) ? conf : new Database();
        let pms = hotelPms && ( hotelPms instanceof Models.HotelPmsSettings) ? hotelPms : await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        //get the reservations per hotel 
        if (!Array.isArray(pms)) { pms = [pms]; }
        //loop through hotel result

        for (let row of pms) {    
            if (hotelId && row.hotelId != hotelId) { continue; }
           
            const reservationsRequest = await pmsApi.getReservationData({ 
                    reservationId, //can be null if we look for all the reservations from the hotel pms
                    pmsId: row.pmsId, 
                    pmsUrl: row.pmsUrl, 
                    pmsUser: row.pmsUser, 
                    pmsPwd: row.pmsPwd 
                });
        
            //we receive an array of enzoReservations data 
            //we add the hotelId to the reservation 
            console.log(reservationsRequest);
            if  (reservationId && reservationsRequest.pmsId) {
                const er = new Enzo.EnzoReservation(reservationsRequest);
                er.hotelId = row.hotelId;
                results.push(er);
            } else if (Array.isArray(reservationsRequest)) {
                reservationsRequest.map((r) => {
                    const er = new Enzo.EnzoReservation(r);
                    er.hotelId = row.hotelId;;
                    results.push(er);
                });
            }
        }
        return results;
            
    } catch(e) {
        console.error(e);
        throw e;
    }
};

const getReservationsHotelStay = async (hotelId = null, reservationId = null, conf = null, hotelPms = null) => { 
    console.log(`Start helper process: get hotel ${hotelId} Reservations ${reservationId}`);
    try{
                              
        //Call the db to get the list of hotel clients and their pmsData
        const pmsApi =  conf && ( conf instanceof PmsModuleApi) ? conf : new PmsModuleApi(); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        const db = conf && ( conf instanceof Database) ? conf : new Database();
        let pms = hotelPms && ( hotelPms instanceof Models.HotelPmsSettings) ? hotelPms : await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        //get the reservations per hotel 
        if (Array.isArray(pms)) { pms = pms[0]; }
        //loop through hotel result
        const reservationsRequest = await pmsApi.getReservationHotelStay({ 
                    reservationId, //can be null if we look for all the reservations from the hotel pms
                    pmsId: pms.pmsId, 
                    pmsUrl: pms.pmsUrl, 
                    pmsUser: pms.pmsUser, 
                    pmsPwd: pms.pmsPwd 
                });
        
            //we receive an array of enzoReservations data 
            //we add the hotelId to the reservation 
        console.log(reservationsRequest);
        return  new Enzo.EnzoHotelStay(reservationsRequest);            
    } catch(e) {
        console.error(e);
        throw e;
    }
};


const postReservations = async (hotelId, reservationId, data, db = null, pms = null) => { 
    console.log("Start helper process: postReservations....");
    try{        //Call the db to get the pmsData
       
        db = db || new Database(hotelId);
        pms =  pms || await db.getHotelPmsInfo(hotelId); 
  
       //retrieve the hotel  pms info 
        const pmsApi = new PmsModuleApi(hotelId); //we make a hotel specific
        
        await pmsApi.updateReservationData({ 
            data,
            reservationId,  
            pmsId: pms.pmsId,
            pmsUrl: pms.pmsUrl,
            pmsUser: pms.pmsUser,  
            pmsPwd: pms.pmsPwd
        });
        console.log("End helper process: postReservations....");
 
        return ;
    } catch(e) {
        console.error(e);
        throw e;
    }
};

const getBookingFromEmail = async (email) => {
    let hotelId = 1; 
    let bookings = []; 
    let validEmail = email.length > 0 || false;
    try {
        if (!email || !validEmail) throw new Errors.EnzoError('no email or invalid email');
        let results = await getReservations(hotelId);
        results.map( er  => {
            if (er.roomStays.length && er.roomStays[0].guests.length && er.roomStays[0].guests[0].email === email) bookings.push(er) ;
            else if ( er.booker.email === email) bookings.push(er) ;
        });
        if (!bookings.length) throw new Errors.NotFound('no reservation found with this email') ; 
        //try to find a valid reservation
        let booking = findValidBooking(bookings);
        return booking ;
    } catch(e) {
        console.log(e);
        throw e;
    } 
};

const resetBookingStatus = async (email = null, reservationId = null, db = null) => {
    try {
        const hotelId = 1; //we reset the demo reservation thus the hotelId is known (for now at least) and this is hotel id 1
        db = db || new Database(hotelId);
        const pms = await db.getHotelPmsInfo(hotelId);        
        if (reservationId || email) {
            let newBook;
            if (reservationId) {
                let bookings = await getReservations(hotelId, reservationId, db, hpmspms);
                newBook = resetBookingDate(bookings[0]);   
            } 
            if (email){
                let booking = await getBookingFromEmail(email);
                newBook = resetBookingDate(booking);
            }
            await postReservations(hotelId, newBook.pmsId, newBook); 
            await db.deleteEmailTrackingInfo(newBook.reservationId, hotelId);
        } else {
            let bookings = await getReservations(hotelId, null, db, pms);
            console.log('Reset : bookings => ', bookings);
            //const toUpdate = [];
            for (let b of bookings) {
                let r = await getReservations(hotelId, b.pmsId, db, pms);
                let newBook = resetBookingDate(r[0]) ;
                console.log('Reset ', b.pmsId, newBook);
                await postReservations(hotelId, b.pmsId, newBook, db, pms) 
                await db.deleteEmailTrackingInfo(b.pmsId, hotelId)
            }
            console.log('Reset : %s bookings ', bookings.length);
        }
        return ;
    } catch(e) {
        console.log(e);
        throw e;
    }
};

const getHotelDetails = async (hotelId = null, db = null) => { 
    console.log("Start helper process: get hotel Details....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        const hotelDetails = await db.getHotelDetails(hotelId);
        return hotelDetails;
    } catch (e) {
        console.log(e);
        throw e;
    } 
};


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getHotelSettings = async (hotelId = null, db = null) => { 
    console.log("Start helper process: get hotel settings....", hotelId);
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        const hotelScreenSettings = await db.getHotelScreenSettings(hotelId); //retrieve all the hotels with their pms info
        const hotelStyleSettings = await db.getHotelStyleSettings(hotelId); //retrieve all the hotels with their pms info
        return { screens: hotelScreenSettings, styles: hotelStyleSettings };
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const getEmailTracking = async (hotelId = null, reservationId = null, type = null, db = null) => { 
    console.log("Start helper process: get Email Tracking....");
    try{
        //Call the db to get the email tracking
        db = db || new Database(hotelId);
        const mailTracking = await db.getEmailTrackingInfo(hotelId, reservationId, type); //retrieve all the hotels with their pms info
        return mailTracking;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const addOrUpdateEmailTracking = async (emailTracking, db = null) => { 
    console.log("Start helper process: addOrUpdateEmailTracking....");
    try{
        //Call the db to get the email tracking
        db = db || new Database(emailTracking.hotelId);
        const emailInfo = await db.getEmailInfo(emailTracking.messageId);
        if (emailInfo.length) await db.updateEmailTrackingInfo(emailTracking);
        else await db.addEmailTrackingInfo(emailTracking);
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const deleteEmailTracking = async (hotelId = null, reservationId = null, db = null) => { 
    console.log("Start helper process: deleteEmailTracking....");
    try{
        //Call the db to get the email tracking
        db = db || new Database(hotelId);
        await db.deleteEmailTrackingInfo(hotelId, reservationId); //retrieve all the hotels with their pms info
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const getHotelInfo = async (hotelId, db = null) => { 
    console.log("Start helper process: get hotel info....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        const hotelInfo = await db.getHotels({ hotelId }); //retrieve all the hotels with their pms info
        return hotelInfo[0];
    } catch (e) {
        console.log(e);
        throw e;
    } 
}



const getHotelPmsInfo = async (hotelId, startDate, endDate, db = null) => { 
    console.log("Start helper process: get hotel Stays....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);        //get the hotel data from the pmsAPI
        const hotel = await db.getHotelDetails(hotelId);
        return new Enzo.EnzoHotelStay({ hotel });
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const getHotelOffers = async (hotelId, startDate, endDate, db = null, pmsAccess = null, pmsApi = null) => { 
    console.log("Start helper process: get hotel Stays....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        pmsAccess = pmsAccess || await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        pmsApi = pmsApi || new PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the hotel data from the pmsAPI
        const hotelOffers = await pmsApi.getHotelOffers({ 
                    pmsId:  pmsAccess.pmsId,
                    pmsUrl:  pmsAccess.pmsUrl, 
                    pmsUser:  pmsAccess.pmsUser,
                    pmsPwd:  pmsAccess.pmsPwd,
                    startDate, 
                    endDate  
                });
        return new Enzo.EnzoHotelStay(hotelOffers);
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const getHotelAvailabilities = async (hotelId, startDate, endDate, db = null) => { 
    console.log("Start helper process: get hotel Stays....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        //get the hotel data from the pmsAPI
        const hotel = await db.getHotelDetails(hotelId);
        return new Enzo.EnzoHotelStay({ hotel });
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const getPaymentResult = async ({ transactionId, hotelId }, db = null ) => {
    try{
        const payApiUrl = process.env.PAYMENT_API_URL;
        const api = SETTINGS.PAYMENT_ENDPOINT.GET_PAYMENT_RESULT;
        const hotelInfo = await getHotelInfo(hotelId, db); 
        const applicationId = "checkin";
        const hotelName = hotelInfo.name;
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

const getPaymentSession = async (hotelId, reservationId, transactionId = null, db = null) => { 
    console.log("Start helper process: get pay  sessions....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(hotelId);
        //get the hotel data from the pmsAPI
        const sessions = await db.getPaymentSession({ hotelId, reservationId, transactionId });
        return sessions.map(session => new Models.PaymentSession({
            reservationId: session.reservation_id,
            hotelId: session.hotel_id,
            transactionId: session.transaction_id,
            startedAt: new Date(session.started_at).getTime(),
            updatedAt: session.updated_at ? new Date(session.updated_at).getTime() : null ,
            status: session.status
        })
    );
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const addPaymentSession = async (data, db = null) => { 
    console.log("Start helper process: get pay  sessions....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(data.hotelId);
        //get the hotel data from the pmsAPI
        await db.addPaymentSession(data);
        return 
    } catch (e) {
        console.log(e);
        throw e;
    } 
}
const updatePaymentSession = async (data, db = null) => { 
    console.log("Start helper process: get pay  sessions....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        db = db || new Database(data.hotelId);
        //get the hotel data from the pmsAPI
        await db.updatePaymentSession(data);
        return 
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const makeQrCodeEmail = async (hotelId, booking) =>{

if (!booking.length) throw new Models.NotFound() ;

roomStay = booking.roomStays[0];

if (roomStay) booking =  new Enzo.EnzoRoomStay(roomStay);
if (!booking) throw new Models.NotFound() ;
if (!token) throw new Error('no token') ; 
//TO DO  verification on token  
let firstName = roomStay.guests.length && roomStay.guests[0].firstName ? roomStays.guests[0].firstName : reservation.booker.firstName;
let lastName = roomStay.guests.length && roomStay.guests[0].lastName ? roomStays.guests[0].lastName : reservation.booker.lastName;

await sendEmail(MAILTYPES.QR, booking, hotelId);
const dataUrl = await makeQrCode(hotelId, booking.pmsId, firstName, lastName);
return dataUrl;
}


const isPaymentDone = async (hotelId, reservationId) => {
    let isDone = false;
    try{
        const paySessions = await getPaymentSession(hotelId, reservationId);
        if (paySessions.length) {
        
            for (let s of paySessions) {
                let sess;
                if (s.status === Models.PaymentSession.PAYMENT_SESSION_STATUS.FINISHED) {
                   sess = s ;
                   const payRes = await getPaymentResult({ transactionId: sess.transactionId, hotelId: sess.hotelId });
                    if (payRes.status === PaymentResult.PAYMENT_RESULTS.PAID) { 
                        isDone = true;
                        break;
                    } 
                }
            }    
        }
        return isDone;
    }catch (e) {
        console.error(e);
        throw e;
    }
}

module.exports = {
    getReservations,
    getReservationsHotelStay,
    postReservations,
    resetBookingStatus,
    getBookingFromEmail,
    getHotelSettings,
    getHotelDetails,
    getEmailTracking,
    addOrUpdateEmailTracking,
    deleteEmailTracking,
    getHotelInfo,
    getHotelPmsInfo,
    getHotelOffers ,
    getHotelAvailabilities,
    isPaymentDone,
    getPaymentResult,
    getPaymentSession,
    addPaymentSession,
    updatePaymentSession,
    makeQrCodeEmail
}