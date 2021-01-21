'use strict';

// 
// const
const { SNS_TOPIC_ARN } = process.env;

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const sendMessage = (message = '', messageDeduplicationId, messageGroupId = '') => {
  const params = {
    Message                : message,
    TopicArn               : SNS_TOPIC_ARN,
    MessageGroupId         : messageGroupId,
    MessageDeduplicationId : messageDeduplicationId
  };

  const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

  return publishTextPromise
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

module.exports = {
  sendMessage
};