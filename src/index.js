"use strict";
var port = 3000;

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

console.log('Got post request for /roller with player: '+playerName+' and room: '+roomName);
  res.render('roller', {
roomName: roomName,
playerName: playerName
});
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(port, function(){
  console.log('listening on *:'+port);
});
      
