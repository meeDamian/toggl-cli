'use strict';

let me = {};

me.main = function ({input, simple, interactive, help, views}) {
	input.parse()
		.then(input => {
			if (!input.cmd) {
				if (!interactive.FINISHED) {
					views.log(help.getHint());
					return;
				}

				interactive.start(input);
				return;
			}

			simple.execute(input);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	help: require('./help.js'),
	views: require('./views.js'),

	input: require('./input.js'),
	simple: require('./simple/'),
	interactive: require('./interactive.js')
});
