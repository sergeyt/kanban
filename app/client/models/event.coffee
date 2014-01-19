# work item event
Template.event.content = ->
	@html || @text

Template.event.email = ->
	Meteor.Kanban.resolve_email @person

Template.event.rendered = ->
	$e =  $ @find '.item-event'
	btn = $e.find '.btn-expand'
	panel = $e.find '.panel-collapse'
	btn.click ->
		btn.toggleClass('icon-expanded').toggleClass('icon-collapsed')
		panel.toggleClass 'in'
