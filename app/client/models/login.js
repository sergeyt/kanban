function typeaheadDataSet(key, method){
    var _key = key;
    var _method = method;
    return function(){
        if (!_method) _method = _key;
        var data = Session.get(_key) || [];
        Meteor.call(_method, function(err,res){
            if (EJSON.equals(res, data)){
                return;
            }
            Session.set(_key, res);
        });
        return JSON.stringify(data);
    };
}

Template.login.emails = typeaheadDataSet('emails');
Template.login.endpoints = typeaheadDataSet('endpoints');

Template.login.events({
	'click .login-button': function(e, t) {

		e.preventDefault();

        // retrieve the input field values
		var fogbugz = t.find('#endpoint').value;
		var email = t.find('#login-email').value;
		var password = t.find('#login-password').value;

		var options = {
			fogbugz: fogbugz,
			email: email,
			password: password
		};

		Meteor.loginWithFogBugz(options, function(err) {
			if (err) {
				alert('login failed: ' + err);
			} else {
				Meteor.call('onLogin', Meteor.userId());
			}
		});
	}
});

Template.login.rendered = function(){
	$(this.firstNode).find('.typeahead').each(function(){
		Meteor.typeahead(this);
	});
};