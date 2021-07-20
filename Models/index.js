const EmailTrackingObject = (reservationID, type, sendDate = null, sentDate = null, messageID = null, attempts = 1) => ({
    "reservationID" :  reservationID , 
    "emailType": type , 
    "sendingDate" : sendDate || Date.now() ,
    "sentDate" : sentDate || Date.now() ,
    "messageID" : messageID || reservationID ,
    "attempts" : attempts ,
})

class EmailTracking { 
    constructor(reservationID, type, sendDate = null, sentDate = null, messageID = null, attempts = 1) {
        this.reservationID =  reservationID ; 
        this.emailType = type ; 
        this.sendingDate = sendDate || Date.now() ;
        this.sentDate = sentDate || Date.now() ;
        this.messageID = messageID || reservationID ;
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
    EmailTrackingObject
}