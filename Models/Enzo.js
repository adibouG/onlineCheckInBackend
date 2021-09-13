// locale
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/locale",
   
    "type": "string",
    "title": "Locale",
    "format": "locale",
    "enum": ["da-DK", "de-DE", "en-UK", "en-US", "es-ES", "fr-FR", "it-IT", "nl-NL"],
    "default": "en-UK"
}
 */

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
        NL: "nl-NL",
        DEFAULT: this.GB
    };
    static SUPPORTED_LOCALE_LIST = [
        "da-DK",
        "de-DE", 
        "en-UK",
        "en-GB",
        "en-US",
        "es-ES",
        "fr-FR",
        "it-IT",
        "nl-NL"
    ];


    constructor(locale = null){
        if (locale && locale.includes('-') && EnzoLocale.SUPPORTED_LOCALE_LIST.includes(locale)) this.locale = locale;
        else if (locale && EnzoLocale.SUPPORTED_LOCALE[locale.toUpperCase()]) this.locale = locale;
        else this.locale = EnzoLocale.SUPPORTED_LOCALE.DEFAULT;
    }
}
// currency
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/currency",
 
    "type": "string",
    "title": "Currency",
    "format": "currency",
    "enum": ["AUD", "CHF", "CNY", "DKK", "EUR", "GBP", "GEL", "MYR", "USD"],
    "default": "EUR"
}
*/
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
        DEFAULT: this.EUR
    };
    static SUPPORTED_CURRENCY_LIST = ["AUD", "CHF", "CNY", "DKK", "EUR", "GBP", "GEL", "MYR", "USD"];

    constructor(currency = null){
        if (currency && EnzoLocale.SUPPORTED_CURRENCY_LIST.includes(currency)) this.currency = currency;
        else this.currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT;
    }
}

// image
/*{
    "id": "https://enzosystems.com/schemas/hotel/image",
   
    "type": "object",
    "title": "Image",
    "required": ["source", "width", "height"],
    "properties": {
        "source": {"type": "string","title": "Source", "format": "uri"},
        "width": {"type": "number", "title": "Width", "unit": "px", "minimum": 1, "multipleOf": 1},
        "height": {"type": "number", "title": "Height", "unit": "px", "minimum": 1, "multipleOf": 1},
        "focusPoint": {
            "type": "object",
            "title": "Focus point",
            "required": ["x", "y"],
            "properties": {
                "x": {"type": "number", "title": "Horizontal position", "unit": "%", "minimum": 0, "maximum": 100, "multipleOf": 1},
              "y": {"type": "number",  "title": "Vertical position", "unit": "%", "minimum": 0, "maximum": 100, "multipleOf": 1}
            }
        } 
    }
}
 */
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
class LocalText {
    constructor(value = null, locale = EnzoLocale.SUPPORTED_LOCALE.DEFAULT) 
    {
        this.locale = locale;
        this.value = value ;
    }
}

// address 
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/address",
    
    "type": "object", 
    "title": "Address",
    "required": ["address1", "city", "postalCode", "country"],
    "properties": {
        "address1": {"type": "string", "title": "House number and street name"},
        "address2": {"type": "string", "title": "Apartment/suite/unit"},
        "city": {"type": "string", "title": "City"},
        "state": {"type": "string", "title": "State/Province"},
        "postalCode": {"type": "string", "title": "Postal code"},
        "country": {"type": "string", "title": "Country", "format": "ISO 3166-2"}
    }
}
*/

class EnzoAddress {
    constructor({ addressLine1 = null, addressLine2 = null, country = null, postalCode = null, city = null } = {}) {
        this.addressLine1 = addressLine1  ;
        this.addressLine2 = addressLine2 ;
        this.postalCode = postalCode; 
        this.city = city;
        this.country = country;
    }
}

// hotel
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/hotel",
   
    "type": "object",
    "title": "Hotel",
    "required": ["pmsId", "name", "logo"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "chainName": {"type": "string", "maxLength": 32, "title": "Chain name"},
        "name": {"type": "string", "maxLength": 32, "title": "Name"},
        "email": {"type": "string", "maxLength": 128, "format": "email", "title": "Email address"},
        "phone": {"type": "string", "maxLength": 32, "format": "phone", "title": "Phone"},
        "website": {"type": "string", "maxLength": 128, "format": "url", "title": "Web site"},
        "address": {"$ref": "/schemas/hotel/address"},
        "logo": {"$ref": "/schemas/hotel/image"},
        "images": {
            "type": "array", "title": "Images",
            "items": {"$ref": "/schemas/hotel/image"}
        },
        "policies":  {"type": "string", "title": "Policies"},
        "gdprRules":  {"type": "string", "title": "GDPR rules"},
        "guestRegistrationForm":  {"type": "string", "title": "Guest registration form"},
        }
    }
}
*/

class EnzoHotel {
    constructor({ hotelId = null, pmsId = null, 
        chainName = null, name = null, email = null, 
        phone = null, website = null, address = null, 
        logo = null, images = [], 
        policies = null, gdprRules = null, 
        guestRegistrationForm = null, checkInTime = null } = {}) 
    {
        this.hotelId = hotelId  ;
        this.pmsId = pmsId  ;
        this.chainName = chainName ;
        this.name = name; 
        this.email = email;
        this.phone = phone;
        this.website = website;
        this.address = address ? new EnzoAddress(address) : null;
        this.logo = logo;
        this.images = images;
        this.policies = policies;
        this.gdprRules = gdprRules;
        this.guestRegistrationForm = guestRegistrationForm;
        this.checkInTime = checkInTime;
    }
}

// hotel Stay object
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/main_hotel_object",
   
    "hotel": {"$ref": "/schemas/hotel/hotel"},
    "rooms": {"type": "array", "title": "Rooms", "items": {"$ref": "/schemas/hotel/room"}},
    "roomTypes": {"type": "array", "title": "Room types", "items": {"$ref": "/schemas/hotel/roomtype"}},
    "roomFeatures": {"type": "array", "title": "Room features", "items": {"$ref": "/schemas/hotel/roomfeature"}},
    "ratePlans": {"type": "array", "title": "Rate plans", "items": {"$ref": "/schemas/hotel/rateplan"}},
    "optionGroups": {"type": "array", "title": "Opion groups", "items": {"$ref": "/schemas/hotel/optiongroup"}},
    "options": {"type": "array", "title": "Options", "items": {"$ref": "/schemas/hotel/option"}},
    "minibar": {"$ref": "/schemas/hotel/minibar"}
}
*/
class EnzoHotelStay {

    constructor({ hotel = null, 
        rooms = [], roomTypes = [], roomFeatures = [],
        ratePlans = [], optionGroups = [], options = [], 
        minibar = null } = {}) 
    {
        this.hotel = hotel ? new EnzoHotel(hotel) : null;
        this.rooms = rooms.map(r => new EnzoRoom);
        this.roomTypes = roomTypes.map(r => new EnzoRoom); 
        this.roomFeatures = roomFeatures.map(r => new EnzoRoom);
        this.ratePlans = ratePlans.map(r => new EnzoRoom);
        this.optionGroups = optionGroups.map(r => new EnzoOptionGroup);
        this.options = options.map(r => new EnzoOption);
        this.minibar = minibar;
    }
    
}
// room
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/room",
    
    "type": "object",
    "title": "Room",
    "required": ["pmsId", "name", "roomTypeId"],
    "properties": { 
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {"type": "string", "maxLength": 32, "title": "Number or name"},
        "roomTypeId": {"type": "string", "maxLength": 64, "title": "Room type id"},
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

class EnzoRoom {

    static ROOM_STATUS_LIST = ["Clean", "CleanForInspection", "Dirty", "Occupied", "Maintenance"];
    static ROOM_STATUS = {
        CLEAN: "Clean",
        CLEANFORINSPECTION: "CleanForInspection",
        DIRTY: "Dirty",
        OCCUPIED: "Occupied",
        MAINTENANCE: "Maintenance"
    };
    constructor({ pmsId = null, name = [],
        roomTypeId = null, 
        status = EnzoRoom.ROOM_STATUS.DIRTY, images = [],
        directions = [], view = [] }) 
    {
        this.pmsId = pmsId ;
        this.name = name.map(n => new LocalText(n));
        this.roomTypeId = roomTypeId; 
        this.status = status;
        this.images = images;
        this.directions = directions.map(d => new LocalText(d))
        this.view = view.map(v => new LocalText(v));
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
    constructor({ pmsId = null, name = [],
        maxOccupancy = 0, minOccupancy = 0, 
        bedType = null, image = null, 
        description = [], roomFeature = null }) 
    {
        this.pmsId = pmsId ;
        this.name = name.map(n => new LocalText(n)) ;
        this.description = description.map(n => new LocalText(n));
        this.minOccupancy = minOccupancy; 
        this.maxOccupancy = maxOccupancy;
        this.bedType = bedType;
        this.image = image;
        this.roomFeature = roomFeature;
        
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


// person
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/person",
    
    "type": "object",
    "title": "Person",
    "required": ["lastName", "email"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "firstName": {"type": "string", "maxLength": 32, "title": "First name"},
        "lastName": {"type": "string", "maxLength": 32, "title": "Last name"},
        "fullName": {"type": "string", "maxLength": 64, "title": "Full name"},
        "ageCategory": {"type": "string", "title": "Age category", "enum": ["Infant", "Child", "Adult"]},
        "dateOfBirth": {"type": "string", "maxLength": 10, "format": "date", "title": "Date of birth"},
        "gender": {"type": "string", "title": "Gender", "enum": ["Male", "Female", "Neutral"]},
        "nationality": {"type": "string", "maxLength": 2, "format": "country", "title": "Nationality"},
        "language": {"type": "string", "maxLength": 2, "format": "language", "title": "Language"},
        "address": {"$ref": "/schemas/hotel/address"},
        "email": {"type": "string", "maxLength": 64, "format": "email", "title": "Email"},
        "phone": {"type": "string", "maxLength": 16, "format": "phone", "title": "Mobile phone"},
        "signature": {"$ref": "/schemas/hotel/image", "title": "Signature"},
        "identification": {"$ref": "/schemas/hotel/identification"},
        "note": {"type": "string", "maxLength": 64, "title": "Note"},
    }
}
*/

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

// identification
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/person_identification",
   
    "type": "object",
    "title": "Identification",
    "required": ["type", "number", "lastName", "expires"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "type": {"type": "string", "title": "Document type", "enum": ["Passport", "TravelDocumentCard", "DriverLicense", "Visa"]},
        "number": {"type": "string", "maxLength": 32, "title": "Document number"},
        "firstName": {"type": "string", "maxLength": 32, "title": "First name"},
        "lastName": {"type": "string", "maxLength": 32, "title": "Last name"},
        "fullName": {"type": "string", "maxLength": 64, "title": "Full name"},
        "dateOfBirth": {"type": "string", "maxLength": 10, "format": "date", "title": "Date of birth"},
        "issued": {"type": "string", "maxLength": 10, "format": "date", "title": "Issued"},
        "expires": {"type": "string", "maxLength": 10, "format": "date", "title": "Expires"},
        "country": {"type": "string", "maxLength": 2, "format": "country", "title": "Country"},
        "state": {"type": "string", "maxLength": 32, "title": "State"},
        "scan": {"$ref": "/schemas/hotel/image", "title": "Scan"}
    }
}
*/

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

// folio
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/folio",
    "type": "object",
    "title": "Folio",
    "required": ["name", "totalCost", "alreadyPaid", "remainingToPay"],
    "properties": {
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "name": {
            "type": "array", "title": "Name",
            "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 16}}}
        },
        "totalCost": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Total costs"},
        "taxIncluded": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Tax included"},
        "alreadyPaid": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Already paid"},
        "remainingToPay": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "To pay"},
        "folioDateGroups": {
            "type": "array",
            "title": "Name",
            "items": {
                "type": "object",
                "title": "Folio date group",
                "required": ["pmsId", "name", "subtotal"],
                "properties": {
                    "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
                    "name": {
                        "type": "array", "title": "Name",
                        "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 16}}}
                    },
                    "subtotal": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Subtotal"},
                    "folioGroups": {
                        "type": "array",
                        "title": "Name",
                        "items": {
                            "type": "object",
                            "title": "Folio group",
                            "required": ["pmsId", "name", "subtotal"],
                            "properties": {
                                "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
                                "name": {
                                    "type": "array", "title": "Name",
                                    "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 16}}}
                                },
                                "subtotal": "type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Subtotal",
                                "folioItems": {
                                    "type": "array",
                                    "title": "Name",
                                    "items": {
                                        "type": "object",
                                        "title": "Folio item",
                                        "required": ["pmsId", "type", "subtotal"],
                                        "properties": {
                                            "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
                                            "type": {"type": "string", "maxLength": 16, "title": "Type", "enum": ["Charge", "Payment", "Tax"]},
                                            "name": {
                                                "type": "array", "title": "Name",
                                                "items": {"type": "object", "properties": {"locale": {"type": "string", "format": "locale", "maxLength": 5}, "value": {"type": "string", "maxLength": 16}}}
                                            },
                                            "unitPrice": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Unit Price"},
                                            "numberOfItems": {"type": "number", "multipleOf": 1, "minimum": 0, "title": "Number of items"},
                                            "subtotal": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Subtotal"},
                                            "dateTime": {"type": "string", "maxLength": 32, "format": "datetime", "title": "Date and time"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
*/

class EnzoFolioItem {
    static FOLIO_ITEM_TYPES = { 
        CHARG: "Charge",
        PAY: "Payment", 
        TAX: "Tax" 
    };

    constructor({ pmsId = null, name = [], subtotal = 0, type = EnzoFolioItem.FOLIO_ITEM_TYPES.CHARG, unitPrice = 0, numberOfItems = 0,
        dateTime = null, details = null } = {}) {
        this.pmsId = pmsId ;
        this.name = name.map(n => new LocalText(n)) ;
        this.unitPrice = unitPrice;
        this.numberOfItems = numberOfItems;
        this.subtotal = subtotal ;
        this.type = type ;
        this.dateTime = dateTime;
        this.details = details;
    }
}
class EnzoFolioGroup {
    constructor({ pmsId = null, name = [], subtotal = 0, folioItems = [] } = {}) 
        {
        this.pmsId = pmsId ;
        this.name = name ;
        this.subtotal = subtotal ;
        this.folioItems = folioItems ;
        }
    }


class EnzoFolioDateGroup {
    constructor({ pmsId = null, name = [], subtotal = 0, folioGroups = [] } = {}) 
        {
        this.pmsId = pmsId ;
        this.name = name ;
        this.subtotal = subtotal ;
        this.folioGroups = folioGroups ;
        }
    }

class EnzoFolio {
    constructor({ pmsId = null, name = [], 
        totalCost = 0, taxIncluded = 0, alreadyPaid = 0, remainingToPay = 0,
        currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT, folioDateGroups = [] } = {}) {
        this.pmsId = pmsId ;
        this.name = name ;
        this.totalCost = totalCost ;
        this.taxIncluded = taxIncluded ;
        this.alreadyPaid = alreadyPaid;
        this.remainingToPay = remainingToPay;
        this.currency = currency;
        this.folioDateGroups = folioDateGroups;
    }
}
 
       
 
//payment
/*{
    "$id": "https://enzosystems.com/schemas/hotel/payment",
   
    "type": "object",
    "title": "Payment",
    "required": ["id", "amount", "dateTime"],
    "properties": {
        "id": {"type": "string", "maxLength": 64, "title": "Id"},
        "amount": {"type": "number", "minimum": 0, "multipleOf": 0.01, "title": "Amount"},
        "paymentMethod": {"type": "string"}, "maxLength": 64, "title": "Payment method"},
        "dateTime": {"type": "string", "maxLength": 32, "format": "datetime", "title": "Date and time"}
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



// option
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/option",
    
    "type": "object",
    "title": "Option",
    "required": ["pmsId", "optionGroupId", "name", "description", "offered"],
    "properties": { 
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "optionGroupId": {"type": "string", "maxLength": 64, "title": "Group id"},
        "categoryId": {"type": "string", "maxLength": 64, "title": "Category id"},
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
        "price": {"type": "number", "title": "Price", "minimum": 0, "multipleOf": 0.01},
        "priceType": {"type": "string", "title": "Price type", "enum": ["PerDay", "PerNight", "PerStay", "PerGuest", "PerGuestPerDay", "PerGuestPerNight", "PerGuestPerStay"]},
        "timeStart": {"type": "string", "title": "Start time", "format": "time"},
        "timeEnd": {"type": "string", "title": "End time", "format": "time"},
        "images": {
            "type": "array", "title": "Button images", 
            "items": {"$ref": "/schemas/hotel/image"}
        },
        "hidden": {"type": "boolean", "title": "Hidden"},
        "disabled": {"type": "boolean", "title": "is disabled?"},
        "accessCodes": {
            "type": "array", "title": "Access codes", 
            "items": {"type": "string", "format": "base64"}
        },
        "offered": {"type": "string", "title": "Offered", "enum": ["Always", "Never", "Rule"]},
        "rule": {"$ref": "/schemas/hotel/rule"}
    }
}
*/
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
        name = [], description = [], 
        pricingMethod = EnzoOption.PRICING_METHOD.PERSTAY, image = [], 
        currency = EnzoCurrency.SUPPORTED_CURRENCY.DEFAULT, price = 0,
        timeStart = null, timeEnd = null, quantity = 0 } = {}) {
        this.pmsId = pmsId ;
        this.optionGroupId = optionGroupId ;
        this.categoryId = categoryId ;
        this.name = name; 
        this.description = description;
        this.price = price;
        this.priceType = priceType;
        this.images = image
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.currency = currency;
        this.pricingMethod = pricingMethod;
        this.quantity = quantity;
        this.image = image;
    }
} 



// roomStay
/*
{
    "$id": "https://enzosystems.com/schemas/hotel/roomstay",

    "type": "object",
    "title": "Room stay",
    "required": ["pmsId", "status", "expectedArrival", "expectedDeparture", "numberOfAdults", "roomTypeId", "folios"],
    "properties": { 
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "status":  {"type": "string", "title": "Status", "enum": ["WaitingForGuest", "CheckingIn", "CheckedIn", "CheckingOut", "CheckedOut"]},
        "expectedArrival": {"type": "string", "format": "date-time"},
        "expectedDeparture": {"type": "string", "format": "date-time"},
        "finalArrival": {"type": "string", "format": "date-time"},
        "finalDeparture": {"type": "string", "format": "date-time"},
        "numberOfAdults": {"type": "number", "multipleOf": 1, "title": "Number of adults"},
        "numberOfChildren": {"type": "number", "multipleOf": 1, "title": "Number of children"},
        "numberOfInfants": {"type": "number", "multipleOf": 1, "title": "Number of infants"},
        "guests": {"type": "array", "items": {"$ref": "/schemas/hotel/person"}, "title": "Guest(s)"},
        "company": {"$ref": "/schemas/hotel/company"},
        "cars": {"type": "array", "items": {"$ref": "/schemas/hotel/car"}, "title": "Car(s)"},
        "roomId": {"type": "string", "maxLength": 64, "title": "Room PMS id"},
        "roomTypeId": {"type": "string", "maxLength": 64, "title": "Room type PMS id"},
        "ratePlanId": {"type": "string", "maxLength": 64, "title": "Rate plan PMS id"},
        "optionIds": {"type": "array", "items": {"type": "string", "maxLength": 64, "title": "Option PMS id"}, "title": "Option(s)"},
        "purposeOfStay": {"type": "string", "title": "Purpose of stay", "enum": ["Leisure", "Corporate"]},
        "primaryGuestIsMember": {"type": "boolean", "title": "Booker is member"},
        "primaryGuestIsVIP": {"type": "boolean", "title": "Booker is VIP"},
        "primaryGuestAcceptedHotelPolicies": {"type": "boolean", "title": "Guest accepted hotel policies"},
        "primaryGuestAcceptedGdprRules": {"type": "boolean", "title": "Guest accepted GDPR rules"},
        "primaryGuestAllowsEmailMarketing": {"type": "boolean", "title": "Guest allows email marketing"},
        "wifi": {"$ref": "/schemas/hotel/wifi"},
        "folios": {"type": "array", "items": {"$ref": "/schemas/hotel/folio"}, "title": "Folio(s)"},
        "payments": {"type": "array", "items": {"$ref": "/schemas/hotel/payment"}, "title": "Payment(s)"}
    }
}

*/
class EnzoRoomStay  {
    constructor({ pmsId = null, bookingRef = null,
        expectedArrival = null, expectedDeparture = null, finalArrival = null, finalDeparture = null, 
        numberOfAdults = 0, numberOfChildren = 0, numberOfInfants = 0,
        roomId = null, ratePlanId = null, roomTypeId = null,
        primaryGuestIsMember = false, primaryGuestIsVIP = false,
        primaryGuestAcceptedHotelPolicies = false, primaryGuestAcceptedGdprRules = false,
        primaryGuestAllowsEmailMarketing = false,
        status = null, payments = [], folios = [], guests = [], optionIds = [], 
        wifi = null } = {}) 
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
        this.primaryGuestIsMember = primaryGuestIsMember;
        this.primaryGuestIsVIP = primaryGuestIsVIP;
        this.primaryGuestAcceptedHotelPolicies = primaryGuestAcceptedHotelPolicies;
        this.primaryGuestAcceptedGdprRules = primaryGuestAcceptedGdprRules;
        this.primaryGuestAllowsEmailMarketing = primaryGuestAllowsEmailMarketing;
        this.wifi = wifi;
        this.payments = payments.map(p => new EnzoPayment(p)) ;
        this.folios = folios.map(f => new EnzoFolio(f)) ;
        this.guests = guests.map(g => new EnzoGuest(g));
    }
}

class EnzoQrCode {
    constructor({ qrCodeData = null, generatedBy = null, hotelId = null, pmsId = null, reservationId = null } = {}) 
    {
        this.qrCodeData = qrCodeData;
        this.generatedBy = generatedBy;
        this.hotelId = hotelId;
        this.pmsId = pmsId;
        this.reservationId = reservationId;
    }
}


/*
{
    "$id": "https://enzosystems.com/schemas/hotel/reservation",
    
    "type": "object",
    "title": "Reservation",
    "required": ["pmsId", "roomStays"],
    "properties": { 
        "pmsId": {"type": "string", "maxLength": 64, "title": "PMS id"},
        "booker": {"$ref": "/schemas/hotel/person"},
        "bookerCompany": {"$ref": "/schemas/hotel/company"},
        "bookerIsMember": {"type": "boolean", "title": "Booker is member"},
        "bookerIsVIP": {"type": "boolean", "title": "Booker is VIP"},
        "bookingChannel": {"type": "string", "maxLength": 64, "enum": ["Direct", "Booking.com", "Expedia", "Trivago", "Hotels.com", "Airbnb", "Agoda", "Hotelbeds", "Other"], "title": "Booking channel"},
        "roomStays": {
            "type": "array", "title": "Room stay(s)", 
            "items": {"$ref": "/schemas/hotel/roomStay"}
        }
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
{
    "$id": "https://enzosystems.com/schemas/hotel/main_stay_object",

    "type": "object",
    "title": "Main Stay Object",
    "required": ["reservation", "availableRoomIds", "availableRoomTypeIds", "availableOptionIds"],
    "properties": { 
        "hotel": {"$ref": "/schemas/hotel/hotel" },
        "reservation": {"$ref": "/schemas/hotel/reservation" },
        "availableRoomIds": [],
        "availableRoomTypeIds": [],
        "availableOptionIds": [] 
    }      
}
}
*/
class EnzoStay {
    constructor({ reservation = null, availableRoomIds = [],
         availableRoomTypeIds = [], availableOptionIds = [] } = {})
    {
        this.reservation = reservation ? new EnzoReservation(reservation) : null;
        this.availableRoomIds = availableRoomIds;
        this.availableRoomTypeIds = availableRoomTypeIds;
        this.availableOptionIds = availableOptionIds;
    }
   
}


module.exports = {
    EnzoQrCode,
    EnzoOption,

    EnzoPayment,
    EnzoFolioItem,
    EnzoFolioDateGroup,
    EnzoFolioGroup,
    EnzoFolio,


    EnzoAddress ,
    EnzoGuest,
    EnzoGuestIdentification,
    
    EnzoHotelStay,
    EnzoHotel,

    EnzoRoom,
    EnzoRoomType,
    //EnzoRoomFeature,


    EnzoRoomStay,
    EnzoReservation,
    EnzoStay,

    LocalText,
    Image,
    EnzoLocale,
    EnzoCurrency

}