const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var loredis = redis.createClient();
var reredis = redis.createClient({
    host:cfg.remote[0]
});
function distribute(func){
    return (...args)=>
    Promise.all([
        loredis[func](...args),
        reredis[func](...args)
    ])
}
function getUser(username){
    return get(`user:${username}`);
}
exports.createUser = function(username,password){
    getUser(username)
    .then(exists=>{
        if(!userData)return true;
        return false;
    })
}