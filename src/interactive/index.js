'use strict';

let me = {
	FINISHED: true
};

me.render = function ({logger, help, chalk}, lines) {
	if (lines === undefined) {
		logger.clear();
		return;
	}

	if (typeof lines === 'string') {
		lines = [lines];
	}

	logger([
		...lines,
		chalk.bold.cyan(help.getMicro())
	].join('\n'));
};

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

me.list = function ({toggl, views}, token, amount) {
	toggl.getTimeEntries(token, {amount})
		.then(views.list)
		.then(me.render)
		.catch(views.err);
};

me.details = function ({toggl, views}, token) {
	toggl.getCurrentTimeEntry(token, true)
		.then(views.details)
		.then(me.render)
		.catch(views.err);
};

me.start = function ({views, help}, {token}) {
	me.keyListener(key => {
		switch (key) {
			case 'h':
			case '?':
				me.render(help.getShort());
				break;

			case 'x':
				me.render(undefined);
				break;

			case 'c':
				me.details(token);
				break;

			case 'l':
				me.list(token, 8);
				break;

			case 'L':
				me.list(token, 16);
				break;

			case '\u001b[A': console.log('up'); break;
			case '\u001b[B': console.log('down'); break;
			case '\u001b[C': console.log('right'); break;
			case '\u001b[D': console.log('left'); break;

			default:
				views.log(key);
				break;
		}
	});
};

me = require('mee')(module, me, {
	logger: require('log-update'),
	chalk: require('chalk'),

	process,
	views: require('../views.js'),
	toggl: require('../toggl.js'),
	help: require('../help.js')
});
