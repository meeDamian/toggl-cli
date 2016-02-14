'use strict';

let me = {};

me.main = function ({input, simple, interactive, views}) {
	input.parse()
		.then(input => {
			views.dark = input.dark;
			views.debug = input.debug;

			if (!input.cmd) {
				interactive.start(input);
				return;
			}

			simple.execute(input);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	views: require('./views.js'),

	input: require('./input.js'),
	simple: require('./simple/'),
	interactive: require('./interactive/')
});
