const { AsyncResource, executionAsyncId } = require('async_hooks');
const { pgClient, pgPool } = require('../DB/dbConfig.js');

/**
 * Database class is the main interface to the checkin app database 
 * it can be specialized object and method for an hotel, or generic for all hotels
 * it also provide the methods to manage the email tracking table  
 */ 
class Database extends AsyncResource {
    
    constructor(hotelId = null) {
        super('DbQuery');
        this.hotelId = hotelId;     //specialize the instance for a specific hotel
    }

    //get the hotel and pms related data (pms id, access, etc ...)
    async getHotelPmsInfo(hotelId = null){
        console.log('getHotelPmsInfo....')
        hotelId = hotelId || this.hotelId ;
        let query1, query1result, data;
     
        try {
            const client = await pgPool.connect();
            //get hotel pms
            if (hotelId) { 
                query1 = 'SELECT a.*, b.pms_name, c.* from hotel a JOIN pms b ON a.pms_id = b.pms_id JOIN hotel_pms_connection c ON a.hotel_id = c.hotel_id WHERE a.hotel_id = $1' ;
                query1result =  await client.query(query1, [hotelId]) ;
                data = query1result.rows[0];
            } else {
                query1 = 'SELECT a.*, b.pms_name, c.* from hotel a JOIN pms b ON a.pms_id = b.pms_id JOIN hotel_pms_connection c ON a.hotel_id = c.hotel_id' ;
                query1result = await client.query(query1) ;
                data = query1result.rows;
            } 
            client.release();
            return data;
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async getHotelsCount(){
        let client;
        try {
            client = await pgPool.connect();
            let query, queryResult; 
            query = 'SELECT * from hotel' ; 
            queryResult = await client.query(query) ;
            client.release();
            return query1result.rows.length; 
        }catch(e) {
            console.log(e);
            throw e;
        }
    }
    async getHotels({ hotelName, hotelId }){
        let client;
        try {
            client = await pgPool.connect();
            let query, values, queryResult; 
            if (hotelId) { 
                query = 'SELECT * from hotel WHERE hotel_id = $1' ;
                values = [hotelId] ;
            } else if (hotelName) {
                query = 'SELECT * from hotel WHERE hotel_name = $1' ;
                values = [hotelName] ;
            } else { 
                query = 'SELECT * from hotel' ; 
            }
            if (values) {
                queryResult = await client.query(query, values) ;
            } else {
                queryResult = await client.query(query) ;
            }
            client.release();
            return queryResult.rows; 
        }catch(e) {
            console.log(e);
            throw e;
        }
    }
    async addHotel({ hotelName, pmsId }){
        let client;
        try {
            client = await pgPool.connect();
             //insert hotel 
            const query1AddHotel = 'INSERT INTO hotel(hotel_name, pms_id) VALUES ($1, $2) RETURNING hotel_id' ;
            const query1result = await client.query(query1AddHotel, [hotelName, pmsId]) ;
            client.release();
            return query1result.rows[0].hotel_id; 
        }catch(e) {
            console.log(e);
            throw e;
        }
    }
    async updateHotel(hotelId, newHotel){
        let client;
        try {
            client = await pgPool.connect();
            //check vlaid pms Id and hotel name
            const queryVerifPms = 'SELECT * FROM pms WHERE pms_id=$1' ;
            const queryVerifHotelName = 'SELECT * FROM hotel WHERE hotel_name=$1' ;

            const validPms = await client.query(queryVerifPms, [newHotel.pmsId]) ;
            const validName = await client.query(queryVerifHotelName, [newHotel.name]) ;
            
            if (!validPms.rows.length) throw new Error('invalid pms Id');
            if (validName.rows.length) throw new Error('invalid hotel Name');
            //update hotel
            const query = 'UPDATE hotel SET hotel_name=$1, pms_id=$2 WHERE hotel_id=$3' ;
            await client.query(query, [newHotel.name, newHotel.pmsId, hotelId]) ;
            client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async deleteHotel(hotelId) {
        let client;
        try {
            client = await pgPool.connect();
            const query1 = 'DELETE hotel WHERE hotel_id = $1' ;
            await client.query(query1, [hotelId]) ;
            client.release();
        } catch(e) {
            console.log(e);
            throw e;
        }
    }

    async getHotelPmsSettings(hotelId){
        let client;
        try {
            client = await pgPool.connect();
            const query = 'SELECT * FROM hotel_pms_connection WHERE hotel_id = $1'  ;
            const queryResult = await client.query(query, [hotelId]) ;
            client.release();
            return queryResult.rows[0];
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async addHotelPmsSettings(hotelId, newPmsSettings){
        let client;
        try {
            client = await pgPool.connect();
            const queryVerifPms = 'SELECT * FROM pms WHERE pms_id=$1' ; 
            const validPms = await client.query(queryVerifPms, [newPmsSettings.pmsId]) ;
            if (!validPms.rows.length) throw new Error('invalid pms Id');
            const query = `INSERT INTO hotel_pms_connection(hotel_id, pms_id, pms_user, pms_url, pms_pwd)
            VALUES ($1, $2, $3, $4, $5)`;
            await client.query(query, [hotelId, newPmsSettings.pmsId, newPmsSettings.pmsUser,
                newPmsSettings.pmsUrl, newPmsSettings.pmsPwd]) ;
                client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async updateHotelPmsSettings(hotelId, newPmsSettings){
        let client;
        try {
            client = await pgPool.connect();
            const queryVerifPms = 'SELECT * FROM pms WHERE pms_id=$1' ; 
            const validPms = await client.query(queryVerifPms, [newPmsSettings.pmsId]) ;
            if (!validPms.rows.length) throw new Error('invalid pms Id');
            //insert hotel details
            const query = `UPDATE hotel_pms_connection SET pms_id=$1, pms_user=$2, pms_url=$3, pms_pwd=$4 WHERE hotel_id=$5`;
            await client.query(query, [newPmsSettings.pmsId, newPmsSettings.pmsUser,
                newPmsSettings.pmsUrl, newPmsSettings.pmsPwd, hotelId]) ;
                client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async deleteHotelPmsSettings(hotelId){
        let client;
        try {
            client = await pgPool.connect();
            const query = `DELETE hotel_pms_connection WHERE hotel_id = $1`;
            await client.query(query, [hotelId]) ;
            client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }

  //get the hotel details (name address etc ...)
    async getHotelDetails(hotelId){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel details
            query1 = 'SELECT a.*, b.hotel_name as hotel from hotel_details a JOIN hotel b ON a.hotel_id = b.hotel_id WHERE b.hotel_id = $1'  ;
            query1result = await client.query(query1, [hotelId]) ;
            return query1result.rows[0];
            client.release();
        }catch(e) {
            console.log(e);
            throw e;
        }
    }    
    async addHotelDetails(hotelId, hotelDetails) {
        let client;
        try {
            client = await pgPool.connect();
            const query1 = `INSERT INTO hotel_details(hotel_id, hotel_name,
                 hotel_address, hotel_postcode, hotel_city, hotel_country, 
                 hotel_phone, hotel_email, hotel_logo, hotel_checkin_time)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
            await client.query(query1, [hotelId, hotelDetails.displayedName,
                hotelDetails.address, hotelDetails.postCode, 
                hotelDetails.city, hotelDetails.country,
                hotelDetails.phone, hotelDetails.email, 
                hotelDetails.logo, hotelDetails.checkinTime]) ;
                client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async updateHotelDetails(hotelId, hotelDetails) {
        let client;
        try {
            client = await pgPool.connect();
            const query1 = `UPDATE hotel_details SET hotel_name=$10, hotel_address=$2, hotel_postcode=$3,
             hotel_city=$4, hotel_country=$5, hotel_phone=$6, hotel_email=$7, hotel_logo=$8, hotel_checkin_time=$9 
             WHERE hotel_id=$1`;
            await client.query(query1, [hotelId,
                hotelDetails.address, hotelDetails.postCode, 
                hotelDetails.city, hotelDetails.country,
                hotelDetails.phone, hotelDetails.email, 
                hotelDetails.logo, hotelDetails.checkinTime,
                hotelDetails.displayedName]) ;
                client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async deleteHotelDetails(hotelId){
        let client;
        try {
            client = await pgPool.connect();
            const query = `DELETE hotel_details WHERE hotel_id = $1`;
            await client.query(query, [hotelId]) ;
            client.release();
        } catch(e) {
            console.log(e);
            throw e;
        } 
    }

    //get the hotel app screen settings (style screens logo ...)
    async getHotelScreenSettings(hotelId){
        try {
            const client = await pgPool.connect();
            //get hotel details
            const query1 = 'SELECT * FROM hotel_application_settings WHERE hotel_id = $1'  ;
            const query1result = await client.query(query1, [hotelId]) ;
            client.release();
            return query1result.rows[0].hotel_screen_settings;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    
    async hasSetting(hotelId, client = null ) {
        try{
            client = client ||  await pgPool.connect();
            const verif = 'SELECT * FROM hotel_application_settings WHERE hotel_id = %1';
            const result = await client.query(verif, [hotelId]);
            return result.rows.length ;
        }catch(e){
            console.log(e);
            throw e;
        }
    }
    async addHotelScreenSettings(hotelId, screenSettings){
        try {
            const client = await pgPool.connect();
            const verif = await hasSetting(hotelId, client);
            if (verif > 0) {
                return await this.updateHotelScreenSettings(hotelId, screenSettings);
            }
        
            const query1 = 'INSERT INTO hotel_application_settings(hotel_id, hotel_screen_settings) VALUES (%1, %2) ';  ;
            await client.query(query1, [hotelId, screenSettings]) ;
            client.release();
            return ;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async updateHotelScreenSettings(hotelId, screenSettings){
        try {
            const client = await pgPool.connect();
            const screens = await this.getHotelScreenSettings(hotelId);
            const newScreens = { ...screens, ...screenSettings };
            
            const query1 = 'UPDATE hotel_application_settings SET hotel_screen_settings = %1  WHERE hotel_id = $2';  ;
            await client.query(query1, [newScreens, hotelId]) ;
            client.release();
            return ;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    async deleteHotelScreenSettings(hotelId){
        try {
            const client = await pgPool.connect();
            const query1 = 'UPDATE hotel_application_settings SET hotel_screen_settings = null  WHERE hotel_id = $1';  ;
            await client.query(query1, [hotelId]) ;
            client.release();
            return ;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    //get the hotel style settings (css style font logo ...)
        //get the hotel app screen settings (style screens logo ...)
        async getHotelStyleSettings(hotelId){
            try {
                const client = await pgPool.connect();
                //get hotel details
                const query1 = 'SELECT hotel_styles FROM hotel_application_settings WHERE hotel_id = $1'  ;
                const query1result = await client.query(query1, [hotelId]) ;
                client.release();
                return query1result.rows[0].hotel_styles;
            }catch(e) {
                console.log(e);
                throw e;
            }
        }
        
      
        async addHotelStyleSettings(hotelId, styleSettings){
            try {
                const client = await pgPool.connect();
                const verif = await hasSetting(hotelId, client);
                if (verif > 0) {
                    return await this.updateHotelStyleSettings(hotelId, styleSettings);
                }
            
                const query1 = 'INSERT INTO hotel_application_settings(hotel_id, hotel_styles) VALUES (%1, %2) ';  ;
                await client.query(query1, [hotelId, styleSettings]) ;
                client.release();
                return ;
            }catch(e) {
                console.log(e);
                throw e;
            }
        }
        async updateHotelStyleSettings(hotelId, styleSettings){
            try {
                const client = await pgPool.connect();
                const styles = await this.getHotelStyleSettings(hotelId);
                const newStyles = { ...styles, ...styleSettings };
                
                const query1 = 'UPDATE hotel_application_settings SET hotel_styles = %1  WHERE hotel_id = $2';  ;
                await client.query(query1, [newStyles, hotelId]) ;
                return ;
            }catch(e) {
                console.log(e);
                throw e;
            } 
        }
        async deleteHotelStyleSettings(hotelId){
            try {
                const client = await pgPool.connect();
                const query1 = 'UPDATE hotel_application_settings SET hotel_styles = null  WHERE hotel_id = $1';  ;
                await client.query(query1, [hotelId]) ;
                client.release();
                return ;
            }catch(e) {
                console.log(e);
                throw e;
            }
        }
    
async getFullHotelDataSet(hotelId = null) {
    try {     
        const data = hotelId ? {} : [] ;  
        const pms = await this.getHotelPmsInfo(hotelId);
        if (hotelId) {
            data.pms = pms; 
            data.checkinAppSettings = await this.getHotelAppSettings(hotelId);
            data.hotelDetails = await this.getHotelDetails(hotelId);
        } else {
            for (let hotelpms of pms) {
                const preCheckinApp = await this.getHotelAppSettings(hotelpms.hotel_id);  
                const hotelDetails = await this.getHotelDetails(hotelpms.hotel_id);
                data.push({ pms: hotelpms, checkinAppSettings: preCheckinApp, hotelDetails: hotelDetails });
            }
        } 
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    } 
}

async addHotelFullData({ hotelName, pmsSettings, hotelDetails, hotelAppSettings }){
    let client;
    try {
        client = await pgPool.connect();
        await client.query('BEGIN');
        //insert hotel 
        const query1AddHotel = 'INSERT INTO hotel(hotel_name, pms_id) VALUES ($1, $2) RETURNING hotel_id' ;
        //insert hotel details
        const query2AddHotelDetails = `INSERT INTO hotel_details(hotel_id, hotel_name, hotel_address, hotel_postcode,
            hotel_city, hotel_country, hotel_phone, hotel_email, hotel_logo, hotel_checkin_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        //insert hotel pms details
        const query3AddHotelPmsSettings = `INSERT INTO hotel_pms_connection(hotel_id, pms_id, pms_user, pms_url, pms_pwd)
            VALUES ($1, $2, $3, $4, $5)`;
        //insert hotel app settings 
        /*
        const query4AddHotelAppSettings = `INSERT INTO hotel_pms_connection(hotel_id, pms_id, pms_login, pms_url, pms_pwd)
                VALUES ($1, $2, $3, $4, $5)`;
        */
        const query1result = await client.query(query1AddHotel, [hotelName, pmsSettings.pmsId]) ;
        await client.query(query2AddHotelDetails, [query1result.rows[0].hotel_id, 
            hotelDetails.displayedName, hotelDetails.address,
            hotelDetails.postCode, hotelDetails.city,
            hotelDetails.country, hotelDetails.phone, 
            hotelDetails.email, hotelDetails.logo,
            hotelDetails.checkinTime]) ;
        await client.query(query3AddHotelPmsSettings, [query1result.rows[0].hotel_id,
            pmsSettings.pmsId, pmsSettings.pmsLogin,
            pmsSettings.pmsUrl, pmsSettings.pmsPwd]) ;
        await client.query('COMMIT');
        return query1result.rows[0].hotel_id; 
    }catch(e) {
        await client.query('ROLLBACK');
        console.log(e);
        throw e;
    } 
    client.release();
}

    async deleteHotelFullData(hotelId) {
        let client;
        try {
            client = await pgPool.connect();
            await client.query('BEGIN');
            //insert hotel details
            const query1 = 'DELETE FROM hotel_pms_connection WHERE hotel_id=$1';
            const query2 = 'DELETE FROM hotel_details WHERE hotel_id=$1';
            const query3 = 'DELETE FROM hotel WHERE hotel_id=$1';
            await client.query(query1, [hotelId]);
            await client.query(query2, [hotelId]);
            await client.query(query3, [hotelId]);
            await client.query('COMMIT');
        }catch(e) {
            await client.query('ROLLBACK');
            client.release();
            console.log(e);
            throw e;
        } 
    }
    //get the email tracking info (name address etc ...)

    async getEmailTrackingInfo(hotelId = null, reservationId = null, type = null){
        let client, query1, query1result, data;
        try {
            client = await pgPool.connect();
            if (hotelId && reservationId && type) {
                query1 = 'SELECT * from email_tracking WHERE reservation_id = $1 AND hotel_id = $2 AND email_type = $3' ;
                query1result = await client.query(query1, [reservationId, hotelId, type]);
            } else {
                query1 = 'SELECT * from email_tracking' ;
                query1result = await client.query(query1);
            }
            client.release();
            return query1result.rows;;
        }catch(e) {
            console.log(e);
            throw e;
        } 
        
    }

    async getEmailInfo(messageId){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from email_tracking WHERE message_id = $1' ;
            query1result = await client.query(query1, [messageId]);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    

    async addEmailTrackingInfo(emailTracking){
        let client, query1;
        try {
            if (!emailTracking.hotelId || !emailTracking.reservationId) throw new Error('no ids');
            emailTracking.sentDate = emailTracking.sentDate /1000 || null ;
            emailTracking.sendingDate = emailTracking.sendingDate /1000 || null ;
            client = await pgPool.connect();
            query1 = 'INSERT INTO email_tracking(message_id, reservation_id, hotel_id, email_type, success_sent_date, original_sending_date, attempts) VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6), $7);' ;
            await client.query(query1, [emailTracking.messageId, emailTracking.reservationId, emailTracking.hotelId, emailTracking.emailType, emailTracking.sentDate, emailTracking.sendingDate, emailTracking.attempts]);
            client.release();
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    
    async updateEmailTrackingInfo(emailTracking){
        let client, query1;
        try {
            if (!emailTracking.hotelId || !emailTracking.reservationId) throw new Error('no ids');
            emailTracking.sentDate = emailTracking.sentDate /1000 || null ;
            client = await pgPool.connect();
            query1 = 'UPDATE email_tracking SET success_sent_date = to_timestamp($1), attempts = $2 WHERE message_id =$3 ;' ;
            await client.query(query1, [emailTracking.sentDate, emailTracking.attempts, emailTracking.messageId]);
            client.release();
        }catch(e) {
            console.log(e);
            throw e;   
        } 
    }
    
    async deleteEmailTrackingInfo(reservationId, hotelId){
        let client, query1;
        try {
            if (!hotelId || !reservationId) throw new Error('no ids');
            client = await pgPool.connect();
            query1 = 'DELETE FROM email_tracking WHERE reservation_id = $1 AND hotel_id = $2';
            await client.query(query1, [reservationId, hotelId]);
            client.release();
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
    
    async getEmailError(){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from email_tracking WHERE success_sent_date is NULL' ;
            query1result = await client.query(query1);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
/*

    async getPaymentSession(){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'SELECT * from payment_session' ;
            query1result = await client.query(query1);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async updatePaymentSession(data){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'INSERT INTO payment_session VALUES ($1,$2,$3,$4,$5)' ;
            query1result = await client.query(query1, [data.transactionId, data.hotelId, data.reservationId, data.startedAt, ]);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }

    async updatePaymentSession(){
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            query1 = 'UPDATE payment_session SET ' ;
            query1result = await client.query(query1);
            client.release();
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } 
    }
*/
} 

module.exports = {
    Database
}