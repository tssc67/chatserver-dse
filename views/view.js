var groupListEle = $('#group-list');
var unreadEleList = {};
function viewUpdateGroupList(groupList){
    groupListEle.empty();
    groupList.forEach((groupObj)=>{
        var groupEle = $(`<div class="group"></div>`);
        var unreadEle = $(`<span class="label label-primary">${groupObj.unreadCount}</span>`)
        var groupNameEle = $(`<span style="padding:1em">${groupObj.groupID}</span>`)

        groupEle.append(groupNameEle);
        groupEle.append(unreadEle);
        unreadEleList[groupObj.groupID]=unreadEle;
        groupListEle.append(groupEle)
        groupEle.click(function(){
            console.log(groupObj);
        })
    });
}