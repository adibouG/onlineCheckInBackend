const { randomUUID } = require('crypto');



class Guest {

    constructor({ email = null , fullName = null , address = null, postalCode = null , city = null , mobile = null }){
        this.fullName = fullName;
        this.address = address ;
        this.postalCode = postalCode; 
        this.city = city;
        this.email = email;
        this.mobile = mobile;
    }

}


class Checkin {

    constructor({ uuid = null , guest = null , reservation = null, privacyPolicy = null , payment = null }){
        this.uuid = uuid || randomUUID();
        this.guest = guest ;
        this.privacyPolicy = privacyPolicy; 
        this.payment = payment;
        this.reservation = reservation;
    }

} 


class Payment {
  
    constructor({ amount = null , currency = "€",  paid = null }) {
        this.amount = amount ;
        this.currency = currency; 
        this.paid = paid;
    }

} 


class Reservation {

    constructor({ startDate = null , endDate= null ,  guestCount = null  ,  options = null ,  roomType = null}) {
        this.startDate = startDate  ;
        this.endDate = endDate; 
        this.guestCount = guestCount;
        this.roomType = roomType; 
        this.options = options;
    }

}


const makeFormatedDate = (d = null , l = null) =>   {


    let date = d ? new Date(d) : new Date() ;



    return date.toISOString();

}

const addDay = (date , d) =>  new Date(date.getTime() + d ) ;

    

const SUCCESS_STATUS =  [ 'pending' , 'complete' ] 

class SuccessBody {

    constructor( status , {}  ) {


        this.type =  'success' ;
        this.status =  status ;
        this.response = {} ;

    }

  /*  getResponse() {

        return  (status === 'complete' ? { 
            status : this.status ,
            stay : this.response.stay
    } : 
    {
        status : this.status ,
        stay : this.response.
    } ) */
}


class EnzoError extends Error {

    constructor(e , error , type , message , code ) {
        super(e) ;
        this.message = message ;
        this.code = code ;
        this.error = error ;
        this.type = type ;
    }
}

class Failure extends EnzoError {

    constructor(message , code , error) {
        super(message , code , error) ;
        this.type = 'failure' ;
    }
}


class NotFound extends Failure {

    constructor(message , code , error) {
        super(message , code ) ;
   
        this.error = `notFound` ;
        this.message = `notFound` ;
    }
}

class ExpiredLink extends EnzoError {

    constructor(message , code ) {
        super( message , code  ) ;
        this.error = `expiredLink` ;
        this.message = `expiredLink` ;
    }
}

module.exports = {

    Guest ,
    Checkin ,
    Payment ,
    Reservation ,
    makeFormatedDate,
    addDay ,
    SuccessBody ,
    EnzoError,
    Failure,
    NotFound,
    ExpiredLink

}