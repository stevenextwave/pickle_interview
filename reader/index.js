const express = require('express');
const AWS = require('aws-sdk');
const sendEmail = require('./email');
const app = express();

// AWS configuration
AWS.config.update({
  region: 'us-east-1'
});

const sqs = new AWS.SQS();
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver'; 

// Middleware to parse JSON bodies
app.use(express.json());



// Recursive function to poll SQS queue for messages
function pollQueue() {
  const receiveMessageParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1, // Maximum number of messages to retrieve
    WaitTimeSeconds: 20 // Long polling time (optional)
  };

  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
      console.error('Error receiving message:', err);
    } else if (data.Messages) {
      const message = data.Messages[0];
      const messageBody = JSON.parse(message.Body);

      console.log('Received message:', messageBody);
      const { to, subject, text } = messageBody;

            // Example usage:
      sendEmail(subject, to,text)
        .then(success => {
          if (success) {
            console.log('Email sent successfully');
          } else {
            console.log('Failed to send email');
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
    } else {
      console.log('No messages available');
    }

    // Poll the queue again after a short delay
    setTimeout(pollQueue, 1000); // Adjust the delay as needed
  });
}

// Start polling the queue
pollQueue();

// Start the server
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
