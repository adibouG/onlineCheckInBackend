const api = require('express').Router() ;
const booking = require('../Controllers/getBooking.js') ;
const admin = require('../Controllers/admin.js') ;
const email = require('../Controllers/getEmail.js') ;
const hotel = require('../Controllers/hotels.js') ;
const pms = require('../Controllers/pms.js') ;
const payment = require('../Controllers/payments.js') ;
const mid = require('../Middlewares/middlewares.js') ;


//Checkin APP endpoints 
//TO DO : add security checks and middlewares


api.get(`/checkin/qrcode`, email.getQrFromToken); 
//endpoint to retrieve the reservation data from the token send by email and using the frontend app 
api.post(`/checkin/getpaymentlink`, payment.getPaymentLinkFromToken);
api.get(`/checkin/getpaymentresult/subscribe`, payment.subscribePaymentResultById);
api.get(`/checkin/getpaymentresult`, payment.getPaymentResultById);

api.get(`/checkin/appsettings`, hotel.getHotelScreenSetting) ;
api.get(`/checkin/styles`, hotel.getHotelStylesSetting) ;

api.post(`/checkin`, booking.postBooking);
api.get(`/checkin`, booking.getBookingFromToken);

//endpoint to retrieve the pms data from the pmsAPI 
api.get(`/admin/pms/:pmsId`, pms.getPms);
api.get(`/admin/pms`, pms.getPms);

api.get(`/hotels/:hotelId/appsettings`, hotel.getHotelScreenSetting) ;
api.get(`/hotels/:hotelId/styles`, hotel.getHotelStylesSetting) ;

api.put(`/admin/hotels/:hotelId/pms`,  mid.isAdmin,  hotel.updateHotelPms) ;
api.post(`/admin/hotels/:hotelId/pms`, mid.isAdmin, hotel.addHotelPms) ;
api.delete(`/admin/hotels/:hotelId/pms`, mid.isAdmin, hotel.deleteHotelPms) ;
api.get(`/admin/hotels/:hotelId/pms`, mid.isAdmin, hotel.getHotelPms) ;

api.put(`/admin/hotels/:hotelId/appsettings`, mid.isAdmin, hotel.updateHotelScreenSetting) ;
api.post(`/admin/hotels/:hotelId/appsettings`, mid.isAdmin, hotel.addHotelScreenSetting) ;
api.delete(`/admin/hotels/:hotelId/appsettings`, mid.isAdmin, hotel.deleteHotelScreenSetting) ;

api.post(`/admin/hotels/:hotelId/styles`, mid.isAdmin, hotel.addHotelStylesSetting) ;
api.put(`/admin/hotels/:hotelId/styles`, mid.isAdmin, hotel.updateHotelStylesSetting) ;
api.delete(`/admin/hotels/:hotelId/styles`, mid.isAdmin, hotel.deleteHotelStylesSetting) ;


api.post(`/admin/hotels/:hotelId/details`, mid.isAdmin, hotel.addHotelDetails) ;
api.put(`/admin/hotels/:hotelId/details`, mid.isAdmin, hotel.updateHotelDetails) ;
api.delete(`/admin/hotels/:hotelId/details`, mid.isAdmin, hotel.deleteHotelDetails) ;
api.get(`/admin/hotels/:hotelId/details`, mid.isAdmin, hotel.getHotelDetails) ;

//endpoint to get/add/update/delete hotel data  
api.delete(`/admin/hotels/:hotelId`, mid.isAdmin, hotel.deleteHotelFullData) ;
api.put(`/admin/hotels/:hotelId`, mid.isAdmin,  hotel.updateHotel) ;
api.post(`/admin/hotels`, mid.isAdmin, hotel.addHotel) ;
api.get(`/hotels/:hotelId`, hotel.getHotelObject) ;
api.get(`/hotels`, hotel.getHotels) ;

//endpoint to save/update reservation data  
api.put(`/hotels/:hotelId/reservations/:reservationId`, booking.updateBooking) ;
api.get(`/hotels/:hotelId/reservations/:reservationId`, booking.getBookings) ;
api.get(`/hotels/:hotelId/reservations`, booking.getBookings) ;
//endpoint to trigger a payment request 
api.get(`/hotels/:hotelId/reservations/:reservationId/getPaymentResultById/subscribe`, payment.subscribePaymentResultById);
api.get(`/hotels/:hotelId/reservations/:reservationId/getPaymentResultById`, payment.getPaymentResultById);
api.post(`/hotels/:hotelId/reservations/:reservationId/getPaymentUrl`, payment.getPaymentLink);
//endpoint to get hotel stay offers data   
api.get(`/hotels/:hotelId/stays`, hotel.getHotelStays) ;

//endpoint to trigger a QRCode email request 
api.post(`/hotels/:hotelId/qrcode`, email.renderAndSendQrCode);
api.get(`hotels/count`, hotel.getHotelsCount) ;

//endpoint to reset the reservation data (only for DEMO app)
api.get(`/reset`, booking.resetBookings);
api.get(`/token`, email.getToken);
api.post(`/emailtoken`, email.getEmailType);

//Admin part : UI
api.get('/admin', admin.displayDashboard);
//AWS ALB healthCheck
api.get('/health', (req, res) => res.status(200).send('OK'));

module.exports = api ;