// connect handler of fogbugz events come from URL trigger plugin

function fogbugzEventHandler(req, res, next) {

	if (!(/fogbugz\/events/).test(req.url)){
		next(); // continue down the default middlewares
		return;
	}

	var m = (/case(\d+)/).exec(req.url);
	if (!m) {
		// TODO write error since cannot handle
		next();
		return;
	}

	var caseId = m[1];
	console.log('fogbugz event: case #%d', caseId);

	// TODO get new case info and create or update existing work item
	// FogBugz.caseInfo()

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('received event about case ' + caseId, 'utf-8');
}

// Listen to incoming fogbugz http requests
WebApp.connectHandlers.use(function(req, res, next) {
	// Need to create a Fiber since we're using synchronous http calls and nothing
	// else is wrapping this in a fiber automatically
	Fiber(function() {
		fogbugzEventHandler(req, res, next);
	}).run();
});
