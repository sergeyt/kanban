Template.column.helpers({
	// get column items
	items: function() {
		return WorkItems.find({status: this.status}, {sort: ['id']});
	},

	count: function() {
		return WorkItems.find({status: this.status}).count() + '/' + WorkItems.find().count();
	},

	percentage: function() {
		var p = WorkItems.find({status: this.status}).count() / WorkItems.find().count();
		return (p * 100).toFixed(2);
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