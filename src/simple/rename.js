'use strict';

let me = {};

me.act = function ({current, toggl, views}, token, newName) {
	current.get(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			const {id, description} = entry;
			if (description === newName) {
				throw new Error('Can\'t rename to the same…');
			}

			return {id, description};
		})
		.then(({id, description}) => {
			return toggl.updateTimeEntry(token, id, {description: newName})
				.then(views.renamed(description))
				.then(views.pad)
				.then(views.log);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	current: require('./current.js'),
	toggl: require('../toggl.js'),
	views: require('../views.js')
});
