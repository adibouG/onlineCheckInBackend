const Enzo = require('./enzoBooking.js');
class Guest {
    constructor({ email = null, firstName = null, lastName = null, fullName = null, address = null,
         postalCode = null, city = null, country = null, mobile = null }){
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.address = address ;
        this.postalCode = postalCode; 
        this.city = city;
        this.country = country;
        this.email = email;
        this.mobile = mobile;
    }
}

class Payment {
    constructor({ amount = null, currency = "€", paid = null, method = null, bank = null, transaction = null }) {
        this.amount = amount ;
        this.currency = currency; 
        this.paid = paid;
        this.method = method;
        this.bank = bank;
        this.transaction = transaction;
    }
} 

class Reservation {
    constructor({ status = null, number = null, startDate = null, endDate = null, arrivalDate = null, guestCount = null, options = null, roomType = null }) {
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.arrivalDate = arrivalDate;
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
        this.status = status;
        this.number = number;
    }   
}

//enzo status : "waitingForGuest", "preCheckedIn", "arriving", "inHouse", "leaving", "checkedOut"
class Checkin {
    constructor({ uuid = null, hotelId = null, email = null, reservationID = null, guest = null, reservation = null, privacyPolicy = null, payment = null } = {}){
        this.guest = new Guest(guest) ;
        this.privacyPolicy = privacyPolicy; 
        this.payment = new Payment(payment);
        this.reservation = new Reservation(reservation);
        this.hotelId = hotelId;
        this.reservationID = reservationID || uuid || null;
        this.uuid = uuid || reservationID || null ;
        this.email = email || this.guest.email || null;
    }
    
    static fromEnzoCheckIn(enzoBook) {
       
        const STATUS_MAP = { 
            'WAITINGFORGUEST': 'PENDING',
            'PRECHECKEDIN': 'PRECHECKED',
            'INHOUSE': 'COMPLETE'
        };
       
        let address =  enzoBook.addressLine1 && enzoBook.addressLine2 ? enzoBook.addressLine1.concat(' ', enzoBook.addressLine2) : enzoBook.addressLine1;
        const guest = { email: enzoBook.email, firstName: enzoBook.firstName, lastName: enzoBook.lastName,
            fullName: enzoBook.fullName, address: address,
            postalCode: enzoBook.postalCode, city: enzoBook.city, country: enzoBook.country, mobile: enzoBook.mobile
        };
        const reservation = {
            number: enzoBook.bookingRef,
            status: STATUS_MAP[enzoBook.state.toUpperCase()], 
            startDate: enzoBook.startDate, 
            endDate: enzoBook.endDate, arrivalDate: enzoBook.arrivalDate,
            guestCount: enzoBook.guestCount, 
            options: enzoBook.options, 
            roomType: enzoBook.roomType
        };
        const payment = { 
            amount: enzoBook.payment.amountToPay || 0,
            currency: enzoBook.payment.currency === 'EUR' || enzoBook.payment.currency === "€" ? "€" : enzoBook.payment.currency,
            paid:  enzoBook.payment.amountToPay === 0 || enzoBook.payment.amountPaid === enzoBook.payment.amountToPay , 
            method:enzoBook.payment.method,
            bank:enzoBook.payment.bank,
            transaction: enzoBook.payment.transaction
        };
       
        const check = { 
            uuid: enzoBook.uuid || enzoBook.reservationId, 
            hotelId: enzoBook.hotelId,
            email: enzoBook.email,
            reservationID: enzoBook.reservationId,
            guest, 
            reservation,
            payment,
            privacyPolicy: enzoBook.hotelPolicies['privacyPolicy']
        };
        const checkInRequest = new Checkin(check);
        return checkInRequest;
    }
    toEnzoCheckIn() {
        const STATUS_MAP = { 'PENDING': 'waitingForGuest', 'PRECHECKED': 'preCheckedIn', 'COMPLETE': 'inHouse' };
        this.state = STATUS_MAP[this.reservation.status.toUpperCase()] || (this.reservation.arrivalDate ? 'inHouse' : 'waitingForGuest') ; 
        Object.assign(this, this.guest, this.reservation);
        this.addressLine1 = this.address; 
        this.reservationId = this.reservationID;
        this.bookingRef = this.number;
        if (!this.hotelPolicies) this.hotelPolicies = {}; 
        this.hotelPolicies['privacyPolicy'] = this.privacyPolicy;
        this.payment =  {
            amountToPay: this.payment.amount || 0,
            currency: this.payment.currency ,
            amountPaid:  this.payment.paid ? this.payment.amount : 0 ,
            method: this.payment.method, 
            bank: this.payment.bank,
            transaction: this.payment.transaction
        };
        let e = new Enzo.EnzoCheckInRequest(this);
        return e;
    }
} 

module.exports = {
    Guest ,
    Checkin ,
    Payment ,
    Reservation 
}