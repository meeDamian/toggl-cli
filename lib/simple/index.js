'use strict';

let me = {};

me.execute = function ({list, current, console}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'l':
		case 'list':
			list.show(token, cmd[1]);
			break;

		case 'n':
		case 'now':
			current.show(token);
			break;


		default:
			console.error('Invalid command. Try `toggl --help`.');
	}
};

me = require('mee')(module, me, {
	list: require('./list.js'),
	current: require('./current.js'),

	console
});
