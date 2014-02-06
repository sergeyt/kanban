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
	'click .login-button': (event) ->

		event.preventDefault()

    # retrieve the input field values
		options =
			fogbugz: $('#endpoint').val()
			email: $('#login-email').val()
			password: $('#login-password').val()

		Meteor.loginWithFogBugz options, (err) ->
			return alert "login failed: #{err}" if err
			Meteor.call 'on_login', Meteor.userId()

Template.login.rendered = ->
	$(@firstNode).find('.typeahead').each ->
		Meteor.typeahead(this)
