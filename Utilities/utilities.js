


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
            findInDataStore({ value , key , child }) ;
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


module.exports = {
    isBookingValid,
    isPreCheckedBooking,
    findValueInDataStore ,
    getInDataStore , 
    setInDataStore ,
    dateDiffInDays,
    makeDate,
    getDay
}