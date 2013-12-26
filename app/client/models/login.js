function fetchSet(key, method){
    if (!method) method = key;
    var data = Session.get(key) || [];
    Meteor.call(method, function(err,res){
        if (EJSON.equals(res, data)){
            return;
        }
        Session.set(key, res);
    });
    return JSON.stringify(data);
}

Template.login.emails = function(){
    return fetchSet('emails');
};

Template.login.endpoints = function(){
    return fetchSet('endpoints');
};

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