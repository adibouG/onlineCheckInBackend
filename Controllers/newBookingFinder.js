

 //compare the date if checkIn can be offer take a booking and the param name to check
 const preCheckInDateIsValid = (booking, dateParam) => {
    let canBePreCheck = false ;
    let startDate = new Date(booking[dateParam]);
    if ( startDate >= new Date() && startDate <= addDay(new Date(), SETTINGS.CHECKIN_REQUEST_START_DAY_OFFSET))
    { 
        canBePreCheck = true ;
    }
    return canBePreCheck ;
}
