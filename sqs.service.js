'use strict';

//
// dependencies
const AWS = require('aws-sdk');

//
// const
const { NODE_ENV, AWS_ACCESS_SECRET, AWS_ACCESS_KEY, AWS_REGION_SQS, AWS_ACCOUNT_ID } = process.env;

class SQSService {
  constructor(queueName) {
    this.SQS        = this.openConnection();
    this.queueName  = queueName;
  }

  openConnection() {
    let SQS;
    if (NODE_ENV === 'local') {
      SQS = new AWS.SQS(
        {
          region      : AWS_REGION_SQS,
          credentials : {
            secretAccessKey : AWS_ACCESS_SECRET, 
            accessKeyId     : AWS_ACCESS_KEY
          }
        }
      );
    } else {
      SQS = new AWS.SQS();
    }
    return SQS;
  }

  sendMessage (message, messageAtribute = null) {
    return new Promise((resolve, reject) => {
      
      const params = {
        MessageBody : JSON.stringify(message),
        QueueUrl    : `https://sqs.${AWS_REGION_SQS}.amazonaws.com/${AWS_ACCOUNT_ID}/${this.queueName}`
      };

      if (messageAtribute) params.MessageAttributes = messageAtribute;
  
      this.SQS.sendMessage(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = {
  SQSService
};