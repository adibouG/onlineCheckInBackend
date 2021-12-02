const api = require('express').Router() ;
const booking = require('../Controllers/getBooking.js') ;
const admin = require('../Controllers/admin.js') ;
const email = require('../Controllers/getEmail.js') ;
const hotel = require('../Controllers/hotels.js') ;
const pms = require('../Controllers/pms.js') ;
const payment = require('../Controllers/payments.js') ;


//Checkin APP endpoints 
//TO DO : add security checks and middlewares
const isAdmin = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const {isAdmin} = req?.body;
        if (isAdmin === true) return next();
    } else {
        const {isAdmin} = req?.query;
        if (isAdmin === true) return next(); 
    }
    return res.status(401).end();
}

api.get(`/checkin/qrcode`, email.getQrFromToken); 
//endpoint to retrieve the reservation data from the token send by email and using the frontend app 
api.post(`/checkin/getpaymentlink`, payment.getPaymentLinkFromToken);
api.get(`/checkin/getpaymentresult`, payment.getPaymentResultById);

api.post(`/checkin`, booking.postBooking);
api.get(`/checkin`, booking.getBookingFromToken);

//endpoint to retrieve the pms data from the pmsAPI 
api.get(`/admin/pms/:pmsId`, pms.getPms);
api.get(`/admin/pms`, pms.getPms);

api.get(`/hotels/:hotelId/appsettings`, hotel.getHotelScreenSetting) ;

api.put(`/admin/hotels/:hotelId/pms`, isAdmin,  hotel.updateHotelPms) ;
api.post(`/admin/hotels/:hotelId/pms`,isAdmin, hotel.addHotelPms) ;
api.delete(`/admin/hotels/:hotelId/pms`,isAdmin, hotel.deleteHotelPms) ;
api.get(`/admin/hotels/:hotelId/pms`,isAdmin, hotel.getHotelPms) ;

api.put(`/admin/hotels/:hotelId/screens`,isAdmin, hotel.updateHotelScreenSetting) ;
api.post(`/admin/hotels/:hotelId/screens`,isAdmin, hotel.addHotelScreenSetting) ;
api.delete(`/admin/hotels/:hotelId/screens`,isAdmin, hotel.deleteHotelScreenSetting) ;

api.post(`/admin/hotels/:hotelId/styles`,isAdmin, hotel.addHotelStylesSetting) ;
api.put(`/admin/hotels/:hotelId/styles`,isAdmin, hotel.updateHotelStylesSetting) ;
api.delete(`/admin/hotels/:hotelId/styles`,isAdmin, hotel.deleteHotelStylesSetting) ;
api.get(`/admin/hotels/:hotelId/styles`,isAdmin, hotel.getHotelStylesSetting) ;



api.post(`/admin/hotels/:hotelId/details`,isAdmin, hotel.addHotelDetails) ;
api.put(`/admin/hotels/:hotelId/details`,isAdmin, hotel.updateHotelDetails) ;
api.delete(`/admin/hotels/:hotelId/details`,isAdmin, hotel.deleteHotelDetails) ;
api.get(`/admin/hotels/:hotelId/details`,isAdmin, hotel.getHotelDetails) ;


//endpoint to get/add/update/delete hotel data  
api.delete(`/admin/hotels/:hotelId`, isAdmin, hotel.deleteHotelFullData) ;
api.put(`/admin/hotels/:hotelId`,isAdmin,  hotel.updateHotel) ;
api.post(`/admin/hotels`,isAdmin, hotel.addHotel) ;
api.get(`/admin/hotels/:hotelId`, isAdmin, hotel.getHotels) ;
api.get(`/admin/hotels`,isAdmin, hotel.getHotels) ;

api.get(`/hotels/:hotelId`, hotel.getHotelObject) ;
api.get(`/hotels`, hotel.getHotels) ;


//endpoint to save/update reservation data  
api.put(`/hotels/:hotelId/reservations/:reservationId`, booking.updateBooking) ;
api.get(`/hotels/:hotelId/reservations/:reservationId`, booking.getBookings) ;
api.get(`/hotels/:hotelId/reservations`, booking.getBookings) ;
//endpoint to trigger a payment request 
api.get(`/hotels/:hotelId/reservations/:reservationId/getPaymentResultById`, payment.getPaymentResultById);
api.post(`/hotels/:hotelId/reservations/:reservationId/getPaymentUrl`, payment.getPaymentLink);
//endpoint to get hotel stay offers data   
api.get(`/hotels/:hotelId/stays`, hotel.getHotelStays) ;
api.get(`/hotels/:hotelId/appsettings`, hotel.getHotelStays) ;

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