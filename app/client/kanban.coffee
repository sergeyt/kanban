Meteor.Kanban = {} if not Meteor.Kanban
Meteor.Kanban.selectedItem = new ReactiveProperty null

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
