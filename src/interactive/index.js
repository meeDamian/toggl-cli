'use strict';

/*
 * Nope, not proud of below code. Either 1) deal with it, or 2) submit a cleanup PR.
 */

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

me.err = function ({views}, err) {
	me.render(views.formatErr(err));
};

me.loading = function ({help, logger}) {
	logger([
		help.getLogo(),
		'Loading…'
	].join('\n'));
};

me.help = function ({help, chalk: {red, bold}}, key) {
	const msg = [help.getShort(), ''];

	if (key) {
		msg.push(red(`${bold(key)} is not an option. Try one of the above.`));
	} else {
		msg.unshift('');
	}

	me.render(msg);
};

me.state = function (_, exit) {
	let extensions;

	return {
		exit,
		set(hooks) {
			extensions = hooks;
		},
		isActionable(key) {
			if (!extensions || !extensions[key]) {
				return false;
			}

			extensions[key]();
			extensions = undefined;
			return true;
		}
	};
};

me.current = function ({toggl, views, utils}, {token}) {
	let current;
	let list;
	let renderInterval;
	let updateTimeout;

	function renderView() {
		let hasCurrent = false;

		Promise.resolve(current)
			.then(views.details) // can throw and skip to `.catch()`
			.then(utils.pass(() => {
				hasCurrent = true;
			}))
			.then(views.pad)
			.catch(views.formatErr)
			.then(currentView => {
				const linesUsed = currentView.split('\n').length;

				if (!list) {
					return currentView + '\n'.repeat(10 - linesUsed);
				}

				const offset = hasCurrent ? 1 : 0;

				const listViews = views.list(list.slice(
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
		list = listEntries;
		renderView();
	}

	function update() {
		toggl.getCurrentTimeEntry(token, true)
			.then(updateCurrent)
			.catch(me.err);

		toggl.getTimeEntries(token, {amount: 7})
			.then(updateList)
			.catch(me.err);

		updateTimeout = setTimeout(update, 8 * 1000);
	}

	function resume(which) {
		toggl.getTimeEntries(token, {amount: which + 1, deps: false})
			.then(entries => {
				if (entries[0].duration < 0) {
					which += 1;
				}

				return entries[which - 1];
			})
			.then(({description, pid, billable, tags}) => ({description, pid, billable, tags}))
			.then(entryData => toggl.startTimeEntry(token, entryData))
			.then(update)
			.catch(err => {
				console.log(err);
			});
	}

	function startStop() {
		toggl.getCurrentTimeEntry(token, false)
			.then(entry => {
				return entry ?
					toggl.stopTimeEntry(token, entry.id) :
					toggl.startTimeEntry(token);
			})
			.then(update);
	}

	return {
		startStop,
		resume,
		update,

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
};

me.setKeyListener = function ({process: {stdin, exit}}, cb) {
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

me.onKey = function ({open, pkg, toggl, discard, chalk: {bold, yellow}}, token, current, state) {
	return key => {
		current.freeze();

		if (state.isActionable(key)) {
			return;
		}

		state.set(undefined);

		const which = parseInt(key, 10);
		if (!isNaN(which) && which !== 0) {
			current.resume(which);
			return;
		}

		switch (key) {
			case 'v': // version
				me.render([
					...Array(4),
					`    v${pkg.version}`,
					...Array(5)
				]);
				break;

			case 'x': // clear
				me.render(undefined);
				break;

			case 'c': // current
				current.update();
				break;

			case 's': // start/stop
				current.startStop();
				break;

			case 'l': // list of last 8
				me.showList(token);
				break;

			case 'L': // list of last 16
				me.showList(token, 16);
				break;

			case 'b': // open in browser
				open(toggl.TIMER_URL);
				break;

			case 'p': // add project to current entry
				me.render([
					...Array(2),
					yellow('  Oops, you\'ve found a thing that\'s not there yet…'),
					'',
					`  To ${bold('add a project')}`,
					`    Press ${bold('b')} to open in browser.`,
					...Array(4)
				]);
				break;

			case 'r': // rename current entry
				me.render([
					...Array(2),
					yellow('  Oops, you\'ve found a thing that\'s not there yet…'),
					'',
					`  To ${bold('rename')} current ${bold('time entry')}`,
					`    Exit this mode (press ${bold('q')}), and run:`,
					bold('      $ toggl rename <new name>'),
					...Array(3)
				]);
				break;

			case 'd':
				discard.act(token, state);
				break;

			case 'h': case '?': // help
				me.help();
				break;

			default:
				me.help(key);
				break;
		}
	};
};

me.start = function (_, {token}) {
	me.loading();

	const current = me.current({token});
	const state = me.state(current.update);

	current.update();

	me.setKeyListener(me.onKey(token, current, state));
};

me = require('mee')(module, me, {
	open: require('open'),
	logger: require('log-update'),
	chalk: require('chalk'),

	discard: require('./discard.js'),

	pkg: require('../../package.json'),

	views: require('../views.js'),
	toggl: require('../toggl.js'),
	utils: require('../utils.js'),
	help: require('../help.js'),

	process
});
