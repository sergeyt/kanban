selectedItem = ->
	Meteor.Kanban?.selectedItem?.get()

Template.itemDetails.item = ->
	selectedItem()

Template.itemDetails.eventList = ->
	selectedItem().events || []

Template.itemDetails.contributors = ->
	# todo concat users from changesets
	events = selectedItem().events || []
	all = events
		.filter (it) ->
				it.person?
		.map (it) ->
				# todo resolve email
				{name: it.person.name, email: ''}
	_.uniq all, false, (it) -> it.name
