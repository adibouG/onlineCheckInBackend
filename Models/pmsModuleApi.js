require('dotenv').config();
const { AsyncResource, executionAsyncId } = require('async_hooks');
const axios = require('axios');
const { addDay } = require('../Utilities/utilities.js');
const { CHECKIN_REQUEST_START_DAY_OFFSET } = require('../settings.json');

const PMS_API_BASEURL = process.env.PMS_API_BASEURL; 
//Reservation time filter
// START -> reservations starting (= arriving) within the specified interval.
// COLLIdING -> (default) reservations whose intervals collide with the specified interval.
const TIMEFILTER = { COLLIDING: 'Colliding', START: 'Start' };

class PmsModuleApi extends AsyncResource {
    constructor(hotelId = null, reservationId = null, pmsId = null, url = null,
        user = null, pwd = null, start = null, end = null, pmsTimefilter = null)
        {
            super('httpRequest');
            this.pmsModuleBaseApiUrl = new URL(PMS_API_BASEURL);        
            this.hotelId = hotelId;
            this.reservationId = reservationId;
            this.pmsId = pmsId;
            this.pmsUser = user;
            this.pmsPwd = pwd;
            this.pmsUrl = url;
            this.startDate = start;
            this.endDate = end;
            this.filter = pmsTimefilter ? TIMEFILTER[pmsTimefilter.toUpperCase()] : TIMEFILTER.START ;
            //TODO: add values or token to secure the pms api access too
        } 
    //get the reservation from
    async getReservationData({ reservationId = this.reservationId, 
                                pmsId = this.pmsId, startDate = this.startDate, endDate = this.endDate, filter = this.filter,
                                 pmsUrl = this.pmsUrl, pmsUser = this.pmsUser, pmsPwd = this.pmsPwd, other = null } = {})
        {
            console.log('PmsModuleApi.getReservationData start...  pmsId:' , pmsId )
            console.log('and resevationId:' , reservationId )
         
            try {
                const params = new URLSearchParams();
                const apiUrl = new URL(this.pmsModuleBaseApiUrl);
                apiUrl.pathname += `/pms/${pmsId}/reservations` ;
                if (!pmsId) throw new Error('missing pmsId');
                if (reservationId) apiUrl.pathname += `/${reservationId}`; 
                else {
                    //if no reservationId is provided 
                    // a time period must be defined or default one is used (today -> offset setting)
                    const isDates = (startDate && endDate) || (this.startDate && this.endDate) ;
                    if (isDates) {
                        startDate = new Date(startDate || this.startDate); 
                        endDate = new Date(endDate || this.endDate);
                    } else {
                        startDate = new Date() ;
                        endDate = addDay(startDate, CHECKIN_REQUEST_START_DAY_OFFSET);
                    }
                    params.set('startDate', startDate.toISOString());
                    params.set('endDate', endDate.toISOString());
                    if (filter) params.set('timeFilter', filter);
                }
                if (pmsUrl) params.set('pmsUrl', pmsUrl);
                if (pmsUser) params.set('pmsUser', pmsUser); 
                if (pmsPwd) params.set('pmsPwd', pmsPwd);
                apiUrl.search = params;
                const request = await axios.get(apiUrl.toString()/*, { validateStatus: s => (s < 500) }*/);
                console.log('PmsModuleApi.getReservationData end...  pmsId:' , pmsId )
                return request.data;            
            } catch(e) {
                console.error(e.message);
                throw e;
            }
        }

    async updateReservationData({ data, hotelId = null, reservationId = null, pmsId = null,
        pmsUrl = null, pmsUser = null, pmsPwd = null } = {}) 
        {

            const body = { pmsUrl, pmsUser, pmsPwd, data };
            try{
                console.log(this.pmsModuleBaseApiUrl);
                const apiUrl = new URL(this.pmsModuleBaseApiUrl);
                if (!pmsId) throw new Error('missing pmsId');
                apiUrl.pathname += `/pms/${pmsId}/reservations` ;
                if (reservationId) apiUrl.pathname += `/${reservationId}`; 
                await axios.put(apiUrl.toString(), body); 
                return ;
            } catch(e) {
                console.error(e);
                throw e;
            }
        }
    async getHotelData({ pmsId = null, startDate = null, endDate = null, pmsUrl = null, pmsUser = null, pmsPwd = null }) 
    {
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsId = pmsId || this.pmsId ;
        pmsUser = pmsUser || this.pmsUser ;
        pmsPwd = pmsPwd || this.pmsPwd;

        try{  
            const params = new URLSearchParams();
            const apiUrl = new URL(this.pmsModuleBaseApiUrl);
            if (!pmsId) throw new Error('missing pmsId');
            apiUrl.pathname += `/pms/${pmsId}/hotel` ;
            const isDates = (startDate && endDate) || (this.startDate && this.endDate) ;
            if (isDates) {
                startDate = new Date(startDate || this.startDate); 
                endDate = new Date(endDate || this.endDate);
            } else {
                startDate = new Date() ;
                endDate = addDay(startDate, CHECKIN_REQUEST_START_DAY_OFFSET);
            }
            params.set('startDate', startDate.toISOString());
            params.set('endDate', endDate.toISOString());
        
            if (pmsUrl) params.set('pmsUrl', pmsUrl);
            if (pmsUser) params.set('pmsUser', pmsUser); 
            if (pmsPwd) params.set('pmsPwd', pmsPwd);

            const requestResult =  await axios.get(apiUrl.toString(), { validateStatus: (s) => (s < 500) }); 
            return requestResult.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }


    //return an hotelStay object
    async getHotelOffers({ pmsId = null, startDate = null, endDate = null, pmsUrl = null, pmsUser = null, pmsPwd = null }) 
    {
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsId = pmsId || this.pmsId ;
        pmsUser = pmsUser || this.pmsUser ;
        pmsPwd = pmsPwd || this.pmsPwd;

        try{  
            const params = new URLSearchParams();
            const apiUrl = new URL(this.pmsModuleBaseApiUrl);
            if (!pmsId) throw new Error('missing pmsId');
            apiUrl.pathname += `/pms/${pmsId}/hotelstay` ;
            const isDates = (startDate && endDate) || (this.startDate && this.endDate) ;
            if (isDates) {
                startDate = new Date(startDate || this.startDate); 
                endDate = new Date(endDate || this.endDate);
            } else {
                startDate = new Date() ;
                endDate = addDay(startDate, CHECKIN_REQUEST_START_DAY_OFFSET);
            }
            params.set('startDate', startDate.toISOString());
            params.set('endDate', endDate.toISOString());
        
            if (pmsUrl) params.set('pmsUrl', pmsUrl);
            if (pmsUser) params.set('pmsUser', pmsUser); 
            if (pmsPwd) params.set('pmsPwd', pmsPwd);

            const requestResult =  await axios.get(apiUrl.toString(), { validateStatus: (s) => (s < 500) }); 
            return requestResult.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }


    async getHotelOfferAvailabilities({ pmsId = null, startDate = null, endDate = null, pmsUrl = null, pmsUser = null, pmsPwd = null }) 
    {
        pmsUrl = pmsUrl || this.pmsUrl ;
        pmsId = pmsId || this.pmsId ;
        pmsUser = pmsUser || this.pmsUser ;
        pmsPwd = pmsPwd || this.pmsPwd;

        try{  
            const params = new URLSearchParams();
            const apiUrl = new URL(this.pmsModuleBaseApiUrl);
            if (!pmsId) throw new Error('missing pmsId');
            apiUrl.pathname += `/pms/${pmsId}/hotel/hotelavailabilities` ;
            const isDates = (startDate && endDate) || (this.startDate && this.endDate) ;
            if (isDates) {
                startDate = new Date(startDate || this.startDate); 
                endDate = new Date(endDate || this.endDate);
            } else {
                startDate = new Date() ;
                endDate = addDay(startDate, CHECKIN_REQUEST_START_DAY_OFFSET);
            }
            params.set('startDate', startDate.toISOString());
            params.set('endDate', endDate.toISOString());
        
            if (pmsUrl) params.set('pmsUrl', pmsUrl);
            if (pmsUser) params.set('pmsUser', pmsUser); 
            if (pmsPwd) params.set('pmsPwd', pmsPwd);

            const requestResult =  await axios.get(apiUrl.toString(), { validateStatus: (s) => (s < 500) }); 
            return requestResult.data ;
        } catch(e) {
            console.error(e);
            throw e;
        }
    }
}

module.exports = { 
    PmsModuleApi
}