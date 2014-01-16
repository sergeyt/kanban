typeaheadDataSet = (key, method) ->
	_key = key
	_method = method

	return ->
		_method = _key if not _method
		data = Session.get _key || []

		Meteor.call _method, (err, res) ->
			return if EJSON.equals res, data
			Session.set _key, res

		JSON.stringify data

Template.login.emails = typeaheadDataSet 'emails'
Template.login.endpoints = typeaheadDataSet 'endpoints'

Template.login.events =
	'click .login-button': (event, tpl) ->

		event.preventDefault()

    # retrieve the input field values
		options =
			fogbugz: tpl.find('#endpoint').value
			email: tpl.find('#login-email').value
			password: tpl.find('#login-password').value

		Meteor.loginWithFogBugz options, (err) ->
			return alert "login failed: #{err}" if err
			Meteor.call 'onLogin', Meteor.userId()

Template.login.rendered = ->
	$(@firstNode).find('.typeahead').each ->
		Meteor.typeahead(this)
