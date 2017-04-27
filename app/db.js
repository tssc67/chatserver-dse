const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var loredis = redis.createClient();
// var reredis = redis.createClient({
//     host:cfg.remote[0]
// });
function distribute(func){
    return (...args)=>
    Promise.all([
        loredis[func](...args)
        // ,
        // reredis[func](...args)
    ])
}

function nano(){
    return ((sec,nano)=>sec*1000000000+nano)(...(process.hrtime()));
}

exports.createGroup = function(groupID){
    return groupExist(groupID)
    .then(exist=>{
        if(exist) 
            throw new Error("group_exist")
        else{
            return distribute('setAsync')(`group:${groupID}`,nano());
        }
    })
}

function groupExist(groupID){
    return loredis.getAsync(`group:${groupID}`)
    .then(creationDate=>{
        return creationDate?true:false;
    })
}


exports.joinGroup = function(userID,groupID){
    return groupExist(groupID)
    .then(exist=>{
        if(exist){
            return Promise.all([
                distribute('saddAsync')(`group:${groupID}:members`,userID),
                distribute('zaddAsync')(`user:${userID}`,nano(),groupID)
            ]);
        }   
        else
            throw new Error("group_not_exist")
    })
}

exports.getUnreadCount = function(userID,groupID){
    return loredis.getAsync(`user:${userID}:lastread:${groupID}`)
    .then(lastTimestamp=>{
        lastTimestamp = Number(lastTimestamp || 0);
        return loredis.zcountAsync(`(${lastTimestamp}`,nano());  
    });
}

exports.readMessages = function(userID,groupID){
    var timestamp = nano();
    return loredis.getAsync(`user:${userID}:lastread:${groupID}`)
    .then(lastTimestamp=>{
        lastTimestamp = Number(lastTimestamp || 0);
        return distribute('setAsync')(`user:${userID}:lastread:${groupID}`,timestamp)
        .then(()=>loredis.get(`group:${groupID}:messages`,lastTimestamp));
    })
}

exports.sendMessage = function(userID,groupID,message){
    var timestamp = nano();
    return groupExist(groupID)
    .then(exist=>{
        if(exist){
            return distribute('zaddAsync')
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