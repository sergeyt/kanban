Package.describe({
  summary: "FogBugz service for kanban"
});

Npm.depends({"fogbugz.js": "0.0.15"});

Package.on_use(function (api) {
	api.use('underscore', ['server']);
	api.export('FogBugzService');
  api.add_files("fogbugz.js", "server");
});
