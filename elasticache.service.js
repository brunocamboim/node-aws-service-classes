'use strict';

//
// dependencies
const redis         = require('redis');
const { promisify } = require('util');

//
// const
const { ELASTICACHE_PRIMARY_ENDPOINT, NODE_ENV } = process.env;

class ElastiCacheRedis {
  constructor(port) {
    this.elasticachePrimaryEndpoint = ELASTICACHE_PRIMARY_ENDPOINT;
    this.port                       = port || 6379;
    this.client                     = null;
    this.isLocal                    = NODE_ENV === 'development' || NODE_ENV === 'local' ? true : false;
    this.createClient();
  }

  createClient () {
    if (NODE_ENV === 'development' || NODE_ENV === 'local') return false;

    this.client = redis.createClient({
      host: this.elasticachePrimaryEndpoint,
      port: this.port
    });

    this.client.on('connect', function() {
      // eslint-disable-next-line no-undef
      console.log('Redis client connected');
    });

    this.client.on('error', function (err) {
      // eslint-disable-next-line no-undef
      console.log('Something went wrong ' + err);
    });

    return true;
  }

  set(key, value, expire = 900) {
    if (this.isLocal) return false;

    const set = promisify(this.client.set).bind(this.client);
    return set(key, JSON.stringify(value))
      .then(() => {
        this.client.expire(key, expire);
        return true;
      })
      .catch((err) => {
        console.warn(`Error setting object into a key ${key} on elasticache`, err);
        return false;
      });
  }

  get(key) {
    if (this.isLocal) return false;

    const get = promisify(this.client.get).bind(this.client);
    return get(key)
      .then((value) => {
        if (value) {
          console.log('The data were researched on elasticache redis.', `Key: ${key}` );
          return JSON.parse(value);
        }

        return false;
      })
      .catch((err) => {
        console.warn(`Error getting object from a key ${key} on elasticache.`, err);
        return false;
      });
  }

  async delete(key) {
    if (this.isLocal) return false;

    const del = promisify(this.client.del).bind(this.client);
    return del(key)
      .then(() => true)
      .catch((err) => {
        console.warn(`Error deleting key ${key} from elasticache.`, err);
        return false;
      });
  }
}

module.exports = new ElastiCacheRedis();