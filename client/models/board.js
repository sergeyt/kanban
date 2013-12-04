// Subscribe to 'boards' collection on startup.
// Select a board once data has arrived.
var boardsHandle = Meteor.subscribe('boards', function () {
	if (!Session.get('board')) {
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
					return Session.get('board') == name ? '' : 'hidden';
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
		Session.set("board", boardName);
		Meteor.call('selectBoard', Meteor.userId(), boardName);
	}
});

Template.board.helpers({
	// selected board
	board: function() {
		var name = Session.get('board');
		return Boards.findOne({name: name});
	},
	view: function() {
		return Session.get('view') || 'comfort';
	},
	// TODO rename
	effects: function(){
			return Session.get('effects') || 'static';
	}
});

