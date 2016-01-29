'use strict';

let me = {};

me.keyListener = function ({process: {stdin, exit}}, cb) {
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');
	stdin.on('data', key => {
		if (key === '\u0003' || key === 'q') {
			exit();
		}

		cb(key);
	});
};

me.start = function ({console, toggl, help, params, list}, {token}) {
	me.keyListener(key => {
		switch (key) {
			case 'h':
			case '?':
				console.log(help.getShort());
				break;

			case 'l':
				list.listTimeEntries(token, 8);
				break;

			case 'L':
				list.listTimeEntries(token, 16);
				break;

			default:
				console.log(key);
				break;
		}
	});
};

me = require('mee')(module, me, {
	process,
	console,
	toggl: require('./toggl.js'),
	help: require('./help.js'),

	// tmp
	list: require('./simple/list.js')
});
