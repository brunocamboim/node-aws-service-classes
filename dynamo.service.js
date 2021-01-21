'use strict';

//
// dependencies
const AWS = require('aws-sdk');

//
// const
const { NODE_ENV, AWS_REGION, AWS_ACCESS_SECRET, AWS_ACCESS_KEY } = process.env;

class DynamoService {
  constructor () {
    this.dynamo = this.openConnection();
  }

  openConnection () {
    let dynamo;
    if (NODE_ENV === 'local') {
      dynamo = new AWS.DynamoDB.DocumentClient(
        {
          region      : AWS_REGION, 
          credentials : { 
            secretAccessKey : AWS_ACCESS_SECRET, 
            accessKeyId     : AWS_ACCESS_KEY 
          } 
        }
      );
    } else {
      dynamo = new AWS.DynamoDB.DocumentClient();
    }
    
    return dynamo;
  }

  putItem (params) {
    return new Promise((resolve, reject) => {
      this.dynamo.put(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  getItem (params) {
    return new Promise((resolve, reject) => {
      this.dynamo.get(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  updateItem (params) {
    return new Promise((resolve, reject) => {
      this.dynamo.update(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  listItems (params) {
    return new Promise((resolve, reject) => {
      this.dynamo.query(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }
}

module.exports = {
  DynamoService
};