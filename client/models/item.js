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
  idClass: function() {
	return Session.get('view') == 'comfort' ? 'label label-default' : '';
  },

  goalClass: function() {
	return (this.tags || []).indexOf('goal') >= 0 ? 'goal' : '';
  },

  assigneeShortName: function() {
	return shortName(this.assignee);
  },

  avatarUrl: function() {
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
  },

  closedClass: function() {
	if (this.status != 'done') return 'hidden';
	return this.closed ? '' : 'hidden';
  },
  closedShort: function() {
	if (!this.closed) return '';
	return PrettyDate.format(new Date(this.closed));
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
  var item = this.find('.work-item a');
  $(item).draggable({
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