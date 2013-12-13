var themes = [
	{name: 'default', label: 'Default'},
	{name: 'cyborg', label: 'Cyborg'},
	{name: 'slate', label: 'Slate'},
	{name: 'united', label: 'United'},
	{name: 'yeti', label: 'Yeti'}
];

themes.forEach(function(theme){
	var name = theme.name;
	Template.themes[name] = function(){
		return UserSession.get('theme') == name;
	};
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