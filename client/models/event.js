// work item event

Template.event.helpers({
  bodyClass: function(){
	return this.html || this.text ? '' : 'hidden';
  },
  content: function() {
	return this.html || this.text;
  }
});
