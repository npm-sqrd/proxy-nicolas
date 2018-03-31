const redis = require('redis');

const client = redis.createClient('redis://ec2-54-67-82-182.us-west-1.compute.amazonaws.com:6379');

client.on('connect', () => {
  console.log('Redis connected');
});

client.on('error', (err) => {
  console.log('Redis error', err);
});

module.exports.redisClient = client;
