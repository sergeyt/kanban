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
		token: service.token,
		// verbose: true // uncomment for verbose logging of fogbugz requests
	});
}

var ItemStatus = {
	active: 'active',
	doing: 'doing',
	review: 'review',
	test: 'test',
	done: 'done'
};

// maps fogbugz case status to kanban invariant status
function resolveStatus(it) {
	var s = ((it.status || {}).name || '').toLowerCase();
	if (s.indexOf('review') >= 0) return 'review';
	if (s.indexOf('resolved') >= 0) return 'test';
	if (s.indexOf('close') >= 0) return 'done';
	if (it.assignee.name == Meteor.settings.public.team)
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

function logerror(promise){
	promise.fail(function(error){
		console.log('fogbugz error: %s', error);
	});
	return promise;
}

function edit(user, data){
	return fbc(user).then(function(client){
		return logerror(client.edit(data));
	});
}

function close(user, id){
	return fbc(user).then(function(client){
		return logerror(client.close(id, 'verified'));
	});
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

function updateItem(item, it){
	item.status = resolveStatus(it);
	item.assignee = it.assignee;
	// update dates
	item.opened = toTime(it.opened);
	item.resolved = toTime(it.resolved);
	item.closed = toTime(it.closed);
	item.events = it.events;
}

function toBoard(it){
	// TODO customize if needed
	return _.extend({}, it, {
		columns: [
			{name: 'Open', status: 'active'},
			{name: 'In progress', status: 'doing'},
			{name: 'On review', status: 'review'},
			{name: 'In testing', status: 'test'},
			{name: 'Verified', status: 'done'}
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
	},

	// TODO remove hardcoded statuses, move to config
	updateStatus: function(user, item, status){

		// TODO customizable workflow.json
		var data;
		var assignee = user.username;

		switch (status){
			// assign to team or to the person who worked on the item
			case ItemStatus.active:
				assignee = Meteor.settings.public.team;
				data = {
					id: item.id,
					// TODO back to person when case is reactivated
					user: assignee,
					status: 'Active',
					comment: 'taken'
				};
				break;

			case ItemStatus.doing:
				data = {
					id: item.id,
					user: user.profile.id,
					status: 'Active',
					comment: 'taken'
				};
				break;

			case ItemStatus.review:
				assignee = Meteor.settings.public.team;
				data = {
					id: item.id,
					user: assignee,
					status: 'On Review',
					comment: 'pending code review'
				};
				break;

			case ItemStatus.test:
				assignee = Meteor.settings.public.qateam;
				data = {
					id: item.id,
					user: assignee,
					status: 'Resolved',
					comment: 'in testing'
				};
				break;

			case ItemStatus.done:
				item.status = 'done';
				close(user, item.id);
				return item;

			default:
				throw new Error('Invalid status ' + status);
		}

		item.status = status;
		if (item.assignee) {
			item.assignee.name = assignee;
		}

		edit(user, data);

		return item;
	}
};