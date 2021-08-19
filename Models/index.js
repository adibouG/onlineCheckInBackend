
class HotelDetails {
    constructor({ hotelId = null, addressId = null, address = null, 
        postCode = null, displayedName=null, city = null, country=null,
        checkinTime = null, phone = null, email = null, web = null,
        logo = null } = {}) {
        this.hotelId  = hotelId  ;
        this.addressId  = addressId  ;
        this.displayedName = displayedName ; 
        this.address = address ;
        this.postCode = postCode; 
        this.city = city;
        this.country = country;
        this.phone = phone;
        this.email = email;
        this.web = web;
        this.checkinTime = checkinTime;
        this.logo = logo ;
    }
}

class HotelPmsSettings { 
    constructor({ hotelId = null, pmsId = null,
        pmsUrl = null , pmsName = null, 
        pmsLogin = null, pmsPwd = null, pmsAdditionalSettings = {} } = {}) {
        this.hotelId = hotelId ; 
        this.pmsId =  pmsId; 
        this.pmsUrl = pmsUrl; 
        this.pmsName = pmsName;
        this.pmsLogin = pmsLogin ;
        this.pmsPwd = pmsPwd ;
        this.pmsAdditionalSettings = pmsAdditionalSettings;
  }
}



class HotelAppSettings { 
    constructor({ hotelId = null, screens = {}, style = {} } = {} ) {
        this.hotelId = hotelId ; 
        this.screens = screens; 
        this.style = style ;
    }
}

class Hotel { 
    constructor({ hotelId = null, name,
        hotelDetails = {}, pmsSettings = {}, applicationSettings = {}} = {}) {
        this.hotelId = hotelId ; 
        this.name =  name ; 
        if (!hotelDetails.displayedName) hotelDetails.displayedName = name;
        if (!hotelDetails.hotelId) hotelDetails.hotelId = hotelId;
        if (!pmsSettings.hotelId) pmsSettings.hotelId = hotelId;
        if (!applicationSettings.hotelId) applicationSettings.hotelId = hotelId;
        this.hotelDetails = new HotelDetails(hotelDetails);
        this.pmsSettings = new HotelPmsSettings(pmsSettings) ;
        this.applicationSettings = new HotelAppSettings(applicationSettings) ;
    
  }
}

class EmailTracking { 
    constructor({ reservationID, hotelID, emailType, sentDate = null, sendingDate = null, messageID = null, attempts = 0 } = {}) {
        this.hotelID =  hotelID ; 
        this.reservationID =  reservationID ; 
        this.emailType = emailType ; 
        this.sendingDate = new Date(sendingDate).getTime() || Date.now() ;
        this.sentDate = new Date(sentDate).getTime() || Date.now() ;
        this.messageID = messageID || (hotelID + '#' +  reservationID + "#" + emailType);
        this.attempts = attempts ;
  }
}
const SUCCESS_STATUS =  [ 'pending' , 'complete' ] ;
class SuccessBody {
    constructor(status, {}) {
        this.type =  'success' ;
        this.status =  status ;
        this.response = {} ;
    }
}

module.exports = {
    SuccessBody ,
    EmailTracking,
    Hotel,
    HotelAppSettings,
    HotelDetails,
    HotelPmsSettings
}