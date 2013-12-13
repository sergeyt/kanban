var Fiber = Npm.require('fibers');
var SockJS = Meteor.require('sockjs-client');
var Q = Meteor.require('q');

function fbsync_startup(){
	// TODO sync existing work items
	// TODO fetch new milestones
}

// helper function to create session with fogbugz service
function fbc(endpoint){
	// TODO use admin credentials
	var user = Meteor.users.findOne({"services.fogbugz.endpoint":endpoint});
	if (!user){
		return Q.reject("")
	}
	var service = user.services.fogbugz;
	return fogbugz({
		url: endpoint,
		token: service.token,
		// verbose: true // uncomment for verbose logging of fogbugz requests
	});
}

function fbsync(e){
	if (!e) return;

	console.log('[fbsync] operation start');

	if (!e.from){
		// TODO handle anonymous event
		console.log('[fbsync] does not support anonymous events for now');
		return;
	}

	var event = (e.event || '').toLowerCase();
	if (!event || !e.id){
		// ignore unknown events
		console.log('[fbsync] event is ignored');
		return;
	}

	if (event.indexOf('case') >= 0){
		fbc(e.from).then(function(client){
			return client.caseInfo(id);
		}).then(function(info){
			var item = FogBugzService.toWorkItem(info);
			return updateWorkItem(item);
		});
	}
}

function updateWorkItem(item){
	// meteor requires fibers
	Fiber(function() {
		console.log("[fbsync] updating item %s", item.id);
		var oldItem = WorkItems.findOne({id: item.id});
		if (!oldItem){
			WorkItems.insert(item);
		} else {
			WorkItems.update(oldItem._id, item);
		}
	}).run();
}

// TODO disconnect from fogbus on meteor restart and process exit
function fogbus_connect(callback){
	var connected = false;
	var sock = SockJS.create('http://fogbus.herokuapp.com/fogbus');
	sock.on('connection', function() {
		connected = true;
		console.log('[fogbus] connection is established');
		callback(sock);
	});
	sock.on('error', function(err) {
		console.log('[fogbus] error:\n', JSON.stringify(err, null, 2));
		if (!connected) {
			// try again
			fogbus_connect(callback);
		}
	});
}

// creates sockjs client to listen fogbus events
function fogbus_startup(){
	fogbus_connect(function(sock){
		sock.on('data', function(e) {
			console.log('[fogbus] message:\n', JSON.stringify(e, null, 2));
			// meteor requires fibers
			Fiber(function() {
				fbsync(e);
			}).run();
		});
		sock.on('error', function(err) {
			console.log('[fogbus] error:\n', JSON.stringify(err, null, 2));
		});
	});
}

Meteor.startup(function() {
	fbsync_startup();
	fogbus_startup();
});
