Template.filterbar.visible = ->
	p = Session.get('perspective') || 'board'
	p == 'board' || p == 'kanban' # TODO 'kanban' perspective is obsolete

extend_filter = (it) ->
	filter = it.filter
	count = WorkItems.find(filter).count()
	extra =
		count: count
		state: ->
			if Meteor.Kanban.Filters.indexOf(filter) >= 0 then 'active' else ''
		click: ->
			Meteor.Kanban.Filters.toggle filter
	_.extend it, extra

# gets category filters
Template.filterbar.categories = ->
	cats = []

	items = WorkItems.find({}).fetch()
	items.forEach (it) ->
		cats = _.uniq cats.concat [it.category]

	cats = cats.map (it) ->
		{css: it, label: it, filter: {category: it}}

	cats.map extend_filter

# gets tag filters
Template.filterbar.tags = ->
	tags = []

	items = WorkItems.find({}).fetch()
	items.forEach (it) ->
		tags = _.uniq tags.concat it.tags

	tags = tags.map (it) ->
		{css: it, label: it, filter: {tags: it}}

	tags.map extend_filter

# event handlers
Template.filterbar.events =
	'click .btn-filter': ->
		@click() if @click
