const Errors = require('../Models/errors.js');
const helpers = require('../Helpers/helpers.js');
const { verifyToken } = require('../Utilities/utilities.js');
const { winstonLogger } = require('../Logger/loggers.js');


const isAdmin = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const {isAdmin} = req?.body;
        if (isAdmin === true) return next();
    } else {
        const {isAdmin} = req?.query;
        if (isAdmin === true) return next(); 
    }
    return res.status(401).end();
};


const getAndCheckToken = async (req, res, next) => {
    
    let token = null;
    let booking = null;

    try {
        //get the token
        const { authorization } = req?.headers ;
        const b64token = authorization ? authorization.split(' ')[1] : req?.query.token;
        token = b64token ? Buffer.from(b64token, 'base64').toString('utf8') : null ;
        winstonLogger.info('received token :' + token);
        //get data and verify the token
        //TODO make a token verification function security check : algo, sign, iss ...
        const decoded = jwt.decode(token); 
        const { uuid, hotelId, reservationId, email, steps } = decoded;
        if (!token || !hotelId || !reservationId) throw new Errors.EnzoError('no valid token');
        booking = await helpers.getReservations(hotelId, reservationId);
        if (!booking.length) throw new Errors.NotFound() ;        
        const reservation = booking[0];
        const roomStay = reservation.roomStays[0];
        //token was signed using the reservation state in order to make it only 1 time use 
        verifyToken(token, roomStay);
        res.local.reservation = reservation;
        return next()
    } catch(e) {
        let error ;
        if (e instanceof jwt.TokenExpiredError) error = new Errors.ExpiredLink() ;
        else if (e instanceof jwt.JsonWebTokenError && e.message === 'invalid signature' && booking.length)  {
            const response = makeCheckInAppResponseBody(res, booking[0].roomStays[0], hotelStay, token);
            
            return res.status(200).send(response);
        } else {
            error = e;
        }
        winstonLogger.error(error) ;
        return res.status(error.code || 401).send(error.message || 'error') ;
    }
};


module.exports = {
    getAndCheckToken,
    isAdmin
}