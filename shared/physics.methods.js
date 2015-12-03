var BasePhysics = function() {
    this.core_instance;
};

BasePhysics.prototype.server_update_physics = function (player_data, delta_t) {

    if (!player_data.is_moving()) {
        return true;
    }

    var move_speed = (Player.move_speed * delta_t);

    player_data.x = this.core_instance.lerp(player_data.x, player_data.fly_x, move_speed);
    player_data.y = this.core_instance.lerp(player_data.y, player_data.fly_y, move_speed);


    var x_diff = Math.abs(Math.round(player_data.fly_x) - Math.round(player_data.x));
    var y_diff = Math.abs(Math.round(player_data.fly_y) - Math.round(player_data.y));

    if (x_diff <= 2 && y_diff <= 2) {
        player_data.reset_to_start();
    }

    return true;
};

BasePhysics.prototype.inc_barrel_angle = function(player_data, delta_t) {

    var offset = (Player.barrel_rotation_speed * delta_t).fixed();

    if ((player_data.a + offset) >= 360) {
        //player_data.a = (Math.abs(360 - (player_data.a + offset))).fixed();
        player_data.a = 0;
    }

    player_data.a = (player_data.a + offset).fixed(1);

    return true;
};

BasePhysics.prototype.analyze_collisions = function(player_data, delta_t) {
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
    other_bodies.forEach(function (el) {
        if (el.body_type == 'circle') {
            if (player_data.check_circle_collision_with(el)) {
                console.log("COllision between", player_data, el);
            }
        }

    });
};



//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.BasePhysics = global.BasePhysics = BasePhysics;
}