var http = require('http');
global.cfg = require('config');
global.failoverState = 'offline';
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var workers[];

console.log(cfg);

if(cluster.isMaster){
    forkCluster();
    var gossipServer = http.createServer(gossipHandler)
    gossipServer.listen(cfg.gossip.port);
}  

else{
    //Application Logic start here
    var main = require('./app/main.js');
    process.on('message',function(msg){
        switch(msg){
            case 'start':
                main.start();
                break;
        }
    })
} 

function initialize(){

}

function runServer(){
    workers.map(worker => worker.send('start'));
}

function forkCluster(){
    for(let i = 0;i < numCPUs;++i){
        workers.push(cluster.fork());
    }
    cluster.on('exit',(worker,code,signal)=>{
        console. log(`worker ${worker.pid} died`);
    });
}

 function gossipHandler(req,res){
    switch(req.headers.message){
        case undefined:
            break;
        case 'start':
            initialize();
            break;
        case 'run':
            failoverState = 'initial';
            runServer();
            break;
    }
    res.end(failoverState);
 }

 function getRemoteFailoverState(idx){
     console.log(`getting state`);
    return new Promise(function(resolve,reject){
        var req = 
        http.request({
            host:cfg.remote[idx],
            port:cfg.gossip.port
        },function(res){
            res.on('data',data=>
                resolve(data.toString())
            );
        });
        req.on('error',(err)=>{reject('offline')})
        req.end();
    });
}

function sendRemoteFailoverState(idx,msg){
    console.log(`sending state`);
    return new Promise(function(resolve,reject){
        var req = http.request({
            host:cfg.remote[idx],
            port:cfg.gossip.port,
            headers:{
                message:msg
            }
        },function(res){
            res.on('data',data=>
                resolve(data.toString())
            );
        });
        req.on('error',(err)=>{
            console.log(err);
            reject('network_offline')}
        );
        req.end();
    });
}