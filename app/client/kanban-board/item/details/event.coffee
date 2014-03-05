# work item event
Template.event.content = ->
	self = @
	html = @_markdown.get()
	if not @format and @text and not self._mdrendered.get()
		Meteor.call 'markdown', @text, (err, res) ->
			self._markdown.set(res || '')
			self._mdrendered.set(true)
	html || @html || @text || @changes

Template.event.email = ->
	Meteor.Kanban.resolve_email @person

Template.event.created = ->
	@data._markdown = new ReactiveProperty ''
	@data._mdrendered = new ReactiveProperty false
