ItemStatus =
	active: 'active'
	doing: 'doing'
	review: 'review'
	test: 'test'
	done: 'done'

status_map = [
	['active', ItemStatus.active],
	['review', ItemStatus.review],
	['resolved', ItemStatus.test],
	['close', ItemStatus.done]
]

map_status = (status) ->
	status = status.toLowerCase()
	f = status_map.filter (p) ->
		status.indexOf(p[0]) >= 0
	return f[0][1] if f.length > 0
	return 'unknown'

reduce_event = (event) ->
	# detect status change
	if event.changes and (/^status changed/i).test(event.changes)
		m = event.changes.match /from '([^']+)' to '([^']+)'/i
		return null if not m
		status = map_status m[2]
		return {date: event.date, status: status}
	# detect dev taken a case (assigned to self)
	if event.description
		m = event.description.match /assigned to (.+) by (.+)/i
		if m and m[1] == m[2]
			return {date: event.date, status: ItemStatus.doing}
		m = event.description.match /closed by (.+)/i
		return {date: event.date, status: ItemStatus.done} if m

	return null

# Determines case statuses at given day
statuses_at_day = (item, all_events, date) ->
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
	events = item.events.map(reduce_event).filter (e) -> e?
	statuses = days.map (d) -> statuses_at_day(item, events, d)

	# remove duplicate statuses
	for status_list, index in statuses
		continue if index == 0
		prev = _.flatten(statuses.slice(0,index))
		filtered_list = status_list.filter (st) ->
			prev.indexOf(st) < 0
		statuses[index] = filtered_list

	statuses

count_statuses_at_day = (dataset, day_index) ->
	counts = {impl: 0, review: 0, testing: 0, verified: 0}

	for record in dataset
		for status in record[day_index]
			switch status
				when ItemStatus.doing then counts.impl++
				when ItemStatus.review then counts.review++
				when ItemStatus.test then counts.testing++
				when ItemStatus.done then counts.verified++

	counts

# build cumulative flow diagram (chart definition for d3-gems)
build_cfd = ->
	# gathering series from WorkItems
	# get sprint days
	board = Meteor.Kanban.currentBoard()
	return null if not board

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
	# from start to end date, per each day determine status of work item
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
		counts = count_statuses_at_day(dataset, i)
		if i > 0
			counts.impl += series.impl[i - 1]
			counts.review += series.review[i - 1]
			counts.testing += series.testing[i - 1]
			counts.verified += series.verified[i - 1]

		series.impl[i] = counts.impl
		series.review[i] = counts.review
		series.testing[i] = counts.testing
		series.verified[i] = counts.verified

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
	$(@find('.cfd')).data('chart', chart).chart() if chart

Template.dashboard.events =
	'click .close': ->
		Session.set 'perspective', 'kanban'
