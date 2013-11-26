Template.toolbar.events({
	'click .btn-compact-view': function () {
		Session.set('view', 'compact');
	},
	'click .btn-comfort-view': function () {
		Session.set('view', 'comfort');
	}
});
