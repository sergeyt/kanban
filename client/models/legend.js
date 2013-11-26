function calcCategoryPercentage(category) {
	return (WorkItems.find({category: category}).count() / WorkItems.find().count() * 100).toFixed(2);
}

Template.legend.bug = function () {
	return calcCategoryPercentage('bug');
};
Template.legend.feature = function () {
	return calcCategoryPercentage('feature');
};
Template.legend.task = function () {
	return calcCategoryPercentage('task');
};
Template.legend.inquiry = function () {
	return calcCategoryPercentage('inquiry');
};

