'use strict';

let me = {};

me.act = function ({current, toggl, views}, token, newName) {
	current.get(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			if (entry.description === newName) {
				throw new Error('Can\'t rename to the same…');
			}

			return toggl.updateTimeEntry(token, entry.id, {description: newName})
				.then(e => {
					views.renamed(entry.description, newName, e.id);
				});
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	current: require('./current.js'),

	views: require('../views.js'),
	toggl: require('../toggl.js')
});
