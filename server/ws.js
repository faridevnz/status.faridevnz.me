import express from 'express';
import { WebSocketServer } from 'ws';


var connectedUsers = [];

//init Express
var app = express();

//init Express Router
var port = 5555;

//return static page with websocket client
app.get('/', function(req, res) {
  res.send('hello');
});

var server = app.listen(port, function () {
    console.log('node.js static server listening on port: ' + port + ", with websockets listener")
})

const wss = new WebSocketServer({ server });

//init Websocket ws and handle incoming connect requests
wss.on('connection', function connection(ws) {
    console.log("connection ...");
    //on connect message
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        connectedUsers.push(message);
    });
    ws.send('message from server at: ' + new Date());
});