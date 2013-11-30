var Future = Npm.require("fibers/future");
var fogbugz = Npm.require("fogbugz.js");

// awaits given promise
// TODO make it as tiny reuseable meteor package
function await(promise){
	var future = new Future();
	var resolve = future.resolver();

	promise.then(function(result){
		resolve(null, result);
	}).fail(function(error){
		resolve(error, null);
	});

	return future.wait();
}

// creates new fogbugz clients using context from given user
function fbc(user){
	var service = user.services.fogbugz;
	return fogbugz({
		url: service.endpoint,
		token: service.token
	});
}

// maps fogbugz case status to kanban invariant status
function resolveStatus(it) {
	var s = ((it.status || {}).name || '').toLowerCase();
	if (s.indexOf('review') >= 0) return 'review';
	if (s.indexOf('resolved') >= 0) return 'test';
	if (s.indexOf('close') >= 0) return 'done';
	if (it.assignee.name == 'AR Dev Team')
		return 'active';
	return 'doing';
}

// maps fogbugz case category to kanban invariant category
function resolveCategory(it) {
	var s =((it.category || {}).name || '').toLowerCase();
	if (s.indexOf('feature') >= 0) return 'feature';
	if (s.indexOf('schedule item') >= 0) return 'task';
	if (s.indexOf('inquiry') >= 0) return 'inquiry';
	if (s.indexOf('review') >= 0) return 'code-review';
	if (s.indexOf('requirement') >= 0) return 'requirement';
	return 'bug';
}

function toTime(d){
	return d ? d.getTime() : null;
}

function toWorkItem(it, board) {
	return {
		board: board.name,
		id: it.id,
		priority: it.priority.id,
		title: it.title,
		assignee: it.assignee,
		category: resolveCategory(it),
		status: resolveStatus(it),
		tags: it.tags,
		// dates
		opened: toTime(it.opened),
		resolved: toTime(it.resolved),
		closed: toTime(it.closed),
		events: it.events
	};
}

function toBoard(it){
	// TODO customize if needed
	return _.extend({}, it, {
		columns: [
			{name: 'Backlog', status: 'active'},
			{name: 'Doing', status: 'doing'},
			{name: 'Review', status: 'review'},
			{name: 'Test', status: 'test'},
			{name: 'Done', status: 'done'}
		]
	});
}

FogBugz = {
	// Creates fogbugz client with specified options
	//
	// @param options {Object} (required) See https://npmjs.org/package/fogbugz.js
	// @returns {Object} The instance of fogbugz client
	connect: function (options) {
		// return toFuture(fogbugz, null)(options);
		return fogbugz(options);
	},

	toWorkItem: toWorkItem,

	// get available boards
	fetchBoards: function(user){
		return await(fbc(user).then(function(client){
			return client.milestones();
		}).then(function(list){
			var now = (new Date()).getTime();
			return list.filter(function(m){
				// filter out past milestones
				return (m.end.getTime() - now) >= 0;
			}).map(toBoard);
		}));
	},

	// gets items for specified board
	fetchItems: function(user, board){
		return await(fbc(user).then(function(client){
			return client.milestone(board).cases();
		}).then(function(list){
			return list.map(function(it){
				return toWorkItem(it, board);
			});
		}));
	}
};