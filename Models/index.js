

class EmailTracking { 
    constructor({ reservationID, hotelID, emailType, sentDate = null, sendingDate = null, messageID = null, attempts = 1 } = {}) {
        this.hotelID =  hotelID ; 
        this.reservationID =  reservationID ; 
        this.emailType = emailType ; 
        this.sendingDate = new Date(sendingDate).getTime() || Date.now() ;
        this.sentDate = new Date(sentDate).getTime() || Date.now() ;
        this.messageID = messageID ;
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
    EmailTracking
}