var emails = [];
var emailsDep = new Deps.Dependency();

Template.login.emails = function(){
	emailsDep.depend();
	Meteor.call('emails', function(err,res){
		if (!_.isEqual(res, emails)){
			emails = res;
			emailsDep.changed();
		}
	});
	return JSON.stringify(emails.filter(function(s){
		return !!s;
	}));
};

Template.login.events({
	'click .login-button': function(e, t) {

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

Template.login.rendered = function(){
	$(this.firstNode).find('.typeahead').each(function(){
		Meteor.typeahead(this);
	});
};