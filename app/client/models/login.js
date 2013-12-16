Template.login.events({
	'click #login-button': function(e, t) {

		e.preventDefault();

		var fogbugz = Meteor.settings.public.fogbugz;
		// retrieve the input field values
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
