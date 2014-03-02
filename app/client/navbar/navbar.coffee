Template.navbar.board = ->
	UserSession.get('board') || 'Board'

Template.navbar.column_bar_visible = ->
	p = Session.get('perspective') || 'board'
	p == 'board' || p == 'kanban' # TODO 'kanban' perspective is obsolete
