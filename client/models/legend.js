function calcCategoryPercentage(category) {
	return (WorkItems.find({category: category}).count() / WorkItems.find().count() * 100).toFixed(2);
}

function calcDoneCategoryPercentage(category) {
	return (WorkItems.find({category: category, status: 'done'}).count() / WorkItems.find().count() * 100).toFixed(2);
}

Template.legend.helpers({
	goal: function() {
		return (WorkItems.find({tags: 'goal'}).count() / WorkItems.find().count() * 100).toFixed(2);
	},
	goalDone: function() {
		return (WorkItems.find({tags: 'goal', status: 'done'}).count() / WorkItems.find().count() * 100).toFixed(2);
	},
	bug: function() {
		return calcCategoryPercentage('bug');
	},
	bugDone: function() {
		return calcDoneCategoryPercentage('bug');
	},
	feature: function() {
		return calcCategoryPercentage('feature');
	},
	featureDone: function() {
		return calcDoneCategoryPercentage('feature');
	},
	task: function() {
		return calcCategoryPercentage('task');
	},
	taskDone: function() {
		return calcDoneCategoryPercentage('task');
	},
	inquiry: function() {
		return calcCategoryPercentage('inquiry');
	},
	inquiryDone: function() {
		return calcDoneCategoryPercentage('inquiry');
	}
});


