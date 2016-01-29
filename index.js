#!/usr/bin/env node --harmony --harmony_destructuring --harmony_default_parameters
'use strict';

require('./lib/input.js')
	.parse()
	.then(input => {
		// if (!input.cmd) {
		// 	interactive.start(toggl, input);
		// 	return;
		// }
		//
		require('./lib/simple/').execute(input);
	})
	.catch(err => {
		console.log(err);
	});
