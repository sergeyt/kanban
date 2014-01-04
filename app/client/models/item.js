// Always be subscribed to the work items for the selected board.
var workItemsHandle = null;

Deps.autorun(function() {
	var board = UserSession.get('board');
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
	idClass: function() {
		return UserSession.get('view') == 'comfort' ? 'label label-default' : '';
	},

	goalClass: function() {
		return (this.tags || []).indexOf('goal') >= 0 ? 'goal' : '';
	},

	assigneeShortName: function() {
		return shortName(this.assignee);
	},

	avatarUrl: function() {
		if (!this.assignee || !this.assignee.email) return '';
		return Gravatar.imageUrl(this.assignee.email, {s: 20});
	},

	assigneeState: function() {
		return shortName(this.assignee) == 'CLOSED' ? 'hidden' : '';
	},

	eventList: function() {
		return this.events;
	},

	commentCount: function() {
		return (this.events || []).length;
	}
});

Template.item.events({
	'click .work-item a': function(e) {
		if (!e.ctrlKey) return;

		e.preventDefault();

		var tr = Template.itemDetails({
			item: this,
			eventList: this.events || []
		});

		var frag = Meteor.render(tr);
		var id = frag.firstElementChild.id;
		document.body.appendChild(frag);
		$("#" + id).modal({show: true});
	}
});

Template.item.rendered = function() {
	var id = this.data._id;
	var item = this.find('.work-item');
	$(item).draggable({
		appendTo: ".board-host",
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
        case 'konstantin':
            return 'Kostya';
	}
	return name;
}