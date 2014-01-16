# Subscribe to 'boards' collection on startup.
# Select a board once data has arrived.
boardsHandle = Meteor.subscribe 'boards'

Template.boards.helpers {
	loading: -> not boardsHandle.ready()

	boards: ->
		boards = Boards.find({}, {sort: {name: 1}}).fetch()
		boards.map (it) ->
			name = it.name
			extra =
				hidden: ->
					if UserSession.get('board') == name then '' else 'hidden'
			_.extend {}, it, extra
}

Template.boards.events {
	'click a[name]': (event) ->
		$e = $(event.target)
		$e = $e.parent('a[name]') if not $e.is('a[name]')

		boardName = $e.attr('name')

		# save selected board
		UserSession.set("board", boardName)

		# load board
		Meteor.call 'selectBoard', Meteor.userId(), boardName
}

Meteor.Kanban = {} if typeof Meteor.Kanban == 'undefined'

Meteor.Kanban.currentBoard = ->
	# TODO auto select board
	name = UserSession.get 'board'
	Boards.findOne {name: name}

Template.board.helpers {
	# selected board
	board: Meteor.Kanban.currentBoard
	view: -> UserSession.get 'view' || 'comfort'
	# TODO rename
	effects: -> UserSession.get('effects') || 'static'
}
