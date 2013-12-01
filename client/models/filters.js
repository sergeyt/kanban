Template.filters.helpers({
	items: function(){
		// TODO calculate all tags and categories from db
		return [
			{tag: 'goal', css: 'goal', label: 'goal'},
			{tag: 'regression', css: 'regression', label: 'regression'},
			{cat: 'bug', css: 'bug', label: 'bug'},
			{cat: 'feature', css: 'feature', label: 'feature'},
			{cat: 'task', css: 'task', label: 'task'},
			{cat: 'inquiry', css: 'inquiry', label: 'inquiry'}
		].map(function(it){
			var filter = it.tag ? {tags: it.tag} : {category: it.cat};
			var count = WorkItems.find(filter).count();
			return _.extend({}, it, {filter: filter, count: count});
		});
	}
});

Template.filters.events({
	'click .filter': function(e, t){
		var target = $(e.target);
		if (!target.is('.filter')){
			target = target.parent('.filter');
		}

		target.toggleClass('selected');

		// update session filters
		var filters = (Session.get('filters') || []).slice();
		if (target.is('.selected')){
			filters.push(this.filter);
		} else {
			// TODO make some utility function/extension
			var filter = JSON.stringify(this.filter);
			for (var i = 0; i < filters.length; i++){
				var f = filters[i];
				if (JSON.stringify(f) == filter){
					filters.splice(i, 1);
					break;
				}
			}
		}
		Session.set('filters', filters);
	}
});
