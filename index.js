var http = require('http');
global.cfg = require('config');
global.failoverState = 'unknown';
global.getRemoteFailoverState = function(){
    return new Promise(function(resolve,reject){

    });
}
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
if(cluster.isMaster){

    for(let i = 0;i<numCPUs;++i)
        cluster.fork();
    cluster.on('exit',(worker,code,signal)=>{
        console. log(`worker ${worker.pid} died`);
    });
} 
else{
    require('./app/main.js');
}
