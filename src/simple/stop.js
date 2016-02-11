'use strict';

let me = {};

me.stop = function ({toggl, views}, token, id) {
	return toggl.stopTimeEntry(token, id)
		.then(views.stopped)
		.then(views.pad)
		.then(views.log)
};

me.act = function ({current, views}, token) {
	current.get(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			return me.stop(token, entry.id);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	current: require('./current.js'),
	toggl: require('../toggl.js'),
	views: require('../views.js')
});
