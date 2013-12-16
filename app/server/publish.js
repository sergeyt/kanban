// Publish complete set of boards for given user.
Meteor.publish('boards', function() {
	return Boards.find();
});

// Publish all work items for requested board name.
Meteor.publish('workItems', function(board) {
	check(board, String);
	return WorkItems.find({board: board});
});
