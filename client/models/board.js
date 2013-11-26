// Subscribe to 'boards' collection on startup.
// Select a board once data has arrived.
var boardsHandle = Meteor.subscribe('boards', function () {
	if (!Session.get('board')) {
		var board = Boards.findOne({}, {sort: {name: 1}});
		if (board) {
			Router.setBoard(board.name);
		}
	}
});

Template.boards.loading = function () {
	return !boardsHandle.ready();
};

Template.boards.boards = function () {
	return Boards.find({}, {sort: {name: 1}});
};

// selected board
Template.board.board = function () {
	var name = Session.get('board');
	return Boards.findOne({name: name});
};