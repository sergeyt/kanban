// get column items
Template.column.items = function () {
	var items = WorkItems.find({status: this.status}, {}).fetch();
	console.log('fetched %d items', items.length);
	return items;
};

Template.column.count = function () {
	return WorkItems.find({status: this.status}, {}).count();
};

Template.column.view = function () {
	return Session.get('view') || 'comfort';
};
