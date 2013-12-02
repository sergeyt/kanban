Session.setDefault('board', null); // name of currently selected board
Session.setDefault('filters', []);
Session.set('view', 'comfort');

Template.app.helpers({
	view: function() {
		return Session.get('view') || 'comfort';
	},
	// TODO rename
	effects: function(){
		return Session.get('effects') || 'static';
	}
});

Meteor.startup(function () {
	Backbone.history.start({pushState: true});
	$(function(){
		$("[data-toggle=tooltip]").tooltip();
	})
});
