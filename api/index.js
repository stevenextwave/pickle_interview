const express = require('express');
const bodyParser = require('body-parser');
const sendJsonToQueue = require('./sqs');

// Usage example
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725519017/receiver'; // Replace with your queue URL


const app = express();
const port = 8080;

// Middleware to parse JSON
app.use(bodyParser.json());

app.post('/email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).send('Missing required fields: to, subject, text');
    }

    const jsonData = {
      to,
      subject,
      text,
      html
    }

    let info = await sendJsonToQueue(queueUrl, jsonData)
    .then(result => {
        console.log('Message sent successfully:', result);
        res.status(200).send('Message sent successfully!');
    })
    .catch(error => {
        console.error('Error sending message:', error);
        res.status(500).send('server error!');
        
    });
     
});

module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}


