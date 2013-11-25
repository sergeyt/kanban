var AppRouter = Backbone.Router.extend({
  routes: {
    ":board": "main"
  },
  main: function (board) {
    var oldBoard = Session.get("board");
    if (oldBoard !== board) {
      Session.set("board", board);
      Session.set("tag_filter", null);
    }
  },
  setBoard: function (name) {
    this.navigate(name, true);
  }
});

Router = new AppRouter();

