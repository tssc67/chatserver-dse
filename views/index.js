var ws;
function connect(){
    ws = new WebSocket(`ws://${document.location.host}`)
    ws.onopen = function(){
    }
}
function getList(callback){
    callback([
        {
          profile:"img/a.jpg",
          name:"The Last Group"
        },
        {
          profile:"img/b.jpg",
          name:"Node.js"
        }
    ])
}
$(function(){
    $('#usernameTextbox').on('input',function(){
        ws.send(JSON.stringify({hello:1}))
    })
});

connect();