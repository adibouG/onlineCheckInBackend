require('dotenv').config();
const pg = require('pg');
const { Pool, Client, types } = pg ;


import { RDSDataClient, BatchExecuteStatementCommand } from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({ region: "REGION" });


const connectionSetting = {
  host     : process.env.DB_HOST ,
  user     : process.env.DB_USER ,
  password : process.env.DB_PASS ,
  database : process.env.DB_NAME ,
  port : process.env.DB_PORT ,
  max : 10 ,// Max number of connections
  ssl  : false ,
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
types.setTypeParser(types.builtins.TIMESTAMP, (value) => {
  return new Date(value);
});

module.exports = {
  pgPool,
  pgClient
};



