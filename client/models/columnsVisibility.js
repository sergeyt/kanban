Template.columnsVisibility.items = function(){
	var board = App.currentBoard();
	if (!board) return [];
	return board.columns.map(function(it){
		var hidden = App.Column(it.name).hidden();
		return {
			name: it.name,
			hidden: hidden ? 'hidden' : ''
		};
	});
};

Template.columnsVisibility.events({
	'click li': function(){
		App.Column(this.name).toggle();
	}
});