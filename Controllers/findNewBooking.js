const { HotelPmsDB } = require('../Models/database.js');
const helpers = require('../Helpers/helpers.js')
const { renderAndSendEmail } = require('./emails.js')
const { makeEmailValues, newReservationFilter } = require('../Utilities/utilities.js');
const { MAILTYPES } = require('../Emails/enzoMails.js');

//get new reservation, return an array of enzoCheckIn, run at specified interval 
const newReservationFinder = async () => {
    console.log("Start process: newReservationFinder ....");
    try {
        const result = await helpers.getReservations(); 
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new HotelPmsDB();
        const emailTracking = await dbManager.getEmailTrackingInfo();  
         //compare the date if checkIn can be offer take a booking and the param name to check
        // filter reservatind for valid precheck dates and status
        // and check the actual tracking status and remove the already tracked ones
        for (const i in result) {
            result[i].reservations = result[i].reservations.filter((r) => newReservationFilter(r, emailTracking)) ;
        }
        //but only if there are actual tracked reservations
        return await newReservationsProcess(result);
    } catch (e) {
        console.log(e);
        throw e;
    }
}


//get the new reservations,
const newReservationsProcess = async (newValidReservations) => {
    console.log("Start process: newReservationsProcess ....");
    const dbManager = new HotelPmsDB();
    try {
        for (const i in newValidReservations) {
            const hotelDetails = await dbManager.getHotelDetails(i);
            newValidReservations[i].reservations.map(async (res) => {
                let reservationObj = await helpers.getReservations(res.hotelId, res.reservationId);
                let checkIn = reservationObj[res.hotelId].reservations[0]; 
                if (checkIn.email) {
                    let values = await makeEmailValues(MAILTYPES.START, checkIn, hotelDetails);
                    return await renderAndSendEmail(MAILTYPES.START, values);
                }
            });
        }
        console.log("End process: newReservationsProcess ....");
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    newReservationFinder
}