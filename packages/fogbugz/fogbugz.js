var Future = Npm.require("fibers/future");
var fogbugz = Npm.require("fogbugz.js");

/*
function toFuture(promiseFn, that) {
	return function () {
		var args = [].slice.call(arguments);
		var future = new Future();
		var cb = future.resolver();
		promiseFn.apply(that, args).done(function (result) {
			if (Array.isArray(result)) {
				cb(result.map(convertIt));
			} else {
				cb(convertIt(result));
			}
		});
		return future.wait();
	};
}

// converts object with promise functions to object with future functions
function convertIt(it) {
	var result = {};
	Object.keys(it).forEach(function (key) {
		var v = it[key];
		if (typeof v == 'function') {
			v = toFuture(v.bind(it));
		} else if (typeof v == 'object') {
			if (Array.isArray(v)) {
				v = v.map(convertIt);
			} else {
				v = convertIt(v);
			}
		}
		result[key] = v;
	});
	return result;
}
*/

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

FogBugz = {
	// Creates fogbugz client with specified options
	//
	// @param options {Object} (required) See https://npmjs.org/package/fogbugz.js
	// @returns {Object} The instance of fogbugz client
	connect: function (options) {
		// return toFuture(fogbugz, null)(options);
		return fogbugz(options);
	},

	toWorkItem: function (it) {
		return {
			// TODO remove this hardcoded board name
			board: 'AR8',
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
};