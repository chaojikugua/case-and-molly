#!/usr/bin/env node
// Socket part
var port = process.env.PORT || 5000
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: port});
console.log('http server listening on %d', port);

var pingInterval = 1000; //ms
var clients = [];

wss.on('connection', function(ws) {
	console.log("socket connection");
    ws.on('message', function(message) {
    	if(message == "join"){
            console.log("joined: " + clients.length);
    		clients.push(ws);
    	} else if(message == "ping"){
            console.log("== ping received");
        } else {
            try{
                console.log(message);
                msg = JSON.parse(message);

                for(var i = 0; i< clients.length; i++){
                    clients[i].send(JSON.stringify(msg), function(error){
                        if(error){
                            console.log(error + " removing.");
                            clients.splice(i,1);
                        }
                    });
                }
            } catch(e){
                console.log("ERROR:" + e.message);
            }
        }   
    });
    ws.on('error', function(reason, code) {
        console.log('socket error: reason ' + reason + ', code ' + code);
    });
});
// ping all clients
var lastPing = 0;
setInterval(function(){
    thisPing = Date.now();
    console.log("ping interval: " + (thisPing - lastPing) + " " + clients.length + " clients");
    for(var i = 0; i< clients.length; i++){
        clients[i].send("{\"ping\": " + Date.now() + "}", function(error){
            if(error){
                console.log(error + " removing.");
                clients.splice(i,1);
            }
        });
    }
    lastPing = thisPing;
}, pingInterval);
