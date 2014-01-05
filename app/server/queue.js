var Fiber = Npm.require('fibers');

Function.prototype.fiber = function(){
	return Fiber(this).run();
};

Meteor.startup(function(){
	var q = new PowerQueue({
		name: 'task-queue',
		isPaused: true
	});

	// TODO request future to make PowerQueue to be fiber-safe
	q.taskHandler = function(data, next, failures){
		Meteor.sync(function(){
			try {
				data(next, failures);
			} catch(err) {
				next('Unable to run task, Error: ' + err.message);
			}
		});
	};

	// public api
	Meteor.pushTask = function(task){
		(function(){
			q.add(task);
		}).fiber();
	};

	Meteor.runTasks = function(){
		(function(){
			q.run();
		}).fiber();
	};

	// self-test
	Meteor.pushTask(function(done){
		console.log('task-queue is ready');
		done();
	});

	Meteor.runTasks();
});
