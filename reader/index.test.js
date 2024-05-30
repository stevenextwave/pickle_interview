const AWS = require('aws-sdk');
const { pollQueue } = require('./index'); // Import pollQueue function from your file

jest.mock('aws-sdk', () => {
  const SQS = jest.fn(() => ({
    receiveMessage: jest.fn(),
    deleteMessage: jest.fn(),
  }));
  return { 
    config: {
        update: jest.fn()
      },
    SQS 

  };
});

jest.mock('./email', () => ({
  sendEmail: jest.fn(() => Promise.resolve({ error: false, data: { messageId: '123' } })),
}));

jest.mock('./dynamodb', () => ({
  writeToDynamoDB: jest.fn(() => Promise.resolve({ error: false })),
}));

describe('pollQueue function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should receive and process a message from the SQS queue', async () => {
    const mockMessage = {
      Messages: [
        {
          Body: JSON.stringify({
            to: 'example@example.com',
            subject: 'Test Subject',
            text: 'Test Text',
          }),
          ReceiptHandle: '12345',
        },
      ],
    };
    const mockReceiveMessage = jest.fn((params, callback) => callback(null, mockMessage));
    const mockDeleteMessage = jest.fn((params, callback) => callback(null, {}));

    const sqsInstance = new AWS.SQS();
    sqsInstance.receiveMessage = mockReceiveMessage;
    sqsInstance.deleteMessage = mockDeleteMessage;

    await pollQueue();

    //expect(mockReceiveMessage).toHaveBeenCalled();
    //expect(mockDeleteMessage).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith('Test Subject', 'example@example.com', 'Test Text');
    expect(writeToDynamoDB).toHaveBeenCalledWith('123', expect.any(String), expect.any(Object), 'OK');
  });

  it('should handle errors when receiving messages from SQS', async () => {
    const mockReceiveMessage = jest.fn((params, callback) => callback(new Error('Failed to receive message')));

    const sqsInstance = new AWS.SQS();
    sqsInstance.receiveMessage = mockReceiveMessage;

    await pollQueue();

    expect(mockReceiveMessage).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(writeToDynamoDB).not.toHaveBeenCalled();
  });

  // Test other scenarios such as no messages available, failure to send email, etc.
});
