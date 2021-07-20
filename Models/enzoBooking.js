class EnzoGuest {
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

class EnzoPayment {
    constructor({ amountToPay = null, amountPaid = null, method = null, currency = "€", paid = null }) {
        this.amountToPay = amountToPay ;
        this.amountPaid = amountPaid ;
        this.currency = currency; 
        this.method = method;
    }
} 

class EnzoCheckIn extends EnzoGuest {
    constructor({ guest, hotelID = null, reservationID = null, bookingRef = null, additionalGuest = null, startDate = null, endDate = null, arrivalDate = null, guestCount = null, options = null, roomType = null, payment = null }) {
        super(guest);
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.arrivalDate = arrivalDate ; 
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
        this.hotelID = hotelID;
        this.reservationID = reservationID;
        this.bookingRef = bookingRef;
        this.payment = new EnzoPayment(payment);
        this.additionalGuest = additionalGuest;
    }
}



module.exports = {
    EnzoGuest ,
    EnzoCheckIn ,
    EnzoPayment 
}