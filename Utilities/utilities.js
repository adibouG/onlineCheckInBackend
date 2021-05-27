


function generateReservation() {



    let uuid = randomUUID() ; 
    return uuid //new Reservation() ;


}  


const isBookingValid = (book) =>  ("arrivalDate" in book.reservation)  ;
        

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


module.exports = {
    isBookingValid,
    findValueInDataStore ,
    getInDataStore , 
    setInDataStore
}