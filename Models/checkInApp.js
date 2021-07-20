class Guest {
    constructor({ email = null, firstName = null, lastName = null, fullName = null, address = null, postalCode = null, city = null, mobile = null }){
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
    constructor({ startDate = null, endDate= null, arrivalDate = null, guestCount = null, options = null, roomType = null }) {
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.arrivalDate = arrivalDate;
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
    }
}

class Checkin {
    constructor({ uuid = null, guest = null, reservation = null, privacyPolicy = null, payment = null }){
        this.uuid = uuid || randomUUID();
        this.reservationID = reservation.id || this.uuid;
        this.email = guest.email || null;
        this.guest = new Guest(guest) ;
        this.privacyPolicy = privacyPolicy; 
        this.payment = new Payment(payment);
        this.reservation = new Reservation(reservation);
    }
} 

module.exports = {
    Guest ,
    Checkin ,
    Payment ,
    Reservation 
}