Template.board_selector.boards = ->
	boards = Boards.find({}, {sort: {name: 1}}).fetch()
	boards.map (it) ->
		name = it.name
		extra =
			hidden: ->
				if UserSession.get('board') == name then '' else 'hidden'
		_.extend {}, it, extra

Template.board_selector.events {
	'click a[name]': (event) ->
		$e = $(event.target)
		$e = $e.parent('a[name]') unless $e.is('a[name]')

		boardName = $e.attr('name')

		# save selected board
		UserSession.set("board", boardName)

		# load board
		Meteor.call 'selectBoard', Meteor.userId(), boardName
}
