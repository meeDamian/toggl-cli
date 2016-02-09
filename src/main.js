'use strict';

let me = {};

me.main = function ({input, simple, interactive, console}) {
	input.parse()
		.then(input => {
			if (!input.cmd) {
				if (!interactive.FINISHED) {
					console.log('\n  Invalid option. Run:\n    $ toggl --help');
					return;
				}

				interactive.start(input);
				return;
			}

			simple.execute(input);
		})
		.catch(err => {
			console.error(err);
		});
};

me = require('mee')(module, me, {
	input: require('./input.js'),

	simple: require('./simple/'),
	interactive: require('./interactive.js'),
	console
});
