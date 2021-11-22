const Errors = require('../Models/errors.js');
const Enzo = require('../Models/Enzo.js');
const helpers = require('../Helpers/helpers.js');
const jwt = require('jsonwebtoken') ;
const { verifyToken, setCheckBooking } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');
const { FINAL_STEP } = require('../settings.json');
//Request a booking route controller (from token contained in email link acyually)
const getBookingFromToken = async (req, res) => {
    
    let token = null;
    let booking = null;
    let hotelAppSettings = null;
    try {
        //get the token
        const { authorization } = req?.headers;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
        token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
        winstonLogger.info('received token :' + token);
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { hotelId, reservationId } = decoded;
        if (!token || !hotelId || !reservationId) throw new Errors.EnzoError('no valid token');
        booking = await helpers.getReservations(hotelId, reservationId);
        if (!booking.length) throw new Errors.NotFound() ;        
        const reservation = booking[0];
        const roomStay = reservation.roomStays[0];
        //token was signed using the reservation state in order to make it only 1 time use 
        verifyToken(token, roomStay); 
        const hotelStay = await helpers.getHotelOffers(hotelId, roomStay.expectedArrival, roomStay.expectedDeparture);
        
        const availableRoomIds = [];
        const  availableRoomTypeIds = [];
        const  availableOptionIds = [];
        hotelStay.rooms.map(r => {
            if(r.status === Enzo.EnzoRoom.ROOM_STATUS.CLEAN) {
                availableRoomIds.push(r.pmsId);
                if (!availableRoomTypeIds.includes(r.roomTypeId)) {
                    availableRoomTypeIds.push(r.roomTypeId);
                }
                return r.pmsId;
            }
        });
                    
        hotelStay.options.map( o => {
            availableOptionIds.push(o.pmsId);
        });
        reservation.roomStays[0].availableOptionIds = availableOptionIds;
        reservation.roomStays[0].availableRoomTypeIds = availableRoomTypeIds;
        reservation.roomStays[0].availableRoomIds = availableRoomIds;
    
        hotelStay.reservation = reservation;

        //get HotelPolicies screens values into the  booking
        return res.status(200).send(hotelStay);
    } catch(e) {
        winstonLogger.error(e) ;
        return res.status(e.code || 401).send(e.message || 'error') ;
    }
};

//Update booking route controller (received from the checkinApp for now) 
const postBooking = async (req, res) => {
    try {
        const { authorization } = req?.headers;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
        const token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
        winstonLogger.info('received token :' + token);
        if (!token) throw new Errors.EnzoError('no token');
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        const data = req?.body;
        if (!data) throw new Errors.EnzoError('no booking nor update');
        const stay = new Enzo.EnzoRoomStay(data);
        verifyToken(token, stay)
        await helpers.postReservations(hotelId, reservationId, stay);
        if (step == FINAL_STEP) enzoCheckin = setCheckBooking(enzoCheckin);
       /*
        const updtBookingData = await helpers.getReservations(hotelId, reservationId);
        if (!updtBookingData) throw new Errors.NotFound() ;
        const response = makeCheckInAppResponseBody(updtBookingData[0].roomStays[0], hotelId);
       */
        return res.status(200).send("OK");
    } catch(e) {
        console.log(e) ;
        return res.status(e.status || 401).send(e.message || 'error') ;
    }
}



const getBookings = async (req, res, next) => {
    try{
        const { hotelId, reservationId } = req?.params ;

        const hotelReservations = await helpers.getReservations(hotelId, reservationId);
        if (!hotelReservations.length) return res.status(404).send(hotelReservations) ;
        else if (reservationId) return res.status(200).send(hotelReservations[0]);
        else return res.status(200).send(hotelReservations);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const updateBooking = async (req, res, next) => {
    try{
        const { hotelId, reservationId } = req?.params ;
        const data = req.body ? req.body : null ;
        await helpers.postReservations(hotelId, reservationId, data);
        return res.status(200).send("OK");
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const getPayments = async (req, res, next) => {
    try{
        const { hotelId, reservationId } = req?.params ;
        //TO DO:
        const hotelReservations = await helpers.getReservations(hotelId, reservationId);
        if (!hotelReservations.length) return res.status(404).send(hotelReservations) ;
        else if (reservationId) return res.status(200).send(hotelReservations[0]);
        else return res.status(200).send(hotelReservations);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const addPayment = async (req, res, next) => {
    try{
        const { hotelId, reservationId } = req?.params ;
        const data = req.body ? req.body : null ;
        //TO DO
        await helpers.postReservations(hotelId, reservationId, data);
        return res.status(200).send("OK");
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

//Reset booking route controller (received from the checkinApp for now) 
const resetBookings = async (req, res) => {
    try {
        const { email, reservationId } = req?.query;
        await helpers.resetBookingStatus(email||null, reservationId||null) ;
        return res.status(200).send("OK");
    } catch(e) {
        console.log(e);
        return res.status(500).end();
    }
}

module.exports = {
    getBookingFromToken ,
    postBooking ,
    resetBookings  ,
    updateBooking,
    getBookings,
    getPayments,
    addPayment
}
