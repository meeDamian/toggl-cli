'use strict';

let me = {};

me.main = function ({input, simple, interactive, console, help}) {
	input.parse()
		.then(input => {
			if (!input.cmd) {
				if (!interactive.FINISHED) {
					console.log(help.getHint());
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
	help: require('./help.js'),
	input: require('./input.js'),
	simple: require('./simple/'),
	interactive: require('./interactive.js'),

	console
});
