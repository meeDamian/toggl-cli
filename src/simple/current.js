'use strict';

let me = {};

me.get = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.show = function ({toggl, views}, token) {
	me.get(token)
		.then(current => {
			if (!current) {
				throw new Error('No timer is running.');
			}

			views.detailsLog(current);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	views: require('../views.js'),
	toggl: require('../toggl.js')
});
