const { HotelPmsDB } = require('../Models/database.js');
const Enzo = require('../Models/enzoBooking.js');
const PmsApi = require('../Models/pmsModuleApi.js');


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const getReservations = async (hotelId = null, reservationId = null) => { 
    console.log("Start helper process: getReservations....");
    try{
        let result = {};
        //Call the db to get the list of hotel clients and their pmsData
        const dbManager = new HotelPmsDB(hotelId);
        const hotelWithPmsAccessList = await dbManager.getHotelPmsInfo(hotelId); //retrieve all the hotels with their pms info
        const pmsApi = new PmsApi.PmsModuleApi(hotelId); //we use 1 generic manager (no hotelID) that will do request for each hotel 
        //get the reservations per hotel Ids
        for (let i = 0; i < hotelWithPmsAccessList.length; ++i) {     
            let hotel = hotelWithPmsAccessList[i]; 
            result[hotel.id] = await pmsApi.getReservationData({ reservationId: reservationId,  hotelId: hotel.id, pmsId: hotel.pms, pmsUrl: hotel.url, pmsLogin: hotel.login,  pmsPwd: hotel.pwd });
            result[hotel.id].reservations.map((r, i) => {
                r.hotelId = hotel.id;
                r.pmsId = hotel.id;
                let e = new Enzo.EnzoStay(r);
                result[hotel.id].reservations[i] = e;
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
        //Call the db to get the list of hotel clients and their pmsData
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


module.exports = {
    getReservations,
    postReservations
}