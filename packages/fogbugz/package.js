Package.describe({
  summary: "FogBugz Client"
});

Npm.depends({"fogbugz.js": "0.0.8"});

Package.on_use(function (api) {
  api.export('FOGBUGZ'); // `api.export` introduced in Meteor 0.6.5
  api.add_files("fogbugz.js", "server");
});
