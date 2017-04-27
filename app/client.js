const db = require('./db.js');
var sockets = {};

module.exports = function(wss){
    wss.on('connection',socket=>{
        socket.on('message',msg=>{
            handler(socket,JSON.parse(msg));
        })
        socket.on('close',()=>{
            if(socket.userID)delete sockets[socket.userID];
        })
    })
}

function handler(socket,msg){
    act(socket,msg.action,msg.data);
}

function act(socket,action,data){
    var actions = {
        'hi':function(){
            userID = data.toString();
            if(socket.userID){
                delete sockets[userID]
            }
            sockets[userID] = userID;
            socket.userID = userID;
        },
        'createGroup':function(){

        }
    };
    if(!actions[action])return socket.send('unknown_action');
    actions[action]();
}