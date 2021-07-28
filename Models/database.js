const { pgClient, pgPool } = require('../DB/dbConfig.js');

class HotelPmsDB {
    
    constructor(hotelID = null) {
        this.hotelID = hotelID;
        this.data = null;
    }
    async getHotelPmsInfo(hotel = null){
        hotel = hotel || this.hotelID || null;
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel pms
            if (hotel) query1 = 'SELECT a.*, b.name, b.url from hotel a JOIN pms b ON a.pms = b.id WHERE a.id = $1' ;
            else query1 = 'SELECT a.*, b.name, b.url from hotel a JOIN pms b ON a.pms = b.id' ;
            query1result = hotel ? await client.query(query1, [hotel]) : await client.query(query1) ;
            if (!query1result.rows.length) throw new Error('no result');
            if (JSON.stringify(query1result.rows) !== JSON.stringify(this.data)) this.data = query1result.rows ;
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async getHotelDetails(hotelID){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel details
            query1 = 'SELECT a.* from hotel_details a JOIN hotel b ON a.hotel_id = b.id WHERE b.id = $1'  ;
            query1result = await client.query(query1, [hotelID]) ;
            //if (!query1result.rows.length) throw new Error('no result');
            client.release();
            return query1result.rows[0];
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async getEmailTrackingInfo(hotelId = null, reservationId = null){
       
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            if (hotelId && reservationId) {
                query1 = 'SELECT * from email_reservation_tracking WHERE reservation = $1 AND hotel = $2' ;
                query1result = await client.query(query1, [hotelId, reservationId]);
            } else {
                query1 = 'SELECT * from email_reservation_tracking' ;
                query1result = await client.query(query1);
            }
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async addEmailTrackingInfo(emailTracking){
       
        let client, query1, query1result;
        try {
            if (!emailTracking.hotelID || !emailTracking.reservationID) throw new Error('no ids');
            client = await pgPool.connect();
           // if (emailTracking.sentDate) { 
                query1 = 'INSERT INTO email_reservation_tracking(message_id, reservation, hotel, email_type, email_sent_date, email_sending_date, attempts) VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6), $7);' ;
                query1result = await client.query(query1, [emailTracking.messageID, emailTracking.reservationID, emailTracking.hotelID, emailTracking.emailType, emailTracking.sentDate, emailTracking.sendingDate, emailTracking.attempts]);
            /*} else {
                query1 = 'INSERT INTO email_reservation_tracking(message_id, reservation, hotel, email_type, email_sending_date, attempts) VALUES ($1, $2, $3, $4, to_timestamp($6), $7);' ;
                query1result = await client.query(query1, [emailTracking.messageID, emailTracking.reservationID, emailTracking.hotelID, emailTracking.emailType, emailTracking.sendingDate, emailTracking.attempts]);
            }*/
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async updateEmailTrackingInfo(emailTracking){
       
        let client, query1, query1result;
        try {
            if (!emailTracking.hotelID || !emailTracking.reservationID) throw new Error('no ids');
            client = await pgPool.connect();
            //if (emailTracking.sentDate) {
                query1 = 'UPDATE email_reservation_tracking SET message_id = $1, email_sent_date = to_timestamp($2), attempts = $3 WHERE reservation = $4 AND hotel = $5;' ;
                query1result = await client.query(query1, [emailTracking.messageID, emailTracking.sentDate, emailTracking.attempts, emailTracking.reservationID, emailTracking.hotelID]);
            /*} else {
                query1 = 'UPDATE email_reservation_tracking SET message_id = $1, attempts = $2 WHERE reservation = $3 AND hotel = $4;' ;
                query1result = await client.query(query1, [emailTracking.messageID, emailTracking.attempts, emailTracking.reservationID, emailTracking.hotelID]);
            }*/
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async deleteEmailTrackingInfo(emailTracking){
       
        let client, query1, query1result;
        try {
            if (!emailTracking.hotelID || !emailTracking.reservationID) throw new Error('no ids');
            client = await pgPool.connect();
            query1 = 'DELETE email_reservation_tracking WHERE reservation = $1 AND hotel = $2';
            query1result = await client.query(query1, [emailTracking.reservationID, emailTracking.hotelID]);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async getEmailError(){
       
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from email_reservation_tracking WHERE email_sent_date is NULL' ;
            query1result = await client.query(query1);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
} 

module.exports = {
    HotelPmsDB
}