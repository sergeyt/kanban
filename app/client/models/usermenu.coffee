Template.usermenu.avatarUrl = ->
	user = Meteor.user()
	email = user.email
	email = user.emails[0].address if user.emails?.length
	Gravatar.imageUrl(email, {s: 24})

Template.usermenu.events({
	'click .sign-out': ->
		Meteor.logout()
})
