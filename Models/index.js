
class HotelDetails {
    constructor({ hotelId = null, addressId = null, address = null, 
        postCode = null, displayedName = null, city = null, country=null,
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
        pmsUser = null, pmsPwd = null, pmsAdditionalSettings = {} } = {}) {
        this.hotelId = hotelId ; 
        this.pmsId =  pmsId; 
        this.pmsUrl = pmsUrl; 
        this.pmsName = pmsName;
        this.pmsUser = pmsUser ;
        this.pmsPwd = pmsPwd ;
        this.pmsAdditionalSettings = pmsAdditionalSettings;
  }
}




class Pms { 
    constructor({ pmsId = null,
        pmsName = null , pmsClassName = null } = {}) {
      
        this.pmsId =  pmsId;   
        this.pmsName = pmsName;
        this.pmsClassName = pmsClassName ;
    }
}

class HotelStylesSettings { 
    constructor({ fontFamily = null, backgroundImage = null,  cssFileUrl = null, logo = null } = {} ) { 
        
        this.fontFamily = fontFamily; 
        this.backgroundImage = backgroundImage ;
        this.logo = logo
        this.cssFileUrl = cssFileUrl ;
    }
}


class HotelScreenSettings { 
    constructor({  screenId = null, description = null, screenFields = {} } = {} ) {
   
        this.screenId = screenId;  
        this.description = description ;
        this.screenFields = screenFields ; 
    }
}

class HotelAppSettings { 
    constructor({ hotelId = null, screens = {}, style = {} } = {} ) {
        this.hotelId = hotelId; 
        this.screens = screens; 
        this.style = style ;
    }
}

class Hotel { 
    constructor({ hotelId = null, name = null, pmsId = null }) {
        this.hotelId = hotelId ; 
        this.pmsId = pmsId ; 
        this.name = name ; 
  }
}

class EmailTracking { 
    constructor({ reservationId, hotelId, emailType, sentDate = null, sendingDate = null, messageId = null, attempts = 0 } = {}) {
        this.hotelId =  hotelId ; 
        this.reservationId =  reservationId ; 
        this.emailType = emailType ; 
        this.sendingDate = new Date(sendingDate).getTime() || Date.now() ;
        this.sentDate = sentDate ? new Date(sentDate).getTime() : null;
        this.messageId = messageId || (hotelId + '#' +  reservationId + "#" + emailType);
        this.attempts = attempts ;
  }
}
const SUCCESS_STATUS =  [ 'pending' , 'complete' ] ;
class SuccessBody {
    constructor(status, {}) {
        this.type = 'success' ;
        this.status = status ;
        this.response = {} ;
    }
}

module.exports = {
    SuccessBody ,
    EmailTracking,
    Hotel,
    HotelAppSettings,
    HotelScreenSettings,
    HotelDetails,
    HotelPmsSettings,
    HotelStylesSettings,
    Pms
}