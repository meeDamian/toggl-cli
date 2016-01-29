#!/usr/bin/env node --harmony --harmony_destructuring --harmony_default_parameters
'use strict';

require('./lib/input.js')
	.parse()
	.then(input => {
		if (!input.cmd) {
			console.log('\n    Invalid option. Run:\n\t$ toggl --help');
			// require('./lib/interactive.js').start(input);
			return;
		}

		require('./lib/simple/').execute(input);
	})
	.catch(err => {
		console.error(err);
	});
