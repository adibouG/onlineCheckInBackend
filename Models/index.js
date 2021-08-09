
class HotelDetails {
    constructor({ addressId = null, address = null, 
        postalCode = null, displayedName=null, city = null, country=null,
        checkInTime = null,
        logo = null } = {}) {
        this.addressId  = addressId  ;
        this.displayedName = displayedName ; 
        this.address = address ;
        this.postalCode = postalCode; 
        this.city = city;
        this.country = country;
        this.phone = phone;
        this.email = email;
        this.web = web;
        this.checkInTime = checkInTime;
        this.logo = logo ;
    }
}

class HotelPmsSettings { 
    constructor({ hotelID = null, pmsID = null,
        pmsUrl = null , pmsName = null, 
        pmsLogin = null, pmsPwd = null, pmsAdditionalSettings = {} } = {}) {
        this.hotelID = hotelID ; 
        this.pmsID =  pmsID ; 
        this.pmsUrl = pmsUrl; 
        this.pmsName = pmsName;
        this.pmsLogin = pmsLogin ;
        this.pmsPwd = pmsPwd ;
        this.pmsAdditionalSettings = pmsAdditionalSettings;
  }
}



class HotelAppSettings { 
    constructor({ hotelID = null, 
        appSettings = {} , appScreen = null, logo , styles = {} } = {} ) {
            this.hotelID = hotelID ; 
        this.appSettings =  appSettings ; 
        this.appScreen = appScreen; 
        this.logo = logo;
        this.styles = styles ;
    }
}

class Hotel { 
    constructor({ hotelID = null, name, displayedName = null,
        hotelDetails = {}, pmsSettings, appSettings } = {}) {
        this.hotelID = hotelID ; 
        this.name =  name ; 
        if (!hotelDetails.displayedName) hotelDetails.displayedName = name;
        this.hotelDetails = new HotelDetails(address);
        this.pmsSettings = new HotelPmsSettings(pmsSettings) ;
        this.appSettings = appSettings ;
    
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