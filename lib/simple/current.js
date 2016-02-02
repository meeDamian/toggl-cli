'use strict';

let me = {};

me.get = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.show = function ({toggl}, token) {
	me.get(token)
		.then(([c]) => {
			console.log(JSON.stringify(c, null, 2));
		})
		.catch(err => {
			console.error(err);
		});
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	toggl: require('../toggl.js'),
	core: require('./core.js'),

	console
});
