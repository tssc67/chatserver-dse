const db = require('./db.js');
module.exports = function(wss){
    wss.on('connection',socket=>{
        socket.on('message',msg=>{
            handler(socket,JSON.parse(msg));
            
        })
    })
}

function handler(socket,msg){
    switch(msg.action){
        case 'joinGroup':

    }
}