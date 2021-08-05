const { HotelPmsDB } = require('../Models/database.js');
const Enzo = require('../Models/enzoBooking.js');
const PmsApi = require('../Models/pmsModuleApi.js');
const { findValidBooking, resetBookingDate } = require('../Utilities/utilities.js')
const Models = require('../Models/errors.js')

//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getReservations = async (hotelId = null, reservationId = null) => { 
    console.log("Start helper process: getReservations....");
    try{
        let result = null;
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new HotelPmsDB(hotelId);
        const hotelWithPmsAccessList = await dbManager.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsApi.PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the reservations per hotel Ids
        for (let i = 0; i < hotelWithPmsAccessList.length; ++i) {    
            let hotel = hotelWithPmsAccessList[i]; 
            console.log(hotel.id) 
            if (!result) result = {};
            if (!result[hotel.id]) result[hotel.id] = {};
            result[hotel.id] = await pmsApi.getReservationData({ reservationId: reservationId,  hotelId: hotel.id, pmsId: hotel.pms, pmsUrl: hotel.pmsUrl, pmsLogin: hotel.pmsLogin,  pmsPwd: hotel.pmsPwd });
            result[hotel.id].reservations.map((r, idx) => {
                r.hotelId = hotel.id;
                r.pmsId = hotel.id;
                let e = new Enzo.EnzoStay(r);
                result[hotel.id].reservations[idx] = e;
            });
        }
        return result;
    } catch(e) {
        console.error(e);
        throw e;
    }
}


const postReservations = async (hotelId, reservationId, data) => { 
    console.log("Start helper process: postReservations....");
    try{
        let result = {};
        //Call the db to get the pmsData
        const dbManager = new HotelPmsDB(hotelId);
        const hotelWithPmsAccessList = await dbManager.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsApi.PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the reservations per hotel Ids
        for (let i = 0; i < hotelWithPmsAccessList.length; ++i) {     
            let hotel = hotelWithPmsAccessList[i]; 
            result = await pmsApi.updateReservationData({ data, reservationId: reservationId,  hotelId: hotel.id, pmsId: hotel.pms, pmsUrl: hotel.url, pmsLogin: hotel.login,  pmsPwd: hotel.pwd });
        }
        return result;
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
        let track = new HotelPmsDB(); 
        let hotelID = 1; 
        if (reservationID || email) {
            let newBook;
            if (reservationID) {
                let bookings = await getReservations(hotelID, reservationID);
                newBook = resetBookingDate(bookings[hotelID].reservations[0]);   
            } else {
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


module.exports = {
    getReservations,
    postReservations,
    resetBookingStatus,
    getBookingFromEmail
}