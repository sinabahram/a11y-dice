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

console.log('sending player names: '+playerNames+' to '+socket.handshake.address);
socket.emit('players', {playerNames: playerNames});

});

function onDisconnect(socket) {
if(!(socket.id in players))
return;

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
command = msg.command.trim();

console.log('in '+roomName+': onCommand from '+playerName+': '+command);

var matches = /(\d{1,2})[dD](\d{1,3})([+-]\d{1,3})?/.exec(command);
if(matches) {
//for(var i=0; i<matches.length; i++)
//console.log(i+': '+matches[i]+', '+typeof matches[i]);

if(parseInt(matches[1]) < 1) {
socket.emit('invalid', {reason: "Can't roll 0 dice"});
return;
}

var result = rollDice(matches[1], matches[2], matches[3]);
io.sockets.in(roomName).emit('results', {playerName: playerName, result: result, command: command});
}
else
socket.emit('invalid', {reason: 'Invalid dice roll command'});
}

function rollDice(numDice, sides, modifier) {
var result = "(", total=0;
var flag = false;
for(var i=0; i<numDice; i++) {
if(flag)
result += ", ";

var val = getRandomIntInclusive(1, sides);
result += val;
total += val;
flag = true;
}

if(modifier) {
var mod = 1;
if(modifier.substr(0,1) == '-') {
mod = -1;
}

total += mod*parseInt(modifier.substr(1));
}

result += ") = "+total;
return result;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

http.listen(port, function(){
  console.log('listening on *:'+port);
});
      
