const { Database } = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js')
const Enzo = require('../Models/Enzo.js')
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, newReservationFilter } = require('../Utilities/utilities.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');

//get new reservation, return an array of enzoCheckIn, run at specified interval 
const newReservationFinder = async () => {
    console.log("Start process: newReservationFinder ....");
    try {
        let results = await helpers.getReservations(); 
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new Database();
        const emailTracking = await dbManager.getEmailTrackingInfo();  
         //compare the date if checkIn can be offer take a booking and the param name to check
        // filter reservation for valid precheck dates and status
        // and check the actual tracking status and remove the already tracked ones
        results = results.filter( er => {
            let r = er.roomStays.filter( rs => newReservationFilter(rs, emailTracking, er.hotelId)) 
            console.log(r.length);
            return r.length > 0 ? true : false;
        });
        //but only if there are actual tracked reservations
        return await newReservationsProcess(results);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

//get the new reservations,
const newReservationsProcess = async (newValidStays) => {
    console.log("Start process: newValidStays ....");
    const dbManager = new Database();
    try {   
        //we store the hotel data in an object to pavoid requesting the same data multiple time
        const hotels = {};
        for (const er of newValidStays) {
            //get the hotelId to retrieve the hotel details and store it for use with each reservation in this hotel
            
            if (!hotels[er.hotelId]) {
                const hd = await dbManager.getHotelDetails(er.hotelId);
                hotels[er.hotelId] = new Enzo.EnzoHotel({ 
                    hotelId: hd.hotel_id,  
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
                })
            }

            //get the full details and send an email for each roomstay of the reservation for  
            for (let rs of er.roomStays) {
                const stayData = await helpers.getReservations(er.hotelId, rs.pmsId);
                if (stayData.length && stayData[0].roomStays.length) {
                    //as we provide a roomStayId as reservationId and hotelId we have only one result a
                    let email; 
                    // email is sent to 1ary guest if email or to booker
                    if (stayData[0].roomStays[0].guests.length && stayData[0].roomStays[0].guests[0].email) email = stayData[0].roomStays[0].guests[0].email ;
                    else email = stayData[0].booker.email;
                    // if email is set we make the email values with the hotel and reservation and send it
                    if (email) {
                        const values = await makeEmailValues(MAILTYPES.START, stayData[0], hotels[er.hotelId]);
                        return await renderAndSendEmail(MAILTYPES.START, values);
                    }
                }
            }
        }
        console.log("End process: newValidStays ....");
    } catch (e) {
         console.log(e);
        throw e;
    }
}

module.exports = {
    newReservationFinder
}