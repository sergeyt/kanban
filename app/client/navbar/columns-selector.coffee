Template.columns_selector.items = ->
	board = Meteor.Kanban.currentBoard()
	return [] if not board

	board.columns.map (it) ->
		hidden = Meteor.Kanban.Column(it.name).hidden()
		col =
			name: it.name
			hidden: if hidden then 'hidden' else ''
		col

Template.columns_selector.events =
	'click li': ->
		Meteor.Kanban.Column(this.name).toggle()
