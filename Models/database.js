const { pgClient, pgPool } = require('../DB/dbConfig.js');

/**
 * HotelPmsDB class is the main interface to the checkin app database 
 * it can be specialized object and method for an hotel, or generic for all hotels
 * it also provide the methods to manage the email tracking table  
 */ 
class HotelPmsDB {
    
    constructor(hotelID = null) {
        this.hotelID = hotelID;     //specialize the instance for a specific hotel
        this.data = null;           //hold/store returned data for comparison, access,etc ...
    }

    //get the hotel and pms related data (pms id, access, etc ...)
    async getHotelPmsInfo(hotel = null){
        hotel = hotel || this.hotelID || null;
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel pms
            if (hotel) query1 = 'SELECT a.*, b.pms_name, c.* from hotel a JOIN pms b ON a.pms_id = b.pms_id JOIN hotel_pms_connection c ON a.hotel_id = c.hotel_id WHERE a.hotel_id = $1' ;
            else query1 = 'SELECT a.*, b.pms_name, c.* from hotel a JOIN pms b ON a.pms_id = b.pms_id JOIN hotel_pms_connection c ON a.hotel_id = c.hotel_id' ;
            query1result = hotel ? await client.query(query1, [hotel]) : await client.query(query1) ;
            if (!query1result.rows.length) throw new Error('no result');
            if (JSON.stringify(query1result.rows) !== JSON.stringify(this.data)) this.data = query1result.rows ;
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            if (client) client.release();
        }
    }

    //get the hotel details (name address etc ...)
    async getHotelDetails(hotelID){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel details
            query1 = 'SELECT a.*, b.hotel_name as hotel from hotel_details a JOIN hotel b ON a.hotel_id = b.hotel_id WHERE b.hotel_id = $1'  ;
            query1result = await client.query(query1, [hotelID]) ;
            return query1result.rows[0];
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    //get the hotel app settings (style screens logo ...)
    async getHotelAppSettings(hotelID){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel details
            query1 = 'SELECT hotel_id, screens, style FROM hotel_application_settings WHERE hotel_id = $1'  ;
            query1result = await client.query(query1, [hotelID]) ;
            return query1result.rows[0];
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    async getFullHotelDataSet(hotelID = null){
        try {     
            const results = [];  
            const hotelPms = await this.getHotelPmsInfo(hotelID);
            for (let i = 0; i < hotelPms.length; i++) {
                let hotelID = hotelPms[i].hotel_id;
                const settings = await this.getHotelAppSettings(hotelID);  
                const details = await this.getHotelDetails(hotelID);
                results.push({ 
                    hotel_id: hotelID,
                    hotel_pms: hotelPms[i], 
                    hotel_application_settings: settings,
                    hotel_details: details
                });
            } 
            return results;
        } catch (e) {
            console.log(e);
            throw e;
        } 
    }
   
    async addHotel(newHotel){
        let client;
        try {
            client = await pgPool.connect();
            await client.query('BEGIN');
            //insert hotel details
            let query1 = 'INSERT INTO hotel(hotel_name, pms_id) VALUES ($1, $2) RETURNING hotel_id' ;
            let query2 = `INSERT INTO hotel_details(
                hotel_id, hotel_name, hotel_address, hotel_postcode,
                hotel_city, hotel_country, hotel_phone, hotel_email,
                hotel_logo, hotel_checkin_time)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
            let query3 = `INSERT INTO hotel_pms_connection(
                    hotel_id, pms_id, pms_login, pms_url, pms_pwd)
                    VALUES ($1, $2, $3, $4, $5)`;
            const query1result = await client.query(query1, [newHotel.name, newHotel.pmsSettings.pmsId]) ;
            let newHotelId = query1result.rows[0].hotel_id; 
            await client.query(query2, [newHotelId,
                newHotel.hotelDetails.displayedName, newHotel.hotelDetails.address,
                newHotel.hotelDetails.postCode, newHotel.hotelDetails.city,
                newHotel.hotelDetails.country, newHotel.hotelDetails.phone, 
                newHotel.hotelDetails.email, newHotel.hotelDetails.logo,
                newHotel.hotelDetails.checkinTime]) ;
            await client.query(query3, [newHotelId,
                newHotel.pmsSettings.pmsId, newHotel.pmsSettings.pmsLogin,
                newHotel.pmsSettings.pmsUrl, newHotel.pmsSettings.pmsPwd]) ;
            await client.query('COMMIT');
            return newHotelId; 
        }catch(e) {
            await client.query('ROLLBACK');
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }
  
    async updateHotelDetails(hotelID, hotelDetails) {
        let client;
        try {
            client = await pgPool.connect();
            let query1 = `UPDATE hotel_details SET hotel_name=$10, hotel_address=$2, hotel_postcode=$3,
             hotel_city=$4, hotel_country=$5, hotel_phone=$6, hotel_email=$7, hotel_logo=$8, hotel_checkin_time=$9 
             WHERE hotel_id=$1`;
            await client.query(query1, [hotelID,
                hotelDetails.address, hotelDetails.postCode, 
                hotelDetails.city, hotelDetails.country,
                hotelDetails.phone, hotelDetails.email, 
                hotelDetails.logo, hotelDetails.checkinTime,
                hotelDetails.displayedName]) ;
        } catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    async updateHotel(hotelID, newHotel){
        let client;
        try {
            client = await pgPool.connect();
            //insert hotel details
            let query1 = 'UPDATE hotel SET hotel_name=$1, pms_id=$2 WHERE hotel_id=$3' ;
            await client.query(query1, [newHotel.name, newHotel.pmsSettings.pmsId, hotelID]) ;
        } catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    
    async updateHotelPmsSettings(hotelID, newPmsSettings){
        let client;
        try {
            client = await pgPool.connect();
            //insert hotel details
            let query = `UPDATE hotel_pms_connection SET
                pms_id=$1, pms_login=$2, pms_url=$3, pms_pwd=$4
                WHERE hotel_id=$5`;
            await client.query(query, [newPmsSettings.pmsId, newPmsSettings.pmsLogin,
                newPmsSettings.pmsUrl, newPmsSettings.pmsPwd, hotelID]) ;
        } catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }


    async deleteHotel(hotelID) {
        let client;
        try {
            client = await pgPool.connect();
            await client.query('BEGIN');
            //insert hotel details
            let query1 = 'DELETE FROM hotel_pms_connection WHERE hotel_id=$1';
            let query2 = 'DELETE FROM hotel_details WHERE hotel_id=$1';
            let query3 = 'DELETE FROM hotel WHERE hotel_id=$1';
            await client.query(query1, [hotelID]);
            await client.query(query2, [hotelID]);
            await client.query(query3, [hotelID]);
            await client.query('COMMIT');
        }catch(e) {
            await client.query('ROLLBACK');
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }
    //get the email tracking info (name address etc ...)
    async getEmailTrackingInfo(hotelId = null, reservationId = null, type = null){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            if (hotelId && reservationId && type) {
                query1 = 'SELECT * from email_tracking WHERE reservation = $1 AND hotel = $2 AND email_type = $3' ;
                query1result = await client.query(query1, [reservationId, hotelId, type]);
            } else {
                query1 = 'SELECT * from email_tracking' ;
                query1result = await client.query(query1);
            }
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    async getEmailInfo(messageID){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from email_tracking WHERE message_id = $1' ;
            query1result = await client.query(query1, [messageID]);
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }


    async addEmailTrackingInfo(emailTracking){
        let client, query1;
        try {
            if (!emailTracking.hotelID || !emailTracking.reservationID) throw new Error('no ids');
            emailTracking.sentDate = emailTracking.sentDate /1000 || null ;
            emailTracking.sendingDate = emailTracking.sendingDate /1000 || null ;
            client = await pgPool.connect();
            query1 = 'INSERT INTO email_tracking(message_id, reservation, hotel, email_type, sent_date, sending_date, attempts) VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6), $7);' ;
            await client.query(query1, [emailTracking.messageID, emailTracking.reservationID, emailTracking.hotelID, emailTracking.emailType, emailTracking.sentDate, emailTracking.sendingDate, emailTracking.attempts]);
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            client.release();
        }
    }

    async updateEmailTrackingInfo(emailTracking){
        let client, query1;
        try {
            if (!emailTracking.hotelID || !emailTracking.reservationID) throw new Error('no ids');
            emailTracking.sentDate = emailTracking.sentDate /1000 || null ;
            client = await pgPool.connect();
            query1 = 'UPDATE email_tracking SET sent_date = to_timestamp($1), attempts = $2 WHERE message_id =$3 ;' ;
            await client.query(query1, [emailTracking.sentDate, emailTracking.attempts, emailTracking.messageID]);
        }catch(e) {
            console.log(e);
            throw e;   
        } finally {
            if (client) client.release();
        }
    }

    async deleteEmailTrackingInfo(reservationID, hotelID){
        let client, query1;
        try {
            if (!hotelID || !reservationID) throw new Error('no ids');
            client = await pgPool.connect();
            query1 = 'DELETE FROM email_tracking WHERE reservation = $1 AND hotel = $2';
            await client.query(query1, [reservationID, hotelID]);
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            if (client) client.release();
        }
    }

    async getEmailError(){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from email_tracking WHERE sent_date is NULL' ;
            query1result = await client.query(query1);
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            if (client) client.release();
        }
    }
} 

module.exports = {
    HotelPmsDB
}