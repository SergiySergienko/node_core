var Player = function () {

    this.body_type = 'player';

    this.id = '';
	this.socket = '';

	this.x = 0;
	this.y = 0;
	this.a = 0;

    this.ca = 0;

    this.start_x = 0;
    this.start_y = 0;
    this.start_a = 0;

	this.fly_x = 0;
	this.fly_y = 0;

	this.need_smooth_correction = false;
	this.need_correct_angle = false;
    this.is_moving_now = false;
    this.is_rotating = false;

    this.radius = 40;

};

Player.prototype = new BaseBody();

Player.barrel_rotation_speed = 55.1;
Player.radius = 40;
Player.move_speed = 1;
Player.center_angle_radius = 50;


Player.prototype.to_pack = function () {
    result = [];
    result.push(this.id, this.x.fixed(), this.y.fixed(), this.a.fixed(), this.ca.fixed(), this.start_x.fixed(), this.start_y.fixed());
    if (this.is_moving()) {
        result.push(this.fly_x);
        result.push(this.fly_y);
    }
    return result;
};

Player.prototype.reset_to_start = function () {
    this.set_moving_pos(0, 0);
    this.x = this.start_x;
    this.y = this.start_y;
    this.unset_is_moving();
    return true;
};

Player.prototype.set_start_pos = function (new_x, new_y, new_a) {
    if (new_x)
        this.start_x = new_x;
    if (new_y)
        this.start_y = new_y;
    if (new_a)
        this.start_a = new_a;
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

Player.prototype.set_as_rotating = function () {
    this.is_rotating = true;
    return true;
};

Player.prototype.stop_rotating = function () {
    this.is_rotating = false;
    return true;
};

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