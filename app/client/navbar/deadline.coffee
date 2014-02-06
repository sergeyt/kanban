Template.deadline.data = ->
	board = Meteor.Kanban.currentBoard()
	return null if not board or not board.end

	m = moment new Date(board.end)

	deadline =
		day: m.format 'D'
		month: m.format 'MMM'
		full: m.format 'dddd, MMMM Do YYYY'

	deadline
