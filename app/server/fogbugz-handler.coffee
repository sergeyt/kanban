Fiber = Npm.require 'fibers'

# connect handler of fogbugz events come from URL trigger plugin

fogbugzEventHandler = (req, res, next) ->

	# continue down the default middlewares
	return next() if not (/fogbugz\/events/).test(req.url)

	match = (/case(\d+)/).exec(req.url)
	# TODO write error since cannot handle
	return next() if not match

	caseId = match[1]
	console.log 'fogbugz event: case #%d', caseId

	# TODO get new case info and create or update existing work item
	# FogBugz.caseInfo()

	res.writeHead 200, {'Content-Type': 'text/plain'}
	res.end 'received event about case ' + caseId, 'utf-8'

# Listen to incoming fogbugz http requests
WebApp.connectHandlers.use (req, res, next) ->
	# Need to create a Fiber since we're using synchronous http calls and nothing
	# else is wrapping this in a fiber automatically
	fn = ->
		fogbugzEventHandler req, res, next
	Fiber(fn).run()
