const nodemailer = require('nodemailer');

// Function to send an email using Gmail
async function sendEmail(subject, to, text) {
  try {
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '@gmail.com', // Your Gmail email address
        pass: '' // Your Gmail password
      }
    });

    // Define email options
    const mailOptions = {
      from: '@gmail.com', // Sender address (your Gmail email address)
      to: to, // List of recipients
      subject: subject, // Subject line
      text: text // Plain text body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = sendEmail;


