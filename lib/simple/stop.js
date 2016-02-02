'use strict';

let me = {};

me.stop = function ({toggl}, token, id) {
	return toggl.stopTimeEntry(token, id)
		.then(v => {
			console.log(v);
		});
};

me.act = function ({current, console}, token, id) {
	if (id !== undefined) {
		me.stop(token, id);
		return;
	}

	current.get(token)
		.then(entry => {
			if (!entry) {
				console.info('There\'s no entry running…');
				return;
			}

			me.stop(token, entry.id);
		});
};

me = require('mee')(module, me, {
	current: require('./current.js'),
	toggl: require('../toggl.js'),

	console
});
