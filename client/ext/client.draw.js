/**
 * Created by sergiisergiienko on 20.11.15.
 * This is extensions file, decorates Client class and add methods for draw/redraw bodies
 */

Client.prototype.redraw_players = function (players_data) {
    if (players_data.length) {

        var move_speed = (Player.move_speed * this.delta_t).fixed();

        for (var i=0; i <= players_data.length-1; i++) {

            var p_data = players_data[i];
            var player_sprite;

            if (!this.players_mapping[p_data.id]) {
                player_sprite = this.add_player(p_data);
            }
            else {
                player_sprite = this.players_mapping[p_data.id];
            }

            if (p_data.is_need_fix_position()) {
                if (Math.round(player_sprite.x) == Math.round(p_data.x) && Math.round(player_sprite.y) == Math.round(p_data.y)) {
                    current_session.get_player_by_id(p_data.id).mark_position_fixed();
                }
                else {

                    if (p_data.is_moving()) {
                        // Lerping between 2 vectors
                        player_sprite.x = current_session.core_instance.lerp(player_sprite.x, p_data.x, this.delta_t);
                        player_sprite.y = current_session.core_instance.lerp(player_sprite.y, p_data.y, this.delta_t);
                    }
                }

                if (current_session.show_debug) {
                    if ((p_data.fly_x || p_data.fly_y) && !player_sprite["is_drawed"]) {
                        var end_vec = {"x": p_data.fly_x, "y": p_data.fly_y};
                        this.draw_line(player_sprite, end_vec, "0xFFFFFF");
                        player_sprite["is_drawed"] = true;
                    }
                }
            }

            if (!p_data.is_moving()) {
                // Player is on start position Lerping between angles
                this.player_angle_lerp(player_sprite, p_data);
            }

        }
    }
    return true;
};

Client.prototype.player_angle_lerp = function (player_sprite, player_data) {
    if (!player_sprite.hasOwnProperty('ca')) player_sprite['ca'] = player_data.ca;

    var angle_offset = (Player.circle_movement_speed * this.delta_t).fixed(),
        curr_ts = new Date().getTime(),
        ts_diff = curr_ts - current_session.last_applied_packet_time,
        current_angle = player_sprite.ca;


    if (ts_diff <= 30) {
        current_angle = player_data.ca;
    }

    var new_angle = ((current_angle + angle_offset) >= 360 ? 0 : (current_angle + angle_offset).fixed(1));

    var new_pos = current_session.core_instance.angle_to_xy(new_angle, Player.center_angle_radius, player_data.start_x, player_data.start_y, false);

    player_sprite.x = current_session.core_instance.lerp(player_sprite.x, new_pos.x, this.delta_t);
    player_sprite.y = current_session.core_instance.lerp(player_sprite.y, new_pos.y, this.delta_t);

    player_sprite.ca = new_angle;

    return true;
};

// TODO: Fix this method, learn how to inperpolate between angles
// Make angle fix real smooth
// User Phaer.Math if need
// TODO: Ugly shit-coding. should be refactored and optimized

Client.prototype.rotate_players = function (players_data) {
    if (players_data.length) {

        for (var i=0; i <= players_data.length-1; i++) {

            var p_data = players_data[i];
            if (p_data.is_moving()) continue;

            var player_sprite = this.players_mapping[p_data.id],
                new_angle = (player_sprite.ca >= (360 - Player.start_angle_offset) ? (player_sprite.ca - (360 - Player.start_angle_offset)) : (player_sprite.ca + Player.start_angle_offset));

            player_sprite.angle = Phaser.Math.wrapAngle(new_angle);

        }
    }
    return true;
};

Client.prototype.add_player = function (player_data) {

    var player_sprite = this.game.add.sprite(player_data.x, player_data.y, 'player');
    player_sprite.anchor.set(.5, .5);
    player_sprite.angle = 0;


    if (current_session.show_debug) {
        var barrel = this.game.add.sprite(Player.radius, 0, 'ball');
        barrel.anchor.set(.5, .5);
        player_sprite.addChild(barrel);
        player_sprite["barrel"] = barrel;
    }

    this.players_mapping[player_data.id] = player_sprite;

    return this.players_mapping[player_data.id];
};

Client.prototype.draw_line = function (from_pos, end_pos, color) {
    if (color == undefined) {
        color = "0xFF3300";
    }
    var graphics = this.game.add.graphics(from_pos.x, from_pos.y);
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(1, color, 1);
    graphics.lineTo(end_pos.x,end_pos.y);
    graphics.endFill();
};

//Client.prototype.redraw_barrels = function () {
//
//    if (current_session.players.length) {
//        for (var i=0; i <= current_session.players.length-1; i++) {
//            var p_data = current_session.players[i];
//
//            if (this.players_mapping[p_data.id]) {
//                var barrel_xy = current_session.core_instance.angle_to_xy(p_data.a, Player.radius, this.players_mapping[p_data.id].x, this.players_mapping[p_data.id].y);;
//                this.players_mapping[p_data.id].barrel.x = (barrel_xy.x - this.players_mapping[p_data.id].x);
//                this.players_mapping[p_data.id].barrel.y = (barrel_xy.y - this.players_mapping[p_data.id].y);
//            }
//
//        }
//    }
//
//    return true;
//};
