var Future = Npm.require("fibers/future");

function resolveCaseStatus(c){
    var s = c.status.name.toLowerCase();
    if (s.indexOf('review') >= 0) return 'review';
    if (s.indexOf('resolved')  >= 0) return 'test';
    if (s.indexOf('close')  >= 0) return 'done';
    return 'active';
}

function caseToWorkItem(c){
    var timestamp = (new Date()).getTime();
    return {
        id: c.id,
        title: c.title,
        status: resolveCaseStatus(c),
        board: 'AR8',
        // TODO provide dates in fogbugz.js
        created: timestamp,
        modified: timestamp
    };
}

// if the database is empty on server start, create some sample data.
Meteor.startup(function () {

    console.log('init db...');

    Boards.remove({});
    WorkItems.remove({});

    Boards.insert({
        name: 'AR8',
        columns: [
            {name: 'Backlog', status: 'active'},
            {name: 'Doing', status: 'dev'},
            {name: 'Review', status: 'review'},
            {name: 'Test', status: 'test'},
            {name: 'Done', status: 'done'}
        ]
    });

    // fetch data from fogbugz
    console.log('connecting to fogbugz %s under %s', Meteor.settings.fogbugz, Meteor.settings.user);

    var itemsFuture = new Future();
    var itemsResolver = itemsFuture.resolver();

    FOGBUGZ.connect({
        url: Meteor.settings.fogbugz,
        user: Meteor.settings.user,
        password: Meteor.settings.password
    }).then(function(fb){
            return fb.search();
    }).then(function(list){
        console.log('fetched %d cases', list.length);
        itemsResolver(null, list.map(caseToWorkItem));
    }).fail(function(error){
        console.log('error: %s', error);
        itemsResolver([]);
    });

    var items = itemsFuture.wait();
    for (var i = 0; i < items.length; i++){
        var it = items[i];
        WorkItems.insert(it);
        console.log('inserted %s: %s', it.id, it.title);
    }
    console.log('db updated!');
});
