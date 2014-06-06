var cluster = require('cluster');
var os = require('os');
var http = require('http');

var PORT = 5050;
var numCPUs = 2;//os.cpus().length;

var workers = {};

if (cluster.isMaster) {
    cluster.on('disconnect', function (worker) {
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    for(var i=0; i < numCPUs; i++){
        var worker = cluster.fork();
        workers[worker.pid] = worker;
    }

}else{
    var staticFileServer = require('./app');
    staticFileServer.server.listen(PORT);
    console.log('[worker:%s] start listen on %s', process.pid, PORT);
}

process.on('SIGTERM', function () {
    for (var pid in workers) {
        process.kill(pid);
    }
    process.exit(0);
});