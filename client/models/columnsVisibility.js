Template.columnsVisibility.items = function(){
	var name = Session.get('board');
	var board = Boards.findOne({name: name});
	if (!board) return [];
	return board.columns.map(function(it){
		var hidden = !!Session.get('column.' + it.name + '.hidden');
		return {
			name: it.name,
			iconClass: hidden ? 'hidden' : ''
		};
	});
};

Template.columnsVisibility.events({
	'click li': function(){
		var key = 'column.' + this.name + '.hidden';
		var hidden = !!Session.get(key);
		Session.set(key, !hidden);
	}
});