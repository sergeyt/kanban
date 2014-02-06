Template.board.helpers {
	# selected board
	board: -> Meteor.Kanban.currentBoard()
	# current view type
	view: -> UserSession.get 'view' || 'comfort'
	# TODO rename
	effects: -> UserSession.get('effects') || 'static'

	column_list: ->
		selectedItem = Meteor.Kanban.selectedItem?.get()
		return [{name: 'All Cases', status: 'any'}] if selectedItem
		@columns
}
