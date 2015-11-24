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
	this.core_instance = new Core();
	this.current_player_link = false;
	this.delta_t = 0;

    this.physics_timer;
    this.broadcast_timer;
    this.seq_inc_timer;

    this.show_debug = false;
	
};

GameSession.world_width = 640;
GameSession.world_height = 480;
GameSession.bullet_fly_max_length = 350;
GameSession.bullet_fly_speed = 0.5;

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
	player.x = 50;
	player.y = 50;
	player.a = 0;

	return player;
};


GameSession.prototype.to_pack = function(not_stringify) {
	var data = [this.current_seq, this.players.length, this.server_render_time, new Date().getTime()];
	for (var player of this.players) {
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
		
		// this is bullet coords
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
	
	return this;
};

// Server method
// Analyze inputs and run simple algorithms
GameSession.prototype.apply_pendings = function(seq_to_apply) {

	var i = 0;
    for (pending of this.server_pendings) {
		//var pending = this.server_pendings[i];

		if (parseInt(pending.s) == parseInt(seq_to_apply)) {

            var player = this.get_player_by_id(pending.pid);


            //var new_points = this.core_instance.input_to_points(player, pending.i);

            var arr = pending.i.split("-");
            var bullet_data;

            if (arr.indexOf("f") != -1 && !player.is_moving()) {
                var old_data = this.local_history[seq_to_apply.toString()];
                var old_p_data = { "x": 0, "y": 0, "a": 0 };
                for (var i=4; i <= old_data.length-1; i++) {

                    if (old_data[i][0] == pending.pid) {

                        old_p_data.x = old_data[i][1];
                        old_p_data.y = old_data[i][2];
                        old_p_data.a = old_data[i][3];

                        break;
                    }
                }

                bullet_data = this.core_instance.init_fly_vector(old_p_data.x, old_p_data.y, old_p_data.a, Player.radius);
                //var curr_dt = new Date().getTime();
                //var diff = (curr_dt - pending.t);
                //var p_diff = (curr_dt - old_data[3])
                //console.log("End vec is:", bullet_data);

                player.set_moving_pos(bullet_data.x, bullet_data.y);
                player.set_is_moving();

                //console.log(diff, p_diff, this.current_seq, old_data[0]);
                //this.add_bullet(pending.pid, bullet_data);
            }

            this.server_pendings.splice(i, 1);

        }
        i+=1;
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

GameSession.prototype.analyze_collisions = function() {
	if (this.players.length) {
        var need_stop = false;
        for (player_data of this.players) {
			
			if (player_data.x >= GameSession.world_width) {
                player_data.x = GameSession.world_width;
                need_stop = true;
            }
			if (player_data.x <= 0) {
                player_data.x = 0;
                need_stop = true;
            }
			if (player_data.y >= GameSession.world_height) {
                player_data.y = GameSession.world_height;
                need_stop = true;
            }
			if (player_data.y <= 0) {
                player_data.y = 0;
                need_stop = true;
            }
            if (need_stop) {
                player_data.set_moving_pos(0, 0);
                player_data.unset_is_moving();
            }
		}
	}
    return true;
};

GameSession.prototype.inc_barrel_angle = function() {
	if (this.players.length) {
        var offset = (Player.barrel_rotation_speed * this.delta_t).fixed();
        //console.log(this.delta_t);

        for (player_data of this.players) {
            if ((player_data.a + offset) >= 180) {
                player_data.a = 180;
                player_data.a *= -1;
            }
            player_data.a = (player_data.a + offset).fixed();

        }

	}
    return true;
};

GameSession.prototype.server_update_physics = function () {
    var move_speed = (Player.move_speed * this.delta_t);
    for (player_data of this.players) {
        if (player_data.is_moving()) {
            player_data.x = this.core_instance.lerp(player_data.x, player_data.fly_x, move_speed);
            player_data.y = this.core_instance.lerp(player_data.y, player_data.fly_y, move_speed);

            if (Math.round(player_data.x) == Math.round(player_data.fly_x) && Math.round(player_data.y) == Math.round(player_data.fly_y)) {

                player_data.set_moving_pos(0, 0);
                player_data.x = 50;
                player_data.y = 50;
                player_data.unset_is_moving();
            }
            //console.log(player_data.x, player_data.y, player_data.fly_x, player_data.fly_y);
        }
    }
    return true;
};


//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.GameSession = global.GameSession = GameSession;
}