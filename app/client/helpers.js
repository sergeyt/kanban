// Handlebars helpers

if (typeof Handlebars !== 'undefined') {
    Handlebars.registerHelper("timeago", function(date) {
        if (date) {
            var dateObj = new Date(date);
            return moment(dateObj).fromNow().replace(/\ /g, '\u00a0');
        }
        return 'some time ago';
    });
}
