var Fiber = Npm.require('fibers');
var SockJS = Meteor.require('sockjs-client');

function fbsync(){

}

// creates sockjs client to listen fogbus events
function fogbus(){
	var sock = SockJS.create('http://fogbus.herokuapp.com/fogbus');
	sock.on('connection', function() {
		console.log('[fogbus] connection is established');
	});
	sock.on('data', function(e) {
		console.log('[fogbus] message:', JSON.stringify(e.data, null, 2));
	});
	sock.on('error', function(err) {
		console.log('[fogbus] error:', JSON.stringify(err, null, 2));
	});
}

Meteor.startup(function() {
	fbsync();
	fogbus();
});
