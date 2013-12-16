var Fiber = Npm.require('fibers');

// TODO resolve bug tracking service from user context
// TODO async loading of boards, work items

function insertBoards(boards){
	console.log('fetched %d boards', boards.length);
	for (var i = 0; i < boards.length; i++) {
		// TODO update existing board
		var it = boards[i];
		Boards.insert(it);
		console.log('inserted board %s', it.name);
	}
}

function insertItems(items){
	console.log('fetched %d items', items.length);
	for (var i = 0; i < items.length; i++) {
		// TODO update existing item
		var it = items[i];
		WorkItems.insert(it);
		console.log('inserted %s: %s', it.id, it.title);
	}
}

function loadBoards(user, callback){
	// TODO support multiple fogbugz servers
	// fetch boards if they are empty
	if (Boards.find({}).count() === 0){
		var boards = FogBugzService.fetchBoards(user);
		insertBoards(boards);

		if (_.isFunction(callback)){
			callback(boards);
		}
	}
}

function selectBoard(user, board){
	// TODO reload/update board with new/changed items
	// load board if it is empty
	if (WorkItems.find({board: board.name}).count() === 0){
		console.log('fetching items for %s', board.name);
		var items = FogBugzService.fetchItems(user, board);
		insertItems(items);
	}
}

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

		loadBoards(user, function(boards){
			if (boards.length === 0) return;
			var now = moment(new Date());
			// TODO more inteligent depending on user team
			// select closed sprint
			var open = boards.filter(function(it){
				return moment(new Date(it.start)).diff(now, 'days') >= 0;
			});
			var board = _.min(open, function(it){
				return moment(new Date(it.start)).diff(now, 'days');
			});
			if (board){
				selectBoard(user, board);
			}
		});
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
	}
});