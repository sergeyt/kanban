Template.deadline.data = ->
	board = App.currentBoard()
	return null if !board or !board.end
	m = moment(new Date(board.end))
	return {
		day: m.format('D')
		month: m.format('MMM')
		full: m.format('dddd, MMMM Do YYYY')
	}
