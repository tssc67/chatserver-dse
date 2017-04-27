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

function nano(){
    return ((sec,nano)=>sec*1000000000+nano)(...(process.hrtime()));
}

exports.createGroup = function(groupID){
    groupExist(groupID)
    .then(exist=>{
        if(exist) 
            throw new Error("group_exist")
        else{
            return distribute('set')(`group:${groupID}`,nano());
        }
    })
}

exports.groupExist = function(groupID){
    loredis.get(`group:${groupID}`)
    .then(creationDate=>{
        return creationDate?true:false;
    })
}


exports.joinGroup = function(userID,groupID){
    groupExist(groupID)
    .then(exist=>{
        if(exist){
            return Promise.all([
                distribute('sadd')(`group:${groupID}:members`,userID),
                distribute('zadd')(`user:${userID}`,nano(),groupID)
            ]);
        }   
        else
            throw new Error("group_not_exist")
    })
}

exports.getUnreadCount = function(userID,groupID){
    loredis.get(`user:${userID}:lastread:${groupID}`)
    .then(lastTimestamp=>{
        lastTimestamp = Number(lastTimestamp || 0);
        return loredis.zcount(`(${lastTimestamp}`,nano());  
    });
}

exports.readMessages = function(userID,groupID){
    var timestamp = nano();
    loredis.get(`user:${userID}:lastread:${groupID}`)
    .then(lastTimestamp=>{
        lastTimestamp = Number(lastTimestamp || 0);
        return distribute('set')(`user:${userID}:lastread:${groupID}`,timestamp)
        .then(()=>loredis.get(`group:${groupID}:messages`,lastTimestamp));
    })
}

exports.sendMessage = function(userID,groupID,message){
    var timestamp = nano();
    groupExists(groupID)
    .then(exist=>{
        if(exist){
            return distribute('zadd')
            (`group:${groupID}:messages`,timestamp,JSON.stringify({
                username,
                timestamp,
                message
            }))
        }
        else
            throw new Error("group_not_exist");
    })
}