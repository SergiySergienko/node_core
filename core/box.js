var Box = function() {
    this.body_type = 'box';
};

Box.prototype = new BaseBody();

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.Box = Box;
}
