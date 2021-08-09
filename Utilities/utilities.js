const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../Crypto/crypto.js');
let QRCode = require('qrcode') ;
const CheckInApp = require('../Models/CheckInApp.js');
const Models = require('../Models/index.js');
const Errors = require('../Models/errors.js');
const SETTINGS = require('../settings.json') ;
const { MAILTYPES } = require('../Emails/enzoMails.js') ;
const { CHECKIN_REQUEST_START_DAY_OFFSET, VALID_ENZO_STATUS, APP_BASE_URL } = SETTINGS ;

const preCheckInIsValid = (booking, offset = CHECKIN_REQUEST_START_DAY_OFFSET) => {
    const startDate = new Date(booking.startDate);
    return (startDate >= new Date().setHours(0, 0, 0, 0) && startDate <= addDay(new Date().setHours(23, 59, 59, 999), offset) && booking.state && VALID_ENZO_STATUS.includes(booking.state.toUpperCase()));
}
const isItTracked = (r, emailTracking) => {
    let isTracked = false;
    for (let j = 0; j < emailTracking.length; j++) {
        if (emailTracking[j].reservation === r.reservationId && parseInt(emailTracking[j].hotel) === parseInt(r.hotelId)) isTracked = true; 
        if (isTracked) break;   
    }  
    return isTracked;
};

const newReservationFilter = (r, l) => (preCheckInIsValid(r) && !isItTracked(r, l));

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
const makeStartPreCheckInEmailToken = (email, uuid, state, reservationID, hotelID) => {
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
        let token = jwt.sign(payload, secretKey + state, sign) ;
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
        let reservationID = booking.reservationId;
        let hotelID = booking.hotelId;
        let state = booking.state;
        let token =  makeStartPreCheckInEmailToken(email, uuid, state, reservationID, hotelID);
        return token;
    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
    }
}

const findValidBooking = (bookings) => {
    let booking ;
    console.log(bookings)
    if (!bookings.length) throw new Models.NotFound('no reservation with this email') ; 
    //try to find a valid reservation
    for (let b of bookings) {
        if (preCheckInIsValid(b) &&  b.state.toUpperCase() === 'WAITINGFORGUEST'){ //isBookingValid(b) && !isPreCheckedBooking(b)) {
            //if (!status || status.toUpperCase() === 'PENDING') 
            booking = b ;
            break;
        }
    }       
    if (!booking) { // if none try to find a prechecked reservation
        for (let b of bookings) {
            if (preCheckInIsValid(b) &&  b.state.toUpperCase() === 'PRECHECKEDIN'){//if (isBookingValid(b) && isPreCheckedBooking(b)) {
                //if (!status || status.toUpperCase() === 'PRECHECKED')
                booking = b ;
                break;
            }
        }
    }
    if (!booking) { // if none try to find a checked reservation
        for (let b of bookings) {
            if (!preCheckInIsValid(b) && b.state.toUpperCase() === 'INHOUSE'){ //(!(isBookingValid(b) || isPreCheckedBooking(b))) {
                //if (!status || status.toUpperCase() === 'COMPLETE') 
                booking = b ;
                break;
            }
        }
    }
    if (!booking) throw new Errors.NotFound();
    return booking ;
}

const setCheckBooking = (bookingUpdt) => {
    bookingUpdt.state = 'PRECHECKEDIN' ;
    return bookingUpdt ;
} 

const isBookingValid = (book) =>  !book.arrivalDate && VALID_ENZO_STATUS.includes(book.state.toUpperCase()) ;

const isPreCheckedBooking = (book) => ("state" in book && book.state.toUpperCase() === 'PRECHECKEDIN') ;

const makeCheckInAppResponseBody = (booking, hotelID, hotelAppSettings) => {
    console.log(hotelAppSettings)
    let prechecked = false ;
    let complete = false;
    console.log('makeCheckInAppResponseBody ', booking)
    if (isPreCheckedBooking(booking)) prechecked = true ;
    if (!isBookingValid(booking)) complete = true ;
    const checkin = CheckInApp.Checkin.fromEnzoCheckIn(booking);
    if (complete) response = { type: 'failure', status: 'complete', stay: { arrivalDate: checkin.reservation.arrivalDate }, hotel_id: hotelID, hotelAppSettings };
    else if (prechecked) response = { type: 'success', status: 'prechecked', checkin : checkin, hotel_id: hotelID, hotelAppSettings };
    else response = { type: 'success', status: 'pending', checkin : checkin, hotel_id: hotelID, hotelAppSettings };
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
    a = new Date(a);
    b = new Date(b);
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
    if (isPreCheckedBooking(book)) book.state = 'waitingForGuest';
    if (book.payment.paid) book.payment.paidAmount = 0;
    if (book.hotelPolicies && book.hotelPolicies.privacyPolicy && book.hotelPolicies.privacyPolicy.accepted) book.hotelPolicies.privacyPolicy.accepted = false;
    if (book.mobile) book.mobile = null;
    if (book.postalCode) book.postalCode = null;
    if (book.city) book.city = null;
    if (book.country) book.country = null;
    if (book.addressLine1) book.addressLine1 = null;
    if (book.addressLine2) book.addressLine2 = null;
    return book ;
};

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
    if ("arrivalDate" in book && book.arrivalDate) {
        newDates = makeCheckDates(true) ; 
        book.arrivalDate = newDates.otherDate ;
        book.startDate = newDates.otherDate ;
        book.endDate = newDates.today ;
        book.state = 'inHouse';
    } else {
        newDates = makeCheckDates(false) ; 
        book.startDate = newDates.today ;
        book.endDate = newDates.otherDate ;
        book.state = 'waitingForGuest';
        book = resetBookingState(book);
    }
    return book ;
};

const makeFormatedDate = (d = null, l = null) =>   {
    let date = d ? new Date(d) : new Date() ;
    return date.toISOString();
}

const addDay = (date, d) => (new Date(new Date(date).getTime() + (d * MS_PER_DAY))) ;

//return a value object containing the values needed to render the email templates  
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
            let token = makeToken(booking); 
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
            const numNights = dateDiffInDays(d1, d2)
            const roomType =  booking.roomType;
            const numGuests = booking.guestCount;
            const checkInTime = hotelValues.hotel_checkin_time;
            values = {
                checkInDate: d1 ,
                base64qrCode: url ,
                guestFullName: guestName ,
                booking: booking.bookingRef || booking.reservationId, 
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
    findValidBooking,
    resetBookingState,
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
    makeCheckInAppResponseBody,
    makeStartPreCheckInEmailToken,
    makeToken,
    makeEmailValues,
    newReservationFilter
}