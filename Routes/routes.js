const api = require('express').Router() ;
const bookingControllers = require('../Controllers/getBooking.js') ;
const emailControllers = require('../Controllers/getEmail.js') ;
const SETTINGS = require('../settings.json');

api.post(SETTINGS.API_ENDPOINT.POST_BOOKING, bookingControllers.postBooking) ;
api.get(SETTINGS.API_ENDPOINT.RESET_BOOKING, bookingControllers.resetBookings );
api.get(SETTINGS.API_ENDPOINT.FETCH_BOOKING_FROM_TOKEN, bookingControllers.getBookingFromToken);
api.post(SETTINGS.API_ENDPOINT.GET_QRCODE, emailControllers.renderAndSendQrCode);
api.get(SETTINGS.API_ENDPOINT.SEND_EMAIL, emailControllers.getEmail, emailControllers.renderAndSendMail);
api.get(SETTINGS.API_ENDPOINT.GET_NEW_RESERVATIONS, bookingControllers.getNewReservations);

module.exports = api  ;