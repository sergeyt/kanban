var Future = Npm.require("fibers/future");

function fbsync(){
	console.log('sync db with fogbugz...');

	Boards.remove({});
	WorkItems.remove({});

	Boards.insert({
		name: 'AR8',
		columns: [
			{name: 'Backlog', status: 'active'},
			{name: 'Doing', status: 'doing'},
			{name: 'Review', status: 'review'},
			{name: 'Test', status: 'test'},
			{name: 'Done', status: 'done'}
		]
	});

	// fetch data from fogbugz
	console.log('connecting to fogbugz %s under %s', Meteor.settings.fogbugz, Meteor.settings.user);

	var itemsFuture = new Future();
	var itemsResolver = itemsFuture.resolver();

	FogBugz.connect({
		url: Meteor.settings.fogbugz,
		user: Meteor.settings.user,
		password: Meteor.settings.password
	}).then(function (fb) {
				return fb.search();
			}).then(function (list) {
				console.log('fetched %d cases', list.length);
				itemsResolver(null, list.map(FogBugz.toWorkItem));
			}).fail(function (error) {
				console.log('error: %s', error);
				itemsResolver(error, []);
			});

	var items = itemsFuture.wait();
	for (var i = 0; i < items.length; i++) {
		var it = items[i];
		WorkItems.insert(it);
		console.log('inserted %s: %s', it.id, it.title);
	}
	console.log('sync done!');
}

Meteor.methods({
	sync: function(){
		fbsync();
	}
});

// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
	if (Boards.find().count() == 0) {
		fbsync();
	}
});
