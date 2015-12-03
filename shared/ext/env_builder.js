GameSession.prototype.build_environment = function () {
    "use strict";
    var map_data = this.current_map_data[1];
    var _this = this;
    map_data.bodies.forEach(function (element) {
        _this.add_entity(element.b_type, element);
    });

    return true;
};

GameSession.prototype.add_entity = function(entity_type, entity_data) {
    this.game_entities.push(this.instantiate_entity(entity_type, entity_data));
    return this;
};

GameSession.prototype.instantiate_entity = function(entity_type, entity_data) {
    var e_maping = {
        'save_point': 'SavePoint',
        'box': 'Box',
        'circle': 'Circle'
    };
    var body = eval("new " + e_maping[entity_type] + "()");
    body.apply_from_pack(entity_data);
    return body;
};


GameSession.prototype.add_box = function(box_data) {
    this.game_entities.push(box_data);
    return this.game_entities;
};