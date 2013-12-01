Package.describe({
  summary: "FogBugz Client"
});

Npm.depends({"fogbugz.js": "0.0.15"});

Package.on_use(function (api) {
	api.use('underscore', ['server']);
	if (api.export) api.export('FogBugz'); // `api.export` introduced in Meteor 0.6.5
  api.add_files("fogbugz.js", "server");
});
