Template.navbar.helpers({
	comfortState: function() {
		return Session.get('view') == 'comfort' ? 'active' : '';
	},
	compactState: function() {
		return Session.get('view') == 'compact' ? 'active' : '';
	},
	effectsState: function() {
		return Session.get('effects') == 'cool' ? 'active' : '';
	}
});

Template.navbar.events({
	'click .btn-compact-view': function() {
		Session.set('view', 'compact');
	},
	'click .btn-comfort-view': function() {
		Session.set('view', 'comfort');
	},
	'click .btn-effects': function() {
		var v = Session.get('effects');
		if (v !== 'cool') {
			Session.set('effects', 'cool');
		} else {
			Session.set('effects', 'static');
		}
	}
});
