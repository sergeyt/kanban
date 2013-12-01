Session.setDefault('board', null); // name of currently selected board
Session.setDefault('filters', []);
Session.set('view', 'comfort');

Meteor.startup(function () {
	Backbone.history.start({pushState: true});
	$(function(){
		$("[data-toggle=tooltip]").tooltip();
	})
});
