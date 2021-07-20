const { pgClient, pgPool } = require('../DB/dbConfig.js');

class HotelPms {
    
    constructor(hotelID = null) {
        this.hotelID = hotelID;
        this.data = null;
    }
    async getHotelPmsData(hotelID = null){
        let hotel = hotelID || this.hotelID || null;
        let client, query1, query1result;
        try {
            client = await pgPool.connect();
            //get hotel pms
            if (hotel) query1 = 'SELECT a.*, b.name, b.url from hotel a JOIN pms b ON a.pms = b.id WHERE a.id = $1' ;
            else query1 = 'SELECT a.*, b.name, b.url from hotel a JOIN pms b ON a.pms = b.id' ;
            query1result = hotel ? await client.query(query1, [hotel]) : await client.query(query1) ;
            if (!query1result.rows.length) throw new Error('no result');
            if (JSON.stringify(query1result.rows) !== JSON.stringify(this.data)) this.data = query1result.rows ;
            return query1result.rows;
        }catch(e) {
            console.log(e);
            throw e;
        } finally {
            console.log('release');
            client.release();
        }
    }
} 

module.exports = {
    HotelPms
}