// Always be subscribed to the work items for the selected board.
var workItemsHandle = null;

Deps.autorun(function(){
    var board = Session.get('board');
    if (board) {
        workItemsHandle = Meteor.subscribe('workItems', board);
    } else {
        workItemsHandle = null;
    }
});

Template.items.loading = function(){
    return !(workItemsHandle && workItemsHandle.ready());
};

