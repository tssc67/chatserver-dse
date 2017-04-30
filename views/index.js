var ws;
function connect(){
    ws = new WebSocket(`ws://${document.location.host}`)
    ws.onopen = function(){
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

}
function deleteGroup(){
    
}
function sendMessage(){

}
$(function(){
    $('#usernameTextbox').on('input',function(){
        sendAction('hi',$(this).val());
    })
});

connect();