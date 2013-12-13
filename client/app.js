Session.setDefault('filters', []);

Template.app.helpers({
	view: function() {
		return UserSession.get('view') || 'comfort';
	},
	// TODO rename
	effects: function(){
		return UserSession.get('effects') || 'static';
	}
});

Meteor.startup(function () {
	// TODO HTML5 navigation history with routes
	// Backbone.history.start({pushState: true});

	$(function(){
		$('[data-toggle="tooltip"]').tooltip();
	})
});
