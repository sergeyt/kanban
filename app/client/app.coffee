Session.setDefault 'filters', []

Template.app.view = ->
	UserSession.get('view') || 'comfort'

# TODO rename
Template.app.effects = ->
	UserSession.get('effects') || 'static'

Meteor.startup ->
	# TODO HTML5 navigation history with routes
	# Backbone.history.start {pushState: true}
	initBootstrap()

initBootstrap = ->
	# auto activation of bootstrap tooltips
	create_tooltip = ->
		$(this).tooltip()
	destroy_dooltip = ->
		$(this).tooltip('destroy')

	$ ->
		$('[data-toggle="tooltip"]').livequery create_tooltip, destroy_dooltip
