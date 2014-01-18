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

index_of = (filter) ->
	filter = JSON.stringify filter
	filters = Session.get('filters') || []
	for it, index in filters
		return index if JSON.stringify(it) == filter
	-1

Template.filter.selected = ->
	if index_of(@filter) >= 0 then 'selected' else ''

Template.filter.events =
	'click .filter': (event, tpl) ->

		filters = (Session.get('filters') || []).slice()

		index = index_of tpl.data.filter
		if index < 0
			filters.push(tpl.data.filter)
		else
			filters.splice(index, 1)

		Session.set 'filters', filters
