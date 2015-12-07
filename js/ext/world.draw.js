//
// TODO: Implements normal redrawing of static and dynamic bodies
//
Client.prototype.redraw_world_bodies = function (bodies_data) {
    "use strict";

    bodies_data.forEach(function(body) {
        console.log(body.body_type);
        switch(body.body_type) {
            case 'circle':
                this.graphics_instance.lineStyle(1, 0xff0000);
                this.graphics_instance.drawCircle(body.x, body.y, body.radius);
                break;
            case 'box':
                this.graphics_instance.beginFill(0xFFFF00, 1);
                this.graphics_instance.bounds = new PIXI.Rectangle(body.x, body.y, body.width, body.height);
                this.graphics_instance.drawRect(body.x, body.y, body.width, body.height);
                break;
            default:
                console.log("Unknown body type!!", body.body_type);
                break;
        }


        //this.game.add.text(body.x, body.y, body.body_type, { fill: '#ffffff', fontSize: '11px' });
    }.bind(this));

};