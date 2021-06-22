// Load the AWS SDK for Node.js
const {DynamoDBClient}  = require("@aws-sdk/client-dynamodb");
// Set the region 
//AWS.config.update({region: 'eu-west-1'});

const ddbClient = new DynamoDBClient({ region: 'eu-west-1' });

module.exports = {ddbClient}  

