'use strict';

let me = {};

me.getState = function ({toggl}, token, id, exit) {
	function confirm() {
		toggl.deleteTimeEntry(token, id)
			.then(exit, exit);
	}

	return {
		y: confirm,
		n: exit
	};
};

me.act = function ({toggl, views, logger, utils}, token, state) {
	toggl.getCurrentTimeEntry(token, true)
		.then(utils.pass(entry => {
			state.set(me.getState(token, entry.id, state.exit));
		}))
		.then(views.discard)
		.then(x => logger(x.join('\n')));
};

me = require('mee')(module, me, {
	logger: require('log-update'),

	toggl: require('../toggl.js'),
	views: require('../views.js'),
	utils: require('../utils.js')
});
