var Box = function() {
    this.body_type = 'box';
    this.width = 0;
    this.height = 0;
};

Box.prototype = new BaseBody();

Box.prototype.apply_from_pack = function (data_to_apply) {
    if (data_to_apply.x) {
        this.x = data_to_apply.x;
    }
    if (data_to_apply.y) {
        this.y = data_to_apply.y;
    }
    if (data_to_apply.w) {
        this.width = data_to_apply.w;
    }
    if (data_to_apply.h) {
        this.height = data_to_apply.h;
    }
    return this;
};


//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.Box = Box;
}
