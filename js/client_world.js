// var Player = require ("./player");

var Player = function(pid) {
	this.pid = pid;
	this.x = 0;
	this.y = 0;
	this.a = 0;

	this.updates_history = [];
	this.pending_updates = [];
};

var players = {};
var game;
var old_p_size = 0;
var pending_updates = [];
var current_pending = null;

var add_player = function(id) {
	var new_player = new Player(id);
	players[id.toString()] = new_player;
	return new_player;
};


var delete_player = function(pid) {
	delete(players[pid.toString()]);
	return players;
};
var update_player = function(pid, data) {
	// var prev_state = players[pid.toString()];
	players[pid.toString()].pending_updates.push(data);
	// players[pid.toString()] = data;
	return players[pid.toString()];
};

var update_players = function(data) {
	pending_updates.push(data);
	return data;
};

var init_graphics = function() {
	game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
};

var preload = function() {
	console.log("Inside preload");
};

var create = function() {

	this.players_mapping = {};

	console.log("Inside create");
	console.log(this.players_mapping);
};

var update = function(dt) {
	proceed_pendings.call(this, game.time.elapsed);
	redraw_players.call(this, game.time.elapsed);
	check_keys.call(this);
};

var render = function() {
	// console.log("Inside render");
};

var proceed_pendings = function (delta_time) {
	if (current_pending)
		return true;

	var pending_data = null;
	var speed = 4;

	if (pending_updates && pending_updates.length > 0) {
		pending_data = pending_updates.shift();
		for (key in pending_data) {
			if (!players[key]) {
				players[key] = pending_data[key];
				var p_sprite = draw_player(pending_data[key]);
				this.players_mapping[key] = p_sprite;
			}
			else {
				if (this.players_mapping[key]) {
					
					if (this.players_mapping[key].x == this.players_mapping[key].goal_x && this.players_mapping[key].y == this.players_mapping[key].goal_y) {

						this.players_mapping[key].goal_x = pending_data[key].x;
						this.players_mapping[key].goal_y = pending_data[key].y;
						current_pending = pending_data[key];
					}
				
				}
			}
		}
		
	}
};

var draw_player = function(player_data) {	
	var spr = this.game.add.sprite(player_data.x, player_data.y);
	spr.goal_x = spr.x;
	spr.goal_y = spr.y;
 	var text = game.add.text(0, 0, "player", {fill: "#ffffff"});

	spr.addChild(text);
	return spr;
};

var redraw_players = function(delta_time) {
	var p_sprite;
	var speed = 4;
	var is_finished = true;
	for(key in players) {
			player = players[key];
			
			if (this.players_mapping[key]) {
				if (this.players_mapping[key].goal_x && this.players_mapping[key].x != this.players_mapping[key].goal_x) {
					is_finished = false;
					
					if (this.players_mapping[key].goal_x > this.players_mapping[key].x) {
						if ((this.players_mapping[key].x+speed) > this.players_mapping[key].goal_x) {
							this.players_mapping[key].x = this.players_mapping[key].goal_x;
						} else {
							this.players_mapping[key].x += (speed);
						}
						
					} else {
						if ((this.players_mapping[key].x-speed) < this.players_mapping[key].goal_x) {
							this.players_mapping[key].x = this.players_mapping[key].goal_x;
						} else {
							this.players_mapping[key].x -= (speed);
						}
					}
					
				} 
				if (this.players_mapping[key].goal_y && this.players_mapping[key].y != this.players_mapping[key].goal_y) {
					is_finished = false;
					
					if (this.players_mapping[key].goal_y > this.players_mapping[key].y) {
						if ((this.players_mapping[key].y+speed) > this.players_mapping[key].goal_y) {
							this.players_mapping[key].y = this.players_mapping[key].goal_y;
						} else {
							this.players_mapping[key].y += (speed);
						}
						
					} else {
						if ((this.players_mapping[key].y-speed) < this.players_mapping[key].goal_y) {
							this.players_mapping[key].y = this.players_mapping[key].goal_y;
						} else {
							this.players_mapping[key].y -= (speed);
						}
					}
					
				}
			}
			
		}
		if (is_finished)
			current_pending = null;
};

var check_keys = function () {
	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        // this.players_mapping[current_pid].x -= 4;
        players[current_pid].x -= 4;
        socket.emit("update_player", players[current_pid]);
        // ufo.x -= speed;
        // ufo.angle = -15;
        // leftBtn.alpha = 0.6;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {

    	// this.players_mapping[current_pid].x += 4;
        players[current_pid].x += 4;
        socket.emit("update_player", players[current_pid]);

        // ufo.x += speed;
        // ufo.angle = 15;
        // rightBtn.alpha = 0.6;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {

    	// this.players_mapping[current_pid].x += 4;
        players[current_pid].y += 4;
        socket.emit("update_player", players[current_pid]);

        // ufo.x += speed;
        // ufo.angle = 15;
        // rightBtn.alpha = 0.6;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {

    	// this.players_mapping[current_pid].x += 4;
        players[current_pid].y -= 4;
        socket.emit("update_player", players[current_pid]);

        // ufo.x += speed;
        // ufo.angle = 15;
        // rightBtn.alpha = 0.6;
    }
    else
    {
        // ufo.rotation = 0;
        // leftBtn.alpha = rightBtn.alpha = 0;
    }
};

