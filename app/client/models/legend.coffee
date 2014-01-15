Template.legend.items = ->
	# TODO calculate all tags and categories from db
	return [
		{tag: 'goal', css: 'goal', title: 'Goals'},
		{cat: 'bug', css: 'bug', title: 'Bugs'},
		{cat: 'feature', css: 'feature', title: 'Features'},
		{cat: 'task', css: 'task', title: 'Tasks'},
		{cat: 'inquiry', css: 'inquiry', title: 'Inquiries'}
	].map (it) ->
		total = WorkItems.find().count()

		filter = if it.tag then {tags: it.tag} else {category: it.cat}
		count = WorkItems.find(filter).count()

		filter.status = 'done'
		done = WorkItems.find(filter).count()

		_.extend {}, it, {
			done: if count == 0 then '' else (done/total*100).toFixed(2)
			total: if count == 0 then '' else (count/total*100).toFixed(2)
		}
