var BaseBody = function() {

    this.body_type = 'base';

    this.x = 0;
    this.y = 0;
    this.a = 0;

    this.is_active = true;

};

BaseBody.prototype.set_pos = function (new_x, new_y, new_a) {
    if (new_x)
        this.x = new_x;
    if (new_y)
        this.y = new_y;
    if (new_a)
        this.a = new_a;
    return this;
};

BaseBody.prototype.disable = function () {
    this.is_active = false;
    return true;
};

BaseBody.prototype.set_angle = function (new_a) {
    if (new_a)
        this.a = new_a;
    return this;
};

BaseBody.prototype.check_circle_collision_with = function (other_circle_body) {
    var circle1 = {radius: this.radius, x: this.x, y: this.y};
    var circle2 = {radius: other_circle_body.radius, x: other_circle_body.x, y: other_circle_body.y};

    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    var result = false;

    if (distance < circle1.radius + circle2.radius) {
        result = true;
    }

    return result;
};

BaseBody.prototype.check_circle_with_box_collision = function (circle_body, box_body) {
    var circle_distance = {};

    circle_distance.x = Math.abs(circle_body.x - box_body.x);
    circle_distance.y = Math.abs(circle_body.y - box_body.y);

    if (circle_distance.x > (box_body.width/2 + circle_body.radius)) { return false; }
    if (circle_distance.y > (box_body.height/2 + circle_body.radius)) { return false; }

    if (circle_distance.x <= (box_body.width/2)) { return true; }
    if (circle_distance.y <= (box_body.height/2)) { return true; }

    var corner_distance_sq = Math.pow((circle_distance.x - (box_body.width/2)), 2) +
                             Math.pow((circle_distance.y - (box_body.height/2)), 2);

    return (corner_distance_sq <= Math.pow(circle_body.radius, 2));
};

BaseBody.prototype.apply_from_pack = function (data_to_apply) {
    if (data_to_apply.x) {
        this.x = data_to_apply.x;
    }
    if (data_to_apply.y) {
        this.y = data_to_apply.y;
    }
    return this;
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.BaseBody = BaseBody;
}
