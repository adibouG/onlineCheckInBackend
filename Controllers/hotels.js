require('dotenv').config();
const db = require('../Models/database.js');
const Models = require('../Models/index.js');
const helpers = require('../Helpers/helpers.js');

// GET /email route controller function, get a valid booking, generate token and trigger the 1rst start-pre-checkin email.
const getHotels = async (req, res, next) => {
//TODO replace the email trigger by the loop search process
    try{
        let hotelID = req.params ? req.params.hotelId : null ;
        const dbManager = new db.HotelPmsDB();
        let hotels = await dbManager.getFullHotelDataSet(hotelID);
        return res.status(200).send(hotels);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const addHotel = async (req, res, next) => {
    try{
        const newHotelValues = req.body ;
        const newHotel = new Models.Hotel(newHotelValues);
        const dbManager = new db.HotelPmsDB();
        const newHotelPmsId = newHotel.pmsSettings && newHotel.pmsSettings.pmsId ? newHotel.pmsSettings.pmsId : null; 
        if (!newHotelPmsId) throw new Error('Missing pms id');
        let newID = await dbManager.addHotel(newHotel);
        return res.status(200).send({ hotel_id: newID });
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
const updateHotel = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        const newHotelValues = req.body ;
        newHotelValues.hotelId = hotelId ;
        const hotel = new Models.Hotel(newHotelValues);
        const hotelpms = hotel.pmsSettings;
        const hoteldetails = hotel.hotelDetails;
        const hotelPmsId = hotelpms.pmsId ? hotelpms.pmsId : null; 
        const dbManager = new db.HotelPmsDB();
        if (!hotelPmsId) throw new Error('Missing pms id');
        await dbManager.updateHotel(hotelId, hotel);
        await dbManager.updateHotelDetails(hotelId, hoteldetails);
        await dbManager.updateHotelPmsSettings(hotelId, hotelpms);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
const deleteHotel = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new db.HotelPmsDB();
        await dbManager.deleteHotel(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     

const getBookings = async (req, res, next) => {
    try{
        let hotelID = req.params ? req.params.hotelId : null ;
        let reservationID = req.query ? req.query.reservationId : null ;
        let hotelReservations = await helpers.getReservations(hotelID, reservationID);
        return res.status(200).send(hotelReservations);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const updateBooking = async (req, res, next) => {
    try{
        let hotelID = req.params ? req.params.hotelId : null ;
        let payload = req.body ? req.body : null ;
        let { reservationId } = payload ;
        await helpers.postReservations(hotelID, reservationId, payload);
        return res.status(200).send("OK");
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

module.exports = {
    getHotels,
    addHotel,
    updateHotel,
    deleteHotel,
    getBookings,
    updateBooking
}