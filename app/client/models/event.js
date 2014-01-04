// work item event

Template.event.helpers({
  content: function() {
	return this.html || this.text;
  },
  collapseId: function(){
	return 'collapse-' + this.id;
  }
});
