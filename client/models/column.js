// get column items
Template.column.items = function(){
    var items = WorkItems.find({status: this.status}, {}).fetch();
    console.log('fetched %d items', items.length);
    return items;
};
