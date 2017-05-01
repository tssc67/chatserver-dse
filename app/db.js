const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var loredis = redis.createClient();
var reredis = redis.createClient({
    host:cfg.remote[0]
});
var failover = false;
reredis.on('error',err=>{
    failover = true;
    //Remote fail
})

function distribute(func){
    return (...args)=>
    Promise.all([
        loredis[func](...args),
        failover ? undefined : reredis[func](...args)
    ])
}

function nano(){
    return ((sec,nano)=>sec*1000000000+nano)(...(process.hrtime()));
}


function groupExist(groupID){
    return loredis.getAsync(`group:${groupID}`)
    .then(creationDate=>{
        return creationDate?true:false;
    })
}

exports.listGroup = function(userID){
    return loredis.zrangeAsync(`user:${userID}`,-1,-1);
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

exports.deleteGroup = function(groupID){
    return Promise.all([
        distribute('delAsync')(`group:${groupID}`),
        distribute('delAsync')(`group:${groupID}:members`),
        distribute('delAsync')(`group:${groupID}:messages`)
    ]);
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
        return loredis.zcountAsync(`group:${groupID}:messages`,`(${lastTimestamp}`,nano());  
    });
}

exports.readMessages = function(userID,groupID){
    var timestamp = nano();
    return loredis.getAsync(`user:${userID}:lastread:${groupID}`)
    .then(lastTimestamp=>{
        lastTimestamp = Number(lastTimestamp || 0);
        return distribute('setAsync')(`user:${userID}:lastread:${groupID}`,timestamp)
        .then(()=>loredis.zrangeAsync(`group:${groupID}:messages`,lastTimestamp,timestamp));
    })
}

exports.sendMessage = function(userID,groupID,message){
    var timestamp = nano();
    return groupExist(groupID)
    .then(exist=>{
        if(!exist){
            throw new Error("group_not_exist");
        }
        return loredis.sismemberAsync(`group:${groupID}:members`,userID)
    })
    .then(ismember=>{
        if(!ismember)throw new Error("user_is_not_member")
        return distribute('zaddAsync')
            (`group:${groupID}:messages`,timestamp,JSON.stringify({
                userID,
                timestamp,
                message
            }));
    })
}