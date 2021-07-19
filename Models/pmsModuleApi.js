const axios = require('axios');
//TODO: add imported settings
class PmsModuleApi {
    constructor(hotelID, reservationID) {
        this.pmsModuleApiUrl = new URL(`http://localhost:3002/pmsmodule/api/reservation`);
        //this.data = null;
        this.hotelID = hotelID;
        this.reservationID = reservationID;
        this.data = null;
    } 
    //get the reservation from
    async getReservationData(hotelID = null, reservationID = null) {
        hotelID = hotelID || this.hotelID ;
        reservationID = reservationID || this.reservationID ;
        try{
            let params = new URLSearchParams();
            params.set('hotelID', hotelID);
            if (reservationID) params.set('reservationID', reservationID);
            this.pmsModuleApiUrl.search = params;
            console.log(this.pmsModuleApiUrl.toString());
            let bookingData =  await axios.get(this.pmsModuleApiUrl.toString());
            this.data = bookingData.data; 
            return bookingData.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }

    async updateReservationData(hotelID = null, reservationID = null, updatedBooking) {
        hotelID = hotelID || this.hotelID ;
        reservationID = reservationID || this.reservationID ;
        let payload = { hotelID, reservationID, checkin: updatedBooking };
        try{
            console.log(this.pmsModuleApiUrl.toString());
            let requestResult =  await axios.post(this.pmsModuleApiUrl.toString(), payload); 
            return requestResult ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }
}

module.exports = {
    PmsModuleApi
}