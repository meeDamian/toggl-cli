'use strict';

let me = {};

me.execute = function ({list, current, smart, start, stop, console}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'list': case 'l':
			list(token, cmd[1]);
			break;

		case 'now': case 'n':
			current(token);
			break;

		case 's':
			smart(token, cmd[1]);
			break;

		case 'start':
			start(token, cmd[1]);
			break;

		case 'stop':
			stop(token);
			break;

		default:
			console.error('Invalid command. Try `toggl --help`.');
	}
};

me = require('mee')(module, me, {
	current: require('./current.js').show,
	list: require('./list.js').show,
	smart: require('./smart.js').act,
	start: require('./start.js').act,
	stop: require('./stop.js').act,

	console
});
