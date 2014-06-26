var mongodbPool = require('../db');
var ObjectID = require('mongodb').ObjectID;
var Grid = require('mongodb').Grid;

global['bufferSize'] = 20;
global['mediaData'] = []; 

exports.index = function(req, res){
    var data = findInBuffer(req.params.fileid);
    if(data){
        return res.send(data);
    }else{
        mongodbPool.acquire(function(err,db){
            if(err){
                return res.json(400,err);
            }
            var grid = new Grid(db, 'fs');
            try{
                var id = new ObjectID(req.params.fileid);
            }catch(e){
                return res.json(400,{'err':'wrong id format'});
            }
            grid.get(id,function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return res.json(400,err);
                }
                if(doc){
                    updateBuffer(req.params.fileid, doc);
                    return res.send(doc);
                }else{
                    return res.send('None');
                }
            });
        });
    }
};
exports.clearBuffer = function(){
    if(global['mediaData'].length > global['bufferSize']/2){
        for(var i=0; i<global[mediaData].length/2; i++)
            global['mediaData'].pop();
    }
}
var findInBuffer = function(id, callback){
    for (var i = global['mediaData'].length; i > 0; i--) {
        if(global['mediaData'][i-1].hasOwnProperty(id)){
           return global['mediaData'][i-1][id];
        }
    }
    return null;
};

var updateBuffer = function(id, data){
    if(global['mediaData'].length >= global['bufferSize']){
        global['mediaData'].pop();
    }
    var newMedia = {};
    newMedia[id] = data;
    global['mediaData'].push(newMedia);
}
