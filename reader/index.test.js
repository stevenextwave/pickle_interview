const AWS = require('aws-sdk');
const { pollQueue } = require('./index');
const sendEmail = require('./email');
const writeToDynamoDB = require('./dynamodb');

// Mock the SQS service
jest.mock('aws-sdk', () => {
  const SQS = {
    receiveMessage: jest.fn().mockReturnThis(),
    deleteMessage: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  const putMock = jest.fn().mockReturnValue({ promise: jest.fn() });
  const mockDocumentClient = {
    put: putMock
  };
  return {
    config: {
      update: jest.fn()
    },        
    SQS: jest.fn(() => SQS),
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient)
    }
  };
});
jest.mock('./email');
jest.mock('./dynamodb');

describe('pollQueue', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a message and send an email', async () => {
    const mockMessage = {
      Messages: [
        {
          Body: JSON.stringify({ to: 'test@example.com', subject: 'Test Subject', text: 'Test Text' }),
          ReceiptHandle: 'test-receipt-handle'
        }
      ]
    };

    AWS.SQS().receiveMessage.mockImplementationOnce((params, callback) => {
      callback(null, mockMessage);
    });


    sendEmail.mockResolvedValueOnce({ error: false, data: { messageId: '12345' } });
    writeToDynamoDB.mockResolvedValueOnce({ error: false });

    pollQueue();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the setTimeout to complete

    expect(sendEmail).toHaveBeenCalledWith('Test Subject', 'test@example.com', 'Test Text');
    expect(writeToDynamoDB).toHaveBeenCalledWith('12345', expect.any(String), {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
    }, "OK");
    expect(AWS.SQS().deleteMessage).toHaveBeenCalledWith({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver',
      ReceiptHandle: 'test-receipt-handle'
    }, expect.any(Function));
  });

  it('should handle errors when receiving messages', async () => {
    AWS.SQS().receiveMessage.mockImplementationOnce((params, callback) => {
      callback(new Error('Receive message error'), null);
    });

    pollQueue();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the setTimeout to complete

    expect(sendEmail).not.toHaveBeenCalled();
    expect(writeToDynamoDB).not.toHaveBeenCalled();
    expect(AWS.SQS().deleteMessage).not.toHaveBeenCalled();
  });

  it('should handle errors when sending an email', async () => {
    const mockMessage = {
      Messages: [
        {
          Body: JSON.stringify({ to: 'test@example.com', subject: 'Test Subject', text: 'Test Text' }),
          ReceiptHandle: 'test-receipt-handle'
        }
      ]
    };

    AWS.SQS().receiveMessage.mockImplementationOnce((params, callback) => {
      callback(null, mockMessage);
    });

    sendEmail.mockResolvedValueOnce({ error: true, message: 'Email error' });

    pollQueue();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the setTimeout to complete

    expect(sendEmail).toHaveBeenCalledWith('Test Subject', 'test@example.com', 'Test Text');
    expect(writeToDynamoDB).not.toHaveBeenCalled();
    expect(AWS.SQS().deleteMessage).toHaveBeenCalledWith({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver',
      ReceiptHandle: 'test-receipt-handle'
    }, expect.any(Function));
  });

  it('should handle no messages available', async () => {
    AWS.SQS().receiveMessage.mockImplementationOnce((params, callback) => {
      callback(null, {});
    });

    pollQueue();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the setTimeout to complete

    expect(sendEmail).not.toHaveBeenCalled();
    expect(writeToDynamoDB).not.toHaveBeenCalled();
    expect(AWS.SQS().deleteMessage).not.toHaveBeenCalled();
  });
});
