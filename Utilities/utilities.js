const { randomUUID } = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../Crypto/crypto.js');
let QRCode = require('qrcode') ;
const Models = require('../Models/index.js');
const Enzo = require('../Models/Enzo.js');
const Errors = require('../Models/errors.js');
const SETTINGS = require('../settings.json') ;
const { MAILTYPES } = require('../Emails/enzoMails.js') ;
const { CHECKIN_REQUEST_START_DAY_OFFSET, VALID_ENZO_STATUS, APP_BASE_URL } = SETTINGS ;

const preCheckInIsValid = (booking, offset = CHECKIN_REQUEST_START_DAY_OFFSET) => {
    const startDate = booking.expectedArrival ? new Date(booking.expectedArrival) : null;
    return (startDate && startDate >= new Date().setHours(0, 0, 0, 0) && startDate <= addDay(new Date().setHours(23, 59, 59, 999), offset) && booking.status && VALID_ENZO_STATUS.includes(booking.status.toUpperCase()));
}
const isItTracked = (reservation, hotelId, emailTrackingList) => {
    let isTracked = false;
    if (!emailTrackingList) return false;
    for (let track of emailTrackingList) {
        const trckObj = new Models.EmailTracking({ 
            reservationId: track.reservation_id,
            hotelId: track.hotel_id, 
            emailType: track.email_type, 
            sentDate: track.success_sent_date, 
            sendingDate: track.original_sending_date, 
            messageId: track.message_id, 
            attempts: track.attempts 
        });
        if (trckObj.reservationId == reservation.pmsId && trckObj.hotelId == hotelId) {
            isTracked = true; 
            break;
        }   
    }  
    return isTracked;
};

const newReservationFilter = (reservationId, hotelId, emailTrackList = null) => (preCheckInIsValid(reservationId) && !isItTracked(reservationId, hotelId, emailTrackList));


const makeQrCode = async (hotelId, booking) => {
    let code = {
        bookingId: booking.pmsId, 
        hotelId: hotelId, 
        firstName: booking.firstName , 
        lastName: booking.lastName 
    };
    return await QRCode.toDataURL(JSON.stringify(code));
}


const secureTokenSign = { 
    expiresIn: SETTINGS.TOKEN.VALIDITY,
    issuer: 'ENZOSYSTEMS ONLINE PRECHECKIN API',
    subject: 'precheckinapi/reservation',
    audience: 'Enzosystems/online precheckin api'
};
const makeSecureRequestToken = (reservationId, hotelId, steps, token = null) => {

    let tokenId = randomUUID();
    let payload = { tokenId, reservationId, hotelId, steps };
    try {
        let token = jwt.sign(payload, secretKey + reservationId, secureTokenSign) ;
        return token;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const verifySecureToken = (token, enzoBooking) => {
    try {
        return jwt.verify(token, secretKey + enzoBooking.pmsId, secureTokenSign);
    } catch (e) {
        throw e;
    } 
};

const startTokenSign = { 
    expiresIn: SETTINGS.TOKEN.VALIDITY,
    issuer: 'ENZOSYSTEMS ONLINE PRECHECKIN API',
    subject: 'precheckinapi/getBookingFromEmail',
    audience: 'Enzosystems/online precheckin api'       
};

const unlimitedTokenSign = { 
    issuer: 'ENZOSYSTEMS ONLINE PRECHECKIN API',
    subject: 'precheckinapi/getBookingFromEmail',
    audience: 'Enzosystems/TEST online precheckin api'       
};
//function to generate customized tokens 

const verifyToken = (token, booking) => {

    const decoded = jwt.decode(token)
    let test = String((decoded.aud).split('/')[1]).startsWith('TEST') ;
    //let test = false
    let sign =  test ? unlimitedTokenSign : startTokenSign ;
    try {
        jwt.verify(token, secretKey + booking.pmsId + booking.status, sign);
    } catch (e) {
        throw e;
    } 
};
const makeToken = (uuid, reservationId, status, hotelId) => {
    try{
        //if a valid booking exist, generate the token for the 1rst email 
        //TODO place the signature template in a specific module and set up a real secret with 32char/128bit entropy
        let steps = [-2, -1, 0, 1];
        let payload = { reservationId, hotelId, uuid, steps } ;
        let token = jwt.sign(payload, secretKey + reservationId + status, startTokenSign) ;
        let b64token = Buffer.from(token, 'utf8').toString('base64') ;
        return b64token;
    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
    }
};

const makeUnlimitedToken = (reservationId, hotelId, status) => {

    try{
        //if a valid booking exist, generate the token for the 1rst email 
        //TODO place the signature template in a specific module and set up a real secret with 32char/128bit entropy

        const payload = { reservationId, hotelId } ;

       

        let token = jwt.sign(payload, secretKey + reservationId + status, unlimitedTokenSign) ;
        let b64token = Buffer.from(token, 'utf8').toString('base64') ;
        return b64token;

    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
    }
};




const findValidBooking = (bookings) => {
    let booking ;
    console.log(bookings)
    if (!bookings.length) return  ; 
    //try to find a valid reservation
    for (let b of bookings) {
        if (preCheckInIsValid(b) && b.status.toUpperCase() === 'WAITINGFORGUEST'){ 
            booking = b ;
            break;
        }
    }       
    if (!booking) { // if none try to find a prechecked reservation
        for (let b of bookings) {
            if (preCheckInIsValid(b) && b.status.toUpperCase() === 'PRECHECKEDIN'){
                booking = b ;
                break;
            }
        }
    }
    if (!booking) { // if none try to find a checked reservation
        for (let b of bookings) {
            if (!preCheckInIsValid(b) && b.status.toUpperCase() === 'INHOUSE'){ 
                booking = b ;
                break;
            }
        }
    }
    if (!booking) throw new Errors.NotFound();
    return booking ;
};

const setCheckBooking = (bookingUpdt) => {
    bookingUpdt.status = 'PRECHECKEDIN' ;
    return bookingUpdt ;
} ;

const isBookingValid = (book) =>  !book.finalArrival && VALID_ENZO_STATUS.includes(book.status.toUpperCase()) ;

const isPreCheckedBooking = (book) => ("status" in book && book.status.toUpperCase() === 'PRECHECKEDIN') ;

//make a specific checkin app Response Body, handle the conversion to check in app format, verify the status and build response accordingly
//take a EnzoStay as booking, the hotelId, and the hotel app Settings object ... 
const makeCheckInAppResponseBody = ( res, stay, hotelStay, requestToken = null) => {
    hotelStay.reservation = stay;
    res.cookie( 'token', requestToken, { maxAge: 3000, httpOnly: true });
    res.locals =  hotelStay ;
    return res;
};

const findValueInDataStore = ({ value, key, store }) => {
    let objectToFind = [] ;
    for (const entry in store) {
        if (store[entry] === value) {
            if (key && key !== entry) continue ;
            objectToFind.push(store) ;
        } else if (Object.keys(store[entry]) && Object.keys(store[entry]).length){
            let child = store[entry] ;
            return findValueInDataStore({ value , key , store: child }) ;
        } 
    }
    return objectToFind ;
};

const getInDataStore = (key, store) => {
    if (!(key in store)) return null ;
    return store[key] ;
};

const setInDataStore = (key, upd, store) => {
    if (!getInDataStore(key, store)) return null ;
    store[key] = upd  ;
    return store[key] ;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const dateDiffInDays = (a, b) => {
    // Discard the time and time-zone information.
    let d1 = new Date(a);
    let d2 = new Date(b);
    if (d1 >= d2) { return Math.floor(((d1 - d2) / MS_PER_DAY)) }
    if (d1 < d2) { return Math.floor(((d2 - d1) / MS_PER_DAY)) }
}

const makeDate = () => {
    let date1 = new Date(((new Date().getTime()) + (MS_PER_DAY))).toLocaleDateString();
    let date2 = new Date(((new Date(date1).getTime()) + (MS_PER_DAY))).toLocaleDateString() ;
    return { date1, date2 }
}

const getDay = (d , loc = false) => new Date(d).toLocaleDateString(loc, { weekday: 'long' });

const resetBookingState = (book) => {

    if (isPreCheckedBooking(book)) {
        book.status = 'waitingForGuest';
        book.primaryGuestIsMember = false;
        book.primaryGuestAcceptedHotelPolicies = false;
        book.primaryGuestAcceptedGdprRules = false;
        book.primaryGuestAllowsEmailMarketing = false;
        book.wifi = null;
        book.qrCode = null;
        bool.folios = [];
        let f = new Enzo.EnzoFolio();
       
        f.totalCost = Math.floor(Math.random() * 5000)
        f.alreadyPaid = 0;
        f.remainingToPay = f.totalCost;
        f.taxIncluded = 0;
        f.name = new Enzo.LocalText({ 'en-GB' : 'booking bill'});
        let i = new Enzo.EnzoFolioItem();
        i.type = Enzo.EnzoFolioItem.FOLIO_ITEM_TYPES.CHARGE;
        i.totalAmount = f.totalCost;
        i.unitAmount = f.totalCost;
        i.numberOfUnits = 1;
        i.name = new Enzo.LocalText({ 'en-GB' : 'booking bill'});
           
        f.folioItems.push(i);
           
        book.folios.push(f);
    } 
    
    book.guests = book.guests.map(g => resetGuest(g));

    return book ;
};

const resetGuest = (guest) => {
    if (guest.phone) guest.phone = null;
    if (guest.note) guest.note = null;
    if (guest.address) {
        if (guest.address.postCode) guest.address.postCode = null;
        if (guest.address.city) guest.address.city = null;
        if (guest.address.country) guest.address.country = null;
        if (guest.address.address1) guest.address.address1 = null;
        if (guest.address.address2) guest.address.address2 = null;
    }
    return guest ;
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

const resetBookingDate = (reservation) => {
    let newDates ;
    let bookings = reservation.roomStays;
    let updated = [] ;
    if (!bookings.length) return;
    for (let book of bookings) {
        if ("finalArrival" in book && book.finalArrival) {
            newDates = makeCheckDates(true) ; 
            book.finalArrival = newDates.otherDate ;
            book.expectedArrival = newDates.otherDate ;
            book.expectedDeparture = newDates.today ;
            book.status = 'inHouse';
        } else {
            newDates = makeCheckDates(false) ; 
            book.expectedArrival = newDates.today ;
            book.expectedDeparture = newDates.otherDate ;
            book.status = 'waitingForGuest';
            book = resetBookingState(book);
        }
        updated.push(book);
    }
    reservation.roomStays = updated; 
    reservation.booker = resetGuest(reservation.booker); 
    return reservation ;
};

const resetReservation = (reservation) => {
    reservation.booker = resetGuest(reservation.booker);
    reservation.roomStays = reservation.roomStays.map(r => resetBookingDate(r)); 
    return reservation ;
};

const makeFormatedDate = (d = null, l = null) =>   {
    let date = d ? new Date(d) : new Date() ;
    return date.toISOString();
}

const addDay = (date, d) => (new Date(new Date(date).getTime() + (d * MS_PER_DAY))) ;

//return a value object containing the values needed to render the email templates  
const makeEmailValues = async (type, reservation, hotelValues) => {
    try {
        let values = {} ;
        let email = reservation.roomStays[0].guests.length  && reservation.roomStays[0].guests[0].email ? reservation.roomStays[0].guests[0].email : reservation.booker.email;
        //let booking = { ...reservation.roomStays[0], ...reservation.booker } ;
        if (!hotelValues.hotelId) { hotelValues.hotelId = reservation.hotelId ; }
        let firstName = reservation.roomStays[0].guests.length && reservation.roomStays[0].guests[0].firstName ? reservation.roomStays[0].guests[0].firstName : reservation.booker.firstName;
        let lastName = reservation.roomStays[0].guests.length && reservation.roomStays[0].guests[0].lastName ? reservation.roomStays[0].guests[0].lastName : reservation.booker.lastName;
        let guestName =  firstName + " " + lastName ;  
        let d1 = new Date(reservation.roomStays[0].expectedArrival).toLocaleDateString();
        let d2 = new Date(reservation.roomStays[0].expectedDeparture).toLocaleDateString();
        let booking = reservation.roomStays[0].bookingRef || reservation.roomStays[0].pmsId; 
        let guestFullName = guestName ;
        if (type === MAILTYPES.START) {
            let checkDates =  d1 + " - " + d2 ;
            // generate the token for the 1rst email 
            let token = makeToken(reservation.roomStays[0].pmsId, reservation.roomStays[0].pmsId, reservation.roomStays[0].status, hotelValues.hotelId); 
            let base64Image = fs.existsSync(`./Views/${hotelValues.name.toLowerCase()}_base64image.txt`) ? fs.readFileSync(`./Views/${hotelValues.name.toLowerCase()}_base64image.txt`) : fs.readFileSync(`./Views/enzo_base64image.txt`);
            values = {
                guestLinkName : guestName.replaceAll(' ', '.') ,
                checkDates,
                token,
                base64Image,
                app_link_baseUrl: APP_BASE_URL,
            };
        } else if (type === MAILTYPES.QR) {
            let url = await makeQrCode({ ...reservation.roomStays[0], ...reservation.booker });
            const numNights = dateDiffInDays(reservation.roomStays[0].expectedArrival, reservation.roomStays[0].expectedArrival);
            const roomType =  reservation.roomStays[0].roomTypeId;
            const numGuests = reservation.roomStays[0].numberOfAdults + reservation.roomStays[0].numberOfChildren ;
            const checkInTime = hotelValues.checkInTime;
            values = {
                checkInDate: d1,
                base64qrCode: url, 
                checkInTime,
                roomType,
                numNights,
                numGuests
            };
        }
        let hotelDetails = { 
            hotelName: hotelValues.name,
            hotelAddress: hotelValues.address.address2 ? hotelValues.address.address1 + ' ' + hotelValues.address.address2 : hotelValues.address.address1 , 
            hotelPostcode: hotelValues.address.postCode,
            hotelCity: hotelValues.address.city,
            hotelCountry: hotelValues.address.country,
            hotelState: hotelValues.address.state,
            hotelPhone: hotelValues.phone,
            hotelEmail: hotelValues.email
        }
        return ({ ...values, booking, email, guestFullName, ...hotelDetails, reservationId: reservation.roomStays[0].pmsId, hotelId: hotelValues.hotelId });
    } catch(e) {
        let error = e;
        console.log(error);
        throw error;
    }
}


module.exports = {
    resetBookingDate,
    resetReservation,
    resetGuest,
    makeCheckDates,
    findValidBooking,
    resetBookingState,
    isBookingValid,
    isPreCheckedBooking,
    findValueInDataStore,
    getInDataStore,
    setInDataStore,
    dateDiffInDays,
    makeFormatedDate,
    addDay,
    makeDate,
    getDay,
    setCheckBooking,
    makeQrCode,
    makeCheckInAppResponseBody,
    verifyToken,
    verifySecureToken,
    makeSecureRequestToken,
    makeUnlimitedToken,
    makeToken,
    makeEmailValues,
    newReservationFilter
}