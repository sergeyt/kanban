Template.filters.helpers({
	items: function(){

		// gather all tags and categories from db
		var cats = [];
		var tags = [];
		var items = WorkItems.find({}).fetch();
		items.forEach(function(it){
			cats =_.uniq(cats.concat([it.category]));
			tags = _.uniq(tags.concat(it.tags));
		});

		cats = cats.map(function(it){
			return {css: it, label: it, filter: {category: it}};
		});
		tags = tags.map(function(it){
			return {css: it, label: it, filter: {tags: it}};
		});

		return cats.concat(tags).map(function(it){
			var count = WorkItems.find(it.filter).count();
			return _.extend({}, it, {count: count});
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
