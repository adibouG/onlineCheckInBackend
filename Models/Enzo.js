
class EnzoLocale {
    static SUPPORTED_LOCALE = {
        DK: "da-DK",
        DE: "de-DE", 
        UK: "en-UK",
        GB: "en-GB",
        US: "en-US",
        ES: "es-ES",
        FR: "fr-FR",
        IT: "it-IT",
        NL: "nl-NL" ,
        DEFAULT: "en-GB"
    };

    constructor(locale = EnzoLocale.SUPPORTED_LOCALE.GB){
        this.locale = locale;
    }
}

class EnzoCurrency {

    static SUPPORTED_CURRENCY = { 
        AUD: "AUD",
        CHF: "CHF",
        CNY: "CNY", 
        DKK: "DKK", 
        EUR: "EUR", 
        GBP: "GBP", 
        GEL: "GEL", 
        MYR: "MYR", 
        USD: "USD",
        DEFAULT: "EUR"
    };

    constructor(currency = EnzoCurrency.SUPPORTED_CURRENCY.EUR){
        this.currency = currency;
    }
}

class Image {
    constructor({ 
        source = null,
        width = null,
        height = null 
    } = {}) 
    {
        this.source = source;
        this.width = width ;
        this.height = height ;
    }
}

 class Text {
    constructor(locale = EnzoLocale.SUPPORTED_LOCALE.DEFAULT, text) 
     {
         this[locale] = text;
     }
 }

class LocalText {
    
    constructor( ...v ) {

        if (!v) return null;
        else if ( typeof(v) === 'Object') { 
            for (let i in V) { this[i] = v[i]; }
        } else {
            new Text(...v);
        }
    }
}
class EnzoAddress {
    constructor({ addressLine1 = null, addressLine2 = null, country = null, postalCode = null, city = null } = {}) {
        this.addressLine1 = addressLine1  ;
        this.addressLine2 = addressLine2 ;
        this.postalCode = postalCode; 
        this.city = city;
        this.country = country;
    }
}



class EnzoHotel {
    constructor( { hotelId = null, pmsId = null, 
        chainName = null, name = null, hotel = null, email = null, 
        phone = null, website = null, address = null, 
        logo = null, images = [], 
        policies = null, gdprRules = null, 
        guestRegistrationForm = null, checkOutTime = null,
         checkInTime = null  } = {}) 
    {
            this.hotelId = hotelId  ;
            this.pmsId = pmsId  ;
            this.chainName = chainName ;
            this.hotel = hotel ;
            this.name = name; 
            this.email = email;
            this.phone = phone;
            this.website = website;
            this.address = address ? new EnzoAddress(address) : null;
            this.logo = logo;
            this.images = images;
            this.policies = new LocalText(policies);
            this.gdprRules = new LocalText(gdprRules) ;
            this.guestRegistrationForm = new LocalText(guestRegistrationForm);
            this.checkInTime = checkInTime;
            this.checkOutTime = checkOutTime;
    }
}

class EnzoHotelStay {

    constructor({ hotel = null, 
        rooms = [], roomTypes = [], roomFeatures = [],
        ratePlans = [], optionGroups = [], options = [], 
        minibar = null } = {}) 
    {
        this.hotel = hotel ? new EnzoHotel(hotel) : null;
        this.rooms = rooms.map(r => new EnzoRoom(r));
        this.roomTypes = roomTypes.map(r => new EnzoRoomType(r)); 
        this.roomFeatures = roomFeatures.map(r => new EnzoRoomFeature(r));
        this.ratePlans = ratePlans.map(r => new EnzoRatePlan(r));
        this.optionGroups = optionGroups.map(r => new EnzoOptionGroup(r));
        this.options = options.map(r => new EnzoOption(r));
        this.minibar = new EnzoMinibar(minibar);

    }
}

class EnzoRoom {
    
    static ROOM_STATUS_LIST = ["Clean", "CleanForInspection", "Dirty", "Occupied", "Maintenance"];
    static ROOM_STATUS = {
        CLEAN: "Clean",
        CLEANFORINSPECTION: "CleanForInspection",
        DIRTY: "Dirty",
        OCCUPIED: "Occupied",
        MAINTENANCE: "Maintenance"
    };
    constructor({ pmsId = null, name = {},
        roomTypeId = null, 
        status = EnzoRoom.ROOM_STATUS.DIRTY, images = [],
        directions = {}, view = {} }) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name);
        this.roomTypeId = roomTypeId; 
        this.status = status;
        this.images = images;
        this.directions = new LocalText(directions);
        this.view = new LocalText(view);
    }
} 


/*
// roomType
{
    "$id": "https://enzosystems.com/schemas/hotel/roomtype",
    
    "type": "object",
    "title": "Room type",
    "required": ["pmsId", "name", "description", "minOccupancy", "maxOccupancy"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {
            "type": "array", "title": "Name",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 32}}}
        },
        "description": {
            "type": "array", "title": "Description",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 128}}}
        },
        "descriptionLong": {
            "type": "array", "title": "Description long",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 512}}}
        },
        "minOccupancy": {"type": "number", "title": "Min. occupancy", "multipleOf": 1, "minimum": 1, "maximum": 10},
        "maxOccupancy": {"type": "number", "title": "Max. occupancy", "multipleOf": 1, "minimum": 1, "maximum": 50},
        "beds": {
            "type": "array", "title": "Beds",
            "items": {"type": "object", "properties": {
                "name": {
                    "type": "array", "title": "Name",
                    "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 32}}}
                }, 
                "numberOfBeds": {"type": "number", "title": "Number of beds", "multipleOf": 1, "minimum": 1}}}
        },
        "roomSize": {"type": "number", "title": "Square meters", "multipleOf": 1},
        "roomFeatureIds": {
            "type": "array", "title": "Room feature ids", 
            "items": {"type": "string", "maxLength": 64, "title": "Room feature id"}
        },	
        "view": {
            "type": "array", "title": "View",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 32}}}
        },
        "directions": {
            "type": "array", "title": "Directions",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 128}}}
        },
        "images": {
            "type": "array", "title": "Images", 
            "items": {"$ref": "/schemas/hotel/image"}
        }
    }
}
*/
class EnzoRoomType {
    constructor({ pmsId = null, name = null,
        maxOccupancy = 0, minOccupancy = 0, 
        bedType = null, images = null, 
        view = null, direction = null, 
        roomSize = null,
        description = [], descriptionLong = [],
        roomFeatureIds = [] }) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.description = new LocalText(description);
        this.descriptionLong = new LocalText(descriptionLong);
        this.minOccupancy = minOccupancy || 1; 
        this.maxOccupancy = maxOccupancy || 1;
        this.bedType = bedType;
        this.images = images.map(i => new EnzoImage(i));
        this.directions = new LocalText(directions);
        this.view = new LocalText(view);
        this.roomFeatureIds = roomFeatureIds;
        this.roomSize = roomSize;
    }
} 
/*
// roomFeature
{
    "$id": "https://enzosystems.com/schemas/hotel/roomfeature",
    
    "type": "object",
    "title": "Room feature",
    "required": ["pmsId", "name"],
    "properties": { 
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {
            "type": "array", "title": "Name",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 32}}}
        },
        "description": {
            "type": "array", "title": "Description",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 128}}}
        },
        "images": {
            "type": "array", "title": "Images", 
            "items": {"$ref": "/schemas/hotel/image"}
        }
    }
}
*/
class EnzoRoomFeature {
    constructor({ pmsId = null, name = {}, images = null, description = {} }) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.description = new LocalText(description);
        this.descriptionLong = new LocalText(descriptionLong);
        this.minOccupancy = minOccupancy || 1; 
        this.maxOccupancy = maxOccupancy || 1;
        this.bedType = bedType;
        this.images = images.map(i => new EnzoImage(i));
        this.directions = new LocalText(directions);
        this.view = new LocalText(view);
        this.roomFeatureIds = roomFeatureIds;
        this.roomSize = roomSize;
    }
} 

class EnzoGuest  {
    
    constructor({ pmsId = null,
        firstName = null, lastName = null, fullName = null,
        email = null, gender = EnzoGuest.GENDER_CATEGORIES.NEUTRAL, language = null, dateOfBirth = null,
        ageCategory = EnzoGuest.AGE_CATEGORIES.ADULT, note = null, nationality = null, 
        identification = null, signature = null, address = null, phone= null } = {}) 
        {
            this.pmsId = pmsId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.gender = gender ;
            this.address = address ? new EnzoAddress(address) : null;
            this.gender = gender ;
            this.dateOfBirth = dateOfBirth;
            this.ageCategory = ageCategory;
            this.language = language;        
            this.nationality = nationality;        
            this.signature = signature;
            this.identification = identification;
            this.email = email;
            this.phone = phone;
            this.note = note;
    }
   static AGE_CATEGORIES = { INFANT: "Infant", CHILD: "Child", ADULT: "Adult" }; 
   static GENDER_CATEGORIES = { MALE: "Male", FEMALE: "Female", NEUTRAL: "Neutral" }; 
}


class EnzoGuestIdentification  {
    
    static IDENTIFICATION_TYPES_LIST =  ["Passport", "TravelDocumentCard", "DriverLicense", "Visa"] ;
    static IDENTIFICATION_TYPES =  {
        PASS: "Passport",
        TRAV: "TravelDocumentCard",
        DRIV: "DriverLicense",
        VISA: "Visa",
        OTHER: "Other"
    };
    constructor({ pmsId = null, firstName = null, lastName = null, fullName = null, 
        dateOfBirth = null, type = EnzoGuestIdentification.IDENTIFICATION_TYPES.OTHER,
        number = null, issued = null, expires = null,
        country = null, state = null, scan = null } = {}) 
        {
            this.pmsId = pmsId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.type = type ;
            this.number = number ;
            this.issued = issued ;
            this.dateOfBirth = dateOfBirth;
            this.expires = expires;
            this.country = country;        
            this.state = state;        
            this.scan = scan;
        }
}


class EnzoFolioItem {
    static FOLIO_ITEM_TYPES = { CHARG: "Charge", PAY: "Payment", TAX: "Tax" };
    constructor({ pmsId = null, name = null, subtotal = 0, type =  EnzoFolioItem.FOLIO_ITEM_TYPES.CHARG, unitPrice = 0, numberOfItems = 0,
        dateTime = null, details = null } = {}) {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.unitPrice = unitPrice;
        this.numberOfItems = numberOfItems;
        this.subtotal = subtotal ;
        this.type = type ;
        this.dateTime = dateTime;
        this.details = details;
    }
}

class EnzoFolioGroup {
    constructor({ pmsId = null, name = null, subtotal = 0, folioItems = [] } = {}) 
        {
        this.pmsId = pmsId ;
        this.name = name ;
        this.subtotal = subtotal ;
        this.folioItems = folioItems ;
        }
    }


class EnzoFolioDateGroup {
    constructor({ pmsId = null, name = null, subtotal = 0, folioGroups = [] } = {}) {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.subtotal = subtotal ;
        this.folioGroups = folioGroups ;
    }
}

class EnzoFolio {
    constructor({ pmsId = null, name = null, 
        totalCost = 0, taxIncluded = 0, alreadyPaid = 0, remainingToPay = 0,
        currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT, folioDateGroups = [] } = {}) {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.totalCost = totalCost ;
        this.taxIncluded = taxIncluded ;
        this.alreadyPaid = alreadyPaid;
        this.remainingToPay = remainingToPay;
        this.currency = currency;
        this.folioDateGroups = folioDateGroups;
    }
}
 
       
class EnzoPayment {
    constructor({ pmsId = null, transaction = null, amount = 0, 
        dateTime = null, bank = null, paymentMethod = null, 
        currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT
    } = {}) {
        this.pmsId = pmsId ;
        this.amount = amount ;
        this.dateTime = dateTime ;
        this.currency = currency; 
        this.paymentMethod = paymentMethod;
        this.bank = bank;
        this.transaction = transaction;
    }
} 

class EnzoOption {

    static PRICING_METHOD = {
        PERDAY:"PerDay",
        PERNIGHT: "PerNight", 
        PERSTAY: "PerStay",
        PERGUEST: "PerGuest",
        PERGUESTPERDAY: "PerGuestPerDay",
        PERGUESTPERNIGHT: "PerGuestPerNight", 
        PERGUESTPERSTAY: "PerGuestPerStay"
    }
    
    constructor({ pmsId = null, optionGroupId = null, categoryId = null,
        name = null, description = null, pricingMethod = EnzoOption.PRICING_METHOD.PERSTAY, 
        image = [], currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT, price = 0,
        timeStart = null, timeEnd = null, quantity = 0 } = {}) {
        this.pmsId = pmsId ;
        this.optionGroupId = optionGroupId ;
        this.categoryId = categoryId ;
        this.name = new LocalText(name); 
        this.description = description;
        this.price = price;
        this.priceType = priceType;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.currency = currency;
        this.pricingMethod = pricingMethod;
        this.quantity = quantity;
        this.image = image;
    }
} 



class EnzoOptionGroup {

    static OPTIONGROUP_TYPES = {
        BREAKFAST: "Breakfast",
        LUNCH: "Lunch",
        DINER: "Diner",
        EARLYCHECKIN: "EarlyCheckIn",
        LATECHECKOUT: "LateCheckOut",
        ENTRYTICKET: "EntryTicket", 
        PARKING: "Parking",
        OTHER: "Other"
    }

    constructor({ 
        pmsId = null, 
        type = EnzoOptionGroup.OPTIONGROUP_TYPES.OTHER,
        maxOptionsToSelect = null,
        minOptionsToSelect = 1, 
        disabled = true
    } = {}) 
    {
        this.pmsId = pmsId, 
        this.type = type, 
        this.minOptionsToSelect = minOptionsToSelect;
        this.maxOptionsToSelect = maxOptionsToSelect ;
        this.disabled = disabled;
    }
}
// "wifi":
/*{
    "id": "https://enzosystems.com/schemas/hotel/wifi",
 
    "type": "object", "title": "Wifi",
    "required": ["network", "password"],
    "properties": {
        "network": {"type": "string", "title": "Network name"},
        "password": {"type": "string", "title": "Password"}
    }
}*/

class EnzoWifi {
    constructor({ pmsId = null, network = null,
        password = null } = {}) 
        {
            this.pmsId = pmsId ;
            this.network = network;
            this.password= password;
        }

}
class EnzoRoomStay  {
    constructor({ pmsId = null, bookingRef = null,
        expectedArrival = null, expectedDeparture = null, finalArrival = null, finalDeparture = null, 
        numberOfAdults = 0, numberOfChildren = 0, numberOfInfants = 0,
        roomId = null, ratePlanId = null, roomTypeId = null,
        primaryGuestIsMember = false, primaryGuestIsVIP = false,
        primaryGuestAcceptedHotelPolicies = false, primaryGuestAcceptedGdprRules = false,
        primaryGuestAllowsEmailMarketing = false,
        status = null, payments = [], folios = [], guests = [], optionIds = [], addedOptions = [],
        wifi = {}, availableRoomIds = null, availableRoomTypeIds = null,
        availableOptionIds = null  } = {}) 
    {
        this.pmsId = pmsId ;
        this.bookingRef = bookingRef;
        this.status = status;
        this.expectedArrival = expectedArrival ;
        this.expectedDeparture = expectedDeparture; 
        this.finalArrival = finalArrival ; 
        this.finalDeparture = finalDeparture ; 
        this.numberOfAdults = numberOfAdults;
        this.numberOfChildren = numberOfChildren;
        this.numberOfInfants = numberOfInfants;
        this.roomId = roomId;
        this.roomTypeId = roomTypeId; 
        this.ratePlanId = ratePlanId; 
        this.optionIds = optionIds;
        this.addedOptions = addedOptions;
        this.primaryGuestIsMember = primaryGuestIsMember;
        this.primaryGuestIsVIP = primaryGuestIsVIP;
        this.primaryGuestAcceptedHotelPolicies = primaryGuestAcceptedHotelPolicies;
        this.primaryGuestAcceptedGdprRules = primaryGuestAcceptedGdprRules;
        this.primaryGuestAllowsEmailMarketing = primaryGuestAllowsEmailMarketing;
        this.wifi = new EnzoWifi(wifi);
        this.payments = payments.map(p => { if (p) return new EnzoPayment(p) }) ;
        this.folios = folios.map(f => new EnzoFolio(f)) ;
        this.guests = guests.map(g => new EnzoGuest(g));
        this.availableRoomIds = availableRoomIds;
        this.availableRoomTypeIds = availableRoomTypeIds;
        this.availableOptionIds = availableOptionIds;
    }
}

class EnzoQrCode {
    constructor({ 
        qrCodeData = null, generatedBy = null,
        hotelId = null, pmsId = null,
        reservationId = null 
    } = {}) 
    {
        this.qrCodeData = qrCodeData;
        this.generatedBy = generatedBy;
        this.hotelId = hotelId;
        this.pmsId = pmsId;
        this.reservationId = reservationId;
    }
}



class EnzoReservation  {

    static BOOKING_CHANNELS_LIST = ["Direct", "Booking.com", "Expedia", "Trivago", "Hotels.com", "Airbnb", "Agoda", "Hotelbeds", "Other"];
    static BOOKING_CHANNELS = {
        DIRECT: "Direct",
        BOOKINGCOM: "Booking.com",
        EXPEDIA: "Expedia",
        TRIVAGO: "Trivago",
        HOTELSCOM: "Hotels.com",
        AIRBNB: "Airbnb",
        AGODA: "Agoda",
        HOTELBEDS: "Hotelbeds",
        OTHER: "Other"
    };
    constructor({ pmsId = null, booker = null, bookerIsMember = false,
        bookingChannel = EnzoReservation.BOOKING_CHANNELS.OTHER,
        roomStays = [] } = {}) 
    {
        this.pmsId = pmsId;
        this.booker = booker ? new EnzoGuest(booker) : null;
        this.bookerIsMember = bookerIsMember;
        this.bookingChannel = EnzoReservation.BOOKING_CHANNELS_LIST.includes(bookingChannel) ? bookingChannel : "Other";
        this.roomStays = roomStays.map(r => new EnzoRoomStay(r));
    }
}

// class EnzoStay {
//     constructor({ reservation = null, availableRoomIds = [],
//          availableRoomTypeIds = [], availableOptionIds = [] } = {})
//     {
//         this.reservation = reservation ? new EnzoReservation(reservation) : null;
//         this.availableRoomIds = availableRoomIds;
//         this.availableRoomTypeIds = availableRoomTypeIds;
//         this.availableOptionIds = availableOptionIds;
//     }
   
// }


module.exports = {
    EnzoQrCode,
    EnzoOption,
    EnzoOptionGroup,
    EnzoPayment,
    EnzoFolioItem,
    EnzoFolioDateGroup,
    EnzoFolioGroup,
    EnzoFolio,
    EnzoAddress ,
    EnzoGuest,
    EnzoGuestIdentification,
    EnzoHotel,
    EnzoHotelStay,
    EnzoRoom,
    EnzoRoomType,
    EnzoRoomFeature,
    EnzoRoomStay,
    EnzoReservation,
    Text,
    LocalText,
    Image,
    EnzoLocale,
    EnzoCurrency
}