Template.toolbar.buttons = ->
	# large cards
	b1 =
		title: 'Comfortable view'
		icon: 'glyphicon-th-large'
		state: ->
			if UserSession.get('view') == 'comfort' then 'active' else ''
		click: ->
			UserSession.set 'view', 'comfort'
	# small cards
	b2 =
		title: 'Compact view'
		icon: 'glyphicon-th'
		state: ->
			if UserSession.get('view') == 'compact' then 'active' else ''
		click: ->
			UserSession.set 'view', 'compact'
	# effects button
	b3 =
		title: 'Enable effects'
		icon: 'glyphicon-thumbs-up'
		state: ->
			if UserSession.get('effects') == 'cool' then 'active' else ''
		click: ->
			v = UserSession.get 'effects'
			UserSession.set 'effects', if v == 'cool' then 'static' else 'cool'
	# dashboard button
	b4 =
		title: "Dashboard"
		icon: 'glyphicon-dashboard'
		state: ''
		click: ->
			Session.set 'perspective', 'dashboard'

	[b1, b2, b3, b4]

Template.toolbar.events =
	'click .btn': ->
		this.click()
