Template.navbar.board = ->
	UserSession.get('board') || 'Board'
