Session.setDefault('board', null); // name of currently selected board
Session.setDefault('tag_filter', null);
Session.set('view', 'comfort');

Meteor.startup(function () {
	Backbone.history.start({pushState: true});
});
