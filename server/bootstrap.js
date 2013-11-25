// TODO init from fogbugz

function resolveCaseStatus(c){
    var s = c.status.name.toLowerCase();
    if (s.indexOf('review')) return 'review';
    if (s.indexOf('resolved')) return 'test';
    if (s.indexOf('close')) return 'done';
    return 'active';
}

function caseToWorkItem(c){
    var timestamp = (new Date()).getTime();
    return {
        id: c.id,
        title: c.title,
        status: resolveCaseStatus(c),
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
    FOGBUGZ.connect({
        url: Meteor.settings.fogbugz,
        user: Meteor.settings.user,
        password: Meteor.settings.password
    }).then(function(fb){
            return fb.search();
    }).then(function(list){
        console.log('fetched %d cases', list.length);
        list.map(caseToWorkItem).forEach(function(it){
            WorkItems.insert(it);
        });
        console.log('db updated!');
    });

});
