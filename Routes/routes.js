const api = require('express').Router() ;
const booking = require('../Controllers/getBooking.js') ;
const admin = require('../Controllers/admin.js') ;
const email = require('../Controllers/getEmail.js') ;
const hotel = require('../Controllers/hotels.js') ;
const pms = require('../Controllers/pms.js') ;
const payment = require('../Controllers/payments.js') ;


//Checkin APP endpoints 
//TO DO : add security checks and middlewares

//endpoint to retrieve the reservation data from the token send by email and using the frontend app 
api.post(`/checkin/getPaymentLink`, payment.getPaymentLinkFromToken);
api.get(`/checkin/getPaymentResult`, payment.getPaymentResultById);

api.post(`/checkin`, booking.postBooking);
api.get(`/checkin`, booking.getBookingFromToken);

//endpoint to retrieve the pms data from the pmsAPI 
api.get(`/pms/:pmsId`, pms.getPms);
api.get(`/pms`, pms.getPms);

//endpoint to trigger a payment request 
api.get(`/hotels/:hotelId/reservations/:reservationId/paymentResult`, payment.getPaymentResult);
api.get(`/hotels/:hotelId/reservations/:reservationId/payment`, payment.getPaymentLink);
api.post(`/hotels/:hotelId/reservations/:reservationId/payment`, payment.postPaymentResult);

//endpoint to save/update reservation data  
api.put(`/hotels/:hotelId/reservations/:reservationId`, booking.updateBooking) ;
api.get(`/hotels/:hotelId/reservations/:reservationId`, booking.getBookings) ;
api.get(`/hotels/:hotelId/reservations`, booking.getBookings) ;

api.put(`/hotels/:hotelId/pms`, hotel.updateHotelPms) ;
api.post(`/hotels/:hotelId/pms`, hotel.addHotelPms) ;
api.delete(`/hotels/:hotelId/pms`, hotel.deleteHotelPms) ;
api.get(`/hotels/:hotelId/pms`, hotel.getHotelPms) ;

api.put(`/hotels/:hotelId/screens`, hotel.updateHotelScreenSetting) ;
api.post(`/hotels/:hotelId/screens`, hotel.addHotelScreenSetting) ;
api.delete(`/hotels/:hotelId/screens`, hotel.deleteHotelScreenSetting) ;
api.get(`/hotels/:hotelId/screens`, hotel.getHotelScreenSetting) ;

api.post(`/hotels/:hotelId/styles`, hotel.addHotelStylesSetting) ;
api.put(`/hotels/:hotelId/styles`, hotel.updateHotelStylesSetting) ;
api.delete(`/hotels/:hotelId/styles`, hotel.deleteHotelStylesSetting) ;
api.get(`/hotels/:hotelId/styles`, hotel.getHotelStylesSetting) ;

api.post(`/hotels/:hotelId/details`, hotel.addHotelDetails) ;
api.put(`/hotels/:hotelId/details`, hotel.updateHotelDetails) ;
api.delete(`/hotels/:hotelId/details`, hotel.deleteHotelDetails) ;
api.get(`/hotels/:hotelId/details`, hotel.getHotelDetails) ;

//endpoint to get hotel stay offers data   
api.get(`/hotels/:hotelId/stays`, hotel.getHotelStays) ;

//endpoint to trigger a QRCode email request 
api.post(`/hotels/:hotelId/qrCode`, email.renderAndSendQrCode);
//endpoint to trigger a payment request 
api.get(`/hotels/:hotelId/payment`, email.renderAndSendQrCode);
api.post(`/hotels/:hotelId/payment`, email.renderAndSendQrCode);


api.get(`/hotels/count`, hotel.getHotelsCount) ;
//endpoint to get/add/update/delete hotel data  
api.delete(`/hotels/:hotelId`, hotel.deleteHotelFullData) ;
api.put(`/hotels/:hotelId`, hotel.updateHotel) ;
api.get(`/hotels/:hotelId`, hotel.getHotels) ;
api.get(`/hotels`, hotel.getHotels) ;
api.post(`/hotels`, hotel.addHotel) ;
api.get(`/hotels`, hotel.getHotels) ;


//endpoint to reset the reservation data (only for DEMO app)
api.get(`/reset`, booking.resetBookings);
//Admin part : UI
api.get('/admin', admin.displayDashboard);

//AWS ALB healthCheck
api.get('/healthcheck', (req, res) => res.status(200).send('OK'));

module.exports = api ;