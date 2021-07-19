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
class EnzoError extends Error {
    constructor(e, error, type, message, code) {
        super(e) ;
        this.message = message ;
        this.code = code ;
        this.error = error ;
        this.type = type ;
    }
}
class Failure extends EnzoError {
    constructor(message, code, error) {
        super(message, code, error) ;
        this.type = 'failure' ;
    }
}
class NotFound extends Failure {
    constructor(message, code, error) {
        super(message , code ) ;
        this.error = `notFound` ;
        this.message = `notFound` ;
    }
}
class ExpiredLink extends EnzoError {
    constructor(message, code) {
        super(message, code) ;
        this.error = `expiredLink` ;
        this.message = `expiredLink` ;
    }
}

module.exports = {
    SuccessBody ,
    EnzoError,
    Failure,
    NotFound,
    ExpiredLink ,
    EmailTracking,
    EmailTrackingObject
}