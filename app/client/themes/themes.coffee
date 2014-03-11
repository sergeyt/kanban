themes = [
	{name: 'default', label: 'Default'}
	{name: 'amelia', label: 'Amelia'}
	{name: 'cerulean', label: 'Cerulean'}
	{name: 'cosmo', label: 'Cosmo'}
	{name: 'cyborg', label: 'Cyborg'}
	{name: 'flatly', label: 'Flatly'}
	{name: 'journal', label: 'Journal'}
	{name: 'readable', label: 'Readable'}
	{name: 'simplex', label: 'Simplex'}
	{name: 'slate', label: 'Slate'}
	{name: 'spacelab', label: 'Spacelab'}
	{name: 'united', label: 'United'}
	{name: 'yeti', label: 'Yeti'}
]

Template.themes.list = themes.map (theme) ->
	name = theme.name
	extra =
		selected: -> UserSession.get('theme') == name
	_.extend {}, theme, extra

Template.themeSelector.themes = ->
	themes.map (theme) ->
		name = theme.name
		_.extend {}, theme, {
			iconClass: ->
				# todo inline to view
				if UserSession.get('theme') == name then '' else 'hidden'
		}

Template.themeSelector.events =
	'click a[theme]': (event) ->
		event.preventDefault()

		$e = $(event.target)
		$e = $e.parent('a[theme]') unless $e.is('a[theme]')

		theme = $e.attr 'theme'
		UserSession.set 'theme', theme
