const express = require('express');
const AWS = require('aws-sdk');
const sendEmail = require('./email');
const writeToDynamoDB = require('./dynamodb')
const app = express();

// AWS configuration
AWS.config.update({
  region: 'us-east-1'
});

const sqs = new AWS.SQS();
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver'; 

app.use(express.json());

// Recursive function to poll SQS queue for messages
function pollQueue() {
  const receiveMessageParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1, 
    WaitTimeSeconds: 20
  };

  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
      console.error('Error receiving message:', err);
    } else if (data.Messages) {
      const message = data.Messages[0];
      if ( message != undefined)
      {
      const messageBody = JSON.parse(message.Body);

      console.log('Received message:', messageBody);
      const { to, subject, text } = messageBody;

            // Example usage:
      sendEmail(subject, to,text)
        .then(result => {
          if (!result.error) {
            console.log('Email sent successfully');
            writeToDynamoDB(result.data.messageId, new Date().toISOString(), messageBody, "OK").then(result=>{
              if(result.error)
              {
                console.log('Fail to write to dynamodb');
              }

            })
          } else {
            console.log(`Failed to send email ${result.message}`);
          }
        });

      // Delete the message from the queue
      const deleteMessageParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
      };

      sqs.deleteMessage(deleteMessageParams, (err, data) => {
        if (err) {
          console.error('Error deleting message:', err);
        } else {
          console.log('Message deleted successfully');
        }
      });
    }
    } else {
      console.log('No messages available');
    }

    setTimeout(pollQueue, 1000); 
  });
}

// Start polling the queue
pollQueue();

// Start the server
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
