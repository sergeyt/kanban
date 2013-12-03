// work item event

Template.event.helpers({
  when: function() {
	return PrettyDate.format(this.date);
  },
  content: function() {
	return this.html || this.text;
  },
  collapseId: function(){
	return 'collapse-' + this.id;
  }
});
