'use strict';

let me = {};

me.act = function ({current, start, stop}, token, description) {
	if (description) {
		start.act(token, description);
		return;
	}

	current.get(token, false)
		.then(current => {
			if (!current) {
				start.act(token, description);
				return;
			}

			stop.act(token, current.id);
		});
};

me = require('mee')(module, me, {
	current: require('./current.js'),
	start: require('./start.js'),
	stop: require('./stop.js')
});
