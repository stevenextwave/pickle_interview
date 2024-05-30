const AWS = require('aws-sdk');
const sendJsonToQueue = require('./sqs');

// Mock the SQS service
jest.mock('aws-sdk', () => {
  const SQS = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    config: {
      update: jest.fn()
    },        
    SQS: jest.fn(() => SQS),
  };
});

describe('sendJsonToQueue', () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should send JSON data to an SQS queue', async () => {
    const queueUrl = 'mockedQueueUrl';
    const jsonData = { key: 'value' };
    const expectedResult = { MessageId: '12345' };
    AWS.SQS().sendMessage().promise.mockResolvedValue({ MessageId: '12345' });
    const result = await sendJsonToQueue(queueUrl, jsonData);

    expect(AWS.SQS().sendMessage).toHaveBeenCalledWith({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(jsonData),
    });
    expect(result).toEqual(expectedResult);
  });

  it('should throw an error if sending message to SQS fails', async () => {
    const queueUrl = 'mockedQueueUrl';
    const jsonData = { key: 'value' };
    const errorMessage = 'Sending message failed';
    AWS.SQS().sendMessage().promise.mockRejectedValueOnce(new Error(errorMessage));
    await expect(sendJsonToQueue(queueUrl, jsonData)).rejects.toThrow(errorMessage);
  });
});
