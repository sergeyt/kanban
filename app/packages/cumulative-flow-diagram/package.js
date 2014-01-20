Package.describe({
	summary: "Package to create cumulative flow diagrams"
});

Package.on_use(function(api) {
	api.use('d3', ['client']);
	api.use('dimple', ['client']);
	api.add_files('index.js', ['client']);
});
