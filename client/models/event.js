// work item event

Template.event.helpers({
	content: function(){
		if (this.format && this.format.toLowerCase() == 'html') {
			return this.html;
		}
		return this.text || this.description;
	}
});
