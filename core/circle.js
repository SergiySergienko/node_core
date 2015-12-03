var Circle = function() {

    this.body_type = 'circle';
    this.radius = 40;

};

Circle.prototype = new BaseBody();

Circle.prototype.apply_from_pack = function (data_to_apply) {
    if (data_to_apply.x) {
        this.x = data_to_apply.x;
    }
    if (data_to_apply.y) {
        this.y = data_to_apply.y;
    }
    if (data_to_apply.r) {
        this.radius = data_to_apply.r;
    }
    return this;
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.Circle = Circle;
}
