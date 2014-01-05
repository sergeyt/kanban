var Fiber = Npm.require('fibers');

// TODO resolve bug tracking service from user context
// TODO async loading of boards, work items

// deletes all functions from given object
function withoutFuncs(obj){
	Object.keys(obj).forEach(function(key){
		if (_.isFunction(obj[key])){
			delete obj[key];
		}
	});
	return obj;
}

function copy(record){
	var obj = _.extend({}, record);
	delete obj._id;
	withoutFuncs(obj);
	return obj;
}

// Boards handling

function loadBoards(user){
	console.log("fetching boards");
	return FogBugzService.fetchBoards(user).then(function(boards){
		console.log('fetched %d boards', boards.length);
		Meteor.pushTask(function(done){
			updateBoards(boards);
			done();
		});
		Meteor.pushTask(function(done){
			onBoardsLoaded(user);
			done();
		});
		Meteor.runTasks();
	});
}

function updateBoards(boards){
	// TODO try use async.parallel
	console.log('updating/inserting boards');
	for (var i = 0; i < boards.length; i++) {
		var it = boards[i];
		var existing = Boards.findOne({name:it.name});
		if (existing) {
			if (_.isEqual(it, copy(existing))){
				continue;
			}
			// TODO do not loose custom fields
			Boards.update(existing._id, it);
			console.log('updated board %s', it.name);
		} else {
			Boards.insert(it);
			console.log('inserted board %s', it.name);
		}
	}
}

function onBoardsLoaded(user){
	var boards = Boards.find({}).fetch();
	if (boards.length === 0){
		console.log('no boards');
		return;
	}

	console.log('detecting current sprint');
	var now = moment(new Date());
	// TODO more inteligent depending on user team
	// select closest sprint
	var open = boards.filter(function(it){
		var start = moment(new Date(it.start));
		return now.diff(start, 'days') >= 0;
	});
	if (open.length === 0){
		console.log('no open sprints');
		return;
	}

	boards = _.sortBy(open, function(it){
		var start = moment(new Date(it.start));
		return now.diff(start, 'days');
	});

	selectBoard(user, boards[0]);
}

// WorkItems handling

function selectBoard(user, board){
	var userId = user._id;
	console.log('fetching items for %s', board.name);
	return FogBugzService.fetchItems(user, board).done(function(items){
		Meteor.pushTask(function(done){
			updateItems(items);
			done();
		});
		// TODO set active board for user, code below does not work, why?
//		Meteor.pushTask(function(done){
//			console.log('set active board for user', userId);
//			if (!UserSession.get('board', userId)){
//				UserSession.set('board', board.name, userId);
//			}
//			done();
//		});
		Meteor.runTasks();
	});
}

function updateItems(items){
	// TODO try use async.parallel
	console.log('fetched %d items', items.length);
	for (var i = 0; i < items.length; i++) {
		var it = copy(items[i]);
		var existing = WorkItems.findOne({id:it.id});
		if (existing) {
			if (_.isEqual(it, copy(existing))){
				continue;
			}
			// TODO do not loose custom fields
			WorkItems.update(existing._id, it);
			console.log('updated %s: %s', it.id, it.title);
		} else {
			WorkItems.insert(it);
			console.log('inserted %s: %s', it.id, it.title);
		}
	}
}

// Misc

function updateStatus(user, item, oldStatus, newStatus){

	var itemId = item._id;

	try {

		FogBugzService.updateStatus(user, item, newStatus);
		console.log('item %s status was update on %s, assigned to %s', item.id, item.status, item.assignee.name);

		// commit changes
		WorkItems.update(itemId, item);
	} catch (err){
		// rollback status changes
		WorkItems.update(itemId, {status: oldStatus});
	}
}

Meteor.methods({

	// TODO try to avoid need to call this from client, subscribe on some server event
	onLogin: function(userId) {
		var user = Meteor.users.findOne(userId);
		if (!user) throw new Error("Cant find user " + userId);
		loadBoards(user);
	},

	selectBoard: function(userId, name){
		var user = Meteor.users.findOne(userId);
		if (!user) throw new Error("Cant find user " + userId);

		var board = Boards.findOne({name: name});
		if (!board) throw new Error("Cant find board " + name);

		selectBoard(user, board);
	},

	updateStatus: function(userId, itemId, oldStatus, newStatus){

		var user = Meteor.users.findOne(userId);
		if (!user) throw new Error("Cant find user " + userId);

		var item = WorkItems.findOne(itemId);
		if (!item) throw new Error("Cant find work item " + itemId);

		console.log('updating item %s by %s from status %s on %s', item.id, user.username, oldStatus, newStatus);

		// predictive change to quickly update clients
		WorkItems.update(itemId, {$set: {status: newStatus}});

		updateStatus(user, item, oldStatus, newStatus);
	},

	// returns emails of all registered meteor.users
	emails: function(){
		var arr = [];
		Meteor.users.find().fetch().forEach(function(u){
			if (u.email) {
				return arr.push(u.email);
			}
			if (u.emails && u.emails.length > 0){
				var addrs = u.emails.filter(function(e){
					return e.verified && e.address;
				}).map(function(e){
					return e.address;
				});
				arr = arr.concat(addrs);
			}
		});
		return _.uniq(arr);
	},

    endpoints: function(){
        var arr = Meteor.users.find().fetch().map(function(u){
            var service = u.services.fogbugz;
            return service ? service.endpoint : null;
        }).filter(_.identity);
        return _.uniq(arr);
    }
});
