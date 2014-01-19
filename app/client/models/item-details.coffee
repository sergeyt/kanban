# returns selected item
selectedItem = ->
	Meteor.Kanban?.selectedItem?.get()

Template.itemDetails.item = ->
	selectedItem()

Template.itemDetails.event_list = ->
	selectedItem().events || []

Template.itemDetails.contributors = ->
	# todo concat users from changesets
	events = selectedItem().events || []
	all = events
		.filter (it) ->
				it.person? and (it.person.name || '').toLowerCase() != 'nobody'
		.map (it) ->
				user =
					name: it.person.name
					email: Meteor.Kanban.resolve_email it.person
				user
	_.uniq all, false, (it) -> it.name

# ui event handlers
Template.itemDetails.events =
	'click .close': ->
		Meteor.Kanban.selectedItem.set null

	'click .btn-add-comment': ->
		input = $ '.comment-input'
		comment = input.val()
		return if not comment

		btn = $ '.btn-add-comment'
		input.attr 'disabled', 'disabled'
		btn.attr 'disabled', 'disabled'

		itemId = selectedItem().id

		res_handler = (err, res) ->
			input.removeAttr 'disabled'
			btn.removeAttr 'disabled'
			# todo use bootbox to show alerts
			return alert err if err
			input.val('')

		Meteor.call 'comment', Meteor.userId(), itemId, comment, res_handler
