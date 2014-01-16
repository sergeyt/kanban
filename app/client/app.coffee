Session.setDefault 'filters', []

Template.app.view = -> UserSession.get('view') || 'comfort'

# TODO rename
Template.app.effects = -> UserSession.get('effects') || 'static'

Template.app.selectedItem = ->
	Meteor.Kanban?.selectedItem?.get()

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

# todo attempt to fix tabs inside modal, remove when not-needed
#	activate_tab = ->
#		$this = $(this)
#		$this.tab()
#		a = $this.find('a');
#		a.click (e) ->
#			e.preventDefault()
#			$this.tab('show')
#
#
#	deactivate_tab = ->
#		$(this).tab('destroy')

	$ ->
		$('[data-toggle="tooltip"]').livequery create_tooltip, destroy_dooltip
#		$('.nav-tabs').livequery activate_tab, deactivate_tab
