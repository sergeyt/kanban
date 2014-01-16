# always be subscribed to the work items for the selected board.
workItemsHandle = null

Deps.autorun ->
	board = UserSession.get 'board'
	if (board)
		workItemsHandle = Meteor.subscribe 'workItems', board
	else
		# todo unsubscribe
		workItemsHandle = null

Template.items.loading = -> not (workItemsHandle && workItemsHandle.ready())

Template.item.helpers {
	idClass: ->
		if UserSession.get('view') == 'comfort' then 'label label-default' else ''

	goalClass: ->
		if (@tags || []).indexOf('goal') >= 0 then 'goal' else ''

	# todo could be converted to Handlebars helper
	assigneeShortName: -> shortName @assignee

	# todo remove use gravatar helper Handlebars
	avatarUrl: ->
		return '' if not @assignee or not @assignee.email
		Gravatar.imageUrl @assignee.email, {s: 20}

	# todo inline in view
	assigneeState: -> if shortName(@assignee) == 'CLOSED' then 'hidden' else ''

	eventList: -> @events

	commentCount: -> (@events || []).length

	isClosed: -> @status == 'done' or @status == 'closed'
}

Template.item.events =
	'click .work-item a': (event, tpl) ->
		selectedItem = Meteor.Kanban.selectedItem?.get()
		return if not event.ctrlKey and not selectedItem

		event.preventDefault()

		Meteor.Kanban.selectedItem.set tpl.data

Template.item.rendered = ->
	id = @data._id
	item = @find('.work-item')
	$(item).draggable {
		appendTo: ".board-host"
		cursor: "move"
		opacity: 0.7
		helper: "clone"
		start: ->
			Session.set('dragItem', id)
	}

shortName = (user) ->
	return '' if not user or not user.name

	arr = user.name.split ' '
	return arr.slice(0, 2).join(' ') if arr[0].length <= 3

	if arr.length <= 1 then user.name else abbr(arr[0]) + arr[1].substr(0, 1)

abbr = (name) ->
	switch name.toLowerCase()
		when 'alexander' then 'Alex'
		when 'konstantin' then 'Kostya'
		else name
