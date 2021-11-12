
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

class ImageFocusPoint {

    constructor({ x = 50, y = 50 } = {}) 
    {
        this.x = x ;
        this.y = y ;
    }
}
class Image {
    constructor({ 
        source = null,
        width = 1,
        height = 1, 
        focusPoint = {}
    } = {}) 
    {
        this.source = source;
        this.width = width ;
        this.height = height ;
        this.focusPoint = new ImageFocusPoint(focusPoint) ;
    }
}


class LocalText {
    
    constructor(v) {

        if ( typeof v === 'object') { 
            for (let i in v) { this[i] = v[i]; }
        } else {
            this[EnzoLocale.SUPPORTED_LOCALE.DEFAULT] = v;
        }
    }
}
class Address {
    constructor({ address1 = null, address2 = null, postCode = null, city = null, state = null, country = null } = {}) {
        this.address1 = address1  ;
        this.address2 = address2 ;
        this.city = city;
        this.state = state;
        this.postCode = postCode; 
        this.country = country;
    }
}



class Company {
    constructor({ pmsId = null, name = {}, address = {}, email = null, phone = null, note= null } = {}) {
        this.pmsId = pmsId  ;
        this.name = new LocalText(name) ;
        this.address = new Address(address); 
        this.email = email;
        this.phone = phone;
        this.note = note;
    }
}
/*
// company
{
    "$id": "https://enzosystems.com/schemas/hotel/company",
   
    "type": "object",
    "title": "Company",
    "required": ["name"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {"type": "string", "maxLength": 32, "title": "Name"},
        "address": {"$ref": "/schemas/hotel/address", "title": "Address"},
        "email": {"type": "string", "maxLength": 64, "format": "email", "title": "Email"},
        "phone": {"type": "string", "maxLength": 16, "format": "phone", "title": "Phone"},
        "note": {"type": "string", "maxLength": 64, "title": "Note"}
    }
}
 */
class Car {
    constructor({ pmsId = null, licensePlate = null, brand = null, model = null, color = null,
         location = null, keyLocation = null, note = null } = {}) 
    {
        this.pmsId = pmsId  ;
        this.licensePlate = licensePlate ;
        this.brand = brand; 
        this.model = model;
        this.color = color;
        this.location = location;
        this.keyLocation = keyLocation;
        this.note = note;
    }
}
/*
// car
{
    "$id": "https://enzosystems.com/schemas/hotel/car",
   
    "type": "object",
    "title": "Car",
    "required": ["licensePlate"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "licensePlate": {"type": "string", "maxLength": 16, "title": "License plate"},
        "brand": {"type": "string", "maxLength": 16, "title": "Brand"},
        "model": {"type": "string", "maxLength": 16, "title": "Model"},
        "color": {"type": "string", "maxLength": 16, "title": "Color"},
        "location": {"type": "string", "maxLength": 32, "title": "Location"},
        "keyLocation": {"type": "string", "maxLength": 32, "title": "Key location"},
        "note": {"type": "string", "maxLength": 64, "title": "Note"}
    }
}
*/
class EnzoHotel {
    constructor( { hotelId = null, pmsId = null, 
        chainName = null, name = null, email = null, 
        phone = null, website = null, address = null, 
        logo = {}, images = [], 
        hotelPolicies = {}, gdprRules = {}, guestRegistrationForm = {},
        checkOutTime = null, checkInTime = null  } = {}) 
    {
        this.hotelId = hotelId  ;
        this.pmsId = pmsId  ;
        this.chainName = chainName ;
        this.name = name; 
        this.email = email;
        this.phone = phone;
        this.website = website;
        this.address = address ? new Address(address) : null;
        this.logo = logo ? new Image(logo) : null;
        this.images = images.map(image => new Image(image));
        this.hotelPolicies = new LocalText(hotelPolicies);
        this.gdprRules = new LocalText(gdprRules) ;
        this.guestRegistrationForm = new LocalText(guestRegistrationForm);
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
    }
}

class EnzoCommonParameters {
    constructor({ defaultLanguage = EnzoLocale.SUPPORTED_LOCALE.DEFAULT, currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT } = {})
    {
        this.defaultLanguage = defaultLanguage  ; 
        this.currency = currency;
    }
}

/*
// commonParameters
{
    "commonParameters": {
        "$id": "https://enzosystems.com/schemas/hotel/common_parameters",

        "type": "object",
        "title": "Common parameters",
        "required": ["defaultLanguage", "currency"],
        "properties": {
            "defaultLanguage": {"$ref": "#/definitions/locale"},
            "currency": {"$ref": "#/definitions/currency"}
        }
    }
}
*/
class EnzoHotelStay {
    constructor({ commonParameters = null, reservation = null, hotel = null, 
        rooms = [], roomTypes = [], roomFeatures = [],
        ratePlans = [], optionGroups = [], options = [], folioItemGroups = [],
        minibar = null } = {}) 
    {
        this.commonParameters = commonParameters ? new EnzoCommonParameters(commonParameters) : null;
        this.reservation = reservation ? new EnzoReservation(reservation) : null;
        this.hotel = hotel ? new EnzoHotel(hotel) : null;
        this.rooms = rooms.map(r => new EnzoRoom(r));
        this.roomTypes = roomTypes.map(r => new EnzoRoomType(r)); 
        this.roomFeatures = roomFeatures.map(r => new EnzoRoomFeature(r));
        this.ratePlans = ratePlans.map(r => new EnzoRatePlan(r));
        this.options = options.map(r => new EnzoOption(r));
        this.optionGroups = optionGroups.map(r => new EnzoOptionGroup(r));
        this.folioItemGroups = folioItemGroups.map(r => new EnzoFolioItemGroup(r));
        this.minibar = minibar ? new EnzoMinibar(minibar) : null;
    }
}
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/main_hotel_object",
    "version": "1.0",
    "type": "object",
    "title": "Main Data Object",
    "required": ["reservation", "hotel", "rooms", "roomTypes", "roomFeatures", "ratePlans", "optionGroups", "options", "folioItemGroups"],
    "properties": {
        "commonParameters": {"$ref": "/schemas/hotel/common_parameters"},
        "reservation": {"$ref": "/schemas/hotel/reservation"},
        "hotel": {"$ref": "/schemas/hotel/hotel"},
        "rooms": {"type": "array", "title": "Rooms", "items": {"$ref": "/schemas/hotel/room"}},
        "roomTypes": {"type": "array", "title": "Room types", "items": {"$ref": "/schemas/hotel/room_type"}},
        "roomFeatures": {"type": "array", "title": "Room features", "items": {"$ref": "/schemas/hotel/room_feature"}},
        "ratePlans": {"type": "array", "title": "Rate plans", "items": {"$ref": "/schemas/hotel/rate_plan"}},
        "optionGroups": {"type": "array", "title": "Option groups", "items": {"$ref": "/schemas/hotel/option_group"}},
        "options": {"type": "array", "title": "Options", "items": {"$ref": "/schemas/hotel/option"}},
        "folioItemGroups": {"type": "array", "title": "Folio item groups", "items": {"$ref": "/schemas/hotel/folio_item_group"}},
        "minibar": {"$ref": "/schemas/hotel/minibar"}
    }
}
*/


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
/*
// reservation
{
    "$id": "https://enzosystems.com/schemas/hotel/reservation",
   
    "type": "object",
    "title": "Reservation",
    "required": ["pmsId", "roomStays"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "booker": {"$ref": "/schemas/hotel/guest"},
        "bookerCompany": {"$ref": "/schemas/hotel/company"},
        "bookingChannel": {"type": "string", "maxLength": 64, "enum": ["Direct", "Booking.com", "Expedia", "Trivago", "Hotels.com", "Airbnb", "Agoda", "Hotelbeds", "Other"], "title": "Booking channel"},
        "roomStays": {
            "type": "array", "title": "Room stay(s)", "minItems": 1,
            "items": {"$ref": "/schemas/hotel/roomStay"}
        }
    }
}
 */
class EnzoRoomStay  {

    static STAY_PURPOSE = {
        LEISURE: "Leisure", 
        CORPORATE: "Corporate"
    };

    static STAY_STATUS = {
        WAITINGFORGUEST: "WaitingForGuest",
        CHECKINGIN: "CheckingIn",
        CHECKEDIN: "CheckedIn", 
        CHECKINGOUT: "CheckingOut",
        CHECKEDOUT: "CheckedOut",
        UNKNOWN: "Unknown"
    };

    constructor({ pmsId = null, bookingRef = null,
        expectedArrival = null, expectedDeparture = null, finalArrival = null, finalDeparture = null, 
        numberOfNights = 0, dayUse = false, numberOfGuests = 0, numberOfAdults = 0, numberOfChildren = 0, numberOfInfants = 0,
        primaryGuestIsMember = false, primaryGuestIsVIP = false, primaryGuestAcceptedHotelPolicies = false,
        primaryGuestAcceptedGdprRules = false, primaryGuestAllowsEmailMarketing = false,
        status = EnzoRoomStay.STAY_STATUS.UNKNOWN, purposeOfStay = EnzoRoomStay.STAY_PURPOSE.LEISURE,
        folios = [], guests = [],
        roomId = null, ratePlanId = null, roomTypeId = null,
        availableRoomIds = [], availableRoomTypeIds = [],
        availableOptionIds = [], preBookedOptionIds = [], addedOptionIds = [],
        wifi = {}, cars = [],
        note = null, qrCode = null } = {}) 
    {
        this.pmsId = pmsId ;
        this.bookingRef = bookingRef;
        this.status = status;
        this.expectedArrival = expectedArrival ;
        this.finalArrival = finalArrival ; 
        this.numberOfNights = numberOfNights ; 
        this.dayUse = dayUse ; 
        this.expectedDeparture = expectedDeparture; 
        this.finalDeparture = finalDeparture ; 
        this.numberOfGuests = numberOfGuests ; 
        this.numberOfAdults = numberOfAdults;
        this.numberOfChildren = numberOfChildren;
        this.numberOfInfants = numberOfInfants;
        this.roomId = roomId;
        this.roomTypeId = roomTypeId; 
        this.ratePlanId = ratePlanId; 
       
       // this.payments = payments.map(p => { if (p) return new EnzoPayment(p) }) ;
        this.folios = folios.map(f => new EnzoFolio(f)) ;
        this.guests = guests.map(g => new EnzoGuest(g));

        this.availableRoomIds = availableRoomIds;
        this.availableRoomTypeIds = availableRoomTypeIds;

        this.availableOptionIds = availableOptionIds;
        this.preBookedOptionIds = preBookedOptionIds.map(o => new EnzoOptionQualifier(o));
        this.addedOptionIds = addedOptionIds.map(o => new EnzoOptionQualifier(o));

        this.primaryGuestIsMember = primaryGuestIsMember;
        this.primaryGuestIsVIP = primaryGuestIsVIP;
        this.primaryGuestAcceptedHotelPolicies = primaryGuestAcceptedHotelPolicies;
        this.primaryGuestAcceptedGdprRules = primaryGuestAcceptedGdprRules;
        this.primaryGuestAllowsEmailMarketing = primaryGuestAllowsEmailMarketing;

        this.cars = cars.map(c => new Car(c));
        this.wifi = new EnzoWifi(wifi);
        this.note = note;
        this.purposeOfStay = purposeOfStay;
        this.qrCode = qrCode;
    }
}
/*
// roomStay
{
    "$id": "https://enzosystems.com/schemas/hotel/room_stay",
 
    "type": "object",
    "title": "Room stay",
    "required": ["pmsId", "status", "expectedArrival", "expectedDeparture", "numberOfNights", "numberOfAdults", "roomTypeId", "folios"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "status":  {"type": "string", "title": "Status", "enum": ["WaitingForGuest", "CheckingIn", "CheckedIn", "CheckingOut", "CheckedOut"]},
        "expectedArrival": {"type": "string", "format": "date-time"},
        "expectedDeparture": {"type": "string", "format": "date-time"},
        "numberOfNights": {"type": "number", "multipleOf": 1, "title": "Number of night"},
        "dayUse": {"type": "boolean", "title": "Day use only"},
        "finalArrival": {"type": "string", "format": "date-time"},
        "finalDeparture": {"type": "string", "format": "date-time"},i
        "numberOfGuests": {"type": "number", "multipleOf": 1, "title": "Number of guests"},
        "numberOfAdults": {"type": "number", "multipleOf": 1, "title": "Number of adults"},
        "numberOfChildren": {"type": "number", "multipleOf": 1, "title": "Number of children"},
        "numberOfInfants": {"type": "number", "multipleOf": 1, "title": "Number of infants"},
        "guests": {"type": "array", "items": {"$ref": "/schemas/hotel/guest"}, "title": "Guest(s)", "minItems": 1},
        "primaryGuestIsMember": {"type": "boolean", "title": "Booker is member"},
        "primaryGuestIsVIP": {"type": "boolean", "title": "Booker is VIP"},
        "primaryGuestAcceptedHotelPolicies": {"type": "boolean", "title": "Guest accepted hotel policies"},
        "primaryGuestAcceptedGdprRules": {"type": "boolean", "title": "Guest accepted GDPR rules"},
        "primaryGuestAllowsEmailMarketing": {"type": "boolean", "title": "Guest allows email marketing"},
        "cars": {"type": "array", "items": {"$ref": "/schemas/hotel/car"}, "title": "Car(s)"},
        "roomId": {"type": "string", "maxLength": 64, "title": "Room PMS id"},
        "availableRoomIds": {"type": "array", "items": {"type": "string", "maxLength": 64, "title": "Room PMS id"}, "title": "Available room(s)"},
        "roomTypeId": {"type": "string", "maxLength": 64, "title": "Room type PMS id"},
        "availableRoomTypeIds": {"type": "array", "items": {"type": "string", "maxLength": 64, "title": "Room type PMS id"}, "title": "Available room type(s)"},
        "ratePlanId": {"type": "string", "maxLength": 64, "title": "Rate plan PMS id"},
        "availableOptionIds": {"type": "array", "items": {"$ref": "/schemas/hotel/available_option"}, "title": "Available option(s)"},
        "preBookedOptionIds": {"type": "array", "items": {"$ref": "/schemas/hotel/option_qualifier"}, "title": "Booked option(s)"},
        "addedOptionIds": {"type": "array", "items": {"$ref": "/schemas/hotel/option_qualifier"}, "title": "Added option(s)"},
        "purposeOfStay": {"type": "string", "title": "Purpose of stay", "enum": ["Leisure", "Corporate"]},
        "wifi": {"$ref": "/schemas/hotel/wifi"},
        "folios": {"type": "array", "items": {"$ref": "/schemas/hotel/folio"}, "title": "Folio(s)", "minItems": 1},
        "note": {"type": "string", "maxLength": 64, "title": "Note"},
        "qrCode": {"type": "string", "format": "base64", "title": "QR code"}
    }
}
*/

class EnzoRatePlan {

    constructor({ pmsId = null, name = {}, description = {}, optionIds = [] } = {}) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name);
        this.description = new LocalText(description);
        this.optionIds = optionIds;
    }
}
/*
// ratePlan
{
    "$id": "https://enzosystems.com/schemas/hotel/rate_plan",
   
    "type": "object",
    "title": "Rate plan",
    "required": ["pmsId", "name", "options"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {
            "type": "object", "title": "Name", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
            "properties": {
                "en-UK":  {"type": "string", "maxLength": 64},
                "nl-NL":  {"type": "string", "maxLength": 64},
                "de-DE":  {"type": "string", "maxLength": 64},
                "fr-FR":  {"type": "string", "maxLength": 64}
            }
        },
        "description":{
            "type": "object", "title": "Description", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
            "properties": {
                "en-UK":  {"type": "string", "maxLength": 128},
                "nl-NL":  {"type": "string", "maxLength": 128},
                "de-DE":  {"type": "string", "maxLength": 128},
                "fr-FR":  {"type": "string", "maxLength": 128}
            }
        },
        "optionIds": {
            "type": "array", "title": "Option ids",
            "items": {"type": "string", "maxLength": 64, "title": "Option id"}
        }
    }
}
 */
class EnzoOptionQualifier {
  constructor({ optionId = null, bookedDatetime = [], numberOfUnits = 0 } = {}) 
    {
        this.optionId = optionId;
        this.bookedDatetime = bookedDatetime.map(d => new Date(d));
        this.numberOfUnits = numberOfUnits;
    }
}
/*
// optionQualifier
{
    "$id": "https://enzosystems.com/schemas/hotel/optionQualifier",
   
    "type": "object",
    "title": "Option date count",
    "required": ["optionId", "date", "numberOfUnits"],
    "properties": {
        "optionId": {"type": "string", "maxLength": 64, "title": "Option PMS id"},
        "bookedDatetime": {"type": "array", "items": {"type": "string", "format": "date-time"}, "title": "Booked date time"},
        "numberOfUnits": {"type": "number", "multipleOf": 1, "minimum": 0, "title": "Number of options"},
    }
}
 */
class EnzoRoom {
    
    static ROOM_STATUS_LIST = ["Clean", "CleanForInspection", "Dirty", "Occupied", "Maintenance"];
    static ROOM_STATUS = {
        CLEAN: "Clean",
        CLEANFORINSPECTION: "CleanForInspection",
        DIRTY: "Dirty",
        OCCUPIED: "Occupied",
        MAINTENANCE: "Maintenance"
    };
    constructor({ pmsId = null, name = {}, roomTypeId = null, roomFeatureIds = [], status = EnzoRoom.ROOM_STATUS.DIRTY, images = [],
        directions = {}, view = {} } = {}) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name);
        this.roomTypeId = roomTypeId; 
        this.roomFeatureIds = roomFeatureIds; 
        this.status = status;
        this.images = images.map(image => new Image(image));
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
    constructor({ pmsId = null, name = {}, description = {}, descriptionLong = {},
        maxOccupancy = 1, minOccupancy = 1, beds = [], roomSize = 1, roomFeatureIds = [], 
        view = {}, directions = {}, images = [] } = {}) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.description = new LocalText(description);
        this.descriptionLong = new LocalText(descriptionLong);
        this.minOccupancy = minOccupancy; 
        this.maxOccupancy = maxOccupancy;
        this.beds = beds.map(b => new Bed(b));
        this.roomSize = roomSize;
        this.roomFeatureIds = roomFeatureIds;
        this.view = new LocalText(view);
        this.directions = new LocalText(directions);
        this.images = images.map(i => new Image(i));
    }
} 

class Beds {
    constructor({ pmsId = null, name = {}, numberOfBeds = 1 }) {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.numberOfBeds = numberOfBeds ;
    }
}
/*
beds
"items": {"type": "object", "properties": {
    "name": {
        "type": "array", "title": "Name",
        "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 32}}}
    },
    "numberOfBeds": {"type": "number", "title": "Number of beds", "multipleOf": 1, "minimum": 1}}}
*/




class EnzoRoomFeature {
    constructor({ pmsId = null, name = {}, images = [], description = {} } = {}) 
    {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
        this.description = new LocalText(description);
        this.images = images.map(i => new Image(i));
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
class EnzoGuest  {
    
   static AGE_CATEGORIES = { 
       INFANT: "Infant",
       CHILD: "Child",
       ADULT: "Adult" 
    }; 
   static GENDER_CATEGORIES = {
       MALE: "Male", 
       FEMALE: "Female", 
       NEUTRAL: "Neutral" 
    }; 
    constructor({ pmsId = null,
        firstName = null, lastName = null, fullName = null,
        email = null, address = {}, phone= null,
        gender = EnzoGuest.GENDER_CATEGORIES.NEUTRAL, language = null,
        dateOfBirth = null, ageCategory = EnzoGuest.AGE_CATEGORIES.ADULT,
        nationality = null, identification = {}, folios = [], note = null, 
        signature = null, company = {} } = {}) 
    {
        this.pmsId = pmsId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.address = address ? new Address(address) : null;
        this.gender = gender ;
        this.dateOfBirth = dateOfBirth;
        this.ageCategory = ageCategory;
        this.language = language;        
        this.nationality = nationality;        
        this.signature = signature;
        this.identification = new EnzoGuestIdentification(identification);
        this.email = email;
        this.phone = phone;
        this.folios = folios.map(f => new EnzoFolio(f));
        this.company = new Company(company);
        this.note = note;
    }
}


class EnzoGuestIdentification  {
    
    static IDENTIFICATION_TYPES_LIST =  ["Passport", "TravelDocumentCard", "DriverLicense", "Visa"] ;
    static IDENTIFICATION_TYPES =  {
        PASSPORT: "Passport",
        TRAVELCARD: "TravelDocumentCard",
        DRIVERLIC: "DriverLicense",
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

class EnzoFolio {

    static FOLIO_TYPES = { 
        GUEST: "Guest",
        COMPANY: "Company",
        OTHER: "Other"
    };

    constructor({ pmsId = null, type = EnzoFolio.FOLIO_TYPES.OTHER, 
        totalCosts = 0, alreadyPaid = 0, remainingToPay = 0,
        alreadyRefund = 0, remainingToRefund = 0, 
        alreadyPreauthorized = 0, remainingToPreauthorize = 0, 
        /*currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT,*/ 
        folioItems = [], includedTaxes = [] 
    } = {}) 
    {
        this.pmsId = pmsId ;
        this.type = type ;
        this.totalCosts = totalCosts ;
        this.alreadyPaid = alreadyPaid;
        this.remainingToPay = remainingToPay;
        this.alreadyRefund = alreadyRefund;
        this.remainingToRefund = remainingToRefund;
        this.alreadyPreauthorized = alreadyPreauthorized;
        this.remainingToPreauthorize = remainingToPreauthorize;
        //this.currency = currency;
        this.includedTaxes = includedTaxes.map(t => new EnzoFolioTax(t)) ;
        this.folioItems =  folioItems.map(i => new EnzoFolioItem(i));
    }
}
/*
 // folio
{
    "$id": "https://enzosystems.com/schemas/hotel/folio",
   
    "type": "object",
    "title": "Folio",
    "required": ["name", "totalCosts", "alreadyPaid", "remainingToPay"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "type": {"type": "string", "maxLength": 16, "title": "Type", "enum": ["Guest", "Company", "Other"]},
        "totalCosts": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Total costs"},
        "alreadyPaid": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Already paid"},
        "alreadyRefund": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Already refunded"},
        "alreadyPreauthorized": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Already preauthorized"},
        "remainingToPay": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "To pay"},
        "remainingToRefund": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "To refund"},
        "remainingToPreauthorize": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "To preauthorize"},
        "includedTaxes": {"type": "array", "items": {"$ref": "/schemas/hotel/tax"}, "title": "Included tax(es)"},
        "folioItems": {
            "type": "array",
            "title": "Folio items",
            "items": {
                "type": "object",
                "title": "Folio item",
                "required": ["pmsId", "type", "name", "unitAmount", "numberOfUnit", "totalAmount"],
                "properties": {
                    "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
                    "folioItemGroupId": 
                    {"type": "string", "maxLength": 64, "title": "Folio item group id"},
                    "type": {"type": "string", "maxLength": 16, "title": "Type", "enum": ["Charge", "Payment", "Refund"]},
                    "name": {
                        "type": "object", "title": "Name", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
                        "properties": {
                            "en-UK":  {"type": "string", "maxLength": 64},
                            "nl-NL":  {"type": "string", "maxLength": 64},
                            "de-DE":  {"type": "string", "maxLength": 64},
                            "fr-FR":  {"type": "string", "maxLength": 64}
                        }
                    },
                    "unitAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Unit Price"},
                    "numberOfUnits": {"type": "number", "multipleOf": 1, "minimum": 0, "title": "Number of items"},
                    "totalAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Total costs"},
                    "dateTime": {"type": "string", "maxLength": 32, "format": "datetime", "title": "Date and time"}
                }
            }
        }
    }
} 
*/

class EnzoFolioItem {
    static FOLIO_ITEM_TYPES = { 
        CHARGE: "Charge", 
        PAYMENT: "Payment", 
        REFUND: "Refund" 
    };
    constructor({ pmsId = null, folioItemGroupId = null, name = {}, 
        type = EnzoFolioItem.FOLIO_ITEM_TYPES.CHARG, 
        totalAmount = 0, unitAmount = 0, numberOfUnits = 0,
        dateTime = null } = {}) 
    {
        this.pmsId = pmsId ;
        this.folioItemGroupId = folioItemGroupId;
        this.name = new LocalText(name) ;
        this.unitAmount = unitAmount;
        this.numberOfUnits = numberOfUnits;
        this.totalAmount = totalAmount ;
        this.type = type ;
        this.dateTime = dateTime;
    }
}

/*
"folioItems": {
    "type": "array",
    "title": "Folio items",
    "items": {
        "type": "object",
        "title": "Folio item",
        "required": ["pmsId", "type", "name", "unitAmount", "numberOfUnit", "totalAmount"],
        "properties": {
            "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
            "folioItemGroupId": {"type": "string", "maxLength": 64, "title": "Folio item group id"},
            "type": {"type": "string", "maxLength": 16, "title": "Type", "enum": ["Charge", "Payment", "Refund"]},
            "name": {
                "type": "object", "title": "Name", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
                "properties": {
                    "en-UK":  {"type": "string", "maxLength": 64},
                    "nl-NL":  {"type": "string", "maxLength": 64},
                    "de-DE":  {"type": "string", "maxLength": 64},
                    "fr-FR":  {"type": "string", "maxLength": 64}
                }
            },
            "unitAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Unit Price"},
            "numberOfUnits": {"type": "number", "multipleOf": 1, "minimum": 0, "title": "Number of items"},
            "totalAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Total costs"},
            "dateTime": {"type": "string", "maxLength": 32, "format": "datetime", "title": "Date and time"}
        }
    }
}
}
*/
class EnzoFolioItemGroup {
     constructor({ pmsId = null, name = {} } = {}) 
     {
        this.pmsId = pmsId ;
        this.name = new LocalText(name) ;
    }
}
/*
// folioItemGroup
{
    "$id": "https://enzosystems.com/schemas/hotel/folio_item_group",
    
    "type": "object",
    "title": "Folio item group",
    "required": ["pmsId", "name"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {
            "type": "object", "title": "Name", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
            "properties": {
                "en-UK":  {"type": "string", "maxLength": 32},
                "nl-NL":  {"type": "string", "maxLength": 32},
                "de-DE":  {"type": "string", "maxLength": 32},
                "fr-FR":  {"type": "string", "maxLength": 32}
            }
        }
    }
}
*/

class EnzoFolioTax {
    constructor({  name = {}, grossAmount = 0, netAmount = 0, amount = 0 } = {}) 
        {
        this.name = new LocalText(name) ;
        this.grossAmount = grossAmount;
        this.netAmount = netAmount;
        this.amount = amount ;
    }
}
/*
//tax
{
    "$id": "https://enzosystems.com/schemas/hotel/tax",
   
    "type": "object",
    "title": "Tax",
    "required": ["amount", "netAmount", "grossAmount", "name"],
    "properties": {
        "amount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Amount"},
        "netAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Amount"},
        "grossAmount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Amount"},
        "name": {
            "type": "object", "title": "Name", "required": ["en-UK", "nl-NL", "de-DE", "fr-FR"],
            "properties": {
                "en-UK":  {"type": "string", "maxLength": 32},
                "nl-NL":  {"type": "string", "maxLength": 32},
                "de-DE":  {"type": "string", "maxLength": 32},
                "fr-FR":  {"type": "string", "maxLength": 32}
            }
        }
    }
}
 */
       
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

class EnzoAvailableOption {

    static PRICING_METHOD = {
        PERDAY:"PerDay",
        PERNIGHT: "PerNight", 
        PERSTAY: "PerStay",
        PERGUEST: "PerGuest",
        PERGUESTPERDAY: "PerGuestPerDay",
        PERGUESTPERNIGHT: "PerGuestPerNight", 
        PERGUESTPERSTAY: "PerGuestPerStay",
        PERADULT: "PerAdult",
        PERADULTPERDAY: "PerAdultPerDay",
        PERADULTPERNIGHT: "PerAdultPerNight", 
        PERADULTPERSTAY: "PerAdultPerStay"
    };
    static OFFER = {
        ALWAYS:"Always",
        NEVER: "Never", 
        RULE: "Rule"
    };
    constructor({ pmsId = null, optionGroupId = null, categoryId = null,
        name = {}, description = {}, descriptionLong = {},
        price = 0, priceType = EnzoAvailableOption.PRICING_METHOD.PERSTAY, 
        datetimeStart = null, datetimeEnd = null, 
        hidden = false, disabled = false,
        offered = EnzoAvailableOption.OFFER.ALWAYS, 
        rule = {},
        accessCodes = [],
        images = [], 
     } = {}) {
        this.pmsId = pmsId ;
        this.optionGroupId = optionGroupId ;
        this.categoryId = categoryId ;
        this.name = new LocalText(name); 
        this.description = new LocalText(description);
        this.descriptionLong = new LocalText(descriptionLong);
        this.price = price;
        this.priceType = priceType;
        this.datetimeStart = datetimeStart;
        this.datetimeEnd = datetimeEnd;
        this.hidden = hidden;
        this.disabled = disabled;
        this.accessCodes = accessCodes;
        this.offered = offered;
        this.rule = rule ? new EnzoOptionRule(rule) : null;
        this.images = images.map(image => new Image(image));
    }
} 


class EnzoOptionRule {
    static OPERATORS = { 
        AND: 'and',
        OR: 'or',
        //"NOT", "==", "!=", "<", "<=", ">", ">=", "IN", "NOTIN", "ALWAYS"
    };
    constructor({ operator = null, operands = [] }) {
        this.operator = operator;
        this.operands = operands;
    }
}

/*
"rule": {
    "$id": "#rule",
    "type": "object",
    "required": ["operator", "operands"],
    "properties": {
        "operator": {"type": "string","enum": ["AND", "OR", "NOT", "==", "!=", "<", "<=", ">", ">=", "IN", "NOTIN", "ALWAYS"]},
        "operands": {
            "type": "array",
            "items": {"oneOf": [{"type": "string"}, {"type": "number"}, {"$ref": "#rule"}]},
            "minItems": 1
        }
    }
}
*/
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

class EnzoQrCode {
    constructor({ 
        qrCodeData = null, generatedBy = null,
        hotelId = null, 
        pmsId = null,
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


module.exports = {
    EnzoQrCode,
    EnzoWifi,
    EnzoAvailableOption,
    EnzoOptionGroup,
    EnzoOptionQualifier,
    EnzoOptionRule,
    EnzoPayment,
    EnzoFolioItem,
    EnzoFolioItemGroup,
    EnzoFolioTax,
    EnzoFolio,
    EnzoGuest,
    EnzoGuestIdentification,
    EnzoHotel,
    EnzoHotelStay,
    EnzoRatePlan,
    EnzoRoom,
    EnzoRoomType,
    EnzoRoomFeature,
    EnzoRoomStay,
    EnzoReservation,
    EnzoLocale,
    EnzoCurrency,
    LocalText,
    Address ,
    Image,
    Car,
    Company,
    EnzoCommonParameters
}