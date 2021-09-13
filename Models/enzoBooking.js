class EnzoAddress {
    constructor({ addressLine1 = null, addressLine2 = null, country = null, postalCode = null, city = null } = {}) {
        this.addressLine1 = addressLine1 ;
        this.addressLine2 = addressLine2 ;
        this.postalCode = postalCode; 
        this.city = city;
        this.country = country;
    }
}
class EnzoGuest extends EnzoAddress {
    constructor({ email = null, gender = null, sex = null, birthDate = null, documents = null, 
        nationality = null, firstName = null, lastName = null, fullName = null, guestId = null,
        addressLine1 = null, addressLine2 = null, country = null,
        mobile = null, postalCode = null, city = null } = {}) {
       super({ addressLine1, addressLine2, country, postalCode, city });
        this.guestId = guestId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.gender = gender || sex || null;
        this.birthDate = birthDate;
        this.documents = documents;
        this.nationality = nationality;        
        this.email = email;
        this.mobile = mobile;
    }
}

class EnzoPayment {
    constructor({ amountToPay = null, amountPaid = null, bank= null, method = null, currency = "€", transaction = null, }) {
        this.amountToPay = amountToPay ;
        this.amountPaid = amountPaid ;
        this.currency = currency; 
        this.method = method;
        this.bank = bank;
        this.transaction = transaction ;
    }
} 

class EnzoReservation extends EnzoGuest {
    constructor({ roomNumber = null, state = null, email = null, firstName = null,
         lastName = null, fullName = null, postalCode = null,
          city = null, mobile = null, pmsId = null, hotelId = null, reservationId = null, 
          bookingRef = null, addressLine1 = null, addressLine2 = null,
          additionalGuest = null, startDate = null, endDate = null,
           arrivalDate = null, guestCount = null, options = null, roomType = null }) {
        super({ email, firstName, lastName, addressLine1, addressLine2, fullName, postalCode, city, mobile });
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.arrivalDate = arrivalDate ; 
        this.guestCount = guestCount;
        this.roomNumber = roomNumber;
        this.roomType = roomType; 
        this.options = options;
        this.hotelId = hotelId;
        this.pmsId = pmsId;
        this.reservationId = reservationId;
        this.bookingRef = bookingRef;
        this.state = state;
        this.additionalGuest = additionalGuest;
    }
}

class EnzoQrCode {
    constructor({ qrCodeData, generatedBy, hotelId, pmsId, reservationId }) {
        this.qrCodeData = qrCodeData;
        this.generatedBy = generatedBy;
        this.hotelId = hotelId;
        this.pmsId = pmsId;
        this.reservationId = reservationId;
    }
}

class EnzoCheckInRequest extends EnzoReservation {
    constructor({ uuid = null, state = null, email = null, firstName = null, lastName = null, 
        fullName = null, addressLine1 = null, addressLine2 = null, postalCode = null, city = null, mobile = null, 
        payment = null, pmsId = null, hotelId = null, reservationId = null, bookingRef = null, 
        additionalGuest = null, startDate = null, endDate = null, arrivalDate = null, 
        guestCount = null, options = null, roomType = null,
        hotelPolicies = null, other = null } = {}) {
        super({ state, email, firstName, lastName, fullName,
             addressLine1, addressLine2, postalCode, city, mobile,
             pmsId, hotelId, reservationId, bookingRef,
             additionalGuest, startDate, endDate, 
             arrivalDate, guestCount, options, roomType });
        
        this.uuid = uuid;
        this.hotelPolicies = hotelPolicies;
        this.other = other;
        this.payment = payment ? new EnzoPayment(payment) : null ;
    }

}

class EnzoStay extends EnzoCheckInRequest {

    constructor({ uuid = null, state = null, email = null, firstName = null, lastName = null, 
        fullName = null, address = null, addressLine1 = null, addressLine2 = null, postalCode = null, city = null, mobile = null, 
        payment = null, pmsId = null, hotelId = null, reservationId = null, bookingRef = null, 
        additionalGuest = null, startDate = null, endDate = null, arrivalDate = null, 
        guestCount = null, options = null, roomType = null, 
        hotelPolicies = null, other = null } = {}) {
        super({ uuid, state, email, firstName, lastName, fullName,
             address, addressLine1, addressLine2, postalCode, city, mobile, payment,
             pmsId, hotelId, reservationId, bookingRef,
             additionalGuest, startDate, endDate, 
             arrivalDate, guestCount, options, roomType, hotelPolicies, other } );
            


        }
}

module.exports = {
    EnzoPayment,
    EnzoAddress ,
    EnzoGuest,
    EnzoReservation,
    EnzoCheckInRequest,
    EnzoStay,
    EnzoQrCode
}