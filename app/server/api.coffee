Fiber = Npm.require 'fibers'

# TODO resolve bug tracking service from user context
# TODO async loading of boards, work items

# deletes all functions from given object
withoutFuncs = (obj) ->
	Object.keys(obj).forEach (key) ->
		delete obj[key] if _.isFunction obj[key]
	obj

copy = (record) ->
	obj = _.extend {}, record
	delete obj._id
	withoutFuncs obj

# Boards handling

# loads boards (aka milestones)
loadBoards = -> (user) ->
	console.log "fetching boards"

	FogBugzService.fetchBoards(user).then (boards) ->
		console.log 'fetched %d boards', boards.length

		Meteor.pushTask (done) ->
			updateBoards boards
			done()

		Meteor.pushTask (done) ->
			onBoardsLoaded user
			done()

		Meteor.runTasks()

updateBoards = (boards) ->
	# TODO try use async.parallel
	console.log 'updating/inserting boards'

	for it in boards
		existing = Boards.findOne {name:it.name}

		if existing

			continue if _.isEqual it, copy existing

			# TODO do not loose custom fields
			Boards.update existing._id, it
			console.log 'updated board %s', it.name

		else # if non-existing then insert it

			Boards.insert it
			console.log 'inserted board %s', it.name

onBoardsLoaded = (user) ->
	boards = Boards.find({}).fetch()
	return console.log 'no boards' if not boards.length

	console.log 'detecting current sprint'
	now = moment new Date()
	# TODO more inteligent depending on user team
	# select closest sprint
	open = boards.filter (it) ->
		start = moment new Date it.start
		now.diff(start, 'days') >= 0

	return console.log 'no open sprints' if not open.length

	boards = _.sortBy open, (it) ->
		start = moment new Date it.start
		now.diff start, 'days'

	selectBoard user, boards[0]

# WorkItems handling

selectBoard = (user, board) ->
	userId = user._id
	console.log "fetching items for #{board.name}"

	FogBugzService.fetchItems(user, board).done (items) ->

		Meteor.pushTask (done) ->
			updateItems items
			done()

		# TODO set active board for user, code below does not work, why?
#		Meteor.pushTask(function(done){
#			console.log('set active board for user', userId);
#			if (!UserSession.get('board', userId)){
#				UserSession.set('board', board.name, userId);
#			}
#			done();
#		});

		Meteor.runTasks()

updateItems = (items) ->
	# TODO try use async.parallel
	console.log 'fetched %d items', items.length

	for item in items
		it = copy item
		existing = WorkItems.findOne {id: it.id}

		if (existing)
			continue if _.isEqual it, copy existing

			# TODO do not loose custom fields
			WorkItems.update existing._id, it
			console.log 'updated %s: %s', it.id, it.title
		else
			WorkItems.insert it
			console.log 'inserted %s: %s', it.id, it.title

# MISC

updateStatus = (user, item, oldStatus, newStatus) ->

	itemId = item._id

	try

		FogBugzService.updateStatus user, item, newStatus
		console.log 'item %s status was update on %s, assigned to %s', item.id, item.status, item.assignee.name

		# commit changes
		WorkItems.update itemId, item
	catch err
		# rollback status changes
		WorkItems.update itemId, {status: oldStatus}

# PUBLIC WEB API

Meteor.methods {

	# TODO try to avoid need to call this from client, subscribe on some server event

	# called when user is logged in to load boards, etc
	onLogin: (userId) ->
		user = Meteor.users.findOne userId
		throw new Error "Cant find user #{userId}" if not user
		loadBoards(user)

	# selects/loads items for given board
	selectBoard: (userId, name) ->
		user = Meteor.users.findOne userId
		throw new Error "Cant find user #{userId}" if not user

		board = Boards.findOne {name: name}
		throw new Error "Cant find board #{name}" if not board

		selectBoard(user, board)

	# updates status of given item
	updateStatus: (userId, itemId, oldStatus, newStatus) ->

		user = Meteor.users.findOne userId
		throw new Error "Cant find user #{userId}" if not user

		item = WorkItems.findOne itemId
		throw new Error "Cant find work item #{itemId}" if not item

		console.log 'updating item %s by %s from status %s on %s', item.id, user.username, oldStatus, newStatus

		# predictive change to quickly update clients
		WorkItems.update itemId, {$set: {status: newStatus}}

		updateStatus user, item, oldStatus, newStatus

	# returns emails of all registered meteor.users
	emails: ->
		arr = []

		Meteor.users.find().fetch().forEach (user) ->
			return arr.push user.email if (user.email)
			return if not (user.emails && user.emails.length > 0)

			addrs = user.emails
				.filter (e) -> e.verified and e.address
				.map (e) -> e.address
			arr = arr.concat addrs

		_.uniq arr

	endpoints: ->
		arr = Meteor.users.find().fetch()
			.map (user) ->
				service = user.services.fogbugz
				service?.endpoint
			.filter _.identity
		_.uniq arr
}
