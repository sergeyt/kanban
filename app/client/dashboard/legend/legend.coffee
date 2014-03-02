ItemStatus =
	active: 'active'
	doing: 'doing'
	review: 'review'
	test: 'test'
	done: 'done'

Template.dashboard_legend.items = ->
	[
		# TODO common API to get label for status
		{status: ItemStatus.active, label: 'Open'},
		{status: ItemStatus.doing, label: 'In development'},
		{status: ItemStatus.review, label: 'On review'},
		{status: ItemStatus.test, label: 'In testing'},
		{status: ItemStatus.done, label: 'Verified'},
	].map (it) ->
		count = WorkItems.find({status: it.status}).count()
		{label: it.label, count: count}
