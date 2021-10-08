const Enzo = require('./Enzo.js');

class CheckInDemoPayment {

    constructor({ paid = false, amount = 0, currency = 'EUR', method = null,
     bank = null, transaction = null} = {}) {
        this.paid = paid ;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.bank = bank;
        this.transaction = transaction;
    }

    //return an enzo folio object from this single payment property 
    toEnzo() {
        //create the set of folio/subfolio
        const f = new Enzo.EnzoFolio();
        const fdg = new Enzo.EnzoFolioDateGroup();
        const fg = new Enzo.EnzoFolioGroup();
        //set the currency
        f.currency = this.currency;
        //set names
        f.name = new Enzo.LocalText('booking folio', 'en-GB');
        fg.name = new Enzo.LocalText('booking bill folio group', 'en-GB');
        fdg.name =  new Enzo.LocalText('booking bill folio date group', 'en-GB');
        //create a folio item for the charge
        const c_fi = new Enzo.EnzoFolioItem();
        c_fi.name = new Enzo.LocalText('booking bill', 'en-GB');
        c_fi.numberOfItems = 1;
        c_fi.subtotal = this.amount;
        c_fi.unitPrice = this.amount;
        c_fi.type = Enzo.EnzoFolioItem.FOLIO_ITEM_TYPE.CHARG ;
        //add the charge to a subfolio
        fg.folioItems.push(c_fi);
        //if paid
        if (this.paid) { 
            //if paid create a payment and a folio item for the payment
            const p = new Enzo.EnzoPayment();
            const p_fi = new  Enzo.EnzoFolioItem();
            p_fi.name = new Enzo.LocalText('booking bill payment', 'en-GB');
            
            p.bank = this.bank;
            p.transaction = this.transaction;
            p.paymentMethod = this.method;
            p.currency = this.currency;
            p.amount = this.amount;
            p.dateTime = this.transaction.dateTime;

            p_fi.numberOfItems = 1;
            p_fi.subtotal = this.amount;
            p_fi.unitPrice = this.amount;
            p_fi.type = Enzo.EnzoFolioItem.FOLIO_ITEM_TYPE.PAY ;
            p_fi.dateTime = this.transaction.dateTime;	
            //add the payment to the subfolio
            fg.folioItems.push(p_fi);
        }
        //calculate the subfolio total and the folio properties
        fg.folioItems.forEach(i => {
            if (i.type === Enzo.EnzoFolioItem.FOLIO_ITEM_TYPE.PAY) {
                fg.subtotal = fg.subtotal - i.subtotal;
                //add payment to folio total pay
                f.alreadyPaid = f.alreadyPaid + i.subtotal;
            } else {
                fg.subtotal = fg.subtotal + i.subtotal;
                //add charge to folio total cost
                f.totalCost = f.totalCost + i.subtotal;
                //if tax add/include the charge to folio tax property too
                if (i.type === Enzo.EnzoFolioItem.FOLIO_ITEM_TYPE.TAX) {
                    f.taxIncluded = f.taxIncluded + i.subtotal;
                }
            }
        });
        //add the subfolio to subfoliodategroup
        fdg.folioGroups.push(fg);
        fdg.subtotal = fg.subtotal;
        //add the subfoliodategroup to the folio
        f.folioDateGroups.push(fdg);
        //calculate the folio remaining to pay proerty value 
        f.remainingToPay = f.totalCost - f.alreadyPaid; 
        //return the folio
        return f;
    }
        
    static fromEnzo(folio) {
        let p = new CheckInDemoPayment();
        p.amount = folio.remainingToPay;
        p.currency = f.currency ;
        if (folio.remainingToPay === 0) p.paid = true;
        return p;
    }
}

class CheckInDemoGuest {
    constructor({ firstName, lastName, country, address, city, postalCode, mobile, email } = {}) {
        this.firstName = firstName ;
        this.lastName = lastName;
        this.address = address;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
        this.mobile = mobile;
        this.email = email;
    }

    //return an enzo guest from the guest property
    toEnzo(){

        const guest = new Enzo.EnzoGuest();
        const address = new Enzo.EnzoAddress();
        let address1, address2;
        
        if (this.address.contains('\n')) {
            address1 = this.address.split('\n')[0];
            address2 = this.address.split('\n')[1];
        } else {
            address1 = this.address;
            address2 = null;
        }

        address.addressLine1 = address1;
        address.addressLine2 = address2;
        address.postalCode = this.postalCode;
        address.city = this.city;
        address.country = this.country;
        
        guest.firstName = this.firstName; 
        guest.lastName = this.lastName;
        guest.fullName = this.firstName + ' ' + this.lastName;
        guest.phone = this.mobile;
        guest.email = this.email;
        guest.address = address;

        return guest;
    }
    static fromEnzo(guest) {  

        let g = new CheckInDemoGuest();
        let addressLine =  guest.address.addressLine1 && guest.address.addressLine2 ? guest.address.addressLine1.concat('\n', guest.address.addressLine2) : guest.address.addressLine1;
        g.address = addressLine;
        g.city =  guest.address.city; 
        g.postalCode =  guest.address.postalCode; 
        g.country =  guest.address.country; 
        g.firstName = guest.firstName ;
        g.lastName = guest.lastName;
        g.mobile = guest.phone;
        g.email = guest.email;

        return g;
    }

}


class CheckInDemoReservation {
    constructor({ reservationRef = null, options = [], status = null, guestCount = null, roomType = null, startDate = null, endDate = null, arrivalDate = null } = {}){
        this.reservationRef = reservationRef ;
        this.options = options;
        this.guestCount = guestCount;
        this.roomType = roomType;
        this.startDate = startDate ;
        this.endDate = endDate;
        this.arrivalDate = arrivalDate;
        this.status = status || arrivalDate ? 'COMPLETE' : 'PENDING';
    }

    toEnzo(){

        const STATUS_MAP = { 'PENDING': 'waitingForGuest', 'PRECHECKED': 'preCheckedIn', 'COMPLETE': 'inHouse' };
      
        const book = new Enzo.EnzoRoomStay();
        book.bookingRef = this.reservationRef;
        book.expectedArrival = this.startDate;
        book.expectedDeparture = this.endDate;
        book.finalArrival = this.arrivalDate;
        book.numberOfAdults = this.guestCount;
        book.status = STATUS_MAP[this.status.toUpperCase()];
        this.options.forEach( opt => book.optionIds.push(opt.id))
        book.roomTypeId = this.roomType; //new EnzoRoomType()

        return book;
    }


    static fromEnzo({ roomstay, options = [], roomType = null } = {}) {  
        
        const STATUS_MAP = { 'WAITINGFORGUEST': 'PENDING', 'PRECHECKEDIN': 'PRECHECKED', 'INHOUSE': 'COMPLETE' };
   
        const reservation = new CheckInDemoReservation();
        reservation.guestCount = roomstay.numberOfAdults ; // + numberOfChilds + numberOfInfants ? 
        reservation.reservationRef = roomstay.bookingRef;
        reservation.status = STATUS_MAP[roomstay.status.toUpperCase()], 
        reservation.startDate = roomstay.startDate;
        reservation.endDate = roomstay.endDate;
        reservation.arrivalDate = roomstay.arrivalDate;
        roomstay.options.forEach(id => reservation.options.push(options.filter(o => o.pmsId === id)));
        reservation.roomType = roomType || roomstay.roomTypeId;

        return reservation;
    }
}

class CheckInDemoCheckInRequest {
   constructor({ uuid, hotelId = 1, reservationID, guest, email, reservation = null, privacyPolicy = null, payment } = {}){
       this.privacyPolicy = privacyPolicy ;  
       this.payment = new CheckInDemoPayment(payment);
       this.guest = new CheckInDemoGuest(guest);
       this.reservation = new CheckInDemoReservation(reservation);
       this.hotelId = hotelId; 
       this.uuid = uuid;
       this.reservationID = reservationID;
       this.email = email || guest.email;
   } 
   
    toEnzo() {
        const enzoHotel = new Enzo.EnzoHotel();
        enzoHotel.pmsId = this.hotelId;
        enzoHotel.policies = this.privacyPolicy.content || null
        const enzoHotelStay = new Enzo.hotelStayOffers();
        enzoHotelStay.hotel = enzoHotel;
        const enzoRoomstay = this.reservation.toEnzo();
        enzoRoomstay.pmsId = this.reservationID;
        
        const enzoPayment = this.payment.toEnzo(); 
        const enzoGuest = this.guest.toEnzo();
        enzoGuest.policyAccepted = this.privacyPolicy && this.privacyPolicy.accepted; 
        enzoRoomstay.guests.push(enzoGuest);
        enzoRoomstay.folios.push(enzoPayment);

        const enzoReservation = new Enzo.EnzoReservation();
        enzoReservation.booker = enzoGuest;
        enzoReservation.roomStays.push(enzoRoomstay)
        enzoReservation.pmsId = this.uuid ;
        
        const enzoStay = new Enzo.EnzoStay();
        enzoStay.hotel = hotel;
        enzoStay.reservation = enzoReservation;
        
        return enzoStay;
    }



    static fromEnzo(enzoStay) {

        const guest = enzoStay.reservation.booker ;
        const roombooking = enzoStay.reservation.roomStays[0] ;
        const folio = enzoStay.reservation.roomStays[0].folio;
        const email = enzoStay.reservation.booker.email;
        const reservationID = enzoStay.reservation.roomStays[0].pmsId;
        const uuid = enzoStay.reservation.pmsId;
        const hotelId = enzoStay.hotelStayOffers.hotel.pmsId;
        const privacyPolicyContent = enzoStay.hotelStayOffers.hotel.policies;
        
        const cGuest = CheckInDemoGuest.fromEnzo(guest);
        const cPay = CheckInDemoPayment.fromEnzo(folio);
        const cBook = CheckInDemoReservation.fromEnzo({ roomstay: roombooking })

        const checkInRequest = new CheckInRequest();

        checkInRequest.reservationID = reservationID;
        checkInRequest.uuid = uuid;
        checkInRequest.email = email;
        checkInRequest.hotelId = hotelId;
        checkInRequest.privacyPolicy = {
            content: privacyPolicyContent,
            accepted: guest.policyAccepted
        };
        checkInRequest.payment = cPay;
        checkInRequest.guest = cGuest;
        checkInRequest.reservation = cBook;

        return checkInRequest;
    }
}

module.exports = {
    CheckInDemoGuest,
    CheckInDemoReservation,
    CheckInDemoCheckInRequest,
};