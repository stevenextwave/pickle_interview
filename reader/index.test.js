const AWS = require('aws-sdk');
const express = require('express');
const request = require('supertest');
const app = require('./index'); // Assuming your Express app is exported from app.js

jest.mock('aws-sdk', () => {
  const mockedSQS = {
    receiveMessage: jest.fn(),
    deleteMessage: jest.fn()
  };

  const mockedSendEmail = jest.fn();
  const mockedWriteToDynamoDB = jest.fn();

  return {
    config: {
      update: jest.fn()
    },
    SQS: jest.fn(() => mockedSQS),
    mockedSendEmail,
    mockedWriteToDynamoDB
  };
});

describe('pollQueue', () => {
  it('should receive, send email, and write to DynamoDB successfully', async () => {
    const mockedSQS = new AWS.SQS();
    //const mockedSendEmail = require('./email').mockSendEmail;
    //const mockedWriteToDynamoDB = require('./dynamodb').mockWriteToDynamoDB;

    const mockMessage = {
      Body: JSON.stringify({
        to: 'example@example.com',
        subject: 'Test Subject',
        text: 'Test Message'
      }),
      ReceiptHandle: 'receipt-handle'
    };

    mockedSQS.receiveMessage.mockImplementation((params, callback) => {
      callback(null, { Messages: [mockMessage] });
    });

    mockedSendEmail.mockResolvedValueOnce({ error: false, data: { messageId: 'message-id' } });

    mockedWriteToDynamoDB.mockResolvedValueOnce({ error: false });

    // Run pollQueue logic
    // It's a recursive function, so it will keep running until it stops
    // We can't directly test it, so we have to simulate its behavior
    // by calling the function that triggers the logic
    // You may need to refactor your code to make it more testable
    // For simplicity, we're directly invoking the function here
    // In a real-world scenario, you would test this behavior differently
    pollQueue();

    // Assertions
    expect(mockedSQS.receiveMessage).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledWith('Test Subject', 'example@example.com', 'Test Message');
    expect(mockedWriteToDynamoDB).toHaveBeenCalledWith('message-id', expect.any(String), expect.any(Object), 'OK');
    expect(mockedSQS.deleteMessage).toHaveBeenCalledWith({ QueueUrl: 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver', ReceiptHandle: 'receipt-handle' }, expect.any(Function));
  });

  // Write more tests to cover other scenarios
});

// Additional tests for other functionalities in your Express app can be added here
