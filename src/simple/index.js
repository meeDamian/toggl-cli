'use strict';

let me = {};

me.execute = function ({list, current, smart, start, stop, rename, open, help, log}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'list': case 'ls': case 'l':
			list(token, cmd[1]);
			break;

		case 'current': case 'c':
			current(token);
			break;

		case 's':
			smart(token, cmd.splice(1).join(' '));
			break;

		case 'start':
			start(token, cmd.splice(1).join(' '));
			break;

		case 'stop':
			stop(token);
			break;

		case 'rename': case 'r':
			rename(token, cmd.splice(1).join(' '));
			break;

		case 'browser': case 'b':
			open('https://www.toggl.com/app/timer');
			break;

		default:
			log(help.getHint());
	}
};

me = require('mee')(module, me, {
	open: require('open'),

	current: require('./current.js').show,
	list: require('./list.js').show,
	smart: require('./smart.js').act,
	start: require('./start.js').act,
	stop: require('./stop.js').act,
	rename: require('./rename.js').act,

	help: require('../help.js'),
	log: require('../views.js').log
});
