var SavePoint = function() {

    this.radius = 40;

};

SavePoint.prototype = new Circle();

SavePoint.prototype.is_save_point = function () {
    return true;
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.SavePoint = SavePoint;
}
