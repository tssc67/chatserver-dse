var http = require('http');
global.cfg = require('config');
global.failoverState = 'offline';
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var workers=[];


if(cluster.isMaster){
    console.log(cfg);
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
    console.log("Initializing Server");
    failoverState = 'initial';
    getRemoteFailoverState(0)
    .then(state=>{
        console.log(`Remote state : ${state}`);
        switch(state){
            case 'initial':
                runServer();
                return gossip(0,'run');
            case 'offline':
                return gossip(0,'start');
            case 'failover':
                return gossip(0,'replication_request')
                .then(()=>"replicating")
        }
    },errState=>{
        console.log("Remote server network is offline");
        console.log(errState);
        runServer();
        return 'failover';
    }) 
    .then(state=>{
        failoverState = state;
    })
}

function runServer(){
    workers.map(worker => worker.send('start'));
    console.log("Server is running");
}

function forkCluster(){
    for(let i = 0;i < numCPUs;++i){
        workers.push(cluster.fork());
    }
    cluster.on('exit',(worker,code,signal)=>{
        console. log(`worker ${worker.process.pid} died`);
    });
}

function gossipHandler(req,res){
    if(req.headers.password != cfg.gossip.password){
        res.statusCode = 403;
        return res.end("CHU!");
    }
    console.log(`Receiving message : ${req.headers.message}, state : ${failoverState}`);
    switch(req.headers.message){
        case undefined:
            break;
        case 'start':
            initialize();
            break;
        case 'run':
            failoverState = 'running';
            runServer();
            break;
        case 'replication_request':
            failoverState = 'sourcing';
            break;
    }
    res.end(failoverState);
}

function replicate(){
    return new Promise(function(resolve,reject){
        
    });
}

function getRemoteFailoverState(idx){
    return gossip(0,"");
    // return new Promise(function(resolve,reject){
    //     var req = 
    //     http.request({
    //         host:cfg.remote[idx],
    //         port:cfg.gossip.port,
    //         headers:{
    //             password:cfg.gossip.password
    //         }
    //     },function(res){
    //         res.on('data',data=>
    //             resolve(data.toString())
    //         );
    //     });
    //     req.on('error',(err)=>{reject('offline')})
    //     req.end();
    // });
}

function gossip(idx,msg){
    console.log(`Sending message : ${msg}`)
    return new Promise(function(resolve,reject){
        var req = http.request({
            host:cfg.remote[idx],
            port:cfg.gossip.port,
            headers:{
                message:msg,
                password:cfg.gossip.password
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