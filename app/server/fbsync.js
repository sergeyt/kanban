var Fiber = Npm.require('fibers');
var SockJS = Meteor.require('sockjs-client');
var Q = Meteor.require('q');

function toJson(v) {
	if (typeof v == 'string') {
		try {
			return JSON.parse(v);
		} catch (err) {
			return v;
		}
	}
	return v;
}

function fbsync_startup() {
	// TODO sync existing work items
	// TODO fetch new milestones
}

// helper function to create session with fogbugz service
function fbc(endpoint) {
	if (endpoint.charAt(endpoint.length - 1) != '/') {
		endpoint += '/';
	}

	// TODO use admin credentials
	var user = Meteor.users.findOne({"services.fogbugz.endpoint": endpoint});
	if (!user) {
		console.log("error: unknown fogbugz service " + endpoint);
		return Q.reject("unknown fogbugz service " + endpoint);
	}

	var service = user.services.fogbugz;
	var fogbugz = Meteor.require('fogbugz.js');
	return fogbugz({
		url: endpoint,
		token: service.token,
		// verbose: true // uncomment for verbose logging of fogbugz requests
	});
}

function fbsync(e) {
	if (!e) return;

	console.log('[fbsync] operation start');

	if (!e.from) {
		// TODO handle anonymous event
		console.log('[fbsync] does not support anonymous events for now');
		return;
	}

	var event = (e.event || '').toLowerCase();
	if (!event || !e.id) {
		// ignore unknown events
		console.log('[fbsync] event is ignored');
		return;
	}

	if (event.indexOf('case') >= 0) {
		fbc(e.from).then(function(client) {
			return client.caseInfo(id);
		}).then(function(info) {
			var item = FogBugzService.toWorkItem(info);
			return updateWorkItem(item);
		});
	} else {
		console.log('[fbsync] unhandled event '+ event);
	}
}

function updateWorkItem(item) {
	console.log("[fbsync] updating item %s", item.id);
	// meteor requires fibers
	Fiber(function() {
		var existing = WorkItems.findOne({id: item.id});
		if (existing) {
			WorkItems.update(existing._id, item);
		} else {
			WorkItems.insert(item);
		}
	}).run();
}

// TODO disconnect from fogbus on meteor restart and process exit
function fogbus_connect(callback) {
	var connected = false;
	var sock = SockJS.create('http://fogbus.herokuapp.com/fogbus');
	sock.on('connection', function() {
		connected = true;
		console.log('[fogbus] connection is established');
		callback(sock);
	});
	sock.on('error', function(err) {
		err = toJson(err);
		console.log('[fogbus] error:\n', JSON.stringify(err, null, 2));
		if (!connected) {
			// try again
			fogbus_connect(callback);
		}
	});
}

// creates sockjs client to listen fogbus events
function fogbus_startup() {
	fogbus_connect(function(sock) {
		sock.on('data', function(e) {
			e = toJson(e);
			console.log('[fogbus] message:\n', JSON.stringify(e, null, 2));
			// meteor requires fibers
			Fiber(function() {
				fbsync(e);
			}).run();
		});
	});
}

Meteor.startup(function() {
	fbsync_startup();
	fogbus_startup();
});
