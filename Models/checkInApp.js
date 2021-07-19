class Guest {
    constructor({ email = null, fullName = null, address = null, postalCode = null, city = null, mobile = null }){
        this.fullName = fullName;
        this.address = address ;
        this.postalCode = postalCode; 
        this.city = city;
        this.email = email;
        this.mobile = mobile;
    }
}

class Checkin {
    constructor({ uuid = null, guest = null, reservation = null, privacyPolicy = null, payment = null }){
        this.uuid = uuid || randomUUID();
        this.guest = guest ;
        this.privacyPolicy = privacyPolicy; 
        this.payment = payment;
        this.reservation = reservation;
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
    constructor({ startDate = null, endDate= null, guestCount = null, options = null, roomType = null }) {
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
    }
}


module.exports = {
    Guest ,
    Checkin ,
    Payment ,
    Reservation 
}