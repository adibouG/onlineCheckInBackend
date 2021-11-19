const { Database } = require('../Models/database.js');
const Enzo = require('../Models/Enzo.js');
const { PmsModuleApi } = require('../Models/pmsModuleApi.js');
const { findValidBooking, resetBookingDate } = require('../Utilities/utilities.js');
const Errors = require('../Models/errors.js');
const Models = require('../Models/index.js');


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
            if (!(row instanceof Models.HotelPmsSettings)) {
                row = new Models.HotelPmsSettings({
                    hotelId: row.hotel_id, 
                    pmsId: row.pms_id, 
                    pmsUrl: row.pms_url,
                    pmsName: row.pms_name, 
                    pmsUser: row.pms_user, 
                    pmsPwd: row.pms_pwd
                });
            }          
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
            if  (reservationId) {
                const er = new Enzo.EnzoReservation(reservationsRequest);
                er.hotelId = row.hotelId;
                results.push(er);
            } else {
                reservationsRequest.map((r) => {
                    const er = new Enzo.EnzoReservation(r);
                    er.hotelId = row.hotelId;
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
        db = db || new Database(hotelId);
        const hotelPms = await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the hotel data from the pmsAPI
        
        //const hotelData = await pmsApi.getHotelData({ 
        //            pmsId:  hotelPms.pms_id,
        //            pmsUrl:  hotelPms.pms_url, 
        //            pmsUser:  hotelPms.pms_user,
        //            pmsPwd:  hotelPms.pms_pwd,
        //            startDate, 
        //            endDate  
        //        });
        //
        const hotel = await db.getHotelDetails(hotelId);
        // const hotel = new Enzo.EnzoHotel({ 
        //     hotelId: hotelId, 
        //     name: hotelDetails.hotel_name, 
        //     phone: hotelDetails.phone,
        //     email: hotelDetails.email, 
        //     website: hotelDetails.website,
        //     address: hotelDetails.address, 
        //     logo: hotelDetails.logo, 
        //     images: [ hotelDetails.image ], 
        //     checkInTime: hotelDetails.checkInTime, 
        //     checkOutTime: hotelDetails.checkOutTime 
        // });
        const hotelStay = new Enzo.EnzoHotelStay({ hotel });
        return hotelStay;
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
        const hotelPms = await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the hotel data from the pmsAPI
        
        //const hotelData = await pmsApi.getHotelData({ 
        //            pmsId:  hotelPms.pms_id,
        //            pmsUrl:  hotelPms.pms_url, 
        //            pmsUser:  hotelPms.pms_user,
        //            pmsPwd:  hotelPms.pms_pwd,
        //            startDate, 
        //            endDate  
        //        });
        //
        const hotel = await db.getHotelDetails(hotelId);
        // const hotel = new Enzo.EnzoHotel({ 
        //     hotelId: hotelId, 
        //     name: hotelPms.hotel_name, 
        //     phone: hotelDetails.phone,
        //     email: hotelDetails.email, 
        //     website: hotelDetails.website,
        //     address: hotelDetails.address, 
        //     logo: hotelDetails.logo, 
        //     images: [ hotelDetails.image ], 
        //     checkInTime: hotelDetails.checkInTime, 
        //     checkOutTime: hotelDetails.checkOutTime 
        // });
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
    getHotelInfo,
    getHotelPmsInfo,
    getHotelOffers ,
    getHotelAvailabilities
}