Meteor.startup ->
	console.log 'listen boards collection'
	Meteor.subscribe 'boards'

Meteor.Kanban = {} if typeof Meteor.Kanban == 'undefined'

Meteor.Kanban.currentBoard = ->
	# TODO auto select board
	name = UserSession.get 'board'
	Boards.findOne {name: name}

Meteor.Kanban.selectedItem = new ReactiveProperty null

# Filters API
Filters = {}
Filters.indexOf = (filter) ->
	filter = JSON.stringify filter
	filters = Session.get('filters') || []
	for it, index in filters
		return index if JSON.stringify(it) == filter
	-1

Filters.toggle = (filter) ->
	filters = (Session.get('filters') || []).slice()

	index = Filters.indexOf filter
	if index < 0
		filters.push(filter)
	else
		filters.splice(index, 1)

	Session.set 'filters', filters

Meteor.Kanban.Filters = Filters

# resolve email for given user object with id and name fields
Meteor.Kanban.resolve_email = (user) ->
	return '' if not user

	key = 'fogbugz-users'
	users = UserSession.get(key) || []

	if not users.length
		Meteor.call 'fetch_users', Meteor.userId(), (err, res) ->
			return if err
			UserSession.set key, res

	found = _.find users, (it) ->
		it.id == user.id or it.name == user.name

	if found then found.email || '' else ''
