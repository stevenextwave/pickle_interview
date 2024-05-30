# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
ENV PORT 8080
ENV QUEUE https://sqs.us-east-1.amazonaws.com/851725519017/receiver
EXPOSE 8080

# Define the command to run your app
CMD ["node", "index.js"]
