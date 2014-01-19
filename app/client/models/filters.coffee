Template.filters.items = ->
	# gather all tags and categories from db
	cats = []
	tags = []

	items = WorkItems.find({}).fetch()
	items.forEach (it) ->
		cats = _.uniq cats.concat [it.category]
		tags = _.uniq tags.concat it.tags

	cats = cats.map (it) ->
		{css: it, label: it, filter: {category: it}}

	tags = tags.map (it) ->
		{css: it, label: it, filter: {tags: it}}

	cats.concat(tags).map (it) ->
		count = WorkItems.find(it.filter).count()
		_.extend {}, it, {count: count}

# returns index of given filter
index_of = (filter) ->
	filter = JSON.stringify filter
	filters = Session.get('filters') || []
	for it, index in filters
		return index if JSON.stringify(it) == filter
	-1

find_index = (list, predicate) ->
	for it, index in list
		return index if predicae(it)
	-1

toggle_filter = (filter) ->
	filters = (Session.get('filters') || []).slice()

	index = index_of filter
	if index < 0
		filters.push(filter)
	else
		filters.splice(index, 1)

	Session.set 'filters', filters

# returns selected css class
Template.filter.selected = ->
	if index_of(@filter) >= 0 then 'selected' else ''

Template.filter.events =
	'click .filter': (event, tpl) ->
		toggle_filter tpl.data.filter

# priority filters

is_selected_priority = (p) ->
	filters = Session.get('filters') || []
	selected = filters.filter (f) ->
		f.hasOwnProperty 'priority'
	return false if selected.length == 0

	filter = selected[0]
	if filter.priority.hasOwnProperty('$and')
		p1 = filter.priority.$and[0].$gte
		p2 = filter.priority.$and[1].$lte
		return p1 == p || p2 == p

	filter.priority.$lte == p

Template.priority_filters.items = ->
	# todo fetch priorities from db
	[1, 2, 3, 4, 5, 6].map (p) ->
		filter = {priority: {$lte: p}}
		item =
			priority: p
			label: "P#{p}"
			filter: filter
			selected: ->
				if is_selected_priority(p) >= 0 then 'label-success' else 'label-default'
		item

Template.priority_filter.events =
	'click .priority-item': (event, tpl) ->

		priority = tpl.data.priority
		filter = tpl.data.filter
		filters = Session.get('filters') || []
		index = find_index filters, (f) ->
			f.hasOwnProperty 'priority'

		if index < 0
			return toggle_filter filter

		other = filters[index]
		if JSON.stringify(other) == JSON.stringify(filter)
			return toggle_filter filter

		if other.priority.hasOwnProperty('$and')
			p1 = other.priority.$and[0].$gte
			p2 = other.priority.$and[1].$lte
			if priority == p1
				filters[index] = {priority: {$lte: p2}}
			else if priority == p2
				filters[index] = {priority: {$lte: p1}}
			else if priority > p2
				filters[index] = {priority: {$and: [{$gte: p1}, {$lte: priority}]}}
			else if priority < p1
				filters[index] = {priority: {$and: [{$gte: priority}, {$lte: p2}]}}
		else
			p = other.priority.$lte
			if priority > p
				filters[index] = {priority: {$and: [{$gte: p}, {$lte: priority}]}}
			else
				filters[index] = {priority: {$and: [{$gte: priority}, {$lte: p}]}}

		Session.set 'filters', filters
