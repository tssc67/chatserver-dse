global.cfg = require('config');
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
