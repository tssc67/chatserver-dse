<%- include('usernameRandomizer.js') %>
<%- include('view.js') %>
var ws;
function connect(){
    ws = new WebSocket(`ws://${document.location.host}`)
    ws.onopen = function(){
        updateUsername();
    }
    ws.onmessage = function(evt){
        console.log(evt.data);
        handler(JSON.parse(evt.data));
    }
    ws.onclose = function(evt){
        connect();
    }
}
function handler(res){
    switch(res.action){
        case 'hi':
            if(res.message=='ok')listGroup();
            break;
        case 'listGroup':
            if(res.message=='ok'){
                viewUpdateGroupList(res.data);
            }
            break;
        case 'notifyMessage':
            viewUpdateGroupUnreadCount(res.data);
            break;
        case 'readMessages':
            viewUpdateChatDisplay(res.data);
            break;
        case 'createGroup':
        case 'joinGroup':
        case 'leaveGroup':
            if(res.message == 'ok')listGroup();
            break;
    }
}
function sendAction(action,data){
    ws.send(JSON.stringify({
        action,
        data
    }))
}
function listGroup(){
    sendAction('listGroup');
}
function createGroup(groupID){
    sendAction('createGroup',groupID);
}
function joinGroup(groupID){
    sendAction('joinGroup',groupID);
}
function leaveGroup(groupID){
    sendAction('leaveGroup',groupID);
}
function sendMessage(groupID,message){
    sendAction('sendMessage',{groupID,message})
}
function readMessages(groupID){
    sendAction('readMessages',{groupID});
}

function createGroupBtn(){
    if(groupEle.val().length != 0)createGroup(groupEle.val());
}

function joinGroupBtn(){
    if(groupEle.val().length != 0)joinGroup(groupEle.val());
}

function leaveGroupBtn(){
    if(groupEle.val().length != 0)leaveGroup(groupEle.val());
}

function updateUsername(){
    sendAction('hi',usernameEle.val());
}
var usernameEle = $('#username-textbox');;
var groupEle = $('#group-textbox');
$(function(){
    $('#username-textbox').on('input',function(){
        updateUsername();
    })
    $('#chat-input-area').on("keypress",function(e){
        if(e.which == 13){
            if(currentGroup)sendMessage(currentGroup,$(this).val());
            $(this).val('');
        }
    });
    $('#chat-input-area').on("keyup",function(e){
        if(e.which == 13){
        }
    });
});

connect();