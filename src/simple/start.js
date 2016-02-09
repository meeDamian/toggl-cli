'use strict';

let me = {};

me.print = function ({console: {log}, chalk: {green, white, blue, bold, black}, core: {to24hour}}, {id, description, start}) {
	log([
		'\n ',
		green('Started'),
		white(description ? bold(description) : '(no description)'),
		'at',
		blue(to24hour(start)),
		black(`[id:#${id}]`),
		'\n'
	].join(' '));
};

me.act = function ({toggl}, token, description) {
	toggl.startTimeEntry(token, description)
		.then(me.print);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	toggl: require('../toggl.js'),
	core: require('./core.js'),

	console
});
