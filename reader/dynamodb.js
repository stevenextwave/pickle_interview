const AWS = require('aws-sdk');

// Initialize AWS DynamoDB
const tableName = 'message'
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function writeToDynamoDB(messageId, timestamp, content, status) {
  const params = {
    TableName: tableName,
    Item: {
      messageId: messageId,
      timestamp: timestamp,
      content: content,
      status: status
    }
  };

  try {
    const data = await dynamodb.put(params).promise();
    console.log('Data written successfully:', data);
    return data;
  } catch (err) {
    console.error('Error writing data:', err);
    return err;
  }
}

module.exports = writeToDynamoDB;


