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
	$(this.firstNode).droppable({
		accept: ".work-item",
		drop: function(){
			var id = Session.get('dragItem');
			if (id){
				console.log('updating %s on status %s', id, status);
				WorkItems.update(id, {$set: {status: status}});
			}
		}
	});
};