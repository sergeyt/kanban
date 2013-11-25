// get column items
Template.column.items = function(){
    var items = WorkItems.find({status: this.status}, {}).fetch();
    return items;
};
