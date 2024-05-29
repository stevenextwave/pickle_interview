const nodemailer = require('nodemailer');
const sendEmail = require('./email'); 

jest.mock('nodemailer');

describe('sendEmail', () => {
  let sendMailMock;
  let transporterMock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    transporterMock = { sendMail: sendMailMock };
    nodemailer.createTransport.mockReturnValue(transporterMock);
  });

  it('should return success message when email is sent', async () => {
    const info = { response: 'Email sent' };
    sendMailMock.mockResolvedValue(info);

    const subject = 'Test Subject';
    const to = 'test@example.com';
    const text = 'Test email body';

    const result = await sendEmail(subject, to, text);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: '@gmail.com',
      to,
      subject,
      text,
    });
    expect(result.message).toContain('Operation was successful');
    expect(result.error).toBe(false);
    
   
  });

  it('should return error message when email sending fails', async () => {
    const error = new Error('Failed to send email');
    sendMailMock.mockRejectedValue(error);

    const subject = 'Test Subject';
    const to = 'test@example.com';
    const text = 'Test email body';

    const result = await sendEmail(subject, to, text);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: '@gmail.com',
      to,
      subject,
      text,
    });
    expect(result.message).toContain('Error sending email');
    expect(result.error).toBe(true);
    expect(result.data).toBe(error)
  });
});
