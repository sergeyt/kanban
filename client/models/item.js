// Always be subscribed to the work items for the selected board.
var workItemsHandle = null;

Deps.autorun(function () {
	var board = Session.get('board');
	if (board) {
		workItemsHandle = Meteor.subscribe('workItems', board);
	} else {
		workItemsHandle = null;
	}
});

Template.items.loading = function () {
	return !(workItemsHandle && workItemsHandle.ready());
};

Template.item.assigneeShortName = function () {
	return shortName(this.assignee);
};

Template.item.avatarUrl = function () {
	return Gravatar.imageUrl(this.assignee.email, {s: 20});
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