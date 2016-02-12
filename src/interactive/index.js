'use strict';

let me = {
	FINISHED: true
};

me.dashboard = function (_, {current, action}) {
	if (typeof current === 'string') {
		console.log('details');
	} else {
		console.log('list');
	}
};

me.state = function ({views, toggl}, token) {
	const {log, err} = views;

	return new class State {
		constructor() {}

		doThings(fetcher, renderer, ...args) {
			fetcher(token, ...args)
				.then(renderer)
				.then(me.render)
				.catch(err);
		}

		showList(amount) {
			this.doThings(toggl.getTimeEntries, views.list, {amount});
		}

		showDetails() {
			this.doThings(toggl.getCurrentTimeEntry, views.details, true);
		}

		up() {
			log('up');
		}
		right() {
			log('right');
		}
		down() {
			log('down');
		}
		left() {
			log('left');
		}
	};
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

me.start = function ({views, help}, {token, force, debug, dark}) {
	const state = me.state(token, force);

	me.keyListener(key => {
		switch (key) {
			case 'h': case '?':
				me.render(help.getShort());
				break;

			case 'x':
				me.render(undefined);
				break;

			case 'c':
				state.showDetails();
				break;

			case 'l':
				state.showList(8);
				break;

			case 'L':
				state.showList(16);
				break;

			case '\u001b[A': state.up(); break;
			case '\u001b[B': state.down(); break;
			case '\u001b[C': state.right(); break;
			case '\u001b[D': state.left(); break;

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
