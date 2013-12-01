Template.usermenu.avatarUrl = function(){
	var user = Meteor.user();
	var email = user.email;
	if (user.emails && user.emails.length > 0){
		email = user.emails[0].address;
	}
	return Gravatar.imageUrl(email, {s: 24});
};
