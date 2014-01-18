var Future = Npm.require("fibers/future");
var fogbugz = Npm.require("fogbugz.js");

function logfail(p){
	p.fail(function(err){
		console.log('[fogbugz] error:', err);
	});
	return p;
}

// creates new fogbugz clients using context from given user
function fbc(user){
	var service = user.services.fogbugz;
	var p = fogbugz({
		url: service.endpoint,
		token: service.token,
		// verbose: true // uncomment for verbose logging of fogbugz requests
	});
	logfail(p);
	return p;
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
	// TODO detect virtual users using data from fogbugz
	var assignee = (it.assignee.name || '').toLowerCase();
	var isTeam = ['team', 'qa', 'dev'].some(function(s){
		return assignee.indexOf(s) >= 0;
	});
	return isTeam ? 'active' : 'doing';
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
		// link with fogbugz service
		service: board.service,
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

function toBoard(it, user){
	var service = user.services.fogbugz;
	// TODO customize if needed
	return _.extend({}, it, {
		// link board with fogbugz service
		service: service.endpoint,
		columns: [
			{name: 'Open', status: 'active'},
			{name: 'In progress', status: 'doing'},
			{name: 'On review', status: 'review'},
			{name: 'In testing', status: 'test'},
			{name: 'Verified', status: 'done'}
		]
	});
}

FogBugzService = {
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
		return fbc(user).then(function(client){
			return client.milestones(true);
		}).then(function(list){
			var now = moment(new Date());
			return list.filter(function(m){
				if (!m.end) return false;
				var end = moment(m.end);
				var d = end.diff(now, 'days');
				// filter out past milestones including prev sprints
				return d >= -14;
			}).map(function(it){
				return toBoard(it, user);
			});
		});
	},

	// gets items for specified board
	fetchItems: function(user, board){
		return fbc(user).then(function(client){
			return client.milestone(board).cases();
		}).then(function(list){
			return list.map(function(it){
				return toWorkItem(it, board);
			});
		});
	},

	// fetch fogbugz user
	users: function(user){
		// todo filter unnecessary fields
		return fbc(user).then(function(client){
			return client.users();
		});
	},

	// adds comment to given case
	comment: function(user, itemId, text){
		return fbc(user).then(function(client){
			return client.log(itemId, text);
		});
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