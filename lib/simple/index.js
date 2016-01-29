'use strict';

let me = {};

me.execute = function({list, console}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'l':
		case 'list':
			list.listTimeEntries(token, cmd[1]);
			break;

		default:
			console.error('Invalid command. Try `toggl --help`.');
	}
}

me = require('../utils.js')(module, me, {
	list: require('./list.js'),
	console
});
