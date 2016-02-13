'use strict';

let me = {};

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

me.err = function ({views: {err}}, error) {
	err(error, me.render);
};

me.loading = function ({help, logger}) {
	logger([
		help.getLogo(),
		'Loading…'
	].join('\n'));
};

me.dashboard = function ({toggl, views, utils}, {token, force}) {
	let current = undefined; // object
	let list = undefined; // view
	let action = undefined; // list of views

	let renderInterval = undefined;
	let updateTimeout = undefined;

	function renderView() {
		let linesUsed = 0;
		let hasCurrent = false;

		Promise.resolve(current)
			.then(views.details)
			.then(utils.pass(() => hasCurrent = true))
			.then(views.pad)
			.catch(views.err2)
			.then(currentView => {
				let linesUsed = currentView.split('\n').length;

				if (!list) {
					return currentView + '\n'.repeat(10 - linesUsed);
				}

				let offset = hasCurrent ? 1 : 0;

				let listViews = views.list(list.slice(
					offset,
					offset + 10 - linesUsed
				));

				listViews.unshift('');

				return currentView + listViews.join('\n');
			})
			.then(me.render)
			.catch(me.err);
	}

	function updateCurrent(currentEntry) {
		current = currentEntry;
		renderView();

		clearInterval(renderInterval);
		if (current) {
			renderInterval = setInterval(renderView, 1000);
		}
	}

	function updateList(listEntries) {
		list = listEntries
		renderView();
	}

	function getCurrent() {
		toggl.getCurrentTimeEntry(token, true)
			.then(updateCurrent)
			.catch(me.err);

		toggl.getTimeEntries(token, {amount: 7})
			.then(updateList)
			.catch(me.err);

		updateTimeout = setTimeout(getCurrent, 8 * 1000);
	}

	function startStop() {
		toggl.getCurrentTimeEntry(token, false)
			.then(entry => {
				if (entry) {
					return toggl.stopTimeEntry(token, entry.id);
				}

				return toggl.startTimeEntry(token);
			})
			.then(getCurrent);
	}

	return {
		getCurrent,
		startStop,

		freeze() {
			clearInterval(renderInterval);
			renderInterval = undefined;

			clearTimeout(updateTimeout);
			updateTimeout = undefined;
		}
	};
};

me.showList = function ({toggl, views}, token, amount = 9) {
	toggl.getTimeEntries(token, {amount})
		.then(views.list)
		.then(x => ['', ...x])
		.then(me.render)
		.catch(me.err);
}

me.keyListener = function ({process: {stdin, exit}}, cb) {
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');
	stdin.on('data', key => {
		if (key === '\u0003' || key === 'q' || key === 'Q') {
			exit();
		}

		cb(key);
	});
};

me.start = function ({open, views, help, pkg}, {token, force}) {
	me.loading();

	const dash = me.dashboard({token, force});

	dash.getCurrent();

	me.keyListener(key => {
		dash.freeze();

		switch (key) {
			case 'h': case '?':
				me.render(['', help.getShort()]);
				break;

			case 'v':
				me.render([...Array(4), `    v${pkg.version}`, ...Array(5)]);
				break;

			case 'x':
				me.render(undefined);
				break;

			case 'c':
				dash.getCurrent();
				break;

			case 's':
				dash.startStop();
				break;

			case 'l':
				me.showList(token);
				break;

			case 'L':
				me.showList(token, 16);
				break;

			case 'b':
				open('https://www.toggl.com/app/timer');
				break;

			case '\u001b[A': views.log('up'); break;
			case '\u001b[B': views.log('down'); break;
			case '\u001b[C': views.log('right'); break;
			case '\u001b[D': views.log('left'); break;

			default:
				views.log(key);
				break;
		}
	});
};

me = require('mee')(module, me, {
	open: require('open'),
	logger: require('log-update'),
	chalk: require('chalk'),

	pkg: require('../../package.json'),

	views: require('../views.js'),
	toggl: require('../toggl.js'),
	utils: require('../utils.js'),
	help: require('../help.js'),

	process
});
