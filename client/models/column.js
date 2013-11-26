Template.column.helpers({
	// get column items
	items: function() {
		return WorkItems.find({status: this.status});
	},

	count: function() {
		return WorkItems.find({status: this.status}).count() + '/' + WorkItems.find().count();
	},

	percentage: function() {
		var p = WorkItems.find({status: this.status}).count() / WorkItems.find().count();
		return (p * 100).toFixed(2);
	},

	view: function() {
		return Session.get('view') || 'comfort';
	}
});

