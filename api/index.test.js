const request = require('supertest');
const app = require('./index'); // Path to your Express app
const sendJsonToQueue = require('./sqs');

jest.mock('./sqs'); // Mock the sqs module

describe('POST /email', () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver';

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/email')
      .send({ to: 'test@example.com' }); // Missing subject and text

    expect(response.status).toBe(400);
    expect(response.text).toBe('Missing required fields: to, subject, text');
  });

  it('should return 200 if the message is sent successfully', async () => {
    sendJsonToQueue.mockResolvedValueOnce('mocked-result');

    const response = await request(app)
      .post('/email')
      .send({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
        html: '<p>Test HTML</p>'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Message sent successfully!');
    expect(sendJsonToQueue).toHaveBeenCalledWith(queueUrl, {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>'
    });
  });

  it('should return 500 if there is an error sending the message', async () => {
    sendJsonToQueue.mockRejectedValueOnce(new Error('mocked error'));

    const response = await request(app)
      .post('/email')
      .send({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
        html: '<p>Test HTML</p>'
      });

    expect(response.status).toBe(500);
    expect(response.text).toBe('server error!');
    expect(sendJsonToQueue).toHaveBeenCalledWith(queueUrl, {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>'
    });
  });
});
