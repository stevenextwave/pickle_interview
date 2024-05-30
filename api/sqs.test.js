const AWS = require('aws-sdk');
const sendJsonToQueue = require('./sendJsonToQueue');

// Mock the SQS service
jest.mock('aws-sdk', () => {
    const SQS = {
        sendMessage: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        
        SQS: jest.fn(() => SQS),
    };
});

describe('sendJsonToQueue', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Reset mock usage data after each test
    });

    it('should send JSON data to an SQS queue', async () => {
        const queueUrl = 'mockedQueueUrl';
        const jsonData = { key: 'value' };
        const expectedResult = { MessageId: 'mockedMessageId' };

        // Mock the SQS sendMessage method
        AWS.SQS.mockImplementationOnce(() => ({
            sendMessage: jest.fn().mockReturnThis(),
            promise: jest.fn(() => Promise.resolve(expectedResult)),
        }));

        const result = await sendJsonToQueue(queueUrl, jsonData);

        expect(AWS.SQS).toHaveBeenCalledWith({ region: 'us-east-1' });
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

        // Mock the SQS sendMessage method to throw an error
        AWS.SQS.mockImplementationOnce(() => ({
            sendMessage: jest.fn().mockReturnThis(),
            promise: jest.fn(() => Promise.reject(new Error(errorMessage))),
        }));

        await expect(sendJsonToQueue(queueUrl, jsonData)).rejects.toThrow(errorMessage);
    });
});
