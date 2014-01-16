selectedItem = ->
	Meteor.Kanban?.selectedItem?.get()

Template.itemDetails.item = ->
	selectedItem()

Template.itemDetails.eventList = ->
	selectedItem().events || []
