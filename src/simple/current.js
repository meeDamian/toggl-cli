'use strict';

let me = {};

me.get = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.show = function ({toggl, views}, token) {
	me.get(token)
		.then(views.details)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me = require('mee')(module, me, {
	views: require('../views.js'),
	toggl: require('../toggl.js')
});
