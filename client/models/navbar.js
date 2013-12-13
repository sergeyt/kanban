Template.navbar.helpers({
	board: function(){
		return UserSession.get('board') || 'Board';
	},
	comfortState: function() {
		return UserSession.get('view') == 'comfort' ? 'active' : '';
	},
	compactState: function() {
		return UserSession.get('view') == 'compact' ? 'active' : '';
	},
	effectsState: function() {
		return UserSession.get('effects') == 'cool' ? 'active' : '';
	}
});

Template.navbar.events({
	'click .btn-compact-view': function() {
		UserSession.set('view', 'compact');
	},
	'click .btn-comfort-view': function() {
		UserSession.set('view', 'comfort');
	},
	'click .btn-effects': function() {
		var v = UserSession.get('effects');
		if (v !== 'cool') {
			UserSession.set('effects', 'cool');
		} else {
			UserSession.set('effects', 'static');
		}
	},
	'click .btn-clean': function() {
		Meteor.call('clean', Meteor.userId());
	}
});
