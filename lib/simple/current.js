'use strict';

let me = {};

me.show = function ({toggl}, token) {
	toggl.getCurrentTimeEntry(token)
		.then(c => {
			console.log(JSON.stringify(c, null, 2));
		});
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	toggl: require('../toggl.js'),
	core: require('./core.js'),

	console
});
