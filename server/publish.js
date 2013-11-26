// Publish complete set of boards to all clients.
Meteor.publish('boards', function () {
	return Boards.find();
});

// Publish all work items for requested board name.
Meteor.publish('workItems', function (board) {
	check(board, String);
	return WorkItems.find({board: board});
});

