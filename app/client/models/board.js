// Subscribe to 'boards' collection on startup.
// Select a board once data has arrived.
var boardsHandle = Meteor.subscribe('boards', function () {
	if (!UserSession.get('board')) {
// TODO auto select board with current sprint
//		var board = Boards.findOne({}, {sort: {name: 1}});
//		if (board) {
//			Router.setBoard(board.name);
//		}
	}
});

Template.boards.helpers({
	loading: function() {
		return !boardsHandle.ready();
	},
	boards: function() {
		var boards = Boards.find({}, {sort: {name: 1}}).fetch();
		return boards.map(function(board){
			var name = board.name;
			return _.extend({}, board, {
				hidden: function(){
					return UserSession.get('board') == name ? '' : 'hidden';
				}
			});
		});
	}
});

Template.boards.events({
	'click a[name]': function(event){
		var $e = $(event.target);
		if (!$e.is('a[name]')){
			$e = $e.parent('a[name]');
		}
		var boardName = $e.attr('name');
		UserSession.set("board", boardName);
		Meteor.call('selectBoard', Meteor.userId(), boardName);
	}
});

if (typeof App === 'undefined') App = {};
App.currentBoard = function() {
	// TODO auto select board
	var name = UserSession.get('board');
	return Boards.findOne({name: name});
};

Template.board.helpers({
	// selected board
	board: App.currentBoard,
	view: function() {
		return UserSession.get('view') || 'comfort';
	},
	// TODO rename
	effects: function(){
			return UserSession.get('effects') || 'static';
	}
});
