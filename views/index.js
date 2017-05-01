<%- include('usernameRandomizer.js') %>
var ws;
function connect(){
    ws = new WebSocket(`ws://${document.location.host}`)
    ws.onopen = function(){
    }
    ws.onmessage = function(evt){
        console.log(evt.data);
        // handler(JSON.parse(evt.data));
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
            if(res.message=='ok')console.log(res.data);
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
function joinGroup(){
    sendAction('joinGroup',groupID);
}
function deleteGroup(){
    
}
function sendMessage(groupID,message){
    sendAction('sendMessage',{groupID,message})
}
var usernameEle = $('#usernameTextbox');
function updateUsername(){
    sendAction('hi',usernameEle.val());
}
$(function(){
    $('#usernameTextbox').on('input',function(){
        updateUsername();
    })
    usernameEle.val(randomUsername());
    updateUsername();
});

connect();