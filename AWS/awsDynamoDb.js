
const { ddbClient } = require("./awsSdk.js");
const { GetItemCommand , UpdateItemCommand , PutItemCommand , ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {winstonLogger} = require('../Logger/loggers.js') ;


const getDynamoDBItem = async (  TableName , Item ) => {

    
    const params = {
        ConsistentRead: true,
        TableName : TableName,
        Key: Item
    }
   
    try {
    // Call DynamoDB to get the item from the table
        let data = await ddbClient.send(new GetItemCommand(params)); 

        console.log("Success", data.Item);
        winstonLogger.info(`Get Item From  ${TableName} : ${data.Item}`);
        
        let {Item} = data;
        return unmarshall(Item)
    }
    catch (e){
        console.log("Error" , e);
        throw e
      }
};


const putDynamoDBItem = async ( TableName, Item) => {

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
        ConsistentRead: true,
        TableName: TableName ,
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