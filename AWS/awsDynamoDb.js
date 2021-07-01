
const { ddbClient } = require("./awsSdk.js");
const { GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { winstonLogger } = require('../Logger/loggers.js') ;

const getDynamoDBItem = async ( TableName, Item ) => {
    
    const params = {
        ConsistentRead: true,
        TableName : TableName,
        Key: Item
    };
   
    try {
        // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new GetItemCommand(params)); 

        winstonLogger.info(`Get Item From  ${TableName} : ${data.Item}`);
        
        let {Item} = data;
        return unmarshall(Item);
    }
    catch (e){
        console.log("Error" , e);
        throw e;
      }
}

const putDynamoDBItem = async (TableName, Item) => {

    const params = {
        TableName : TableName,
        Item: marshall(Item)
    };
    
    try {
        // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new PutItemCommand(params)); 
    }
    catch (e){
        console.log("Error", e);
        throw e;
    }
}

const findDynamoDBItems = async (TableName) => {

    const params = {
        ConsistentRead: true,
        TableName: TableName,
    };
   
    try {
        // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new ScanCommand(params));
        return data;
    } catch(e) {
        console.log("Error", e);
        throw e;
    }
}

const deleteDynamoDBItem = async (TableName, Item) => {

    const params = {
        TableName : TableName,
        Key: Item
    };
    
    try {
        // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new DeleteItemCommand(params)); 
    }
    catch (e){
        console.log("Error", e);
        throw e;
    }
}

module.exports = {
    findDynamoDBItems,
    getDynamoDBItem,
    putDynamoDBItem,
    deleteDynamoDBItem
}