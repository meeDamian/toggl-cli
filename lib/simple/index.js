'use strict';

let me = {};

me.execute = function ({list, current, smart, start, stop, console}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'l': case 'list':
			list.show(token, cmd[1]);
			break;

		case 'n': case 'now':
			current.show(token);
			break;

		case 's':
			smart.act(token, cmd[1]);
			break;

		case 'start':
			start.act(token, cmd[1]);
			break;

		case 'stop':
			stop.act(token);
			break;

		default:
			console.error('Invalid command. Try `toggl --help`.');
	}
};

me = require('mee')(module, me, {
	current: require('./current.js'),
	list: require('./list.js'),
	smart: require('./smart.js'),
	start: require('./start.js'),
	stop: require('./stop.js'),

	console
});
