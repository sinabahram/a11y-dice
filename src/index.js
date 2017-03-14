"use strict";
var port = 3000;

var players = {};

var app = require('express')();
var bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('view engine', 'ejs');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.render('index');
});

app.post('/roller', function(req, res){
var roomName = req.body.roomName,
playerName = req.body.playerName;

  res.render('roller', {
roomName: roomName,
playerName: playerName
});
});

io.on('connection', function(socket){
socket.on('disconnect', function() { onDisconnect(socket);});
socket.on('join', function(msg) { onJoin(socket, msg);});
socket.on('command', function(msg) { onCommand(socket, msg);});

var playerNames = [];
for(var id in players) {
playerNames.push(players[id].playerName);
}

console.log('sending player names: '+playerNames);
socket.emit('players', {playerNames: playerNames});
});

function onDisconnect(socket) {
console.log(players[socket.id].playerName+' left '+players[socket.id].roomName);
io.sockets.in(players[socket.id].roomName).emit('leave', {playerName: players[socket.id].playerName});
delete players[socket.id];
};

function onJoin(socket, msg) {
console.log(msg.playerName+' joined '+msg.roomName);
socket.join(msg.roomName);
io.sockets.in(msg.roomName).emit('join', msg);

players[socket.id] = {socket: socket};
players[socket.id].playerName = msg.playerName;
players[socket.id].roomName = msg.roomName;
}

function onCommand(socket, msg) {
var playerName = msg.playerName,
roomName = msg.roomName,
command = msg.command;

console.log('in '+roomName+': onCommand from '+playerName+': '+command);

var result = "5";
io.sockets.in(roomName).emit('results', {playerName: playerName, result: result});
}

http.listen(port, function(){
  console.log('listening on *:'+port);
});
      
