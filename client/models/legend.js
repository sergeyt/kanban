Template.legend.helpers({
	items: function(){
		return [
			{tag: 'goal', css: 'goal', title: 'Goals'},
			{cat: 'bug', css: 'bug', title: 'Bugs'},
			{cat: 'feature', css: 'feature', title: 'Features'},
			{cat: 'task', css: 'task', title: 'Tasks'},
			{cat: 'inquiry', css: 'inquiry', title: 'Inquiries'}
		].map(function(it){
			var total = WorkItems.find().count();
			var count = WorkItems.find(it.tag ? {tags: it.tag} : {category: it.cat}).count();
			var done = WorkItems.find(it.tag ? {tags: it.tag, status: 'done'} : {category: it.cat, status: 'done'}).count();
			return _.extend({}, it, {
				done: count === 0 ? '' : (done/total*100).toFixed(2),
				total: count === 0 ? '' : (count/total*100).toFixed(2)
			});
		});
	}
});


