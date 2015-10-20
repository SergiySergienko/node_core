var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var world = require("./js/server_world");
var verbose = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get( '/*' , function( req, res, next ) {
    var file = req.params[0];
    if(verbose) console.log('\t :: Express :: file requested : ' + file);
    res.sendFile( __dirname + '/' + file );

});

setInterval(function() {
	world.send_snapshot();
}, 100);



io.on("connection", function(socket){
	console.log("New user connected");

	var current_pid = socket.id;
	var new_player = world.add_player(current_pid, socket);

	// socket.emit('add_player', current_pid);
	// socket.emit('refresh_players', world.players);
	// socket.broadcast.emit('refresh_players', world.players);
	
	socket.on('disconnect', function() {
    	console.log('user disconnected');
    	world.delete_player(current_pid);
    	// socket.emit('delete_player', current_pid);
    	// socket.broadcast.emit('delete_player', current_pid);
  	});

	socket.on('update_player', function(msg){
		console.log('update_data: ', msg);
		world.update_player(msg.pid, msg);
		// socket.emit('update_player', msg);
		// socket.broadcast.emit('update_player', msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});