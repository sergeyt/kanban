if (typeof App === 'undefined') App = {};

// common column API
App.Column = function(name){
	var hiddenKey = 'column.' + name + '.hidden';

	function hidden(){
		return !!UserSession.get(hiddenKey);
	}

	return {
		hidden: hidden,
		visibile: function(){
			return !hidden();
		},
		hide: function(){
			return UserSession.set(hiddenKey, true);
		},
		toggle: function(){
			UserSession.set(hiddenKey, !hidden());
		}
	};
};

function colurmItems(col){
	var filter = {status: col.status};
	var filters = Session.get('filters');
	if (filters.length > 0){
		if (filters.length > 1){
			filter = {$and:[filter, {$or:filters}]};
		} else {
			filter = {$and:[filter, filters[0]]};
		}
	}
	return WorkItems.find(filter, {sort: ['priority', 'id']}).fetch();
}

Template.column.helpers({
	visible: function(){
		return App.Column(this.name).visibile();
	},

	// get column items
	items: function() {
		return colurmItems(this);
	},

	count: function() {
		return colurmItems(this).length;
	},

	percentage: function() {
		var p = colurmItems(this).length / WorkItems.find().count();
		return (p * 100).toFixed(1);
	},

	width: function(){
		var board = App.currentBoard();
		if (!board) return 2;

		var count = _.reduce(board.columns, function(v, it) {
			return App.Column(it.name).visibile() ? v + 1 : v;
		}, 0);

		switch (count){
			case 3:
				return 3;
			case 2:
				return 5;
			case 1:
				return 10;
		}

		return 2;
	}
});

Template.column.events({
	'click .close': function(e, t){
		App.Column(t.data.name).hide();
	}
});

Template.column.rendered = function(){
	var status = this.data.status;
	var col = this.find('.column');
	$(col).droppable({
		accept: ".work-item a",
		drop: function(){
			var itemId = Session.get('dragItem');
			if (!itemId){
				console.log('no active drag item');
				return;
			}
			var item = WorkItems.findOne(itemId);
			if (!item) {
				console.log('unable to find item with id %s', itemId);
				return;
			}
			if (item.status == status){
				return;
			}

			// predictive change to quickly update clients
			WorkItems.update(itemId, {$set: {status: status}});

			Meteor.call('updateStatus', Meteor.userId(), itemId, item.status, status);
		}
	});
};