const api = require('express').Router() ;
const bookingControllers = require('../Controllers/getBooking.js') ;
//const emailControllers = require('../Controllers/emails.js') ;
const adminControllers = require('../Controllers/admin.js') ;
const emailTrigger = require('../Controllers/getEmail.js') ;
const SETTINGS = require('../settings.json');

//Checkim APP endpoints 
//TO DO : add security checks and middlewares
//endpoint to save/update reservation data  (only for DEMO app)
api.post(SETTINGS.API_ENDPOINT.POST_BOOKING, bookingControllers.postBooking) ;
//endpoint to reset the reservation data (only for DEMO app)
api.get(SETTINGS.API_ENDPOINT.RESET_BOOKING, bookingControllers.resetBookings );
//endpoint to retrieve the reservation data from the token send by email  (only for DEMO app)
api.get(SETTINGS.API_ENDPOINT.FETCH_BOOKING_FROM_TOKEN, bookingControllers.getBookingFromToken);
//endpoint to trigger a QRCode email request 
api.post(SETTINGS.API_ENDPOINT.GET_QRCODE, emailTrigger.renderAndSendQrCode);
//endpoint to trigger the start email request  (only for DEMO app)
//api.get(SETTINGS.API_ENDPOINT.SEND_EMAIL, emailTrigger.getEmail);

//Admin part : UI
api.get('/admin', adminControllers.displayDashboard);

module.exports = api ;