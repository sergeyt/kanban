var Fiber = Npm.require('fibers'),
	SockJS = Meteor.require('sockjs-client'),
	Q = Meteor.require('q'),
	fogbugz = Meteor.require('fogbugz.js');

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

function logfail(promise){
	promise.fail(function(err){
		console.error(err);
	});
	return promise;
}

// helper function to create session with fogbugz service
function connect(endpoint) {
	if (endpoint.charAt(endpoint.length - 1) != '/') {
		endpoint += '/';
	}

	// TODO use admin credentials
	var user = Meteor.users.findOne({"services.fogbugz.endpoint": endpoint});
	if (!user) {
		console.error("unknown fogbugz service " + endpoint);
		return Q.reject("unknown fogbugz service " + endpoint);
	}

	var service = user.services.fogbugz;

	console.log("[fbsync] connecting to service:", JSON.stringify(service, null, 2));

	var promise = fogbugz({
		url: endpoint,
		token: service.token
		// verbose: true // uncomment for verbose logging of fogbugz requests
	});

	return logfail(promise);
}

// fogbus event handler to sync the changed cases
function fbsync(e) {
	if (!e) return;

	console.log('[fbsync] operation start');

	if (!e.from) {
		// TODO handle anonymous event
		console.warn('[fbsync] does not support anonymous events for now');
		return;
	}

	var event = (e.event || '').toLowerCase();
	if (!event || !e.id) {
		// ignore unknown events
		console.log('[fbsync] event is ignored');
		return;
	}

	var id = e.id;

	if (event.indexOf('case') >= 0) {
		connect(e.from).then(function(client) {
			console.log("[fbsync] fetching case %s", id);
			return logfail(client.caseInfo(id));
		}).then(function(info) {
			Meteor.pushTask(function(done){
				syncCase(info);
				done();
			});
			Meteor.runTasks();
		});
	} else {
		console.log('[fbsync] unhandled event '+ event);
	}
}

function syncCase(info){
	console.log("[fbsync] fetched case %s: %s", info.id, info.title);
	var board = resolveBoard(info);
	// TODO handle new milestones
	var item = FogBugzService.toWorkItem(info, board);
	return updateWorkItem(item);
}

function resolveBoard(item){
	if (!item || !item.milestone) return null;
	return Boards.findOne({id:item.milestone.id});
}

function updateWorkItem(item) {
	console.log("[fbsync] updating item %s", item.id);
	var existing = WorkItems.findOne({id: item.id});
	if (existing) {
		WorkItems.update(existing._id, item);
	} else {
		WorkItems.insert(item);
	}
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
			Meteor.pushTask(function(done) {
				fbsync(e);
				done();
			});
			Meteor.runTasks();
		});
	});
}

Meteor.startup(function() {
	fbsync_startup();
	fogbus_startup();
});
