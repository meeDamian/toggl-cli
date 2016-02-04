'use strict';

require('./utils.js');

require('./input.js')
	.parse()
	.then(input => {
		if (!input.cmd) {
			console.log('\n  Invalid option. Run:\n    $ toggl --help');
			// require('./interactive.js').start(input);
			return;
		}

		require('./simple/').execute(input);
	})
	.catch(err => {
		console.error(err);
	});
