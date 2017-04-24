const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var loredis = redis.createClient();
var reredis = redis.createClient();
function get(){

}
function getUser(username){
    return get(`users:${username}`);
}
exports.createUser = function(username,password){
    
}