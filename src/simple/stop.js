'use strict';

let me = {};

me.print = function ({console: {log}, chalk: {red, white, green, blue, bold, black}, core}, {id, description, start, stop, duration}) {
	log([
		'\n ',
		red('Stopped'),
		white(description ? bold(description) : '(no description)'),
		'after',
		green(core.getDuration({duration, start}).durStr),
		'at',
		blue(core.to24hour(stop)),
		black(`[id:#${id}]`)
	].join(' '));
};

me.printErr = function ({chalk: {red}, console: {log}}, err) {
	log(`\n  ${red(err.message)}`);
};

me.stop = function ({toggl}, token, id) {
	return toggl.stopTimeEntry(token, id)
		.then(me.print);
};

me.act = function ({current, console}, token, id) {
	if (id !== undefined) {
		me.stop(token, id);
		return;
	}

	current.get(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			me.stop(token, entry.id);
		})
		.catch(me.printErr);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	core: require('./core.js'),
	current: require('./current.js'),
	toggl: require('../toggl.js'),

	console
});
