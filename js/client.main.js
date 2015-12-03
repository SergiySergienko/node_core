var socket = io();
var current_pid;
var current_session;

var game_client = new Client();
var core_instance = new Core();
var map_manager_instance = new MapManager();

socket.on('connect', function() {
  console.log("Connection established");
  
  current_pid = socket.id;
  current_session = new GameSession();
  current_session.core_instance = core_instance;
  
  game_client.init_ui();

});

socket.on('disconnect', function() {
  console.log("Connection failed");
});

// Server sent us information about our joined room and current session data
socket.on('s.j', function(game_session_data) {
  current_session.apply_from_pack(game_session_data);
});

socket.on('s.s', function(seq_value) {
  current_session.current_seq = parseInt(seq_value);
});

socket.on('s.u', function(snapshot_data) {
  // console.log("Server snapshot received", snapshot_data);
  current_session.client_handle_server_snapshot(snapshot_data);
  // current_session.apply_from_pack(data);
});