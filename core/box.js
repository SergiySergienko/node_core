"use strict";

class Box extends Entity {
	constructor() {
		super();
		this.type = 'box';
	}
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
	module.exports = global.Player = Box;
}