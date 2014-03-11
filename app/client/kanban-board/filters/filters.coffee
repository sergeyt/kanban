__has = Object.prototype.hasOwnProperty

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
		return index if predicate(it)
	-1

# returns selected css class
Template.filter.selected = ->
	if index_of(@filter) >= 0 then 'selected' else ''

Template.filter.events =
	'click .filter': (event, tpl) ->
		Meteor.Kanban.Filters.toggle tpl.data.filter

# ----------------
# Priority Filters
# ----------------

unwrap_and = (filter) ->
	p1 = filter.$and[0].priority.$gte
	p2 = filter.$and[1].priority.$lte
	[p1, p2]

is_priority_filter = (filter) ->
	has_priority = (f) ->
		__has.call f, 'priority'
	is_and = (f) ->
		_.isArray(f.$and) and f.$and.length == 2 and f.$and.every(has_priority)
	has_priority(filter) or is_and(filter)

current_priority_filter = ->
	filters = Session.get('filters') || []
	selected = filters.filter is_priority_filter
	if selected.length == 1 then selected[0] else null

is_selected_priority = (priority) ->
	current = current_priority_filter()
	return false unless current

	if _.isArray current.$and
		[p1, p2] = unwrap_and current
		return p1 == priority || p2 == priority

	current.priority.$lte == priority

priority_filters = [1, 2, 3, 4, 5, 6].map (p) ->
	priority = p
	item =
		priority: priority
		label: "P#{p}"
		filter: {priority: {$lte: p}}
		selected: ->
			if is_selected_priority(priority) then 'label-success' else 'label-default'
	item

Template.priority_filters.items = ->
	priority_filters

priority_range = (p1, p2) ->
	f1 = {priority: {$gte: p1}}
	f2 = {priority: {$lte: p2}}
	{$and: [f1, f2]}

update_priority_filter = (current, priority) ->
	if current.hasOwnProperty('$and')
		[p1, p2] = unwrap_and current
		switch
			when priority == p1 then {priority: {$lte: p2}}
			when priority == p2 then {priority: {$lte: p1}}
			when priority < p1 then priority_range priority, p2
			when priority > p1 and priority < p2 then priority_range priority, p2
			else priority_range p1, priority
	else
		p = current.priority.$lte
		return priority_range p, priority if priority > p
		priority_range priority, p

Template.priority_filter.events =
	'click .priority-item': (event, tpl) ->

		priority = tpl.data.priority
		filter = tpl.data.filter
		filters = Session.get('filters') || []
		index = find_index filters, is_priority_filter

		return Meteor.Kanban.Filters.toggle filter if index < 0

		current = filters[index]
		if JSON.stringify(current) == JSON.stringify(filter)
			return Meteor.Kanban.Filters.toggle filter

		filters[index] = update_priority_filter current, priority

		Session.set 'filters', filters
