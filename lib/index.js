#!/usr/bin/env node --harmony --harmony_destructuring --harmony_default_parameters
'use strict';

require('./input.js')
	.parse()
	.then(input => {
		if (!input.cmd) {
			console.log('\n    Invalid option. Run:\n\t$ toggl --help');
			// require('./interactive.js').start(input);
			return;
		}

		require('./simple/').execute(input);
	})
	.catch(err => {
		console.error(err);
	});
