# Publish complete set of boards for given user.
Meteor.publish 'boards', ->
	Boards.find()

# Publish all work items for requested board name.
Meteor.publish 'workItems', (board) ->
	check board, String
	WorkItems.find {board: board}
