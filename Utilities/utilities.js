const dynamoDB = require('../AWS/awsDynamoDb.js');
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../Crypto/crypto.js');
let QRCode = require('qrcode') ;
const Models = require('../Models/index.js');
const Errors = require('../Models/errors.js');
const SETTINGS = require('../settings.json') ;
const HOTEL = require('../hotel.settings.json') ;
const RESERVATION = SETTINGS.DYNAMODB_TABLE.RESERVATION;

const generateUUID = () => randomUUID();

const makeQrCode = async (booking) => {
    let code = {
        bookingId:booking.uuid, 
        firstName:booking.guest.firstName , 
        lastName:booking.guest.lastName 
    };
    return await QRCode.toDataURL(JSON.stringify(code));
}

//function to generate customized tokens 
const makeStartPreCheckInEmailToken = (email, uuid, reservationID, hotelID) => {
    //TODO place the signature template in a specific module and set up a real secret with 32char/128bit entropy
    let sign = { 
        expiresIn: SETTINGS.TOKEN.VALIDITY,
        issuer: 'ENZOSYSTEMS ONLINE PRECHECKIN API',
        subject: 'precheckinapi/getBookingFromEmail',
        audience: 'Enzosystems/online precheckin api'  
    };
    let reservation_id = reservationID ;
    let hotel_id = hotelID ;
    let payload = { reservation_id, hotel_id, uuid, email } ;
    try {
        let token = jwt.sign(payload, secretKey, sign) ;
        return token;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const getBookingFromEmail = async (email) => {
   
    let bookings = [] ; 
    let validEmail = email.length > 0 || false ;
    try {
        if (!email || !validEmail) throw new Models.EnzoError('no email or invalid email');
        let results = await dynamoDB.findDynamoDBItems(RESERVATION, "email", email);
        results.Items.forEach((item) => {
            let b = unmarshall(item) ;
            if (b["email"] == email || b["guest"]["email"] === email) bookings.push(b) ;
        });
        if (!bookings.length) throw new Models.NotFound('no reservation with this email') ; 
        //try to find a valid reservation
        let booking = findValidBooking(bookings);
        return booking ;
    } catch(e) {
        console.log(e);
        throw e;
    } 
}

const findValidBooking = (bookings, status = null) => {
    let booking ;
    if (!bookings.length) throw new Models.NotFound('no reservation with this email') ; 
    //try to find a valid reservation
    for (let b of bookings) {
        if (isBookingValid(b) && !isPreCheckedBooking(b)) {
            if (!status || status.toUpperCase() === 'PENDING') booking = b ;
            break;
        }
    }       
    if (!booking) { // if none try to find a prechecked reservation
        for (let b of bookings) {
            if (isBookingValid(b) && isPreCheckedBooking(b)) {
                if (!status || status.toUpperCase() === 'PRECHEKED') booking = b ;
                break;
            }
        }
    }
    if (!booking) { // if none try to find a checked reservation
        for (let b of bookings) {
            if (!(isBookingValid(b) || isPreCheckedBooking(b))) {
                if (!status || status.toUpperCase() === 'COMPLETE') booking = b ;
                break;
            }
        }
    }
    if (!booking) throw new Errors.NotFound();
    return booking ;
}

const setCheckBooking = async (bookingUpdt) => {
    let uuidKey = bookingUpdt.uuid;
    bookingUpdt.reservation['status'] = 'PRECHECKED';
    return await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: uuidKey, ...bookingUpdt });
} 

const isBookingValid = (book) => !("arrivalDate" in book.reservation) ;

const isPreCheckedBooking = (book) => (book && book.reservation && "status" in book.reservation && book.reservation.status.toUpperCase() === 'PRECHECKED') ;

const makeCheckInAppResponseBody = (hotel_id, booking) => {
    let prechecked, complete;
    if (isPreCheckedBooking(booking)) prechecked = true ;
    if (!isBookingValid(booking)) complete = true ;
    if (complete) response = { type: 'success', status: 'complete', stay: { arrivalDate: booking.reservation.arrivalDate }, hotel_id: hotel_id };
    else if (prechecked) response = { type: 'success', status: 'prechecked', checkin : booking, hotel_id: hotel_id };
    else response = { type: 'success', status: 'pending', checkin : booking, hotel_id: hotel_id };
    
    return response;
}

const findValueInDataStore = ({ value, key, store }) => {
    let objectToFind = [] ;
    for ( const entry in store ) {
        if (store[entry] === value ) {
            if (key && key !== entry) continue ;
            objectToFind.push(store) ;
        } else if (Object.keys(store[entry]) && Object.keys(store[entry]).length){
            let child = store[entry] ;
            return findValueInDataStore({ value , key , store: child }) ;
        } 
    }
    return objectToFind ;
}

const getInDataStore = (key ,store) => {
    if (!(key in store)) return null ;
    return store[key] ;
}

const setInDataStore = (key ,upd ,store) => {
    if (!getInDataStore(key, store)) return null ;
    store[key] = upd  ;
    return store[key] ;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const dateDiffInDays = (a, b) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  }

const makeDate = () => {
    let date1 = new Date(((new Date().getTime()) + (MS_PER_DAY))).toLocaleDateString();
    let date2 = new Date(((new Date(date1).getTime()) + (MS_PER_DAY))).toLocaleDateString() ;
    return {date1 , date2}
}

const getDay = (d , loc = false) => new Date(d).toLocaleDateString(loc, { weekday: 'long' });

const resetBookingState = (book) => {
    if (isPreCheckedBooking(book)) delete book.reservation.status ;
    return book ;
};

const makeCheckDates = (past = false) => {
    let len = Math.floor(Math.random() * 10)   ;
    len = past ? -1 * len : len ;
    let today = new Date();
    let otherDate = new Date(new Date().setDate(today.getDate() +  len)) ;
    return ({ 
        today: today.toISOString().split('T')[0] ,
        otherDate: otherDate.toISOString().split('T')[0] 
    }) ;
}

const resetBookingDate = (book) => {
    let newDates ;
    if ("arrivalDate" in book.reservation) {
        newDates = makeCheckDates(true) ; 
        book.reservation.arrivalDate = newDates.otherDate ;
        book.reservation.startDate = newDates.otherDate ;
        book.reservation.endDate = newDates.today ;
    } else {
        newDates = makeCheckDates(false) ; 
        book.reservation.startDate = newDates.today ;
        book.reservation.endDate = newDates.otherDate ;
    }
    return book ;
};
 
const resetBookingStatus = async (email = null, uuid = null) => {
    const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;
    try {
        let originalDb = getInDataStore("checkins" ,db) ;
        if (!email && !uuid) {
           for ( const check in  originalDb) {
                let newBook = resetBookingDate(originalDb.checkins[check]) ;
                await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: check, ...newBook });
            }
        } else if (email) {
            let bookings = [];
            for ( const check in  originalDb) {
                if (originalDb[check].email === email) {
                    booking = originalDb[check] ;
                    let newBook = resetBookingDate(booking) ;
                    await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: booking.uuid, email: booking.guest.email, ...newBook });
                }
            }
        } else if (uuid) {
            let booking = findValueInDataStore(uuid, 'uuid', originalDb) ;
            let newBook = resetBookingDate(booking) ;
            await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: booking.uuid, email: booking.guest.email, ...newBook});
        }
        return 1;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const makeFormatedDate = (d = null, l = null) =>   {
    let date = d ? new Date(d) : new Date() ;
    return date.toISOString();
}

const addDay = (date, d) =>  new Date(date.getTime() + (d * MS_PER_DAY)) ;

module.exports = {
    resetBookingDate,
    makeCheckDates,
    resetBookingState,
    resetBookingStatus,
    isBookingValid,
    isPreCheckedBooking,
    findValueInDataStore ,
    getInDataStore , 
    setInDataStore ,
    dateDiffInDays,
    makeFormatedDate ,
    addDay ,
    makeDate,
    getDay,
    generateUUID,
    setCheckBooking,
    makeQrCode,
    getBookingFromEmail,
    makeCheckInAppResponseBody,
    makeStartPreCheckInEmailToken
}