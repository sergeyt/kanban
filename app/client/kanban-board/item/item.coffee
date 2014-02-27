virtual_user_patterns = ['team', 'qa', 'dev'].map (s) ->
	new RegExp("\\s*" + s + "\\s*", "i")

is_virtual_user = (name) ->
	virtual_user_patterns.some (e) ->
		e.test name

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

	assignee_title: ->
		return "#{@assignee.name} <#{@assignee.email}>"

	assignee_virtual: ->
		is_virtual_user @assignee.name

	comment_count: -> (@events || []).length

	is_closed: -> @status == 'done' or @status == 'closed'

	popover_content: ->
		data = @
		frag = Meteor.render ->
			Template.item_popover(data)
		frag.firstChild.outerHTML
}

Template.item.events =
	'click .work-item .content': (event, tpl) ->
		selectedItem = Meteor.Kanban.selectedItem?.get()
		return if not event.ctrlKey and not selectedItem

		event.preventDefault()

		Meteor.Kanban.selectedItem.set tpl.data

init_drag = (item, id) ->
	item.draggable {
		appendTo: ".board-host"
		cursor: "move"
		opacity: 0.7
		helper: "clone"
		start: ->
			Session.set('dragItem', id)
	}

Template.item.rendered = ->
	id = @data._id
	item = $(@find('.work-item'))
	init_drag item, id
	# todo do not display popover on small devices
	item.find('[rel="popover"]').popover()
