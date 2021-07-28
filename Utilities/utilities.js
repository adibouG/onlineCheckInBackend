const dynamoDB = require('../AWS/awsDynamoDb.js');
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../Crypto/crypto.js');
let QRCode = require('qrcode') ;
const Models = require('../Models/index.js');
const Errors = require('../Models/errors.js');
const SETTINGS = require('../settings.json') ;
const { MAILTYPES } = require('../Emails/enzoMails.js') ;
const RESERVATION = SETTINGS.DYNAMODB_TABLE.RESERVATION;
const { CHECKIN_REQUEST_START_DAY_OFFSET, VALID_ENZO_STATUS, APP_BASE_URL } = SETTINGS ;

const preCheckInIsValid = (booking, offset = CHECKIN_REQUEST_START_DAY_OFFSET) => {
    const startDate = new Date(booking.startDate);
    return (startDate >= new Date().setHours(0, 0, 0, 0) && startDate <= addDay(new Date().setHours(23, 59, 59, 999), offset) && VALID_ENZO_STATUS.includes(booking.status.toUpperCase()));
}
const isItTracked = (r, emailTracking) => {
    let isTracked = false;
    for (let j = 0; j < emailTracking.length; j++) {
        if (emailTracking[j].reservation === r.reservationId && parseInt(emailTracking[j].hotel) === parseInt(r.hotelId)) isTracked = true; 
        if (isTracked) break;   
    }  
    return isTracked;
};
const newReservationFilter = (r, l) => preCheckInIsValid(r) && !isItTracked(r, l);


const generateUUID = () => randomUUID();

const makeQrCode = async (booking) => {
    let code = {
        bookingId:booking.uuid, 
        firstName:booking.firstName , 
        lastName:booking.lastName 
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


const makeToken = (booking) => {
    try{
        //if a valid booking exist, generate the token for the 1rst email 
        let email = booking.email;
        let uuid = booking.uuid || generateUUID();
        let reservationID = booking.id || booking.reservationId;
        let hotelID = booking.hotelId;
        let token =  makeStartPreCheckInEmailToken(email, uuid, reservationID, hotelID);
        return token;
    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
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
    console.log(bookings)
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

const setCheckBooking = (bookingUpdt) => {
    let uuidKey = bookingUpdt.uuid;
    bookingUpdt.reservation['status'] = 'PRECHECKED';
    bookingUpdt.status = 'PRECHECKED' ;
    return bookingUpdt ;
} 

const isBookingValid = (book) => {
    if (book.reservation) return !("arrivalDate" in book.reservation && book.reservation.arrivalDate) ;
    else return !("arrivalDate" in book && book.arrivalDate) ;
} 

const isPreCheckedBooking = (book) => {
    if (book.reservation) return ("status" in book.reservation && book.reservation.status.toUpperCase() === 'PRECHECKED') ;
    else return ("status" in book && book.status === 'waitingForGuest') ;
}
const makeCheckInAppResponseBody = (hotel_id, booking) => {
    let prechecked = false ;
    let complete = false;
    console.log(booking)
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

const getInDataStore = (key, store) => {
    if (!(key in store)) return null ;
    return store[key] ;
}

const setInDataStore = (key, upd, store) => {
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
    return { date1, date2 }
}

const getDay = (d , loc = false) => new Date(d).toLocaleDateString(loc, { weekday: 'long' });

const resetBookingState = (book) => {
    if (isPreCheckedBooking(book)) delete book.reservation.status ;
    if (!isBookingValid(book)) delete book.reservation.arrivalDate ;
    if (book.payment.paid) book.payment.paid = false;
    if (book.privacyPolicy.accepted) book.privacyPolicy.accepted = false;
    if (book.guest) {
        if (book.guest.mobile) book.guest.mobile = null;
        if (book.guest.postalCode) book.guest.postalCode = null;
        if (book.guest.city) book.guest.city = null;
        if (book.guest.address) book.guest.address = null;
    }
    return book ;
};

//the true argument will return  
const makeCheckDates = (past = false) => {
    let len = (Math.floor(Math.random() * 10) + 1)   ;
    len = past ? -1 * len : len ;
    let today = new Date();
    let otherDate = addDay(today, len)  ;
    return ({ 
        today: today.toISOString().split('T')[0] ,
        otherDate: otherDate.toISOString().split('T')[0] 
    }) ;
}

const resetBookingDate = (book) => {
    let newDates ;
    console.log(book)
    if ("arrivalDate" in book.reservation) {
        newDates = makeCheckDates(true) ; 
        book.reservation.arrivalDate = newDates.otherDate ;
        book.reservation.startDate = newDates.otherDate ;
        book.reservation.endDate = newDates.today ;
    } else {
        newDates = makeCheckDates(false) ; 
        book.reservation.startDate = newDates.today ;
        book.reservation.endDate = newDates.otherDate ;
        book = resetBookingState(book);
    }
    return book ;
};


 
const resetBookingStatus = async (email = null, uuid = null) => {
    try {
        if (email || uuid) {
            let params = email ? { email: email } : { reservationID: uuid } ;
            let booking = await dynamoDB.getDynamoDBItem(RESERVATION, params);
            let newBook = resetBookingDate(booking);
            await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: booking.uuid, email: booking.guest.email, ...newBook });
        } else {
            let bookings = await dynamoDB.findDynamoDBItems(RESERVATION);
            //reset the dates
            for (let check of bookings.Items) {
                console.log(unmarshall(check));
                let newBook = resetBookingDate(unmarshall(check)) ;
                await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: newBook.uuid, ...newBook });
            }
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

const addDay = (date, d) => (new Date(new Date(date).getTime() + (d * MS_PER_DAY))) ;


const makeEmailValues = async (type, booking, hotelValues) => {
    try {
        let values = {} ;
        let firstName = booking.firstName;
        let lastName = booking.lastName;
        let guestName =  firstName + " " + lastName ;  
        let d1 = new Date(booking.startDate).toLocaleDateString();
        let d2 = new Date(booking.endDate).toLocaleDateString();
        if (type === MAILTYPES.START) {
            let checkDates =  d1 + " - " + d2 ;
            // generate the token for the 1rst email 
            let token =  makeToken(booking); // makeStartPreCheckInEmailToken(email, uuid, reservationID, hotelID);
            //TO DO: check/update the tracking to follow the new pattern and flow
            values = {
                guestLinkName : guestName.replaceAll(' ', '.') ,
                guestFullName : guestName ,
                booking : booking.bookingRef || booking.reservationId, 
                checkDates,
                token,
                app_link_baseUrl: APP_BASE_URL,
                ...booking
            };
        } else if (type === MAILTYPES.QR) {
            let url = await makeQrCode(booking);
            /*
            booking = setCheckBooking(booking);
            await dynamoDB.putDynamoDBItem(RESERVATION, { reservationID: uuidKey, ...bookingUpdt }) 
           */
            const numNights = dateDiffInDays(d1, d2)
            const roomType =  booking.roomType;
            const numGuests = booking.guestCount;
            const checkInTime = hotelValues.hotel_checkin_time;
            values = {
                checkInDate : d1 ,
                base64qrCode : url ,
                guestFullName : guestName ,
                booking : booking.bookingRef || booking.reservationId, 
                checkInTime,
                roomType,
                numNights,
                numGuests,
                ...booking
            };
            
        }

        let hotel = { 
            hotelName: hotelValues.hotel_name,
            hotelAddress: hotelValues.hotel_address,
            hotelPostcode: hotelValues.hotel_postcode,
            hotelCity: hotelValues.hotel_city,
            hotelCountry: hotelValues.hotel_country,
            hotelPhone: hotelValues.hotel_phone,
            hotelEmail: hotelValues.hotel_email 
        }

        return ({ ...values, ...hotel });

    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
    }
}





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
    makeStartPreCheckInEmailToken,
    makeToken,
    makeEmailValues,
    newReservationFilter
}