
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags:'a'});
var domainMiddleware = require('./lib/domain.js');

var server = http.createServer();
var app = express();

app.use(domainMiddleware({
    server:server,
    killTimeout: 30000
}));

// all environments
app.set('port', process.env.PORT || 5050);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.logger({stream:accessLogfile}));
app.use(function(err, req, res, next){
    var meta = '['+ new Date() +']' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
});

setInterval(routes.clearBuffer,10800000); //10800000三小时清理缓存数组


app.get('/:fileid', routes.index);

server.on('request', app);
if(!module.parent) {
    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}
exports.server= server;
exports.app = app;
