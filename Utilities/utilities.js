
const dynamoDB = require('../AWS/awsDynamoDb.js')

const SETTINGS = require('../settings.json') ;
const RESERVATION = SETTINGS.DYNAMODB_TABLE.RESERVATION

function generateReservation() {



    let uuid = randomUUID() ; 
    return uuid //new Reservation() ;


}  


const isBookingValid = (book) =>  !("arrivalDate" in book.reservation)  ;

const isPreCheckedBooking = (book) => ("status" in book.reservation && book.reservation.status.toUpperCase() ===  'PRECHECKED')  ;
        

const findValueInDataStore = ( { value , key , store }) => {

  
    let objectToFind = [] ;

    for ( const entry in store ) {
        console.log(entry) ;
        if (store[entry] === value ) {
            if (key && key !== entry) continue ;
            objectToFind.push(store) ;
        }
        else if (Object.keys(store[entry]) && Object.keys(store[entry]).length){
            let child = store[entry] ;
            return findValueInDataStore({ value , key , store: child }) ;
        } 
    }

    return objectToFind ;
}


const getInDataStore = (key , store) => {

    if (!(key in store)) return null ;

    return store[key] ;
}


const setInDataStore = (key , upd , store) => {

    if (!getInDataStore(key, store)) return null ;

    store[key] = upd  ;
    
    return store[key] ;

}

const MS_PER_DAY = 1000 * 60 * 60 * 24;


const dateDiffInDays = (a, b) => {
   
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  }

  const makeDate = () => {
    let date1 = new Date(((new Date().getTime()) + (MS_PER_DAY))).toLocaleDateString()
    let date2 = new Date(((new Date(date1).getTime()) + (MS_PER_DAY))).toLocaleDateString() 
    return {date1 , date2}
}

const getDay = (d) =>  new Date(d).toLocaleDateString(false, { weekday: 'long' });




const resetBookingState = (book) => {
        
    let newDates ;
    
    if ("status" in book.reservation && book.reservation.status.toUpperCase() === "PRECHECKED") {
        delete  book.reservation.status ;
    }
   
    return book ;
};

const makeCheckDates = (past = false) => {
        
    let len = Math.floor(Math.random() * 10)   ;
    len = past ? -1 * len : len ;

    let today = new Date();
    let otherDate = new Date(new Date().setDate(today.getDate() +  len)) ;

    
    return ({ 
        today: today.toISOString().split('T')[0] ,
        otherDate: otherDate.toISOString().split('T')[0] 
    }) ;
}

    const resetBookingDate = (book) => {
        
        let newDates ;
        
        if ("arrivalDate" in book.reservation) {
            newDates = makeCheckDates(true) ; 
            book.reservation.arrivalDate = newDates.otherDate ;
            book.reservation.startDate = newDates.otherDate ;
            book.reservation.endDate = newDates.today ;
        }
        else {
            newDates = makeCheckDates(false) ; 
            book.reservation.startDate = newDates.today ;
            book.reservation.endDate = newDates.otherDate ;
        }

        return book ;
    };
 
const resetBookingStatus = async (email = null , uuid = null) => {

    const db = require(`../${SETTINGS.DATA_STORAGE.PATH}`) ;
   
 
    try{

        let originalDb = getInDataStore("checkins" , db) ;

   
        if (!email && !uuid) {
           for ( const check in  originalDb) {
               console.log(check)
                let newBook = resetBookingDate(originalDb.checkins[check]) ;
                //originalDb.checkins[check] = newBook ;    
                await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : check , ...newBook   } )
            }
         //  setInDataStore("checkins" , originalDb.checkins ,  db) ; 
        }
        else if (email) {
            let bookings = [];
            for ( const check in  originalDb) {

           //     let bookings =   findValueInDataStore( {value: email , key :'email' , store : originalDb}) ;
                if (originalDb[check].email === email )  {
                      booking = originalDb[check] ;
                
            console.log("*********************************************")
            console.log("*********************************************")
            console.log(booking)
            console.log("*********************************************")
                 let newBook = resetBookingDate(booking) ;
                 //originalDb.checkins[check] = newBook ;    
                 await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : booking.uuid , email : booking.guest.email ,  ...newBook   } )
                }
            }
        }
        else if (uuid) {
    
            let booking = findValueInDataStore(uuid , 'uuid' , originalDb) ;
           
                 let newBook = resetBookingDate(booking) ;
                 //originalDb.checkins[check] = newBook ;    
                 await dynamoDB.putDynamoDBItem(RESERVATION , { reservationID : booking.uuid , email : booking.guest.email , ...newBook   } )
        }
          //  setInDataStore("checkins" , originalDb.checkins ,  db) ; 
        return 1;
    }
    catch(e) {
        console.log(e)
        throw e
    }
   
}



module.exports = {
    resetBookingDate,
    makeCheckDates,
    resetBookingState,
    resetBookingStatus,
    isBookingValid,
    isPreCheckedBooking,
    findValueInDataStore ,
    getInDataStore , 
    setInDataStore ,
    dateDiffInDays,
    makeDate,
    getDay
}