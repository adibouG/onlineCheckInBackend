const api = require('express').Router() ;
const controllers = require('../Controllers/getBooking.js') ;
const SETTINGS = require('../settings.json');




api.get( SETTINGS.API_ENDPOINT.FETCH_BOOKING , controllers.getBooking)
api.post( SETTINGS.API_ENDPOINT.FETCH_BOOKING , controllers.postBooking)
api.post( SETTINGS.API_ENDPOINT.RESET_BOOKING , controllers.resetBookings )




module.exports = api  ;