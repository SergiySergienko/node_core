"use strict";

class Entity {
	constructor() {
		this.type = '';
	}

	toSerializedView() {
		return this.toString();
	}
};