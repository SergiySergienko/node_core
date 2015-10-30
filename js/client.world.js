var Client = function () {
	this.game_ui = '';
	this.game_width = 640;
	this.game_height = 480;
	this.max_pixels_num_to_jump = 100;
};

Client.prototype.init_ui = function () {
	this.game_ui = new Phaser.Game(this.game_width, this.game_height, Phaser.AUTO, 'game', this);
};

Client.prototype.redraw_debug_info = function() {
	if (current_session.server_render_time != 0)
		this.server_lag_text.setText("serv lag: " + current_session.server_render_time + " ms");
	if (current_session.client_render_time != 0)
		this.client_lag_text.setText("client lag: " + current_session.client_render_time + " ms");
	if (this.game.fps != 0)
		this.fps_text.setText("FPS: " + this.game.time.fps);	
};

Client.prototype.preload = function () {
	console.log("Inside preload");
	this.game.time.advancedTiming = true;
};

Client.prototype.create = function () {
	console.log("Inside create");
	this.game.stage.disableVisibilityChange = true;

	this.players_mapping = {};
	this.delta_t = 0;

	this.server_lag_text = this.game.add.text(10, 10, 'serv lag: 0 ms', { fill: '#ffffff', fontSize: '11px' });
	this.client_lag_text = this.game.add.text(100, 10, 'client lag: 0 ms', { fill: '#ffffff', fontSize: '11px' });
	this.fps_text = this.game.add.text(200, 10, 'FPS: 0', { fill: '#ffffff', fontSize: '11px' });
	// var t = setInterval(function () { current_session.client_proceed_pendings(); }.bind(this), 200);
};

Client.prototype.update = function () {
	this.delta_t = (1/this.game.time.elapsed).fixed();
	this.redraw_debug_info();
	var new_pos = current_session.core_instance.client_handle_input.call(this);
	this.add_missing_players();

	current_session.client_proceed_pendings();

	this.redraw_players(this.delta_t);

	if (new_pos.x != 0 || new_pos.y != 0) {
		if (this.players_mapping[current_pid]) {
			this.players_mapping[current_pid].x += new_pos.x;
			this.players_mapping[current_pid].y += new_pos.y;

			// var new_x = (this.players_mapping[current_pid].x + new_pos.x);
			// var new_y = (this.players_mapping[current_pid].y + new_pos.y);
			// this.players_mapping[current_pid].x = current_session.core_instance.lerp(this.players_mapping[current_pid].x, new_x, this.delta_t);
			// this.players_mapping[current_pid].y = current_session.core_instance.lerp(this.players_mapping[current_pid].y, new_y, this.delta_t);
		}
	}

	

};

Client.prototype.render = function () {
	this.update_client_lag_info();
};

Client.prototype.add_missing_players = function () {
	if (current_session.players.length) {
		for (var i=0; i <= current_session.players.length-1; i++) {
			var p_data = current_session.players[i];

			if (!this.players_mapping[p_data.id]) {
				var p_text = this.game.add.text(p_data.x, p_data.y, 'P: ' + p_data.id, { fill: '#ffffff' });
				this.players_mapping[p_data.id] = p_text;
				this.players_mapping[p_data.id]["is_moving"] = false;
			}
		}
	}
	return true;
};

Client.prototype.redraw_players = function (delta_t) {
	if (current_session.last_input_seq > current_session.server_current_seq || current_session.server_current_seq < current_session.current_seq) {
		// console.log("Server last seq:", current_session.server_current_seq, current_session.last_input_seq, current_session.current_seq);
		return true;
	}
	
	if (current_session.players.length) {
		for (var i=0; i <= current_session.players.length-1; i++) {
			var p_data = current_session.players[i];

			// console.log(p_data.id, p_data.x, p_data.y, this.players_mapping[p_data.id].x, this.players_mapping[p_data.id].y);

			if (this.players_mapping[p_data.id]) {

				if (Math.round(p_data.x) != Math.round(this.players_mapping[p_data.id].x) || Math.round(p_data.y) != Math.round(this.players_mapping[p_data.id].y)) {
					
					if (Math.abs(Math.round(p_data.x) - Math.round(this.players_mapping[p_data.id].x)) >= this.max_pixels_num_to_jump ||
						Math.abs(Math.round(p_data.y) - Math.round(this.players_mapping[p_data.id].y)) >= this.max_pixels_num_to_jump) 
					{
						// Hard Set position if difference is too much
						this.players_mapping[p_data.id].is_moving = true;
						this.players_mapping[p_data.id].x = p_data.x;
						this.players_mapping[p_data.id].y = p_data.y;
					} 
					else {
						// Else interpolate to target point
						this.players_mapping[p_data.id].is_moving = true;
						this.players_mapping[p_data.id].x = current_session.core_instance.lerp(this.players_mapping[p_data.id].x, p_data.x, 4 * delta_t);
						this.players_mapping[p_data.id].y = current_session.core_instance.lerp(this.players_mapping[p_data.id].y, p_data.y, 4 * delta_t);
					}
					

					// this.players_mapping[p_data.id].x = p_data.x;
					// this.players_mapping[p_data.id].y = p_data.y;

					// console.log("Move !!!:", p_data.id, this.players_mapping[p_data.id].x, this.players_mapping[p_data.id].y, p_data.x, p_data.y);
				}
				else {
					this.players_mapping[p_data.id].is_moving = false;
				}
			}

		}
	}
};

Client.prototype.update_client_lag_info = function () {
	var current_time = new Date().getTime();
	current_session.client_render_time = (current_time - current_session.last_update_time);
	current_session.last_update_time = new Date().getTime();
};