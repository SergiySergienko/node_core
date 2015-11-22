var Player = function () {
	
	this.id = '';
	this.socket = '';
	
	this.client_updates = [];
	this.server_updates = [];

	this.x = 0;
	this.y = 0;
	this.a = 0;

	this.fly_x = 0;
	this.fly_y = 0;

	this.need_smooth_correction = false;
	this.need_correct_angle = false;
    this.is_moving_now = false;

};

Player.barrel_rotation_speed = 100;
Player.radius = 40;
Player.move_speed = 4;


Player.prototype.to_pack = function () {
    result = [];
    result.push(this.id, this.x.fixed(), this.y.fixed(), this.a.fixed());
    if (this.is_moving()) {
        result.push(this.fly_x);
        result.push(this.fly_y);
    }
    return result;
};

Player.prototype.set_pos = function (new_x, new_y, new_a) {
	if (new_x)
		this.x = new_x;
	if (new_y)
		this.y = new_y;
	if (new_a)
		this.a = new_a;
	return this;
};

Player.prototype.set_angle = function (new_a) {
    if (new_a)
        this.a = new_a;
    return this;
};

Player.prototype.is_moving = function () {
    return this.is_moving_now;
};

Player.prototype.set_is_moving = function () {
    this.is_moving_now = true;
    return true;
};

Player.prototype.unset_is_moving = function () {
    this.is_moving_now = false;
    return true;
};

Player.prototype.set_moving_pos = function (end_x, end_y) {
    this.fly_x = end_x;
    this.fly_y = end_y;
    return true;
};

//Player.prototype.init_bullet_data = function (core_klass) {
//
//	var barrel_pos = core_klass.angle_to_xy(this.a, Player.radius, this.x, this.y);
//	var player_pos = { "x": this.x, "y": this.y };
//
//	var v_end_pos = core_klass.calc_bullet_end_pos(player_pos, barrel_pos);
//
//	var result = { "start": barrel_pos,
//					"end": v_end_pos,
//					"x": barrel_pos.x,
//					"y": barrel_pos.y,
//					"server_x": barrel_pos.x,
//					"server_y": barrel_pos.y,
//					"t": new Date().getTime()
//	};
//
//	return result;
//};

Player.prototype.get_preddicted_angle = function () {
    var result = this.a;

    if ((result + Player.barrel_rotation_speed) > 180) {
        result *= -1;
    }
    result += Player.barrel_rotation_speed;

    return result;
};

Player.prototype.mark_as_updated = function () {
	this.need_smooth_correction = true;
	this.need_correct_angle = true;
	return true;
};

Player.prototype.mark_angle_updated = function () {
    this.need_correct_angle = true;
    return true;
};


Player.prototype.is_need_fix_position = function () {
    return this.need_smooth_correction;
};

Player.prototype.is_need_fix_angle = function () {
    return this.need_correct_angle;
};

Player.prototype.mark_position_fixed = function () {
	this.need_smooth_correction = false;
	return true;
};

Player.prototype.mark_angle_fixed = function () {
	this.need_correct_angle = false;
	return true;
};

Player.prototype.mark_all_fixed = function () {
	this.mark_position_fixed();
	this.mark_angle_fixed();
	return true;
};


//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.Player = Player;
}