Template.columnsVisibility.items = function(){
	var name = UserSession.get('board');
	var board = Boards.findOne({name: name});
	if (!board) return [];
	return board.columns.map(function(it){
		var hidden = !!UserSession.get('column.' + it.name + '.hidden');
		return {
			name: it.name,
			hidden: hidden ? 'hidden' : ''
		};
	});
};

Template.columnsVisibility.events({
	'click li': function(){
		var key = 'column.' + this.name + '.hidden';
		var hidden = !!UserSession.get(key);
		UserSession.set(key, !hidden);
	}
});