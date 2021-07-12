const api = require('express').Router() ;
const bookingControllers = require('../Controllers/getBooking.js') ;
const emailControllers = require('../Controllers/getEmail.js') ;
const SETTINGS = require('../settings.json');

//endpoint to save/update reservation data
api.post(SETTINGS.API_ENDPOINT.POST_BOOKING, bookingControllers.postBooking) ;
//endpoint to reset the reservation data (only for DEMO app)
api.get(SETTINGS.API_ENDPOINT.RESET_BOOKING, bookingControllers.resetBookings );
//endpoint to retrieve the reservation data from the token send by email
api.get(SETTINGS.API_ENDPOINT.FETCH_BOOKING_FROM_TOKEN, bookingControllers.getBookingFromToken);
//endpoint to trigger a QRCode email request
api.post(SETTINGS.API_ENDPOINT.GET_QRCODE, emailControllers.renderAndSendQrCode);
//endpoint to trigger the start email request
api.get(SETTINGS.API_ENDPOINT.SEND_EMAIL, emailControllers.getEmail, emailControllers.renderAndSendMail);

//
api.get(SETTINGS.API_ENDPOINT.GET_NEW_RESERVATIONS, bookingControllers.getNewReservations);

module.exports = api  ;