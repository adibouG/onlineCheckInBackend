const api = require('express').Router() ;
const bookingControllers = require('../Controllers/getBooking.js') ;
const emailControllers = require('../Controllers/getEmail.js') ;
const SETTINGS = require('../settings.json');




api.post( SETTINGS.API_ENDPOINT.FETCH_BOOKING , bookingControllers.postBooking)
api.get( SETTINGS.API_ENDPOINT.RESET_BOOKING , bookingControllers.resetBookings )

api.get( SETTINGS.API_ENDPOINT.FETCH_BOOKING , bookingControllers.getBooking)

api.post( SETTINGS.API_ENDPOINT.GET_QRCODE , emailControllers.renderAndSendQrCode )



api.get( SETTINGS.API_ENDPOINT.SEND_EMAIL , emailControllers.getEmail , emailControllers.renderAndSendMail  )



module.exports = api  ;