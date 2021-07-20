const axios = require('axios');
//TODO: add imported settings
class PmsModuleApi {
    constructor( hotelID, reservationID, pmsUrl = null, pmsID = null, login = null, pwd = null ) {
        this.pmsModuleApiUrl = new URL(`http://localhost:3002/pmsmodule/api/reservation`);
        this.hotelID = hotelID;
        this.reservationID = reservationID;
        this.data = [];
        this.pmsUrl = null;
        this.pmsID = null;
        this.login = null;
        this.pwd = null;
    } 
    //get the reservation from
    async getReservationData({ hotelID = null, reservationID = null, pmsUrl = null, pmsID = null} ) {
        hotelID = hotelID || this.hotelID ;
        reservationID = reservationID || this.reservationID ;
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsID = pmsID || this.pmsID ;
        try{
            let params = new URLSearchParams();
            params.set('hotelID', hotelID);
            if (reservationID) params.set('reservationID', reservationID);
            this.pmsModuleApiUrl.search = params;
            console.log(this.pmsModuleApiUrl.toString());
            let bookingData =  await axios.get(this.pmsModuleApiUrl.toString());
            this.data.push({ hotelID, data: bookingData.data }); 
            console.log(this.data)
            return this.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }

    async updateReservationData(hotelID = null, reservationID = null, updatedBooking, pmsUrl = null, pmsID = null) {
        hotelID = hotelID || this.hotelID ;
        reservationID = reservationID || this.reservationID ;
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsID = pmsID || this.pmsID ;
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


    toEnzoBooking( book ) {


    }
}

module.exports = {
    PmsModuleApi
}