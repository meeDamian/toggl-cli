'use strict';

let me = {};

me.act = function ({toggl}, token, description) {
	toggl.startTimeEntry(token, description)
		.then(v => {
			console.log(v);
		});
};

me = require('mee')(module, me, {
	toggl: require('../toggl.js')
});
