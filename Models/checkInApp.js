class Guest {
    constructor({ email = null, firstName = null, lastName = null,
         fullName = null, address = null, postalCode = null, city = null, mobile = null }){
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.address = address ;
        this.postalCode = postalCode; 
        this.city = city;
        this.email = email;
        this.mobile = mobile;
    }
}

class Payment {
    constructor({ amount = null, currency = "€", paid = null }) {
        this.amount = amount ;
        this.currency = currency; 
        this.paid = paid;
    }
} 

class Reservation {
    constructor({ status = null, startDate = null, endDate = null, arrivalDate = null, guestCount = null, options = null, roomType = null }) {
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.arrivalDate = arrivalDate;
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
        this.status = status;
    }   
}

//enzo status : "waitingForGuest", "preCheckedIn", "arriving", "inHouse", "leaving", "checkedOut"
class Checkin {
    constructor({ uuid = null, hotelId = null, email = null, reservationID = null, 
        reservationId = null, state = null, guest = null, reservation = null,
        privacyPolicy = null, payment = null } = {}){
        this.uuid = uuid || reservationID || reservationId || null ;
        this.reservationID = reservationID || this.uuid || null;
        this.guest = new Guest(guest) ;
        this.email = email || this.guest.email || null;
        this.privacyPolicy = privacyPolicy; 
        this.payment = new Payment(payment);
        this.reservation = new Reservation(reservation);
        this.state = state;
        this.hotelId = hotelId;
    }
    
    static fromEnzoCheckIn(enzoBook) {
       
        const STATUS_MAP = { 'WAITINGFORGUEST': 'PENDING', 'PRECHECKEDIN': 'PRECHECKED', 'INHOUSE': 'CHECKIN' };
       
        enzoBook.hotelId = enzoBook.hotelId;
        enzoBook.reservationID = enzoBook.reservationId;
        enzoBook.state = enzoBook.status ? STATUS_MAP[enzoBook.status.toUpperCase()] : 'PENDING';   
        enzoBook.privacyPolicy = enzoBook.hotelPolicies;
        enzoBook.payment.amount = enzoBook.payment.amountToPay ;
        enzoBook.payment.paid = enzoBook.payment.amountPaid ;
        enzoBook.guest = { ...enzoBook } ;
        enzoBook.guest.address = enzoBook.addressLine1;
        enzoBook.reservation = { ...enzoBook  };
        enzoBook.reservation.status = enzoBook.state ;
        enzoBook.reservation.state = enzoBook.state ;
  
        const checkInRequest = new Checkin(enzoBook);
        return checkInRequest;
    }
    toEnzoCheckIn() {
        const STATUS_MAP = { 'PENDING': 'waitingForGuest', 'PRECHECKED': 'preCheckedIn', 'CHECKIN': 'inHouse' };
        this.status = this.status || this.arrivalDate ? STATUS_MAP[this.state.toUpperCase()] : 'waitingForGuest';  
        this.reservationId = this.reservationID;
        //let e = new Enzo. (this);
        return e;
    }
} 

/*addressLine1: enzoBook.addressLine1,
            addressLine2: enzoBook.addressLine2, postalCode: enzoBook.postalCode,
            city: enzoBook.city, country: enzoBook.country, guestId: enzoBook.guestId,
            firstName: enzoBook.firstName, lastName: enzoBook.lastName, fullName: enzoBook.fullName, enzoBook.gender,
            birthDate: enzoBook.birthDate, documents: enzoBook.documents, nationality: enzoBook.nationality, enzoBook.email,
            mobile: enzoBook.mobile, email: enzoBook.email 
            
             b.guest = { address: enzoBook.addressLine1, ... };
        b.reservation = {  enzoBook.startDate, enzoBook.endDate, enzoBook.arrivalDate,
            enzoBook.guestCount, enzoBook.roomNumber, enzoBook.roomType,
            enzoBook.options, enzoBook.hotelId, enzoBook.pmsId,
            enzoBook.reservationId, enzoBook.bookingRef, enzoBook.status };
        b.payment = { enzoBook.payment.amountToPay, 
              enzoBook.payment.amountPaid, enzoBook.payment.currency,
              enzoBook.payment.method, enzoBook.payment.bank, enzoBook.payment.transation
            };*/

module.exports = {
    Guest ,
    Checkin ,
    Payment ,
    Reservation 
}