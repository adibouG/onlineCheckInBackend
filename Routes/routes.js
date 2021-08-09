const api = require('express').Router() ;
const bookingControllers = require('../Controllers/getBooking.js') ;
const adminControllers = require('../Controllers/admin.js') ;
const emailControllers = require('../Controllers/getEmail.js') ;
const hotelControllers = require('../Controllers/hotels.js') ;


//Checkin APP endpoints 
//TO DO : add security checks and middlewares

//endpoint to retrieve the reservation data from the token send by email  (only for DEMO app)
api.get(`/reservation`, bookingControllers.getBookingFromToken);
api.post(`/reservation`, bookingControllers.postBooking);

//endpoint to save/update reservation data  
api.put(`/hotels/:hotelId/reservations`, hotelControllers.updateBooking) ;
api.get(`/hotels/:hotelId/reservations`, hotelControllers.getBookings) ;

//endpoint to get/add/update/delete hotel data  
api.delete(`/hotels/:hotelId`, hotelControllers.deleteHotel) ;
api.put(`/hotels/:hotelId`, hotelControllers.updateHotel) ;
api.get(`/hotels/:hotelId`, hotelControllers.getHotels) ;
api.post(`/hotels`, hotelControllers.addHotel) ;
api.get(`/hotels`, hotelControllers.getHotels) ;


//endpoint to reset the reservation data (only for DEMO app)
api.get(`/reset`, bookingControllers.resetBookings);
//endpoint to trigger a QRCode email request 
api.post(`/qrCode`, emailControllers.renderAndSendQrCode);

//Admin part : UI
api.get('/admin', adminControllers.displayDashboard);

module.exports = api ;