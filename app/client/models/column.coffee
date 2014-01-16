Meteor.Kanban = {} if typeof Meteor.Kanban == 'undefined'

# common column API
Meteor.Kanban.Column = (name) ->
	hiddenKey = 'column.' + name + '.hidden'

	hidden = -> UserSession.get hiddenKey

	col =
		# determines whether the column is hidden
		hidden: hidden
		# determines whether the column is visible
		visibile: -> not hidden()
		# makes the column to be hidden
		hide: -> UserSession.set hiddenKey, true
		toggle: -> UserSession.set hiddenKey, not hidden()

	col

# todo inline to Meteor.Kanban.Column
columnItems = (col) ->
	filter = {}

	if col.status != 'any'
		filter = {status: col.status}
		filters = Session.get('filters')

		if filters.length > 1
			filter = {$and:[filter, {$or:filters}]}
		else if filters.length > 0
			filter = {$and:[filter, filters[0]]}

	WorkItems.find(filter, {sort: ['priority', 'id']}).fetch()

Template.column.helpers {
	visible: -> Meteor.Kanban.Column(@name).visibile()

	# get column items
	items: -> columnItems(this)

	count: -> columnItems(this).length

	percentage: ->
		p = columnItems(this).length / WorkItems.find().count()
		(p * 100).toFixed(1)

	closeable: ->
		@status != 'any'

	width: ->
		selectedItem = Meteor.Kanban.selectedItem?.get()
		return 4 if selectedItem

		board = Meteor.Kanban.currentBoard()
		return 2 if not board

		acc = (v, it) ->
			Meteor.Kanban.Column(it.name).visibile() ? v + 1 : v

		count = _.reduce board.columns, acc, 0

		switch count
			when 3 then 3
			when 2 then 5
			when 1 then 10
			else 2
}

Template.column.events =
	'click .close': (event, tpl) ->
		Meteor.Kanban.Column(tpl.data.name).hide()

Template.column.rendered = ->
	status = @data.status
	col = @find '.column'

	on_drop = ->
		itemId = Session.get 'dragItem'
		return console.log 'no active drag item' if not itemId

		item = WorkItems.findOne itemId
		return console.log 'unable to find item with id %s', itemId if not item

		# nothing to change
		return if item.status == status

		# predictive change to quickly update clients
		WorkItems.update itemId, {$set: {status: status}}

		Meteor.call 'updateStatus', Meteor.userId(), itemId, item.status, status

	$(col).droppable {
		accept: ".work-item a"
		drop: -> on_drop
	}
