// get column items
Template.column.items = function () {
	return WorkItems.find({status: this.status});
};

Template.column.count = function () {
	return WorkItems.find({status: this.status}).count() + '/' + WorkItems.find().count();
};

Template.column.percentage = function () {
	var p = WorkItems.find({status: this.status}).count() / WorkItems.find().count();
	return (p * 100).toFixed(2);
};

Template.column.view = function () {
	return Session.get('view') || 'comfort';
};
