// TODO resolve bug tracking service from user context, do not use FogBugz explicitly

function insertBoards(boards){
	console.log('fetched %d boards', boards.length);
	for (var i = 0; i < boards.length; i++) {
		var it = boards[i];
		Boards.insert(it);
		console.log('inserted board %s', it.name);
	}
}

function insertItems(items){
	console.log('fetched %d items', items.length);
	for (var i = 0; i < items.length; i++) {
		var it = items[i];
		WorkItems.insert(it);
		console.log('inserted %s: %s', it.id, it.title);
	}
}

Meteor.methods({

	// TODO try to avoid need to call this from client, subscribe on some server event
	onLogin: function(userId) {
		var user = Meteor.users.findOne(userId);
		if (!user) throw new Error("Cant find user " + userId);

		// TODO support multiple fogbugz servers
		// fetch boards if they are empty
		if (Boards.find({}).count() == 0){
			var boards = FogBugz.fetchBoards(user);
			insertBoards(boards);
		}
	},

	selectBoard: function(userId, name){
		var user = Meteor.users.findOne(userId);
		if (!user) throw new Error("Cant find user " + userId);

		var board = Boards.findOne({name: name});
		if (!board) throw new Error("Cant find board " + name);

		// update user selected board in profile
		var profile = user.profile;
		profile.selectedBoard = name;
		Meteor.users.update(user.id, {$set: {profile: profile}});

		// load board if it is empty
		if (WorkItems.find({board: name}).count() == 0){
			var items = FogBugz.fetchItems(user, board);
			insertItems(items);
		}
	}
});