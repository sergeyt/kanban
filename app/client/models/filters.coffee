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

Template.filters.events {
	'click .filter': (event) ->

		target = $(event.target)
		target = target.parent('.filter') if not target.is('.filter')
		target.toggleClass('selected')

		# update session filters
		filters = (Session.get('filters') || []).slice()

		if target.is('.selected')
			filters.push(this.filter)
		else
			# TODO make some utility function/extension
			filter = JSON.stringify(this.filter)
			for f, index in filters
				if JSON.stringify(f) == filter
					filters.splice(index, 1)
					break

		Session.set('filters', filters)
}
