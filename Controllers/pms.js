require('dotenv').config();
const axios = require('axios');

const PMSAPI_URL = process.env.PMS_API_BASEURL;
const getPms = async (req, res) =>  {

    try {
       const { pmsId } = req?.params;
       const url = new URL(`${PMSAPI_URL}/pms`);
       if (pmsId) url.pathname += `/${pmsId}` ; 
       //TO DO add secure auth
       const response = await axios.get(url.toString());
       return res.status(200).send(response.data);
    } catch(e) {
        return  res.status(500).send(e);
    }
}

module.exports = {
    getPms
}