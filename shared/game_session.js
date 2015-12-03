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

    this.last_applied_packet_time = 0;

	this.local_history = {};
	this.server_pendings = [];

	this.players = [];
	this.bullets = {};
	this.bullet_local_history = {};
	this.game_entities = [];
	this.gid = '';
	this.core_instance;
	this.current_player_link = false;
	this.delta_t = 0;

	this.current_map_data;

    this.physics_timer;
    this.broadcast_timer;
    this.seq_inc_timer;

    this.show_debug = false;
	
};

GameSession.world_width = 640;
GameSession.world_height = 480;
GameSession.bullet_fly_max_length = 350;
GameSession.bullet_fly_speed = 0.5;

GameSession.prototype.set_map_data = function(map_data) {
	this.current_map_data = map_data;
	return this;
};

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
    player_data.set_start_pos(player_data.x, (150 * (this.players.length + 1)), player_data.a);
    player_data.y = player_data.start_y;
	this.players.push(player_data);
	return this.players;
};

//
// This function should return class instance of Player class
//
GameSession.prototype.init_new_player = function(socket) {
	var player = new Player();
	
	player.id = socket.id;
	player.socket = socket;
	player.name = "John";
	player.x = 50;
	player.y = 50;
	player.a = 0;

	return player;
};


GameSession.prototype.to_pack = function(not_stringify) {
	var data = [this.current_seq, this.players.length, this.server_render_time, new Date().getTime()];

    data.push(this.current_map_data[0]);
	for (player of this.players) {
		data.push(player.to_pack());
	}
    if (not_stringify) {
        return data;
    }
	return JSON.stringify(data);
};

GameSession.prototype.parse_pack = function(gs_data) {
	var result = {};
	var data = JSON.parse(gs_data);
    var players_offset = 5;
	
	result.seq = parseInt(data[0]);
	result.players_len = parseInt(data[1]);
	result.server_render_time = parseInt(data[2]);
	result.pack_time = parseInt(data[3]);
    result.map_id = data[4];
	result.players = [];
	
	for (var i = 0; i <= result.players_len-1; i ++) {
		var p_data = data[players_offset+i];
		
		var player = this.init_new_player({ id: p_data[0] });
		player.x = p_data[1];
		player.y = p_data[2];
		player.a = p_data[3];
		
		// this is movement end coords
		if (p_data[4] && p_data[5]) {
			player.fly_x = p_data[4];
			player.fly_y = p_data[5];
		}

		result.players.push(player);
		
	}

	return result;
};

GameSession.prototype.apply_from_pack = function(gs_data) {
	var data = this.parse_pack(gs_data);	
	
	this.server_render_time = data.server_render_time;
	
	this.players = data.players;
    this.current_map_data = [data.map_id, map_manager_instance.get_map_data_by_id(data.map_id)];

    this.build_environment();
	
	return this;
};

// Server method
// Analyze inputs and run simple algorithms
GameSession.prototype.apply_pendings = function() {
    var pendings_len = this.server_pendings.length;
    var pendings_to_proceed = this.server_pendings.splice(0, (pendings_len >= Core.server_pending_per_frame ? Core.server_pending_per_frame : pendings_len));

    for (pending of pendings_to_proceed) {

        var player = this.get_player_by_id(pending.pid);

        var arr = pending.i.split("-");

        if (arr.indexOf("f") != -1 && !player.is_moving()) {

            var move_vector = this.core_instance.init_fly_vector(player.x, player.y, player.a, Player.radius);

            player.set_moving_pos(move_vector.x, move_vector.y);
            player.set_is_moving();

        }

        pendings_to_proceed.shift();
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

    var pending_data;

    if (this.server_pendings.length > 0) {

        for (var i=0; i <= this.server_pendings.length-1; i++) {
            pending_data = this.server_pendings[i];
            if ((this.current_seq - this.last_input_seq) >= 2) {
                this.last_input_seq = 0;
            }

            for (player_data of pending_data.players) {
                //var player_data = pending_data.players[a];

                if (player_data.id == current_pid) {

                    // This is current player data
                    if (this.last_input_seq > 0) { // Do we wait for server corrections ? yes - than correct position
                        if (parseInt(pending_data.seq) == parseInt(this.last_input_seq+1)) { // This is next seq after input ends
                            this.current_player().set_pos(player_data.x, player_data.y, player_data.a);
                            this.current_player().mark_as_updated();
                        }
                    }
                    else {
                        this.current_player().set_pos(player_data.x, player_data.y, player_data.a);
                        this.current_player().mark_as_updated();
                    }

                    if (player_data.fly_x && player_data.fly_y) {
                        this.current_player().set_moving_pos(player_data.fly_x, player_data.fly_y);
                        this.current_player().set_is_moving();
                    }
                    else {
                        this.current_player().set_moving_pos(0, 0);
                        this.current_player().unset_is_moving();
                    }

                }
                else {
                    // This is not current player, just set immediately new position
                    if (!this.get_player_by_id(player_data.id)) {
                        this.add_player(player_data);
                    }
                    var player = this.get_player_by_id(player_data.id);

                    player.set_pos(player_data.x, player_data.y, player_data.a);
                    player.mark_as_updated();

                    if (player_data.fly_x && player_data.fly_y) {
                        player.set_moving_pos(player_data.fly_x, player_data.fly_y);
                    }
                    else {
                        player.set_moving_pos(0, 0);
                        player.unset_is_moving();
                    }

                }

            }

            this.last_applied_packet_time = pending_data.pack_time;
            this.server_pendings.splice(i, 1);
        }
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

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.GameSession = global.GameSession = GameSession;
}