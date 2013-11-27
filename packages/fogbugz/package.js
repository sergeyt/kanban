Package.describe({
  summary: "FogBugz Client"
});

Npm.depends({"fogbugz.js": "0.0.9"});

Package.on_use(function (api) {
  api.export('FogBugz'); // `api.export` introduced in Meteor 0.6.5
  api.add_files("fogbugz.js", "server");
});
