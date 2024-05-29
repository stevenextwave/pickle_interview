const AWS = require('aws-sdk');

// Initialize AWS SQS
const sqs = new AWS.SQS({ region: 'us-east-1' }); // Replace 'your-region' with your AWS region

/**
 * Function to send JSON data to an SQS queue.
 * @param {string} queueUrl The URL of the SQS queue.
 * @param {object} jsonData The JSON data to send to the queue.
 * @returns {Promise<object>} A promise that resolves with the result of sending the message.
 */
async function sendJsonToQueue(queueUrl, jsonData) {
    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(jsonData)
    };

    try {
        const result = await sqs.sendMessage(params).promise();
        return result;
    } catch (error) {
        console.error('Error sending message to SQS:', error);
        throw error;
    }
}

module.exports = sendJsonToQueue;
