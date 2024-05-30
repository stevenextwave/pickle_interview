const AWS = require('aws-sdk');

// AWS configuration
AWS.config.update({
  region: 'us-east-1'
});

const tableName = process.env.TABLE || 'message';
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
    const ret = await dynamodb.put(params).promise();
    console.log(`writing ${params} OK`);
    return {
      message: 'Operation was successful',
      error : false,
      data: ret
    };
  } catch (err) {
    console.log(`writing ${err} NOK`)
    return {
      message: `Fail to write data ${JSON.stringify(params)}`,
      error : true,
      data: err
    };
  }
}

module.exports = writeToDynamoDB;


