var groupListEle = $('#group-list');
var chatDisplayEle = $('#chat-display');
var unreadEleList = {};
var currentGroup;
function viewUpdateGroupList(groupList){
    groupListEle.empty();
    currentGroup = null;
    groupList.forEach((groupObj)=>{
        var groupEle = $(`<div class="group"></div>`);
        var unreadEle = $(`<span class="label label-primary">${groupObj.unreadCount}</span>`)
        var groupNameEle = $(`<span style="padding:1em">${groupObj.groupID}</span>`)

        groupEle.append(groupNameEle);
        groupEle.append(unreadEle);
        unreadEleList[groupObj.groupID]=unreadEle;
        groupListEle.append(groupEle)
        groupEle.click(function(){
            readMessages(groupObj.groupID);
        })
    });
}
function viewUpdateGroupUnreadCount(noti){
    if(noti.groupID == currentGroup)readMessages(noti.groupID);
    else unreadEleList[noti.groupID].text(noti.unreadCount);
}
function viewUpdateChatDisplay(messages){
    currentGroup = messages.groupID;
    chatDisplayEle.empty();
    unreadEleList[currentGroup].text(0);
    messages.messages.forEach(function(message){
        message = JSON.parse(message);
        var time = new Date(message.timestamp);
        var messageEle = $(`<div></div>`)
        messageEle.append($(`<div style="padding:0 0.5em;">${message.userID} ${time.toString()}</div>`))
        messageEle.append($(`<div style="padding:0 0.5em 1em 0.5em"><div style="background:#eee;padding:0.5em">${message.message}</div></div>`))
        chatDisplayEle.append(messageEle);
    })
}