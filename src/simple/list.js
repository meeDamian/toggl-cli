'use strict';

let me = {};

me.show = function ({views, toggl}, token, amount) {
	toggl.getTimeEntries(token, {amount})
		.then(views.list)
		.catch(views.err);
};

me = require('mee')(module, me, {
	views: require('../views.js'),
	toggl: require('../toggl.js')
});
