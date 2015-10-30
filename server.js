var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var world = require("./server.world.js");
var verbose = false;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get( '/*' , function( req, res, next ) {
    var file = req.params[0];
    if(verbose) console.log('\t :: Express :: file requested : ' + file);
    res.sendFile( __dirname + '/' + file );
});

io.on("connection", function(socket) {
	console.log("New user connected");

	var joined_game = world.find_game(socket);

	socket.on('disconnect', function() {
    	console.log('user disconnected');
    	joined_game.delete_player(socket.id);
  	});

  	socket.on('c.i', function(msg) {
  		joined_game.server_handle_client_input(msg, socket.id);
	});

	socket.on('c.u', function(msg) {
		console.log('client shapshot received: ', msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});