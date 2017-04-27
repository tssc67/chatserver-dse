var cfg = require('config');
var http = require('http');
http.request({
    host:"127.0.0.1", 
    port:cfg.web.port,
    path:"/auth/create",
    headers:{
        password:cfg.gossip.password,
    }
},(res)=>{
    res.on('data',data=>console.log(data.toString()))
}).end();