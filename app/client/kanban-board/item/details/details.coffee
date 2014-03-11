# returns selected item
selected_item = ->
	Meteor.Kanban?.selectedItem?.get()

Template.itemDetails.item = ->
	selected_item()

Template.itemDetails.event_list = ->
	selected_item().events || []

Template.itemDetails.contributors = ->
	# todo concat users from changesets
	events = selected_item().events || []
	all = events
		.filter (it) ->
				it.person? and (it.person.name || '').toLowerCase() != 'nobody'
		.map (it) ->
				user =
					name: it.person.name
					email: Meteor.Kanban.resolve_email it.person
				user
	_.uniq all, false, (it) -> it.name

Template.itemDetails.rendered = ->
	tabs = $(@find('.comment-tabs'))
	tabs.on 'show.bs.tab', (event) ->
		tab = $(event.target)
		if tab.is '.comment-preview-tab'
			input = $ '.comment-input'
			preview = $ '.comment-preview'
			markdown = input.val()
			old_markdown = preview.data 'source'
			return if markdown == old_markdown
			Meteor.call 'markdown', markdown, (err, res) ->
				html = err || res
				preview.data 'source', markdown
				preview.html html

# ui event handlers
Template.itemDetails.events =
	'click .close': ->
		Meteor.Kanban.selectedItem.set null

	'click .btn-add-comment': ->
		input = $ '.comment-input'
		comment = input.val()
		return unless comment

		btn = $ '.btn-add-comment'
		input.attr 'disabled', 'disabled'
		btn.attr 'disabled', 'disabled'

		itemId = selected_item().id

		res_handler = (err, res) ->
			input.removeAttr 'disabled'
			btn.removeAttr 'disabled'
			# todo use bootbox to show alerts
			return alert err if err
			input.val('')

		Meteor.call 'comment', Meteor.userId(), itemId, comment, res_handler
