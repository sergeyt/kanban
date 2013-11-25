// TODO init from fogbugz
// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
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

    var timestamp = (new Date()).getTime();

    WorkItems.insert({
        text: "AR8 Setup should install the documentation on the user's machine",
        status: 'active',
        tags: ['goal'],
        board: ['AR8'],
        created: timestamp,
        modified: timestamp
    });

});
