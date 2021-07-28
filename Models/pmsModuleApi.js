const axios = require('axios');
const { addDay } = require('../Utilities/utilities.js');
const SETTINGS = require('../settings.json');

//Reservation time filter
// START -> reservations starting (= arriving) within the specified interval.
// COLLIdING -> (default) reservations whose intervals collide with the specified interval.
const TIMEFILTER = { COLLIdING: 'Colliding', START: 'Start' };
//TODO: add imported settings
class PmsModuleApi {
    constructor(hotel = null, reservation = null, pms = null, url = null, login = null, pwd = null, start = null, end = null, pmsTimefilter = null) {
        this.pmsModuleApiUrl = SETTINGS.PMS_API_BASEURL ? new URL(SETTINGS.PMS_API_BASEURL) : new URL(`http://localhost:3002/pmsmodule/api/reservation`);        
        this.hotelId = hotel;
        this.reservationId = reservation;
        this.data = {};
        this.pmsId = pms;
        this.login = login;
        this.pwd = pwd;
        this.pmsUrl = url;
        this.startDate = start;
        this.endDate = end;
        this.filter = pmsTimefilter ? TIMEFILTER[pmsTimefilter.toUpperCase()] : TIMEFILTER.START ;
    } 
    //get the reservation from
    async getReservationData({ hotelId = null, reservationId = null, pmsId = null,
            startDate = null, endDate = null, filter = null,  
            pmsUrl = null, pmsLogin = null, pmsPwd = null 
        } = {}){
        hotelId = hotelId || this.hotelId ;
        reservationId = reservationId || this.reservationId ;
        pmsId = pmsId || this.pmsId ;
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsLogin = pmsLogin || this.login ;
        pmsPwd = pmsPwd || this.pwd ;
        try {
            let params = new URLSearchParams();
            if (!hotelId) throw new Error('missing hotelId');
            if (!pmsId) throw new Error('missing pmsId');
            if (reservationId) params.set('reservationId', reservationId); 
            else {
                //if no reservationId is provided 
                // a time period must be defined or default one is used (today -> offset setting)
                let isDates = (startDate && endDate) || (this.startDate && this.endDate) ;
                if (isDates) {
                    startDate = new Date(startDate||this.startDate) 
                    endDate =  new Date(endDate || this.endDate)
                } else {
                    startDate = new Date() ;
                    endDate = addDay(startDate, SETTINGS.CHECKIN_REQUEST_START_DAY_OFFSET);
                }
                params.set('startDate', startDate.toISOString());
                params.set('endDate', endDate.toISOString());
                if (filter) params.set('timeFilter', filter);
            }
            params.set('hotelId', hotelId);
            params.set('pmsId', pmsId);
            if (pmsUrl) params.set('pmsUrl', pmsUrl);
            if (pmsLogin) params.set('pmsLogin', pmsLogin); 
            if (pmsPwd) params.set('pmsPwd', pmsPwd);
            this.pmsModuleApiUrl.search = params;
           console.log(this.pmsModuleApiUrl.toString())
            const request = await axios.get(this.pmsModuleApiUrl.toString());
            if (parseInt(request.data.hotelId) === parseInt(hotelId)) this.data[hotelId] = request.data;
            return request.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }

    async updateReservationData({ data, hotelId = null, reservationId = null, pmsId = null,
        pmsUrl = null, pmsLogin = null, pmsPwd = null }) {
        hotelId = hotelId || this.hotelId ;
        reservationId = reservationId || this.reservationId ;
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsId = pmsId || this.pmsId ;
        pmsLogin = pmsLogin || this.login ;
        pmsPwd = pmsPwd || this.pwd ;
        let payload = { hotelId, reservationId, pmsId, pmsUrl, pmsLogin, pmsPwd, checkin: data };
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