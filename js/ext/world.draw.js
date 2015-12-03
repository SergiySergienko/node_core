//
// TODO: Implements normal redrawing of static and dynamic bodies
//
Client.prototype.redraw_world_bodies = function (bodies_data) {
    "use strict";

    bodies_data.forEach(function(body) {
        this.game.add.text(body.x, body.y, body.body_type, { fill: '#ffffff', fontSize: '11px' });
    }.bind(this));

};