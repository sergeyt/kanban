Package.describe({
  summary: "FogBugz service for kanban"
});

// TODO upgrade on latest fogbugz.js
Npm.depends({"fogbugz.js": "0.0.15"});

Package.on_use(function (api) {
	api.use('underscore', ['server']);
	api.use('moment', ['server']);
	api.export('FogBugzService');
  api.add_files("fogbugz.js", "server");
});
