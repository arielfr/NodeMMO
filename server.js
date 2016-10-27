var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });
var fs = require('fs');

server.listen('9000');

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));

//Main page of the server
app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
});

//Player List
var players = {};

io.sockets.on('connection', function(socket){
	//Detect socket when you connect
	socket.on('connect', function(data){
		//Save player on the Array
		players[data.nickname] = new Player(data.nickname, data.y, data.x, socket.id);

		//Send broadcast of connection
		socket.broadcast.emit('user_connect', {'nickname' : data.nickname, 'y' : data.y, 'x' : data.x});

		log('Connecting: ' + data.nickname);
	})

	//Detect player movement and update the player
	socket.on('player_move', function (data){
		players[data.nickname].y = data.y;
		players[data.nickname].x = data.x;
	});

	//Detect the Disconnection
	socket.on('disconnect', function(){
		for (key in players){
			if( players[key].socketId  == socket.id){
				log('Disconnecting: ' + key);
				
				//Send broadcast of disconnection
				socket.broadcast.emit('user_disconnect', {'nickname' : players[key].nickname});

				delete players[key];
			}
		}
	})

	//Game Loop
	setInterval(function(){
		socket.emit('players_position', players);
	}, 30);

});

//Player Class
function Player (nickname, y, x, socketId){
	this.nickname = nickname;
	this.y = y;
	this.x = x;
	this.socketId = socketId;
}

function log(logMessage){
	console.log(logMessage);
}
