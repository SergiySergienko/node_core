//
// This file should contains shared between client and server Game Session (World) State
// and objects manipulation functions
//
var GameSession = function() { 
	
	this.last_update_time = new Date().getTime();
	this.server_render_time = 0;
	this.client_render_time = 0;
	this.max_players_per_game = 2;
	this.max_pack_time_difference = 100; // This is maximum MS difference between two snapshots

	this.current_seq = 0;
	this.server_current_seq = 0;
	this.last_input_seq = 0;

	this.local_history = [];
	this.server_pendings = [];

	this.players = [];
	this.bullets = [];
	this.game_entities = [];
	this.gid = '';
	this.core_instance = new Core();
	this.current_player_link = false;
	
};

GameSession.world_width = 640;
GameSession.world_height = 480;

GameSession.prototype.increment_seq = function() {
	this.current_seq += 1;
	return this.current_seq;
};

GameSession.prototype.current_player = function() {
	if (this.current_player_link) {
		return this.current_player_link;
	}
	var player_id = current_pid;
	
	var p_arr = this.players.filter(function(obj) {
		if (obj.id == player_id) {
			return true;
		}
		return false;
	});

	this.current_player_link = p_arr[0];
	
	return this.current_player_link;
};

GameSession.prototype.delete_player = function(player_id) {
	this.players = this.players.filter(function(obj) {
		if (obj.id == player_id)
			return false
		return true
	});
	return this;
};

GameSession.prototype.get_free_places = function() {
	return (this.players.length >= this.max_players_per_game ? 0 : (this.max_players_per_game - this.players.length));
};

GameSession.prototype.add_player = function(player_data) {
	this.players.push(player_data);
	return this.players;
};

GameSession.prototype.add_box = function(box_data) {
	this.game_entities.push(box_data);
	return this.game_entities;
};

GameSession.prototype.add_entity = function(entity_type, entity_data) {
	this.game_entities.push(entity_data);
	return this.game_entities;
};

//
// This function should return class instance of Player class
//
GameSession.prototype.init_new_player = function(socket) {
	var player = new Player();
	
	player.id = socket.id;
	player.socket = socket;
	player.name = "John";
	player.x = 0;
	player.y = 0;
	player.a = 0;

	return player;
};


GameSession.prototype.to_pack = function() {
	var data = [this.current_seq, this.players.length, this.server_render_time, new Date().getTime()];
	for (var player of this.players) {
		data.push([player.id, player.x, player.y, player.a]);
	}
	return JSON.stringify(data);
};

GameSession.prototype.parse_pack = function(gs_data) {
	var result = {};
	var data = JSON.parse(gs_data);
	
	result.seq = parseInt(data[0]);
	result.players_len = parseInt(data[1]);
	result.server_render_time = parseInt(data[2]);
	result.pack_time = parseInt(data[3]);
	result.players = [];
	
	for (var i = 0; i <= result.players_len-1; i ++) {
		var p_data = data[4+i];
		
		var player = this.init_new_player({ id: p_data[0] });
		player.x = p_data[1];
		player.y = p_data[2];
		player.a = p_data[3];
		result.players.push(player);
	}
	
	return result;
};

GameSession.prototype.apply_from_pack = function(gs_data) {
	var data = this.parse_pack(gs_data);	
	
	this.server_render_time = data.server_render_time;
	
	this.players = data.players;
	
	return this;
};

GameSession.prototype.apply_next_pendings = function() {

	for (var i=0; i <= this.server_pendings.length-1; i++) {
		var pending = this.server_pendings[i];

		var player = this.get_player_by_id(pending.pid);
		var new_points = this.core_instance.input_to_points(player, pending.i);
		this.server_pendings.splice(0, (i - (-1)));
	}
	
	return this;
};

GameSession.prototype.get_player_by_id = function(player_id) {
	result = false;
	
	var indx = -1;
	for (var i=0; i <= this.players.length-1; i++) {
		if (this.players[i].id == player_id) {
			indx = i;
			break;
		}
	}
	
	if (indx != -1) {
		result = this.players[indx];
	}
	return result;
};

//
// This method call each client's requestAnimationFrame call !!! Be careful with it 
// (any changes in this method will low down your FPS)
// It should get last known postition from server, compare it with last postition from local history,
// And make smooth fixes if need.
// Than cleanup old pendings data
//
GameSession.prototype.client_proceed_pendings = function() {
	
	var current_client_seq = this.current_seq;
	var last_server_snapshot = this.server_pendings[this.server_pendings.length-1];
	var actual_snapshot = null;

	if (last_server_snapshot) {

		var server_seq = last_server_snapshot.seq;
		var next_local_snapshot = '';
		var local_seq_indx = -1;

		
		// Find last received server's seq in local snapshots history
		for (var i=0; i <= this.local_history.length-1; i++) {
			if (parseInt(this.local_history[i].s) == parseInt(server_seq)) {
				local_seq_indx = i;
				break;
			}
		}
		if (local_seq_indx != -1) {
			// Cleanup old (already processed by server) pendings
			var number_to_clear = Math.abs(local_seq_indx - (-1));
			this.local_history.splice(0, number_to_clear);
		}

		actual_snapshot = last_server_snapshot;
		

		for (var i=0; i <= last_server_snapshot.players.length-1; i++) {
			var player_data = last_server_snapshot.players[i];
			
			if (current_pid == player_data.id) {
				// THIS IS PREDICTIONS FOR LOCAL PLAYER ONLY
				//
				// if local history has snapshots after cleanup
				// This is client's preddictions implementation
				// We used every next after server's processed snapshot from local history
				// as thrully right, and we make coords smooth changes
				
				// if (this.local_history[0]) {
				// 	var local_snapshot = this.local_history[0];
				// 	if (parseInt(local_snapshot.s) == parseInt(server_seq)+1) {
				// 		// We didnt loose any packets yet, everithing is OK
				// 		// actual_snapshot = last_server_snapshot;

				// 		// this.current_player.set_new_pos(player_data.x, player_data.y, player_data.a);

				// 		// console.log("This is true next snapshot:", local_snapshot, last_server_snapshot);
				// 	}
				// 	else {
				// 		// This is not next snapshot, something went wrong
				// 		// We should compare those packs timestamps to max difference

				// 		if ((last_server_snapshot.pack_time - local_snapshot.s) > this.max_pack_time_difference) {
				// 			// OMG the time diff is too match, seems we loose a lot of packets
				// 			// roll back to last servers processed snapshot, becouse server is allways Right :)
				// 			// actual_snapshot = last_server_snapshot;

				// 			this.current_player().set_pos(player_data.x, player_data.y, player_data.a);

				// 			// console.log("Fuck:", local_snapshot, last_server_snapshot);
				// 		} 
				// 		else {
				// 			// Ok, everithing is not so bad ))
				// 			// reset position to data from snapshot
				// 			// this.current_player().set_new_pos(player_data.x, player_data.y, player_data.a);

				// 			// actual_snapshot = last_server_snapshot;
				// 			// console.log("Unknown snapshot:", actual_snapshot, this.current_seq);
				// 		}
				// 	}
				// }
				// else {
				// 	// We have no data in local history but server sent us some changes
				// 	// other players movement etc.
				// 	this.current_player().set_pos(player_data.x, player_data.y, player_data.a);
				// }

				this.current_player().set_pos(player_data.x, player_data.y, player_data.a);
				
			}
			else {
				if (this.get_player_by_id(player_data.id)) {
					this.get_player_by_id(player_data.id).set_pos(player_data.x, player_data.y, player_data.a);
				} 
				else {
					this.add_player(player_data);
					this.get_player_by_id(player_data.id).set_pos(player_data.x, player_data.y, player_data.a);
				}
			}
		}

		// Set current snapshot index to last actual
		// if (actual_snapshot) {
			this.current_seq = last_server_snapshot.seq;
			this.server_render_time = last_server_snapshot.server_render_time;
		// }

		this.server_current_seq = server_seq; // Save last server processed for debug
		
		// Cleanup server's pendings
		local_seq_indx = -1;
		for (var i=0; i <= this.server_pendings.length-1; i++) {
			if (parseInt(this.server_pendings[i].seq) == parseInt(this.current_seq)) {
				local_seq_indx = i;
				break;
			}
		}
		if (local_seq_indx != -1) {
			// Cleanup old (already processed by server) pendings
			number_to_clear = Math.abs(local_seq_indx - (-1));
			this.server_pendings.splice(0, number_to_clear);
		}
		// this.server_pendings.splice(0, this.server_pendings.length-1);
	}
	return true;
};

//
// Delegate this method to Core module
//
GameSession.prototype.server_handle_client_input = function(packet_data, player_id) {
	return this.core_instance.server_handle_client_input.call(this, packet_data, player_id);
};

GameSession.prototype.client_handle_server_snapshot = function(packet_data) {
	return this.core_instance.client_handle_server_snapshot.call(this, packet_data);
};

GameSession.prototype.analyze_collisions = function() {
	if (this.players.length) {
		for (var i=0; i <= this.players.length-1; i++) {
			
			if (this.players[i].x >= GameSession.world_width) {
				this.players[i].x = GameSession.world_width;
			}
			if (this.players[i].x <= 0) {
				this.players[i].x = 0;
			}
			if (this.players[i].y >= GameSession.world_height) {
				this.players[i].y = GameSession.world_height;
			}
			if (this.players[i].y <= 0) {
				this.players[i].y = 0;
			}

		}
	}
};

GameSession.prototype.inc_barrel_angle = function() {
	if (this.players.length) {
		for (var i=0; i <= this.players.length-1; i++) {			
			if (this.players[i].a < 360) {
				this.players[i].a += Player.barrel_rotation_speed;
			}
			else {
				this.players[i].a = 0;
			}
		}
	}
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.GameSession = global.GameSession = GameSession;
}