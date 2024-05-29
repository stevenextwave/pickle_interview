const AWS = require('aws-sdk');
const writeToDynamoDB = require('./dynamodb');

jest.mock('aws-sdk', () => {
  const putMock = jest.fn().mockReturnValue({ promise: jest.fn() });
  const mockDocumentClient = {
    put: putMock
  };
  return {
    config: {
      update: jest.fn()
    },
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient)
    }
  };
});

describe('writeToDynamoDB', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write data to DynamoDB successfully', async () => {
    const mockMessageId = '123';
    const mockTimestamp = new Date();
    const mockContent = 'Test content';
    const mockStatus = 'pending';

    const expectedParams = {
      TableName: 'message',
      Item: {
        messageId: mockMessageId,
        timestamp: mockTimestamp,
        content: mockContent,
        status: mockStatus
      }
    };

    const expectedResult = {
      message: 'Operation was successful',
      error: false,
      data: {}
    };

    AWS.DynamoDB.DocumentClient().put.mockImplementationOnce(() => ({
      promise: jest.fn().mockResolvedValueOnce({})
    }));

    const result = await writeToDynamoDB(mockMessageId, mockTimestamp, mockContent, mockStatus);

    expect(AWS.DynamoDB.DocumentClient).toHaveBeenCalled();
    expect(AWS.DynamoDB.DocumentClient().put).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(expectedResult);
  });

  it('should handle errors when writing to DynamoDB', async () => {
    const mockMessageId = '123';
    const mockTimestamp = new Date();
    const mockContent = 'Test content';
    const mockStatus = 'pending';
    const mockError = new Error('Test error');

    const expectedParams = {
      TableName: 'message',
      Item: {
        messageId: mockMessageId,
        timestamp: mockTimestamp,
        content: mockContent,
        status: mockStatus
      }
    };

    const expectedResult = {
      message: `Fail to write data ${JSON.stringify(expectedParams)}`,
      error: true,
      data: mockError
    };

    AWS.DynamoDB.DocumentClient().put.mockImplementationOnce(() => ({
      promise: jest.fn().mockRejectedValueOnce(mockError)
    }));

    const result = await writeToDynamoDB(mockMessageId, mockTimestamp, mockContent, mockStatus);

    expect(AWS.DynamoDB.DocumentClient).toHaveBeenCalled();
    expect(AWS.DynamoDB.DocumentClient().put).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(expectedResult);
  });
});
