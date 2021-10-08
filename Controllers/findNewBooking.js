const { Database } = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js');
const Enzo = require('../Models/Enzo.js');
const { renderAndSendEmail } = require('./emails.js');
const { makeEmailValues, newReservationFilter } = require('../Utilities/utilities.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');
const { winstonLogger } = require('../Logger/loggers.js');

//get new reservation, return an array of enzoCheckIn, run at specified interval 
const newReservationFinder = async () => {
    console.log("Start process: newReservationFinder ....");
    try {
        const db = new Database();
        const results = await helpers.getReservations(null, null, db); 
        //Call the db to get the list of hotel clients and their pmsData
        const emailTrackingList = await helpers.getEmailTracking(null, null, null, db);
        //const emailTrackingList = await db.getEmailTrackingInfo();  
         //compare the date if checkIn can be offer take a booking and the param name to check
        // filter reservation for valid precheck dates and status
        // and check the actual trackring status and remove the already tracked ones
        const filteredResults = [];
        results.map( er => {
            if (newReservationFilter(er.roomStays[0], er.hotelId, emailTrackingList)) {
                 filteredResults.push(er);
            }
        });
        //but only if there are actual tracked reservations
        return await newReservationsProcess(filteredResults, db);
    } catch (e) {
        console.log(e);
    }
}

//get the new reservations,
const newReservationsProcess = async (newValidStays, db = null) => {
    console.log("Start process: newValidStays ....");
    let count = 0;
    try {   
        db = db || new Database();
        //we store the hotel data in an object to pavoid requesting the same data multiple time
        const hotels = {};
        for (const er of newValidStays) {
            //get the hotelId to retrieve the hotel details and store it for use with each reservation in this hotel
            if (!hotels[er.hotelId]) {
                const hd = await db.getHotelDetails(er.hotelId);
                hotels[er.hotelId] = new Enzo.EnzoHotel({ 
                    hotelId: hd.hotel_id,  
                    hotel: hd.hotel,
                    name: hd.hotel_name,
                    email: hd.hotel_email, 
                    phone: hd.hotel_phone,
                    address: { 
                        addressLine1: hd.hotel_address,
                        country: hd.hotel_country,
                        postalCode: hd.hotel_postcode, 
                        city: hd.hotel_city 
                    }, 
                    logo: hd.hotel_logo,
                    checkInTime: hd.hotel_checkin_time 
                });
            }
            //get the full  details and send an email for each roomstay of the reservation for  
            //for (let rs of er.roomStays) {
            const stayData = await helpers.getReservations(er.hotelId, er.roomStays[0].pmsId, db);
            if (stayData.length && stayData[0].roomStays.length) {
                    //as we provide a roomStayId as reservationId and hotelId we have only one result a
                let email; 
                // email is sent to 1mary guest if email or to booker
                if (stayData[0].roomStays[0].guests.length && stayData[0].roomStays[0].guests[0].email) email = stayData[0].roomStays[0].guests[0].email ;
                else email = stayData[0].booker.email;
                //update and re-check if reservation is tracked 
                console.log('processing '+  stayData[0].roomStays[0].pmsId + ' from hotel ' + er.hotelId )
                const emailTracking = await db.getEmailTrackingInfo(er.hotelId, stayData[0].roomStays[0].pmsId, MAILTYPES.START);  
                // if email is set we make the email values with the hotel and reservation and send it
                if (email && !emailTracking.length) {
                    ++count;
                    console.log('sending email to '+  email + ' for reservation ' + stayData[0].roomStays[0].pmsId + ' from hotel ' + er.hotelId )
                    return await renderAndSendEmail(MAILTYPES.START, stayData[0], hotels[er.hotelId]);
                } else if (email && emailTracking.length) {
                    console.log('email to '+  email + ' for reservation ' + stayData[0].roomStays[0].pmsId + ' from hotel ' + er.hotelId + " was already sent")
                } else if (!email) {
                    console.log(' reservation ' + stayData[0].roomStays[0].pmsId + ' from hotel ' + er.hotelId + " has no provided email ")
                }

            }
        }
        console.log("End process: newValidStays .... processed " + count + " new emails");
        winstonLogger.info("End process: newValidStays .... processed " + count + " new emails");
        return 1;
    } catch (e) {
         console.log(e);
        throw e;
    }
}

module.exports = {
    newReservationFinder
}