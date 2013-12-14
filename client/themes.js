var themes = [
	{name: 'default', label: 'Default'},
	{name: 'amelia', label: 'Amelia'},
	{name: 'cerulean', label: 'Cerulean'},
	{name: 'cosmo', label: 'Cosmo'},
	{name: 'cyborg', label: 'Cyborg'},
	{name: 'flatly', label: 'Flatly'},
	{name: 'journal', label: 'Journal'},
	{name: 'readable', label: 'Readable'},
	{name: 'simplex', label: 'Simplex'},
	{name: 'slate', label: 'Slate'},
	{name: 'spacelab', label: 'Spacelab'},
	{name: 'united', label: 'United'},
	{name: 'yeti', label: 'Yeti'}
];

Template.themes.list = themes.map(function(theme){
	var name = theme.name;
	return _.extend({}, theme, {
		selected: function(){
			return UserSession.get('theme') == name;
		}
	});
});

Template.themeSelector.themes = function(){
	return themes.map(function(theme){
		var name = theme.name;
		return _.extend({}, theme, {
			iconClass: function(){
				return UserSession.get('theme') == name ? '' : 'hidden';
			}
		});
	});
};

Template.themeSelector.events({
	'click a[theme]': function(event){
		event.preventDefault();

		var $e = $(event.target);
		if (!$e.is('a[theme]')){
			$e = $e.parent('a[theme]');
		}

		var theme = $e.attr('theme');
		UserSession.set('theme', theme);
	}
});