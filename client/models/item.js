// Always be subscribed to the work items for the selected board.
var workItemsHandle = null;

Deps.autorun(function() {
	var board = Session.get('board');
	if (board) {
		workItemsHandle = Meteor.subscribe('workItems', board);
	} else {
		workItemsHandle = null;
	}
});

Template.items.loading = function() {
	return !(workItemsHandle && workItemsHandle.ready());
};

Template.item.helpers({
	goalClass: function() {
		return (this.tags || []).indexOf('goal') >= 0 ? 'goal' : 'hidden';
	},

	assigneeShortName: function() {
		return shortName(this.assignee);
	},

	avatarUrl: function() {
		return Gravatar.imageUrl(this.assignee.email, {s: 20});
	},

	assigneeState: function() {
		return shortName(this.assignee) == 'CLOSED' ? 'hidden' : '';
	}
});

Template.item.events({
	'click .work-item a': function(e){
		var tr = Template.eventsPane({list: this.events || []});
		var frag = Meteor.render(tr);
		document.body.appendChild(frag);
		$("#events-pane").modal();
	}
});

Template.item.rendered = function() {
	var id = this.data._id;
	$(this.firstNode).draggable({
		cursor: "move",
		opacity: 0.7,
		helper: "clone",
		start: function() {
			Session.set('dragItem', id);
		}
	});
};

function shortName(user) {
	if (!user || !user.name) {
		return '';
	}
	var arr = user.name.split(' ');
	if (arr[0].length <= 3) {
		return arr.slice(0, 2).join(' ');
	}
	return arr.length <= 1 ? user.name : abbr(arr[0]) + arr[1].substr(0, 1);
}

function abbr(name) {
	switch (name.toLowerCase()) {
		case 'alexander':
			return 'Alex';
	}
	return name;
}