var MapManager = function () {
    this.maps = {
        'abadon': {
            'bodies': [
                {
                    'b_type': 'save_point',
                    'x': 450,
                    'y': 300,
                    'r': 40,
                    'is_static': 1
                },
                {
                    'b_type': 'box',
                    'x': 300,
                    'y': 100,
                    'w': 50,
                    'h': 50,
                    'is_static': 0,
                    'm_vector': [100, 120]
                }
            ]
        },
        'coliseum': {
            'bodies': [
                {
                    'b_type': 'save_point',
                    'x': 450,
                    'y': 250,
                    'r': 20,
                    'is_static': 1
                },
                {
                    'b_type': 'box',
                    'x': 350,
                    'y': 100,
                    'w': 30,
                    'h': 30,
                    'is_static': 1
                },
                {
                    'b_type': 'box',
                    'x': 350,
                    'y': 200,
                    'w': 30,
                    'h': 30,
                    'is_static': 1
                }
            ]
        }
    };
};

MapManager.prototype.get_map_data_by_id = function (map_id) {
    if (!this.maps.hasOwnProperty(map_id)) {
        return false;
    }
    return this.maps[map_id];
};

MapManager.prototype.get_rnd_map = function () {
    var keys = Object.keys(this.maps);
    var max = (keys.length-1);
    var min = 0;
    var val = (Math.floor(Math.random() * (max - min + 1)) + min);
    return [keys[val], this.maps[keys[val]]];
};

//server side we set the 'Core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports.MapManager = global.MapManager = MapManager;
}