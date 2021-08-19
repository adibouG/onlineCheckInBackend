require('dotenv').config();
const axios = require('axios');
const { addDay } = require('../Utilities/utilities.js');
const { CHECKIN_REQUEST_START_DAY_OFFSET } = require('../settings.json');

const PMS_API_BASEURL = process.env.PMS_API_BASEURL; 
//Reservation time filter
// START -> reservations starting (= arriving) within the specified interval.
// COLLIdING -> (default) reservations whose intervals collide with the specified interval.
const TIMEFILTER = { COLLIDING: 'Colliding', START: 'Start' };

class PmsModuleApi {
    constructor(hotel = null, reservation = null, pms = null, url = null, login = null, pwd = null, start = null, end = null, pmsTimefilter = null) {
        this.pmsModuleApiUrl =  new URL(PMS_API_BASEURL);        
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
            let apiUrl = new URL(this.pmsModuleApiUrl);
            // if (!hotelId) throw new Error('missing hotelId');
            // if (!pmsId) throw new Error('missing pmsId');
            console.log('apiUrl.pathname ', apiUrl.pathname) ;
            apiUrl.pathname += `pms/${pmsId}/reservations` ;
            console.log('pmsId ', pmsId) ;
            console.log('apiUrl.pathname ', apiUrl.pathname) ;
            
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
                    endDate = addDay(startDate, CHECKIN_REQUEST_START_DAY_OFFSET);
                }
                params.set('startDate', startDate.toISOString());
                params.set('endDate', endDate.toISOString());
                if (filter) params.set('timeFilter', filter);
            }
            params.set('hotelId', hotelId);
            if (pmsUrl) params.set('pmsUrl', pmsUrl);
            if (pmsLogin) params.set('pmsLogin', pmsLogin); 
            if (pmsPwd) params.set('pmsPwd', pmsPwd);
            apiUrl.search = params;
            console.log(apiUrl.toString());
            const request = await axios.get(apiUrl.toString());
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

        let payload = { hotelId, reservationId, pmsId, pmsUrl, pmsLogin, pmsPwd, data };
        try{
            let apiUrl = new URL(this.pmsModuleApiUrl);
            // if (!hotelId) throw new Error('missing hotelId');
            if (!pmsId) throw new Error('missing pmsId');
            console.log('apiUrl.pathname ', apiUrl.pathname) ;
            apiUrl.pathname += `pms/${pmsId}/reservations` ;
            console.log(apiUrl.toString());
            let requestResult =  await axios.put(apiUrl.toString(), payload); 
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