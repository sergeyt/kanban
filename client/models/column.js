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
	return WorkItems.find(filter, {sort: ['id']}).fetch();
}

Template.column.helpers({
	visible: function(){
		var key = 'column.' + this.name + '.hidden';
		return !!!Session.get(key);
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
	}
});

Template.column.rendered = function(){
	var status = this.data.status;
	var col = this.find('.column');
	$(col).droppable({
		accept: ".work-item a",
		drop: function(){
			var id = Session.get('dragItem');
			if (!id){
				console.log('no active drag item');
				return;
			}
			var item = WorkItems.findOne(id);
			if (!item) {
				console.log('unable to find item with id %s', id);
				return;
			}
			if (item.status == status){
				return;
			}
			Meteor.call('updateStatus', Meteor.userId(), id, item.status, status);
		}
	});
};