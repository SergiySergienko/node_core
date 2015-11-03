//
// This file should contain Physics functions 
// and Game Entities Objects definition
//

var Core = function() { 
    this.moving_local_enabled = false;
};

Core.prototype.handle_server_input = function() {

};

   // (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
    //copies a 2d vector like object from one to another
Core.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
    //Add a 2d vector with another one and return the resulting vector
Core.prototype.v_add = function(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
    //Subtract a 2d vector with another one and return the resulting vector
Core.prototype.v_sub = function(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
    //Multiply a 2d vector with a scalar value and return the resulting vector
Core.prototype.v_mul_scalar = function(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
    //For the server, we need to cancel the setTimeout that the polyfill creates
Core.prototype.stop_update = function() {  window.cancelAnimationFrame( this.updateid );  };
    //Simple linear interpolation
Core.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
    //Simple linear interpolation between 2 vectors
Core.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

Core.prototype.input_to_points = function (player, input_commands) {
	if (player && input_commands) {
		var comm = input_commands.split("-");
		if (comm.length) {
			for(var c of comm) {
				if (c == "l") {
					player.x -= player.move_speed;
				}
				if (c == "u") {
					player.y -= player.move_speed;
				}
				if (c == "r") {
					player.x += player.move_speed;
				}
				if (c == "d") {
					player.y += player.move_speed;
				}
			}
		}
	}
	return player;
};

// Client method only
Core.prototype.client_handle_input = function() {

	var inputs = [];
    var result = { "x": 0, "y": 0 };

	if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        inputs.push("l");   
        result.x = -4;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
    	inputs.push("r");
        result.x = 4;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {
    	inputs.push("d");
        result.y = 4;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
    	inputs.push("u");
        result.y = -4;
    }

    if (inputs.length) {
    	// Save to local history and send as snapshot to server
        this.moving_local_enabled = true;

    	// current_session.current_seq += 1;
        current_session.last_input_seq = current_session.current_seq;
    	var packet_data = {
    		"s": current_session.current_seq,
    		"t": current_session.last_update_time,
    		"i": inputs.join("-")
    	};
    	current_session.local_history.push(packet_data);
    	socket.emit('c.i', packet_data);
    }
    else {
        this.moving_local_enabled= false;
    }
    return result;
};

// Server method only
Core.prototype.server_handle_client_input = function(packet_data, player_id) {
	packet_data.pid = player_id;
	this.server_pendings.push(packet_data);
	// console.log('Server Proceed snapshot from client: ', packet_data);
	return true;
};

// Client method only
// Parse snapshot and push in to pendings to proceed in next tick
//
Core.prototype.client_handle_server_snapshot = function(packet_data) {
	var pack_data = this.parse_pack(packet_data);
	this.server_pendings.push(pack_data);
	return true;
	// console.log('Server Proceed snapshot from client: ', packet_data);
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.Core = global.Core = Core;
}