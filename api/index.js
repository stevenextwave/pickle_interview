const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/email', (req, res) => {
  // Your email processing logic here

  // Return status code 201
  res.status(201).send();
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = server;
