const { Database } = require('../Models/Database.js');
const Enzo = require('../Models/Enzo.js');
const { PmsModuleApi } = require('../Models/pmsModuleApi.js');
const { findValidBooking, resetBookingDate } = require('../Utilities/utilities.js')
const Models = require('../Models/errors.js');
const { request } = require('../app.js');

//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getReservations = async (hotelId = null, reservationId = null) => { 
    console.log(`Start helper process: get hotel ${hotelId} Reservations....` , reservationId);
    try{
        let pmsData;
        const results = [];
        const requests = [];
        //Call the db to get the list of hotel clients and their pmsData
        const db = new Database(hotelId);
        const hotelPms = await db.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        
        //get the reservations per hotel 

        if (hotelId) {
            const requestResult = await pmsApi.getReservationData({ 
                reservationId: reservationId,
                pmsId: hotelPms.pms_id,
                pmsUrl: hotelPms.pms_url,
                pmsUser: hotelPms.pms_user, 
                pmsPwd: hotelPms.pms_pwd 
            });
        
            if (reservationId) {
                const er = new Enzo.EnzoReservation(requestResult); 
                //const stay = new Enzo.EnzoStay({ reservation: er });
                results.push(er);
            } else {
                requestResult.map((r) => {
                    const er = new Enzo.EnzoReservation(r);
                    //const stay = new Enzo.EnzoStay({ reservation: er }) ;
                    results.push(er);
                });
            }
        } else {

            for (let h of hotelPms) {    
           
                console.log('hotel id : ', h.hotel_id);
                const requestResult = await pmsApi.getReservationData({ 
                    reservationId: reservationId,
                    pmsId: h.pms_id, 
                    pmsUrl: h.pms_url, 
                    pmsUser: h.pms_user, 
                    pmsPwd: h.pms_pwd 
                });
               
                //we receive an array of enzoReservations data
                requestResult.map((r) => {
                    const er = new Enzo.EnzoReservation(r);
                    //const stay = new Enzo.EnzoStay({ reservation: er }) ;
                    er.hotelId = h.hotel_id;
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
        const dbManager = new Database(hotelId);
        const hotelWithPmsAccessList = await dbManager.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsApi.PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the reservations per hotel Ids
        for (let i = 0; i < hotelWithPmsAccessList.length; ++i) {     
            let hotel = hotelWithPmsAccessList[i]; 
            await pmsApi.updateReservationData({ 
                data,
                reservationId: reservationId,  
                pmsId: hotel.pms_id,
                pmsUrl: hotel.pms_url,
                pmsLogin: hotel.pms_login,  
                pmsPwd: hotel.pms_pwd
            });
        }
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
        results[hotelID].reservations.forEach((b) => {
            if (b["email"] === email) bookings.push(b) ;
        });
        if (!bookings.length) throw new Models.NotFound('no reservation with this email') ; 
        //try to find a valid reservation
        let booking = findValidBooking(bookings);
        return booking ;
    } catch(e) {
        console.log(e);
        throw e;
    } 
}

const resetBookingStatus = async (email = null, reservationID = null) => {
    try {
        let track = new Database(); 
        let hotelID = 1; 
        if (reservationID || email) {
            let newBook;
            if (reservationID) {
                let bookings = await getReservations(hotelID, reservationID);
                newBook = resetBookingDate(bookings[hotelID].reservations[0]);   
            } 
            if (email){
                let booking = await getBookingFromEmail(email);
                newBook = resetBookingDate(booking);
            }
            await postReservations(hotelID, newBook.reservationId, newBook); 
            await track.deleteEmailTrackingInfo(newBook.reservationId, hotelID);
        } else {
            let bookings = await getReservations(hotelID);
            console.log('Reset : bookings => ', bookings)
            for (let check of bookings[hotelID].reservations) {
                let newBook = resetBookingDate(check) ;
                console.log('Reset ', check, newBook);
                await postReservations(hotelID, newBook.reservationId, newBook); 
                await track.deleteEmailTrackingInfo(newBook.reservationId, hotelID);
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
        const hotelAppSettings = await dbManager.getHotelAppSettings(hotelId); //retrieve all the hotels with their pms info
        return hotelAppSettings;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

const getEmailTracking = async (hotelId = null, reservationId = null, type = null) => { 
    console.log("Start helper process: get Email Tracking....");
    try{
        //Call the db to get the email tracking
        const dbManager = new Database(hotelId);
        const mailTracking = await dbManager.getEmailTrackingInfo(hotelId, reservationId, type); //retrieve all the hotels with their pms info
        let data = mailTracking.length ? mailTracking : null;
        return data;
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
        const pmsApi = new PmsApi.PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the hotel data from the pmsAPI
        const pmsHotelData = await pmsApi.getHotelData({ 
                    pmsId:  hotelPmsAccess.pms_id,
                    pmsUrl:  hotelPmsAccess.pms_url, 
                    pmsUser:  hotelPmsAccess.pms_user,
                    pmsPwd:  hotelPmsAccess.pms_pwd,
                    startDate, 
                    endDate  
                });

        const hotelDetails = await db.getHotelDetails(hotelId);
        const hotelSettings = await db.getHotelAppSettings(hotelId);
     
        const hotel = new Enzo.EnzoHotel({ 
            hotelId: hotelId, 
            name: hotelWithPmsAccessList.hotel_name, 
            phone: hotelDetails.phone,
            email: hotelDetails.email, 
            website: hotelDetails.website,
            address: hotelDetails.address, 
            logo: hotelDetails.logo, 
            images: [ hotelDetails.image ], 
            checkInTime: hotelDetails.checkInTime, 
            checkOutTime: hotelDetails.checkOutTime 
        });
        if (hotelSettings) console.log(hotelSettings)
        //{}.policies && hotelSettings.policies.content){
            
            
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