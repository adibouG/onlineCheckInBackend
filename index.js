require('dotenv').config();

const app = require('./app.js') ;


const port =  process.env.PORT ;
const host = process.env.HOST ;
const scheme = process.env.SCHEME ;


//start the app server on defined port 
app.listen(port , () => {

    console.log('enzo checkin backendAPI is running at %s://%s:%s' , scheme, host , port);

});
