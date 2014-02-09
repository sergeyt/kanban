ItemStatus =
	active: 'active'
	doing: 'doing'
	review: 'review'
	test: 'test'
	done: 'done'

status_map = [
	['review', ItemStatus.review],
	['resolved', ItemStatus.test],
	['close', ItemStatus.done]
]

map_status = (s) ->
	f = status_map.filter (p) ->
		s.indexOf(p[0]) >= 0
	return f[1] if f.length > 0
	return 'unknown'

reduce_event = (event) ->
	# detect status change
	if event.changes and (/^status changed/i).test(event.changes)
		m = event.changes.match /from '([~']+)' to '([~']+)'/i
		status = map_status m[2]
		return {date: event.date, status: status}
	# detect dev taken a case (assigned to self)
	if event.description
		m = event.description.match /assigned to (.+) by (.+)/i
		return {date: event.date, status: ItemStatus.active} if m[1] == m[2]
	return null

# Determines case statuses at given day
statuses_at_day = (item, all_events, date) ->
	return [ItemStatus.done] if it.status == ItemStatus.done
	# get events for given day
	day = moment(date).dayOfYear()
	events = all_events.filter (e) ->
		moment(e.date).dayOfYear() == day
	statuses = events.map (e) -> e.status
	statuses = _.uniq statuses
	return statuses

# Determines case status for given days
item_statuses = (item, days) ->

	# process only status/assignee changes
	events = []
	item.events.forEach (event) ->
		e = reduce_event event
		events.push e if e

	# todo remove duplicate/old statuses
	days.map (d) ->
		statuses_at_day(item, events, d)

# build cumulative flow diagram (chart definition for d3-gems)
build_cfd = ->
	# gathering series from WorkItems
	# get sprint days
	board = Meteor.Kanban.currentBoard()
	end_day = moment(board.end).dayOfYear()
	today = moment(new Date()).dayOfYear()
	# todo reset time
	days = [board.start]
	while true
		next = moment(days[days.length - 1]).add('d', 1)
		day = next.dayOfYear()
		break if day == end_day || day == today
		# todo reset time
		days.push next.toDate()

	# for every work item do the following:
	# from start to end date, per each day determine status of work item in this day
	items = WorkItems.find({}).fetch()
	dataset = items.map (it) -> item_statuses it, days

	# now transform statuses to CFD series
	# init series
	series =
		todo: days.map -> items.length
		impl: days.map -> 0
		review: days.map -> 0
		testing: days.map -> 0
		verified: days.map -> 0

	for d,i in days
		for record in dataset
			for status in record[i]
				switch status
					when ItemStatus.doing then series.impl[i]++
					when ItemStatus.review then series.review[i]++
					when ItemStatus.test then series.testing[i]++
					when ItemStatus.done then series.verified[i]++

	chart =
		type: 'cfd'
		axes:
			x: { majorTicks: "outside" }
			y:
				majorTicks: "outside"
				scalar: true
				margin: true
				grid: { major: true, minor: false }
		title:
			text: 'Cumulative Flow Diagram'
			position: 'center'
		legend:
			position: 'topright'
		series: series

	chart

Template.dashboard.rendered = ->
	chart = build_cfd()
	$(@find('.cfd')).data('chart', chart).chart()

Template.dashboard.events =
	'click .close': ->
		Session.set 'perspective', 'kanban'
