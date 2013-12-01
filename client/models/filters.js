Template.filters.helpers({
	items: function(){
		// TODO get all tags
		return [
			{tag: 'goal', css: 'goal', label: 'goal'},
			{tag: 'regression', css: 'regression', label: 'regression'},
			{cat: 'bug', css: 'bug', label: 'bug'},
			{cat: 'feature', css: 'feature', label: 'feature'},
			{cat: 'task', css: 'task', label: 'task'},
			{cat: 'inquiry', css: 'inquiry', label: 'inquiry'}
		].map(function(it){
			var count = WorkItems.find(it.tag ? {tags: it.tag} : {category: it.cat}).count();
			return _.extend({}, it, {count: count});
		});
	}
});
