require('dotenv').config();
const axios = require('axios');
const Models = require('../Models/index.js');
const Errors = require('../Models/errors.js');

const PMSAPI_URL = process.env.PMS_API_BASEURL;
const getPms = async (req, res) =>  {

    try {
       const { pmsId } = req?.params;
       const url = new URL(`${PMSAPI_URL}/pms`);
       if (pmsId) url.pathname += `/${pmsId}` ; 
       //TO DO add secure auth
       const response = await axios.get(url.toString());
       console.log(response.data)
       let resData;
       if (!pmsId) {
           if (!response.data.length) throw new Errors.NotFound();
           resData = [];
            response.data.map(r => {
                resData.push(new Models.Pms({ pmsId: r.pms_id, pmsName: r.pms_name, pmsClassName: r.class_name }));
            });
        } else {
            resData = new Models.Pms({ pmsId: response.data.pms_id, pmsName: response.data.pms_name, pmsClassName: response.data.class_name });
        }
        return res.status(200).send(resData);
        
    } catch(e) {
        return  res.status(e.code||500).send(e.message);
    }
}

module.exports = {
    getPms
}