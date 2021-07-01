// Load the AWS SDK for Node.js
const {DynamoDBClient}  = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient({ region: 'eu-west-1' });

module.exports = {
    ddbClient
}  

