const AWS = require('aws-sdk');
const sendJsonToQueue = require('./sqs');

jest.mock('aws-sdk', () => {
  const mockedSendMessage = jest.fn().mockReturnThis();
  const mockedPromise = jest.fn();

  return {
    SQS: jest.fn(() => ({
      sendMessage: mockedSendMessage,
    })),
  };
});

describe('sendJsonToQueue', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send JSON data to SQS successfully', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/queue-name';
    const jsonData = { key: 'value' };
    const expectedResult = { MessageId: 'message-id' };

    AWS.SQS().sendMessage().promise.mockResolvedValueOnce(expectedResult);

    const result = await sendJsonToQueue(queueUrl, jsonData);

    expect(AWS.SQS).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(AWS.SQS().sendMessage).toHaveBeenCalledWith({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(jsonData),
    });
    expect(result).toEqual(expectedResult);
  });

  it('should handle errors when sending JSON data to SQS', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/queue-name';
    const jsonData = { key: 'value' };
    const expectedError = new Error('Test error');

    AWS.SQS().sendMessage().promise.mockRejectedValueOnce(expectedError);

    await expect(sendJsonToQueue(queueUrl, jsonData)).rejects.toThrow(expectedError);

    expect(AWS.SQS).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(AWS.SQS().sendMessage).toHaveBeenCalledWith({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(jsonData),
    });
  });
});
