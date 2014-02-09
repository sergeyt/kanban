Template.navbar.helpers {
	board: ->
		UserSession.get('board') || 'Board'
	comfortState: ->
		if UserSession.get('view') == 'comfort' then 'active' else ''
	compactState: ->
		if UserSession.get('view') == 'compact' then 'active' else ''
	effectsState: ->
		if UserSession.get('effects') == 'cool' then 'active' else ''
}

Template.navbar.events =
	'click .btn-compact-view': ->
		UserSession.set 'view', 'compact'

	'click .btn-comfort-view': ->
		UserSession.set 'view', 'comfort'

	'click .btn-effects': ->
		v = UserSession.get 'effects'
		UserSession.set 'effects', if v == 'cool' then 'static' else 'cool'

	'click .btn-refresh': ->
		Meteor.call 'on_login', Meteor.userId()

	'click .btn-dashboard': ->
		Session.set 'perspective', 'dashboard'
