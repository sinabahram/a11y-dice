"use strict";
var port = 3000;

var app = require('express')();
var bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/', function(req, res){
console.log('Got post request for player: '+req.body.playerName+' and room: '+req.body.roomName);
res.redirect('/roller?name='+playerName+'&roomName='+roomName);
});

app.get('/roller', function(req, res){
  res.sendFile(__dirname + '/roller.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(port, function(){
  console.log('listening on *:'+port);
});
      
