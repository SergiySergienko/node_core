var Client = function () {
    this.game_ui = '';
    this.game_width = GameSession.world_width;
    this.game_height = GameSession.world_height;
    this.max_pixels_num_to_jump = 100;
    this.bullet_runned = false;
    this.world_already_drawed = false;

    this.physics_update_interval;
};

Client.prototype.init_ui = function () {
    // We should use CANVAS only for fu**ing windows operations systems
    this.game_ui = new Phaser.Game(this.game_width, this.game_height, Phaser.CANVAS, 'game', this);
};

Client.prototype.redraw_debug_info = function() {
    if (current_session.server_render_time != 0)
        this.server_lag_text.setText("serv lag: " + current_session.server_render_time + " ms");
    if (current_session.client_render_time != 0)
        this.client_lag_text.setText("client lag: " + current_session.client_render_time + " ms");
    if (this.game.fps != 0)
        this.fps_text.setText("FPS: " + this.game.time.fps);

    this.some.setText(current_session.server_pendings.length.toString());

};

Client.prototype.preload = function () {
    console.log("Inside preload");
    this.game.time.advancedTiming = true;
    this.game.load.image('bg', '/images/bg.png');
    this.game.load.image('player', '/images/player.png');

    this.game.load.image('mushroom', 'images/mushroom2.png');
    this.game.load.image('ball', 'images/ball.png');
    this.game.load.spritesheet('button', 'images/button_sprite_sheet.png', 193, 71);
};

Client.prototype.create = function () {
    console.log("Inside create");
    this.game.stage.disableVisibilityChange = true;

    // scale canvas x2
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // set game world and tile background
    this.add.tileSprite(0, 0, 1520, 500, 'bg');
    this.world.setBounds(0, 0, 1520, 500);

    this.players_mapping = {};
    this.bodies_mapping = {};

    this.delta_t = 0;
    this.some = this.game.add.text(300, 10, 'serv lag: 0 ms', { fill: '#ffffff', fontSize: '11px' });

    this.server_lag_text = this.game.add.text(10, 10, 'serv lag: 0 ms', { fill: '#ffffff', fontSize: '11px' });
    this.client_lag_text = this.game.add.text(100, 10, 'client lag: 0 ms', { fill: '#ffffff', fontSize: '11px' });
    this.fps_text = this.game.add.text(200, 10, 'FPS: 0', { fill: '#ffffff', fontSize: '11px' });

    this.run_button = this.game.add.button(this.game_width / 2 - 95, this.game_height - 80, 'button', this.run_click, this, 2, 1, 0);

    this.graphics_instance = this.game.add.graphics(0, 0);

};

Client.prototype.update = function () {

    this.delta_t = (this.game.time.elapsed/1000).fixed();
    current_session.delta_t = this.delta_t;
    //this.some.setText(this.delta_t);

    if (!this.world_already_drawed) {
        this.redraw_world_bodies(current_session.game_entities);
        this.world_already_drawed = true;
    }

    this.redraw_debug_info();

    this.preddicted_redraw_players(current_session.players);
    this.redraw_players(current_session.players);
    this.rotate_players(current_session.players);

    current_session.client_proceed_pendings();

    //var new_pos = current_session.core_instance.client_handle_input.call(this);
    //if (new_pos.x != 0 || new_pos.y != 0) {
    //	if (this.players_mapping[current_pid]) {
    //		this.players_mapping[current_pid].x += new_pos.x;
    //		this.players_mapping[current_pid].y += new_pos.y;
    //	}
    //}

};

Client.prototype.render = function () {
    this.update_client_lag_info();

    //this.game.debug.spriteInfo(this.players_mapping[current_pid], 32, 32);
};

Client.prototype.run_click = function () {
    //var curr_player = current_session.current_player();
    //var curr_player_sprite = this.players_mapping[current_pid];
    //
    //if (curr_player.is_moving()) {
    //    return true;
    //}
    //
    //var a = curr_player_sprite.angle.fixed();
    //
    //var x = curr_player_sprite.x.fixed();
    //var y = curr_player_sprite.y.fixed();
    //
    //var end_vec = current_session.core_instance.init_fly_vector(x, y, a, Player.radius);
    //
    //curr_player.set_moving_pos(end_vec.x, end_vec.y);
    //curr_player.set_is_moving();

    //if (current_session.show_debug) {
    //
    //    this.draw_line(curr_player, end_vec, 0xFF3300);
    //
    //    console.log("End vecor is:", end_vec);
    //}

    current_session.core_instance.client_run_callback.call(this);
    //console.log("Run clicked", a);
};

Client.prototype.update_client_lag_info = function () {
    var current_time = new Date().getTime();
    current_session.client_render_time = (current_time - current_session.last_update_time);
    current_session.last_update_time = new Date().getTime();
};
