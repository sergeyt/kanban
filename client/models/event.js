// work item event

Template.event.helpers({
  when: function() {
	return PrettyDate.format(this.date);
  },
  content: function() {
	var content = this.html || this.text;
	return content ? content : null;
  }
});
