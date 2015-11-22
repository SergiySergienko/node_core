//
// This file contains game rooms/hosts management functions
// and user's join/delete flow
//
var UUID = require('node-uuid');
require("./core/player.js");
require("./core/core.js");
require("./shared/game_session.js");

module.exports = {
	games: {},
	games_count: 0,
	intervals: {},
	physic_call_period_ms: Core.physics_update_period, // run server world for 66 fps
	broadcast_call_period_ms: Math.round(1000/4), // run server world for 45 fps
	inc_seq_interval_ms: 1000,
	max_players_per_game: 2,

	find_game: function(socket) {
		var game;
		var need_to_create_new = false;
		
		if (this.games_count > 0) {
			for (var key in this.games) {

				var tmp_game = this.games[key];
				
				if (tmp_game.get_free_places() <= 0) {
					// This room has no free places
					need_to_create_new = true;
				}
				else {
					// This room has free places
					need_to_create_new = false;
					game = this.join_game(tmp_game, tmp_game.init_new_player(socket));
					break;
				}
			}
		} 
		else {
			need_to_create_new = true;
		}
		if (need_to_create_new) {
			game = this.create_game();
			game = this.join_game(game, game.init_new_player(socket));
		}

		return game;
	},
	join_game: function(game, player) {
		game.add_player(player);
		player.socket.emit('s.j', game.to_pack()); // Server.Join send joined game Id 
		return game;
	},
	create_game: function() {
		var curr_game = new GameSession();
		curr_game.gid = UUID();
		this.games[curr_game.gid] = curr_game;
		this.games_count += 1;

		this.run_game_world(curr_game);

		console.log("New game created", curr_game.gid);
		
		return curr_game;
	},
	run_game_world: function (game_instance) {
		var physics_interval = setInterval(function() {
													this.server_animation_frame(game_instance);
												}.bind(this), this.physic_call_period_ms);

		var broadcast_interval = setInterval(function() {
													this.broadcast_clients_data(game_instance);
												}.bind(this), this.broadcast_call_period_ms);

		var seq_interval = setInterval(function() {
													game_instance.increment_seq();
													this.send_seq_data(game_instance);
												}.bind(this), this.inc_seq_interval_ms);

		this.intervals[game_instance.gid] = [physics_interval, broadcast_interval, seq_interval];
		return true;
	},
	send_seq_data: function (game_instance) {
		for (player of game_instance.players) {
			player.socket.emit('s.s', game_instance.current_seq);
		}
		return true;
	},
	server_animation_frame: function(game_instance) {
		var curr_time = new Date().getTime();

		this.analyze_inputs(game_instance);

        game_instance.server_update_physics();

        game_instance.inc_barrel_angle();

		game_instance.analyze_collisions();

        game_instance.server_render_time = (curr_time - game_instance.last_update_time); // calc server lag time
        game_instance.delta_t = (game_instance.server_render_time/1000);

        //console.log(game_instance.delta_t);

        game_instance.last_update_time = new Date().getTime(); // refresh last server render time
        //console.log("Finished in", (game_instance.last_update_time - curr_time));
		return true;
	},
	broadcast_clients_data: function (game_instance) {

        game_instance.local_history[game_instance.current_seq.toString()] = game_instance.to_pack(true);
		this.send_snapshot(game_instance);

		return true;
	},
	send_snapshot: function(game_instance) {
		var server_pack = game_instance.to_pack();
		for (var player of game_instance.players) {
			player.socket.emit('s.u', server_pack);
		}
	},
	analyze_inputs: function(game_instance) {
        var seq_to_delete = game_instance.current_seq-2;

        if (game_instance.local_history.hasOwnProperty(seq_to_delete.toString())) {
            delete(game_instance.local_history[seq_to_delete.toString()]);
        }

		if (game_instance.server_pendings.length) {
			
			var seq_index = -1;
			for (var i=0; i <= game_instance.server_pendings.length-1; i++) {
				var pending_pack = game_instance.server_pendings[i];

                if ((seq_to_delete) == parseInt(pending_pack.s)) {
					seq_index = i;
				}
				if (game_instance.current_seq == parseInt(pending_pack.s)) {
					break;
				}
			}
			// Delete old pendings
			if (seq_index != -1) {
				var number_to_clear = Math.abs(seq_index - (-1));
				game_instance.server_pendings.splice(0, number_to_clear);
			}

			if (game_instance.server_pendings.length) {
				game_instance.apply_pendings(game_instance.current_seq-1);
			}
		}
	}
};

