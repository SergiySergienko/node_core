var Player = function () {
	
	this.id = '';
	this.socket = '';
	this.move_speed = 4;
	
	this.client_updates = [];
	this.server_updates = [];

	this.x = 0;
	this.y = 0;
	this.a = 0;

	this.new_x = 0;
	this.new_y = 0;
	this.new_a = 0;

};

Player.prototype.set_new_pos = function (new_x, new_y, new_a) {
	if (new_x)
		this.new_x = new_x;
	if (new_y)
		this.new_y = new_y;
	if (new_a)
		this.new_a = new_a;
	return this;
}

Player.prototype.set_pos = function (new_x, new_y, new_a) {
	if (new_x)
		this.x = new_x;
	if (new_y)
		this.y = new_y;
	if (new_a)
		this.a = new_a;
	return this;
}

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.Player = Player;
}