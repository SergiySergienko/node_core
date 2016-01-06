var BasePhysics = function() {
    this.core_instance;
};

BasePhysics.prototype.server_update_physics = function (player_data, delta_t) {

    if (!player_data.is_moving()) return true;

    var move_speed = (Player.move_speed * delta_t),
        current_pos = { x: player_data.x, y: player_data.y },
        target_pos  = { x: player_data.fly_x, y: player_data.fly_y };

    var next_pos = this.core_instance.constant_move_to(current_pos, target_pos, move_speed);

    if (next_pos.dist > 0) {
        player_data.x += next_pos.x;
        player_data.y += next_pos.y;
    }
    else {
        player_data.reset_to_start();
    }

    return true;
};

//BasePhysics.prototype.inc_barrel_angle = function(player_data, delta_t) {
//
//    var offset = (Player.barrel_rotation_speed * delta_t).fixed();
//
//    if ((player_data.a + offset) >= 360) {
//        //player_data.a = (Math.abs(360 - (player_data.a + offset))).fixed();
//        player_data.a = 0;
//    }
//
//    player_data.a = (player_data.a + offset).fixed(1);
//
//    return true;
//};

// TODO: FIX ANGLE CALCULATION AFTER CA=270 degrees and to 360
// IMPORTANT!!!
BasePhysics.prototype.inc_player_angle_position = function(player_data, delta_t) {

    if (player_data.is_moving()) {
        return true;
    }

    var angle_offset = (Player.barrel_rotation_speed * delta_t).fixed();
    player_data.ca = ((player_data.ca + angle_offset) >= 360 ? 0 : (player_data.ca + angle_offset).fixed(1));
    player_data.a = player_data.ca;
    //player_data.a = ((player_data.ca + 90) >= 360 ? (270 + ((player_data.ca + 90) - 360)).fixed(1) : (player_data.ca + 90).fixed(1));
    //console.log("AAA",player_data.a);

    var new_pos = this.core_instance.angle_to_xy(player_data.ca, Player.center_angle_radius, player_data.start_x, player_data.start_y, false);
    player_data.x = new_pos.x;
    player_data.y = new_pos.y;

    return true;
};

BasePhysics.prototype.analyze_collisions = function(player_data, delta_t) {

    if (!player_data.is_moving()) return true;

    var need_stop = false;

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
        player_data.reset_to_start();
    }

    return true;
};


// TODO: Finish this function
// It should check collision between bodies

BasePhysics.prototype.analyze_collisions_between_players = function(player_data, other_bodies, delta_t) {
    "use strict";

    if (!player_data.is_moving()) return true;

    other_bodies.forEach(function (el) {
        if (el.is_active) {

        switch (el.body_type) {
            case 'circle':
                if (player_data.check_circle_collision_with(el)) {
                    if (el.is_save_point()) {

                        el.disable();

                        player_data.set_start_pos(el.x, el.y, false);
                        player_data.reset_to_start();

                        console.log("COllision between player and save point");
                    }
                    else {
                        console.log("COllision between player and some circle");
                    }
                }
                break;
            case 'box':
                if (player_data.check_circle_with_box_collision(player_data, el)) {
                    player_data.reset_to_start();
                    console.log("COllision between player and Box");
                }
                break;
            default:
                console.log("Unknown body type", el.body_type);
                break;
        }
        }

    });
    return true;
};



//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.BasePhysics = global.BasePhysics = BasePhysics;
}