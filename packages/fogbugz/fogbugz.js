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

function edit(user, data){
	return fbc(user).then(function(client){
		return client.edit(data).then(function(){
			return client.caseInfo(data.id);
		});
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
			{name: 'Review', status: 'review'},
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
		var caseInfo;
		switch (status){
			// assign to team or to the person who worked on the item
			case ItemStatus.active:
				caseInfo = await(edit(user, {
					id: item.id,
					// TODO back to person when case is reactivated
					assignee: Meteor.settings.public.team,
					status: 'Active',
					comment: 'taken'
				}));
				break;

			case ItemStatus.doing:
				caseInfo = await(edit(user, {
					id: item.id,
					assignee: user.profile.id,
					status: 'Active',
					comment: 'taken'
				}));
				break;

			case ItemStatus.review:
				caseInfo = await(edit(user, {
					id: item.id,
					assignee: Meteor.settings.public.team,
					status: 'On Review',
					comment: 'pending code review'
				}));
				break;

			case ItemStatus.test:
				caseInfo = await(edit(user, {
					id: item.id,
					assignee: Meteor.settings.public.qateam,
					status: 'Resolved',
					comment: 'in testing'
				}));
				break;

			case ItemStatus.done:
				caseInfo = await(fbc(user).then(function(client){
					return client.close(item.id, 'verified').then(function(){
						return client.caseInfo(item.id);
					});
				}));
				break;

			default:
				throw new Error('Invalid status ' + status);
		}

		updateItem(item, caseInfo);
	}
};