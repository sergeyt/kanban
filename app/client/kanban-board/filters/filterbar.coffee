Template.filterbar.visible = ->
	p = Session.get('perspective') || 'board'
	p == 'board' || p == 'kanban' # TODO 'kanban' perspective is obsolete

Template.filterbar.categories = ->
	cats = []

	items = WorkItems.find({}).fetch()
	items.forEach (it) ->
		cats = _.uniq cats.concat [it.category]

	cats = cats.map (it) ->
		{css: it, label: it, filter: {category: it}}

	cats.map (it) ->
		count = WorkItems.find(it.filter).count()
		_.extend it, {count: count}

Template.filterbar.tags = ->
	tags = []

	items = WorkItems.find({}).fetch()
	items.forEach (it) ->
		tags = _.uniq tags.concat it.tags

	tags = tags.map (it) ->
		{css: it, label: it, filter: {tags: it}}

	tags.map (it) ->
		count = WorkItems.find(it.filter).count()
		_.extend it, {count: count}
