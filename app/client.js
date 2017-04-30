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
            if(typeof data != 'string') return socket.send('err')
            db.createGroup(data).then(()=>{
                return socket.send('ok');
            })
            .then(()=>{
                return db.joinGroup(socket.userID,data);
            })
            .catch(err=>{
                switch(err){
                    case 'group_exist':
                        return socket.send('group_exist')
                    default:
                        console.log(err);
                        return socket.send('err');
                }
            });
        },
        'joinGroup':function(){
            db.joinGroup(socket.userID,data)
            .then(()=>{
                socket.send('ok');
            },(err)=>{
                switch(err){
                    case 'group_not_exist':
                        return socket.send('group_not_exist');
                    default:
                        console.log(err);
                        return socket.send('err');
                }
            });
        },
        'listGroup':function(){
            db.listGroup(socket.userID).then(list=>socket.send,(err)=>{
                console.log(err);
                return socket.send('err');
            });
        },
        'message':function(){
            // NOT YET IMPLEMENT
        }
    };
    if(!actions[action])return socket.send('unknown_action');
    if(action!='hi' && !socket.userID)return socket.send('unknown_userid');
    actions[action]();
}