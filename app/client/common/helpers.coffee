# Handlebars helpers
return if typeof Handlebars == 'undefined'

Handlebars.registerHelper "timeago", (date) ->
	'some time ago' if not date
	dateObj = new Date(date)
	moment(dateObj).fromNow().replace(/\ /g, '\u00a0')

Handlebars.registerHelper "gravatar", (email, size) ->
	Gravatar.imageUrl(email, {s: size})
