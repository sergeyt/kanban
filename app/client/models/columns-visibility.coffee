Template.columnsVisibility.items = ->
	board = App.currentBoard()
	return [] if not board
	board.columns.map (it) ->
		hidden = App.Column(it.name).hidden()
		return {
			name: it.name
			hidden: if hidden then 'hidden' else ''
		}

Template.columnsVisibility.events {
	'click li': ->
		App.Column(this.name).toggle()
}
