'use strict';

let me = {};

me.execute = function ({list, current, smart, start, stop, rename, open, help, views}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'list': case 'l': case 'ls':
			list(token, cmd[1]);
			break;

		case 'current': case 'c': case 'top':
			current(token);
			break;

		case 'smart': case 's':
			smart(token, cmd.splice(1).join(' '));
			break;

		case 'start': case 'up':
			start(token, cmd.splice(1).join(' '));
			break;

		case 'stop': case 'down':
			stop(token);
			break;

		case 'rename': case 'r': case 'mv':
			rename(token, cmd.splice(1).join(' '));
			break;

		case 'browser': case 'b': case 'open':
			open('https://www.toggl.com/app/timer');
			break;

		default:
			views.log(help.getHint());
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
	views: require('../views.js')
});
