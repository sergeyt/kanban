// work item event

Template.event.helpers({
	when: function() {
		return PrettyDate.format(this.date);
	},
	bodyClass: function() {
		return this.html || this.text ? '' : 'hidden';
	},
	content: function() {
		return this.html || this.text;
	}
});
