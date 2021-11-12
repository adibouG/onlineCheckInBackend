require('dotenv').config();
const { Database } = require('../Models/database.js');
const { DatabaseAdmin } = require('../Models/databaseAdmin.js');

const Models = require('../Models/index.js');
const helpers = require('../Helpers/helpers.js');

//get the hotels count
const getHotelsCount = async (req, res) => {
    try{
        const dbManager = new Database();
        const hotels = await dbManager.getHotelsCount();
        return res.status(200).send(hotels);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

//get the hotels
const getHotels = async (req, res) => {
    try{
        const { hotelId } = req?.params;
        const dbManager = new Database();
        const hotels = await dbManager.getHotels({ hotelId });
        let response;
        response = hotels.map(r => new Models.Hotel({ hotelId: r.hotel_id, name: r.hotel_name, pmsId: r.pms_id }));
        response = hotelId ? response[0] : response;
        return res.status(200).send(response);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

//add an hotel
const addHotel = async (req, res) => {
    try{
        const { hotelName, pmsId, hotelDetails } = req.body ;
        const dbManager = new Database();
        //check pmsId exist 
        let pms = await dbManager.getPmsCount(pmsId);
        if (!pms) throw new Error('PmsId does not exist');
        const newHotel = new Models.Hotel({ name: hotelName, pmsId: pmsId });
        let newId = await dbManager.addHotel({ hotelName: newHotel.name, pmsId: newHotel.pmsId });
        if (hotelDetails) {
            const newHotelDetails = new Models.HotelDetails({ hotelId: newId, ...hotelDetails });
            await dbManager.addHotelDetails(newId, newHotelDetails);
        }
        return res.status(200).send({ hotelId: newId });
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
const updateHotel = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        const { hotelName, pmsId } = req.body ;
        const updtHotel = new Models.Hotel({ name: hotelName, pmsId: pmsId });
        const dbManager = new Database();
        await dbManager.updateHotel(hotelId, updtHotel);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
/*     
const deleteHotel = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new Database();
        await dbManager.deleteHotel(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
*/
//hotel booking

const getBookings = async (req, res, next) => {
    try{
        const { hotelId, reservationId } = req?.params ;

        const hotelReservations = await helpers.getReservations(hotelId, reservationId);
        console.log(hotelReservations)
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

// hotel details 
const getHotelObject = async (req, res) => {
    try{
        const hotelId = req.params ? req.params.hotelId : null ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new Database();
        const data = await dbManager.getHotelObject(hotelId);
        return res.status(200).send(data);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


// hotel details 
const getHotelDetails = async (req, res) => {
    try{
        const hotelId = req.params ? req.params.hotelId : null ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new Database();
        const data = await dbManager.getHotelDetails(hotelId);
        return res.status(200).send(data);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


const addHotelDetails = async (req, res) => {
    try{
        const hotelId = req.params ? req.params.hotelId : null ;
        const { hotelDetails } = req.body ;
        const dbManager = new Database();
        const newHotelDetails = new Models.HotelDetails({ hotelId: hotelId, ...hotelDetails });
        await dbManager.addHotelDetails(hotelId, newHotelDetails);
        return res.status(200).send("OK");
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
const updateHotelDetails = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { hotelDetails } = req.body ;
        if (!hotelId) throw new Error('Missing hotel id');
        const updtHotelDetails = new Models.HotelDetails(hotelDetails);
        const dbManager = new Database(); 
        await dbManager.updateHotelDetails(hotelId, updtHotelDetails);
       
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const deleteHotelDetails = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new Database(); 
        await dbManager.deleteHotelDetails(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}




//Pms Access
const getHotelPms = async (req, res) => {
    try{
        const { hotelId } = req?.params ;
        const dbManager = new Database();
        const hotels = await dbManager.getHotelPmsSettings(hotelId);
        return res.status(200).send(hotels);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const addHotelPms = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { pmsSettings } = req.body ;
        const newHotelPms = new Models.HotelPmsSettings(pmsSettings);
        const dbManager = new Database();
        let newId = await dbManager.addHotelPmsSettings(hotelId, newHotelPms);
        return res.status(200).send({ hotelId: newId });
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
const updateHotelPms = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { pmsSettings } = req.body ;
        if (!pmsSettings.pmsId) throw new Error('Missing pms id');
        const updtHotelPms = new Models.HotelPmsSettings({ hotelId, ...pmsSettings });
        const dbManager = new Database();
        await dbManager.updateHotelPmsSettings(hotelId, updtHotelPms);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
const deleteHotelPms = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        if (!hotelId) throw new Error('Missing hotel id');
        const dbManager = new Database();
        await dbManager.deleteHotelPmsSettings(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

//Screens Settings

const getHotelScreenSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const dbManager = new Database();
        const screens = await dbManager.getHotelScreenSettings(hotelId);
        return res.status(200).send(screens);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const addHotelScreenSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { screenSettings } = req?.body
        const newHotelScreen = new Models.HotelScreenSettings(screenSettings);
        const dbManager = new Database();
        await dbManager.addHotelScreenSettings(hotelId, newHotelScreen);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


const updateHotelScreenSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { screenSettings } = req?.body
        const newHotelScreen = new Models.HotelScreenSettings(screenSettings);
        const dbManager = new Database();
        await dbManager.updateHotelScreenSettings(hotelId, newHotelScreen);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}



const deleteHotelScreenSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const dbManager = new Database();
        await dbManager.deleteHotelScreenSettings(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


//Style Settings

const getHotelStylesSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const dbManager = new Database();
        const styles = await dbManager.getHotelStyleSettings(hotelId);
        const hotelStyle = new Models.HotelStylesSettings({ logo: styles.logo, fontFamily: styles['font-family'], backgroundImage: styles['background-image'], cssFileUrl: styles['css']  });
        return res.status(200).send(hotelStyle);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}

const addHotelStylesSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { styleSettings } = req?.body
        const newHotelStyle = new Models.HotelStyleSettings(styleSettings);
        const dbManager = new Database();
        await dbManager.addHotelStyleSettings(hotelId, newHotelStyle);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


const updateHotelStylesSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const { styleSettings } = req?.body
        const newHotelStyle = new Models.HotelPmsSettings(styleSettings);
        const dbManager = new Database();
        await dbManager.updateHotelStyleSettings(hotelId, newHotelStyle);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}



const deleteHotelStylesSetting = async (req, res, next) => {
    try{
        const { hotelId } = req?.params ;
        const dbManager = new Database();
        await dbManager.deleteHotelStyleSettings(hotelId);
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}



const getHotelFullData = async (req, res) => {
    try{
        const { hotelName, pmsSettings, checkinAppSettings, hotelDetails } = req.body ;
        if (!pmsSettings.pmsId) throw new Error('Missing pms id');
        const newHotel = new Models.Hotel({ name: hotelName, pmsId: pmsSettings.pmsId });
        const newHotelPms = new Models.HotelPmsSettings(pmsSettings);
        const newHotelDetails = new Models.HotelDetails(hotelDetails);
        const newHotelAppSettings = new Models.HotelAppSettings(checkinAppSettings);
        const dbManager = new Database();
        let newId = await dbManager.addHotel({ hotelName: newHotel.name, pmsSettings: newHotelPms, hotelDetails: newHotelDetails, hotelAppSettings: newHotelAppSettings });
        return res.status(200).send({ hotelId: newId });
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     

//add a full hotel data set 
const addHotelFullData = async (req, res) => {
    try{
        const { hotelName, pmsSettings, checkinAppSettings, hotelDetails } = req.body ;
        if (!pmsSettings.pmsId) throw new Error('Missing pms id');
        const newHotel = new Models.Hotel({ name: hotelName, pmsId: pmsSettings.pmsId });
        const newHotelPms = new Models.HotelPmsSettings(pmsSettings);
        const newHotelDetails = new Models.HotelDetails(hotelDetails);
        const newHotelAppSettings = new Models.HotelAppSettings(checkinAppSettings);
        const dbManager = new Database();
        let newId = await dbManager.addHotel({ hotelName: newHotel.name, pmsSettings: newHotelPms, hotelDetails: newHotelDetails, hotelAppSettings: newHotelAppSettings });
        return res.status(200).send({ hotelId: newId });
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     
//update a full hotel data set 
const updateHotelFullData = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        const { hotelName, pmsSettings, checkinAppSettings, hotelDetails } = req.body ;
        if (!pmsSettings.pmsId) throw new Error('Missing pms id');

        const updtHotel = new Models.Hotel({ name: hotelName, pmsId: pmsSettings.pmsId });
        const updtHotelPms = new Models.HotelPmsSettings(pmsSettings);
        const updtHotelDetails = new Models.HotelDetails(hotelDetails);
        const updtHotelAppSettings = new Models.HotelAppSettings(checkinAppSettings);

        const dbManager = new Database();
        await dbManager.updateHotel(hotelId, updtHotel);
        await dbManager.updateHotelDetails(hotelId, updtHotelDetails);
        await dbManager.updateHotelPmsSettings(hotelId, updtHotelPms);
        //await dbManager.updateHotelAppSettings(hotelId, updtHotelAppSettings);
        
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


     
//update a full hotel data set 
const deleteHotelFullData = async (req, res, next) => {
    try{
        const hotelId = req.params.hotelId ;
        const { hotelName, pmsSettings, checkinAppSettings, hotelDetails } = req.body ;
        if (!pmsSettings.pmsId) throw new Error('Missing pms id');

        const updtHotel = new Models.Hotel({ name: hotelName, pmsId: pmsSettings.pmsId });
        const updtHotelPms = new Models.HotelPmsSettings(pmsSettings);
        const updtHotelDetails = new Models.HotelDetails(hotelDetails);
        const updtHotelAppSettings = new Models.HotelAppSettings(checkinAppSettings);

        const dbManager = new Database();
        await dbManager.updateHotel(hotelId, updtHotel);
        await dbManager.updateHotelDetails(hotelId, updtHotelDetails);
        await dbManager.updateHotelPmsSettings(hotelId, updtHotelPms);
        //await dbManager.updateHotelAppSettings(hotelId, updtHotelAppSettings);
        
        return res.status(200).send('OK');
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}
     

// hotel stay data 
const getHotelStays = async (req, res) => {
    try{
        const { hotelId } = req?.params;
        const { startDate, endDate } = req?.query;
        const hotelStays = await helpers.getHotelStays(hotelId, startDate, endDate);
        return res.status(200).send(hotelStays);
    } catch(e) {
        let error = e;
        console.log(error);
        return res.status(400).send(error) ;
    }
}


module.exports = {
    getHotels,
    getHotelsCount,
    addHotel,
    updateHotel,
   // deleteHotel,
    deleteHotelFullData,
    getHotelPms,
    addHotelPms,
    updateHotelPms,
    deleteHotelPms,
    getBookings,
    updateBooking,
    getHotelStays,
    getHotelScreenSetting,
    updateHotelScreenSetting,
    addHotelScreenSetting,
    deleteHotelScreenSetting,
    getHotelStylesSetting,
    updateHotelStylesSetting,
    addHotelStylesSetting,
    deleteHotelStylesSetting,
    getHotelDetails,
    updateHotelDetails,
    addHotelDetails,
    deleteHotelDetails,
    getHotelObject

}