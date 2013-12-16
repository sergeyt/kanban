Template.deadline.data = function() {
	var board = App.currentBoard();
	if (!board || !board.end) return null;
	var m = moment(new Date(board.end));
	return {
		day: m.format('D'),
		month: m.format('MMM'),
		full: m.format('dddd, MMMM Do YYYY')
	};
};