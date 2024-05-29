const nodemailer = require('nodemailer');
// Function to send an email using Gmail
async function sendEmail(subject, to, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '@gmail.com', 
        pass: '' 
      }
    });

    const mailOptions = {
      from: '@gmail.com', 
      to: to, 
      subject: subject, 
      text: text 
    };

    const info = await transporter.sendMail(mailOptions);
    return {
        message: 'Operation was successful',
        error : false,
        data: info
      };
  } catch (err) {
    return {
        message: `Error sending email: ${err}`,
        error: true,
        data: err
      };
  }
}

module.exports = sendEmail;


