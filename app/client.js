const db = require('./db.js');
var sockets = {};

module.exports = function(wss){
    wss.on('connection',socket=>{
        socket.on('message',msg=>{
            try{
                handler(socket,JSON.parse(msg));
            }catch(err){
                console.log(err);
                socket.send("malform_json");
            }
        })
        socket.on('close',()=>{
            if(socket.userID)delete sockets[socket.userID];
            console.log(socket.userID + ' leave');
        })
    })
}

function handler(socket,msg){
    act(socket,msg.action,msg.data);
}

function act(socket,action,data){
    function response(message,data){
        socket.send(JSON.stringify({action,message,data}));
    }
    var actions = {
        'hi':function(){
            userID = data.toString();
            console.log("New Client " + userID);
            if(socket.userID){
                delete sockets[userID]
            }
            sockets[userID] = userID;
            socket.userID = userID;
            return response('ok');
        },
        'createGroup':function(){
            if(typeof data != 'string') return response('error');;
            db.createGroup(data).then(()=>{
                return response('ok');
            })
            .then(()=>{
                return db.joinGroup(socket.userID,data);
            })
            .catch(err=>{
                switch(err){
                    case 'group_exist':
                        return response('group_exist');
                    default:
                        console.log(err);
                        return response('error');
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
                        return response('group_not_exist')
                    default:
                        console.log(err);
                        return response('error');
                }
            });
        },
        'listGroup':function(){
            var list;
            db.listGroup(socket.userID).then(res=>{
                list = res;
                return Promise.all(
                    list.map(groupID=>{
                        return db.getUnreadCount(socket.userID,groupID);
                    })
                )
            })
            .then(unreadCountList=>{
                console.log(unreadCountList);
                return response("ok",JSON.stringify(
                    unreadCountList.map((unreadCount,idx)=>{
                        return {groupID:list[idx],unreadCount}
                    })
                ))
            })
            .catch(err=>{
                console.log(err);
                return response('err');
            });
        },
        'sendMessage':function(){
            db.sendMessage(socket.userID,data.groupID,data.message)
            .then(()=>{
                response('ok');
            })
            .catch((err)=>{
                switch(err){
                    case 'group_not_exist':
                        return response('group_not_exist');
                    case 'user_is_not_member':
                        return response('user_is_not_member')
                    default:
                        console.log(err);
                        return response('error');
                }
            });
        }
    };
    if(!actions[action])return response('unknown_action')
    if(action!='hi' && !socket.userID)return response('unbind_userid')
    actions[action]();
}