# always be subscribed to the work items for the selected board.
workItemsHandle = null

Deps.autorun ->
	board = UserSession.get 'board'
	if board
		workItemsHandle = Meteor.subscribe 'workItems', board
	else
		# todo unsubscribe
		workItemsHandle = null

Template.items.loading = -> not (workItemsHandle && workItemsHandle.ready())

Template.item.helpers {
	id_class: ->
		if UserSession.get('view') == 'comfort' then 'label label-default' else ''

	goal_class: ->
		if (@tags || []).indexOf('goal') >= 0 then 'goal' else ''

	# todo inline in view
	assignee_state: ->
		if Meteor.Helpers.short_name(@assignee) == 'CLOSED' then 'hidden' else ''

	assignee_title: ->
		return '' if not @assignee
		return "#{@assignee.name} <#{@assignee.email}>"

	comment_count: -> (@events || []).length

	is_closed: -> @status == 'done' or @status == 'closed'
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
