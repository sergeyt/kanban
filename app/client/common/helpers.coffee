# Handlebars helpers
return if typeof Handlebars == 'undefined'

short_name = (user) ->
	return '' if not user or not user.name

	arr = user.name.split ' '
	return arr.slice(0, 2).join(' ') if arr[0].length <= 3

	if arr.length <= 1 then user.name else abbr(arr[0]) + arr[1].substr(0, 1)

abbr = (name) ->
	switch name.toLowerCase()
		when 'alexander' then 'Alex'
		when 'konstantin' then 'Kostya'
		else name

Meteor.Helpers = {} if not Meteor.Helpers
Meteor.Helpers.short_name = short_name

# formats as relative date
Handlebars.registerHelper "timeago", (date) ->
	'some time ago' if not date
	dateObj = new Date(date)
	moment(dateObj).fromNow().replace(/\ /g, '\u00a0')

# fetch avatar image from gravatar
Handlebars.registerHelper "gravatar", (email, size) ->
	Gravatar.imageUrl(email, {s: size, d: 'retro'})

Handlebars.registerHelper "short_name", (user) ->
	short_name user
