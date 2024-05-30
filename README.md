# email sender

It has 2 folders , api/ and reader/. api is the api gateway and the producer and reader is the consumer. They communicate via SQS queue , and store the details in dynamodB . Reader uses gmail to send email.

## Missing Feature
DLQ to store fail message and retry

EKS cluster to deploy the package, for now we need to rely on running the process locally 

## Installation 

Please create an SQS queue 

Please create an DynamoDB , example "message"

with the following columns
```
     messageId: primary,
     timestamp: sortkey,

```

And you need to create an app password for gmail

[Create and use app passwords](https://support.google.com/mail/answer/185833?hl=en)

ensure you have the AWS_ACCESS_KEY and AWS_SECRET_KEY in your local env


## Usage

Start the API 
```bash
export PORT=8080
export QUEUE=https://sqs.us-east-1.amazonaws.com/851725519017/receiver
node index.js
```

Start the Reader
```bash
export PORT=8089
export QUEUE=https://sqs.us-east-1.amazonaws.com/851725519017/receiver
export TABLE=message
export PASSWORD="some password"
export FROM="some@gmail.com"
node index.js

```
Trigger the API
```bash
curl -X POST http://localhost:8080/email -H "Content-Type: application/json"      -d '{
           "to": "lowsweeleong@gmail.com",
           "subject": "Test Email",
           "text": "Hello, this is a test email.",
           "html": "<p>Hello, this is a <b>test</b> email.</p>"
         }'
```

There is a github action to build the docker images and push it to docker hub


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)