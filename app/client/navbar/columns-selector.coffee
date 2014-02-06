Template.columnsVisibility.items = ->
	board = Meteor.Kanban.currentBoard()
	return [] if not board

	board.columns.map (it) ->
		hidden = Meteor.Kanban.Column(it.name).hidden()
		col =
			name: it.name
			hidden: if hidden then 'hidden' else ''
		col

Template.columnsVisibility.events =
	'click li': ->
		Meteor.Kanban.Column(this.name).toggle()
