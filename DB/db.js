require('dotenv').config();
const pg = require('pg');
const { Pool, Client, types } = pg ;

const connectionSetting = {
  host     : process.env.DB_HOST ,
  user     : process.env.DB_USER ,
  password : process.env.DB_PWD ,
  database : process.env.DB_NAME ,
  port : process.env.DB_PORT ,
  max : DB.MAXCON ,// Max number of connections
  ssl  : DB.SSL ,
  connect_timeout : DB.CONN_TIMEOUT ,  
};

const pgPool = new Pool(connectionSetting);
const pgClient = new Client(connectionSetting);

types.setTypeParser(types.builtins.INT8, (value) => {
  return parseInt(value);
});
types.setTypeParser(types.builtins.FLOAT8, (value) => {
   return parseFloat(value);
});
types.setTypeParser(types.builtins.NUMERIC, (value) => {
   return parseFloat(value);
});
types.setTypeParser(types.builtins.BYTEA, (value) => {
  return value.toString();
});

module.exports = {
  pgPool,
  pgClient
};



