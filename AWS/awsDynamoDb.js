
const SETTINGS = require('../settings.json') ;
const { GetItemCommand , UpdateItemCommand , PutItemCommand , ScanCommand } = require("@aws-sdk/client-dynamodb");
const { ddbClient } = require("./awsSdk.js");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {RESERVATION , TOKEN} = SETTINGS.DYNAMODB_TABLE ;
// Set the parameters


// Create the DynamoDB service object
//const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'}) ; //{apiVersion: '2012-08-10'});



const getDynamoDBItem = async (  TableName , Item ) => {

    
    const params = {
        TableName : TableName,
        Key: Item
    }
   
    try {
    // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new GetItemCommand(params)); //ddb.get(params) 
        console.log("Success", data.Item);
        let {Item} = data;
        return unmarshall(Item)
    }
    catch (e){
        console.log("Error", e);
      throw e
      }
};


const putDynamoDBItem = async (  TableName, Item) => {

        const params = {
            TableName : TableName,
            Item: marshall(Item)
        }
        
        try {
        // Call DynamoDB to get the item from the table
            let data = await ddbClient.send(new PutItemCommand(params)); //ddb.get(params) 
            console.log("Success", data.Item);
            let {Item} = data;
            //return unmarshall(Item)
        }
        catch (e){
            console.log("Error", e);
          throw e
          }
    };
    


const findDynamoDBItems = async ( TableName, Item , Value) => {

    
    const params = {
        TableName: TableName 
    }

    // Call DynamoDB to add the item to the table
    try {
        // Call DynamoDB to get the item from the table
         let data = await ddbClient.send(new ScanCommand(params))
         console.log("Success", data);
        return data
    } catch(err) {
        //console.log("Success", data);
        console.log("Error", err);
        throw err ;
      }

};

module.exports = {
    findDynamoDBItems,
    getDynamoDBItem,
    putDynamoDBItem
}