const AWS = require('aws-sdk');

// Initialize AWS DynamoDB
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1' }); // Replace 'your-region' with your AWS region
const tableName = 'message'

/**
 * Function to write data to a DynamoDB table.
 * @param {string} tableName The name of the DynamoDB table.
 * @param {object} data The data to write to the table.
 * @returns {Promise<object>} A promise that resolves with the result of writing the item.
 */
async function writeDataToDynamoDB(data) {
    const params = {
        TableName: tableName,
        Item: AWS.DynamoDB.Converter.marshall(data)
    };

    try {
        const result = await dynamodb.putItem(params).promise();
        return result;
    } catch (error) {
        console.error('Error writing data to DynamoDB:', error);
        throw error;
    }
}

module.exports = writeDataToDynamoDB;
