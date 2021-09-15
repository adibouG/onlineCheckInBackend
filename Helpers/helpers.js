const { Database } = require('../Models/Database.js');
const Enzo = require('../Models/Enzo.js');
const { PmsModuleApi } = require('../Models/pmsModuleApi.js');
const { findValidBooking, resetBookingDate } = require('../Utilities/utilities.js');
const Models = require('../Models/errors.js');


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getReservations = async (hotelId = null, reservationId = null, conf = null, hotelPms = null ) => { 
    console.log(`Start helper process: get hotel ${hotelId} Reservations....` , reservationId);
    try{
        const results = [];
        //Call the db to get the list of hotel clients and their pmsData
        const pmsApi =  conf && ( conf instanceof PmsModuleApi) ? conf : new PmsModuleApi(); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        const db = conf && ( conf instanceof Database) ? conf : new Database();
        const pms = hotelPms || await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        //get the reservations per hotel 
        console.log(pms)
        if (Array.isArray(pms) && pms.length) {
            //loop through hotel result
            for (let h of pms) {    
                if (hotelId && h.hotel_id != hotelId) { continue; }
                
                const requestResult = await pmsApi.getReservationData({ 
                    reservationId,
                    pmsId: h.pms_id, 
                    pmsUrl: h.pms_url, 
                    pmsUser: h.pms_user, 
                    pmsPwd: h.pms_pwd 
                });
                //we receive an array of enzoReservations data 
                //we add the hotelId to the reservation 
                if  (reservationId) {
                    const er = new Enzo.EnzoReservation(requestResult);
                    er.hotelId = h.hotel_id;
                    results.push(er);
                } else {
                    requestResult.map((r) => {
                        const er = new Enzo.EnzoReservation(r);
                        er.hotelId = h.hotel_id;
                        results.push(er);
                    });
                }
            }
        } else {
            const requestResult = await pmsApi.getReservationData({ 
                reservationId,
                pmsId: pms.pms_id, 
                pmsUrl: pms.pms_url, 
                pmsUser: pms.pms_user, 
                pmsPwd: pms.pms_pwd 
            });
            //we receive an array of enzoReservations data 
            //we add the hotelId to the reservation 
            if  (reservationId)  {
                const er = new Enzo.EnzoReservation(requestResult);
                er.hotelId = pms.hotel_id;
                results.push(er);
            } else {
                requestResult.map((r) => {
                    const er = new Enzo.EnzoReservation(r);
                    er.hotelId = pms.hotel_id;
                    results.push(er);
                });
            }
        }
        
        return results;
    } catch(e) {
        console.error(e);
        throw e;
    }
}


const postReservations = async (hotelId, reservationId, data) => { 
    console.log("Start helper process: postReservations....");
    try{        //Call the db to get the pmsData
        const db = new Database(hotelId);
        const hotelPms = await db.getHotelPmsInfo(hotelId); //retrieve the hotel  pms info
        const pmsApi = new PmsModuleApi(hotelId); //we make a hotel specific
        await pmsApi.updateReservationData({ 
            data,
            reservationId: reservationId,  
            pmsId: hotelPms.pms_id,
            pmsUrl: hotelPms.pms_url,
            pmsUser: hotelPms.pms_user,  
            pmsPwd: hotelPms.pms_pwd
        });
        return 1;
    } catch(e) {
        console.error(e);
        throw e;
    }
}

const getBookingFromEmail = async (email) => {
    let hotelID = 1; 
    let bookings = []; 
    let validEmail = email.length > 0 || false;
    try {
        if (!email || !validEmail) throw new Models.EnzoError('no email or invalid email');
        let results = await getReservations(hotelID);
        results.map( er  => {
            if (er.roomStays.length && er.roomStays[0].guests.length && er.roomStays[0].guests[0].email === email) bookings.push(er) ;
            else if ( er.booker.email === email) bookings.push(er) ;
        });
        if (!bookings.length) throw new Models.NotFound('no reservation found with this email') ; 
        //try to find a valid reservation
        let booking = findValidBooking(bookings);
        return booking ;
    } catch(e) {
        console.log(e);
        throw e;
    } 
}

const resetBookingStatus = async (email = null, reservationId = null) => {
    try {
        const hotelId = 1; 
        const db = new Database(hotelId);
        const pms = await db.getHotelPmsInfo(hotelId);  
        if (reservationId || email) {
            let newBook;
            if (reservationId) {
                let bookings = await getReservations(hotelId, reservationId, db, pms);
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
            console.log('Reset : bookings => ', bookings)
            for (let b of bookings) {
                let r = await getReservations(hotelId, b.pmsId, db, pms);
                let newBook = resetBookingDate(r[0]) ;
                console.log('Reset ', b , newBook, db, pms);
                await postReservations(hotelId, newBook.pmsId, newBook, db, pms); 
                await db.deleteEmailTrackingInfo(newBook.pmsId, hotelId);
            }
        }
        return 1;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const getHotelDetails = async (hotelId = null) => { 
    console.log("Start helper process: get hotel Details....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new Database();
        const hotelDetails = await dbManager.getHotelDetails(hotelId);
        return hotelDetails;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getHotelSettings = async (hotelId = null) => { 
    console.log("Start helper process: get hotel settings....", hotelId);
    try{
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new Database(hotelId);
        const hotelScreenSettings = await dbManager.getHotelScreenSettings(hotelId); //retrieve all the hotels with their pms info
        const hotelStyleSettings = await dbManager.getHotelStyleSettings(hotelId); //retrieve all the hotels with their pms info
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
        const dbManager = db || new Database(hotelId);
        const mailTracking = await dbManager.getEmailTrackingInfo(hotelId, reservationId, type); //retrieve all the hotels with their pms info
        return mailTracking;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const addOrUpdateEmailTracking = async (emailTracking) => { 
    console.log("Start helper process: addOrUpdateEmailTracking....");
    try{
        //Call the db to get the email tracking
        const dbManager = new Database(emailTracking.hotelID);
        const emailInfo = await dbManager.getEmailInfo(emailTracking.messageID);
        if (emailInfo.length) await dbManager.updateEmailTrackingInfo(emailTracking);
        else await dbManager.addEmailTrackingInfo(emailTracking);
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


const deleteEmailTracking = async (hotelId = null, reservationId = null) => { 
    console.log("Start helper process: deleteEmailTracking....");
    try{
        //Call the db to get the email tracking
        const dbManager = new Database(hotelId);
        await dbManager.deleteEmailTrackingInfo(hotelId, reservationId); //retrieve all the hotels with their pms info
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const getHotelStays = async (hotelId, startDate, endDate) => { 
    console.log("Start helper process: get hotel Stays....");
    try{
        //Call the db to get the list of hotel clients and their pmsData
        const db = new Database(hotelId);
        const hotelPmsAccess = await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the hotel data from the pmsAPI
        /*const hotelData = await pmsApi.getHotelData({ 
                    pmsId:  hotelPmsAccess.pms_id,
                    pmsUrl:  hotelPmsAccess.pms_url, 
                    pmsUser:  hotelPmsAccess.pms_user,
                    pmsPwd:  hotelPmsAccess.pms_pwd,
                    startDate, 
                    endDate  
                });
        */
        const hotelDetails = await db.getHotelDetails(hotelId);
        const hotel = new Enzo.EnzoHotel({ 
            hotelId: hotelId, 
            name: hotelPmsAccess.hotel_name, 
            phone: hotelDetails.phone,
            email: hotelDetails.email, 
            website: hotelDetails.website,
            address: hotelDetails.address, 
            logo: hotelDetails.logo, 
            images: [ hotelDetails.image ], 
            checkInTime: hotelDetails.checkInTime, 
            checkOutTime: hotelDetails.checkOutTime 
        });
        const hotelStay = new Enzo.EnzoHotelStay({ hotel });
        return hotelStay;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}


module.exports = {
    getReservations,
    postReservations,
    resetBookingStatus,
    getBookingFromEmail,
    getHotelSettings,
    getHotelDetails,
    getEmailTracking,
    addOrUpdateEmailTracking,
    deleteEmailTracking,
    getHotelStays 

}