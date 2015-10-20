var Player = require ("./player");
var players = {};
var sockets = {};

module.exports = {
	add_player: function(id, socket) {
		var new_player = new Player(id);
		players[id.toString()] = new_player;
		sockets[id.toString()] = socket;
		return new_player;
	},
	delete_player: function(pid) {
		delete(players[pid.toString()]);
		delete(sockets[pid.toString()]);
		return players;
	},
	update_player: function(pid, data) {
		players[pid.toString()] = data;
		console.log("UPD:", players[pid.toString()]);
		return players[pid.toString()];
	},
	send_snapshot: function() {
		for(key in sockets) {
			var socket = sockets[key];
			var data = players;
			socket.emit('server_update', data);
		}
	}
};

module.exports.players = players;