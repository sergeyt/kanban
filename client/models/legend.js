function calcCategoryPercentage(category) {
	return (WorkItems.find({category: category}).count() / WorkItems.find().count() * 100).toFixed(2);
}

Template.legend.helpers({
	bug: function() {
		return calcCategoryPercentage('bug');
	},
	feature: function() {
		return calcCategoryPercentage('feature');
	},
	task: function() {
		return calcCategoryPercentage('task');
	},
	inquiry: function() {
		return calcCategoryPercentage('inquiry');
	}
});


