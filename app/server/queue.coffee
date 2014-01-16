Fiber = Npm.require 'fibers'

Function.prototype.fiber = ->
	Fiber(this).run()

Meteor.startup ->
	q = new PowerQueue {name: 'task-queue', isPaused: true}

	# TODO request future to make PowerQueue to be fiber-safe
	q.taskHandler = (data, next, failures) ->
		Meteor.sync ->
			try
				data next, failures
			catch err
				next 'Unable to run task, Error: ' + err.message

	# public api
	Meteor.pushTask = (task) ->
		fn = -> q.add(task)
		Fiber(fn).run()

	Meteor.runTasks = ->
		fn = -> q.run()
		Fiber(fn).run()

	# self-test
	Meteor.pushTask (done) ->
		console.log 'task-queue is ready'
		done()

	Meteor.runTasks()
