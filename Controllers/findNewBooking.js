const { HotelPms } = require('../Models/database.js');
const { PmsModuleApi } = require('../Models/pmsModuleApi.js');
const { EnzoCheckIn } = require('../Models/enzoBooking.js');
const { CHECKIN_REQUEST_START_DAY_OFFSET } = require('../settings.json');
const { addDay } = require('../Utilities/utilities.js');

 //compare the date if checkIn can be offer take a booking and the param name to check
 const preCheckInDateIsValid = (booking, offset = CHECKIN_REQUEST_START_DAY_OFFSET ) => {
    let canBePreCheck = false ;
    let startDate = new Date(booking.startDate);
    if ( startDate >= new Date() && startDate <= addDay(new Date(), offset))
    { 
        canBePreCheck = true ;
    }
    return canBePreCheck ;
}


//get new reservation, return an array of enzoCheckIn, run at specified interval 
const newReservationFinder = async () => {
    console.log("Start newReservationFinder ....");
    //Call the db to get the list of hotel clients and their pmsData
    let hotelPms = new HotelPms();
    let hotelPmsList = await hotelPms.getHotelPmsData();
    console.log(hotelPmsList)
    //let pmsModuleList = []; //store the pms objects (1 per hotel) 
    let reservations = []; // store the reservations returned 
    let pmsModule = new PmsModuleApi(); //we try with 1 generic manager that will do request for each hotel 
    hotelPmsList.forEach(async (hotel) => {
        //  {id: 1,hotel: 'test',pms: 1,login: null,pwd: null,name: 'dynamoDB',url: 'dynamoDB'},
        //pms = { id: 2, hotel: 'mewsDemoGrossEnv', pms: 2, login: 'E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D', pwd: 'C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D', name: 'MewsDemo', url: 'https://api.mews-demo.com' }
        console.log(hotel.id)
        let results = await pmsModule.getReservationData({ hotelID: hotel.id });
        console.log(results)
        return reservations.push(results);
    });
    console.log(reservations)
    //for (let hotelReservation of reservations) {
    //        //convert to EnzoBooking
    //        let enzoBooking = convertBooking(hotelReservation);
    //        if (!preCheckInDateIsValid(enzoBooking)) continue;
    //        console.log(res);
    //        reservations.push(res);
    //    }
    //
    return reservations;
}

module.exports = {
    newReservationFinder
}