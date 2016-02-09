'use strict';

let me = {};

me.printErr = function ({chalk: {red}, console: {log}}, err) {
	log(`\n  ${red(err.message)}\n`);
};

me.printStatus = function ({chalk: {white, blue, bold, black}, console: {log}}, oldName, newName, id) {
	log([
		'\n  ',
		blue('Renamed'),
		'from',
		white(oldName ? bold(oldName) : '(no description)'),
		'to',
		white(newName ? bold(newName) : '(no description)'),
		black(`[id:#${id}]`),
		'\n'
	].join(' '));
};

me.act = function ({current, toggl, console}, token, newName) {
	current.get(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			if (entry.description === newName) {
				throw new Error('Can\'t rename to the same…');
			}

			return toggl.updateTimeEntry(token, entry.id, {description: newName})
				.then(e => {
					me.printStatus(entry.description, newName, e.id);
				});
		})
		.catch(me.printErr);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	current: require('./current.js'),
	toggl: require('../toggl.js'),

	console
});
