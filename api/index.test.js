const request = require('supertest');
const nodemailer = require('nodemailer');
const app = require('./index');

jest.mock('nodemailer');

describe('POST /email', () => {
    let sendMailMock;

    beforeEach(() => {
        sendMailMock = jest.fn().mockResolvedValue({ messageId: '12345' });
        nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send an email and return 200', async () => {
        const res = await request(app)
            .post('/email')
            .send({
                to: 'recipient@example.com',
                subject: 'Test Email',
                text: 'Hello, this is a test email.',
                html: '<p>Hello, this is a <b>test</b> email.</p>'
            });

        expect(res.status).toBe(200);
        expect(res.text).toBe('Email sent successfully!');
        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: 'recipient@example.com',
            subject: 'Test Email',
            text: 'Hello, this is a test email.',
            html: '<p>Hello, this is a <b>test</b> email.</p>'
        }));
    });

    it('should return 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/email')
            .send({
                subject: 'Test Email',
                text: 'Hello, this is a test email.'
            });

        expect(res.status).toBe(400);
        expect(res.text).toBe('Missing required fields: to, subject, text');
        expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('should return 500 if sending email fails', async () => {
        sendMailMock.mockRejectedValue(new Error('Failed to send email'));

        const res = await request(app)
            .post('/email')
            .send({
                to: 'recipient@example.com',
                subject: 'Test Email',
                text: 'Hello, this is a test email.',
                html: '<p>Hello, this is a <b>test</b> email.</p>'
            });

        expect(res.status).toBe(500);
        expect(res.text).toBe('Error sending email');
        expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
});
