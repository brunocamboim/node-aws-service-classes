'use strict';

//
// dependencies
const AWS = require('aws-sdk');

class S3Service {
  constructor(bucketName) {
    this.s3         = this.openConnection();
    this.bucketName = bucketName;
  }

  openConnection () {
    let s3;
    if (process.env.NODE_ENV === 'local') {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId     : process.env.S3_ACCESS_KEY,
          secretAccessKey : process.env.S3_ACCESS_SECRET,
          region          : process.env.S3_REGION,
          signatureVersion: process.env.S3_SIGN_VERSION
        }
      });
    } else {
      s3 = new AWS.S3();
    }
    
    return s3;
  }
  
  getDataFromFile(key, query = 'SELECT * FROM s3object s ', limit = '') {
    const params = {
      Bucket            : this.bucketName,
      Key               : key,
      ExpressionType    : 'SQL',
      Expression        : query + limit,
      InputSerialization: {
        CSV: {
          FileHeaderInfo  : 'USE',
          RecordDelimiter : '\n',
          FieldDelimiter  : ';'
        }
      },
      OutputSerialization: {
        CSV: {}
      }
    };

    return new Promise((resolve, reject) => {
      this.s3.selectObjectContent(params, (err, data) => {
        if (err) { 
          reject(err); 
        }

        if (!data) {
          reject('Empty data object');
        }

        const records = [];
        data.Payload
          .on('data', (event) => {
            if (event.Records) {
              records.push(event.Records.Payload);
            }
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('end', () => {
            const result = Buffer.concat(records).toString('utf8');
            resolve(result.split('\r\n').filter(Boolean));
          });
      });
    });
  }
}

module.exports = {
  S3Service
};