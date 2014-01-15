Template.itemDetails.item = ->
	@item.get()

Template.itemDetails.eventList = ->
	@item.get()?.events || []

Template.itemDetails.created = ->
	data = @data
	data.item = new ReactiveProperty null

	Meteor.Kanban.selectedItem.onChange = (item) ->
		data.item.set item

		dlg = $("#item-details")

		dlg.on 'hidden.bs.modal', ->
			Meteor.Kanban.selectedItem.set null

		dlg.on 'shown.bs.modal', ->
			data.item.set item

		dlg.modal {show: true}
