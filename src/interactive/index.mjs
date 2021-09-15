/*
 * Nope, not proud of below code. Either 1) deal with it, or 2) submit a cleanup PR.
 */

import process from 'node:process';
import chalk from 'chalk';
import logger from 'log-update';
import open from 'open';
import help from '../help.mjs';
import meeEsm from '../mee-esm.mjs';
import pkg from '../pkg.mjs';
import toggl from '../toggl.mjs';
import utils from '../utils.mjs';
import views from '../views.mjs';
import discard from './discard.mjs';

const me = {};

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
		chalk.bold.cyan(help.getMicro()),
	].join('\n'));
};

me.err = function ({views}, error) {
	this.render(views.formatErr(error));
};

me.loading = function ({help, logger}) {
	logger([
		help.getLogo(),
		'Loading…',
	].join('\n'));
};

me.help = function ({help, chalk: {red, bold}}, key) {
	const message = [help.getShort(), ''];

	if (key) {
		message.push(red(`${bold(key)} is not an option. Try one of the above.`));
	} else {
		message.unshift('');
	}

	this.render(message);
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
		},
	};
};

me.current = function ({toggl, views, utils}, {token}) {
	let current;
	let list;
	let renderInterval;
	let updateTimeout;
	const self = this;

	function renderView() {
		let hasCurrent = false;

		Promise.resolve(current)
			.then(views.details) // Can throw and skip to `.catch()`
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
					offset + 10 - linesUsed,
				));

				listViews.unshift('');

				return currentView + listViews.join('\n');
			})
			.then(self.render)
			.catch(self.err);
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
			.catch(self.err);

		toggl.getTimeEntries(token, {limit: 7})
			.then(updateList)
			.catch(self.err);

		updateTimeout = setTimeout(update, 8 * 1000);
	}

	function resume(limit) {
		toggl.getTimeEntries(token, {limit: limit + 1, deps: false})
			.then(entries => {
				if (entries[0].duration < 0) {
					limit += 1;
				}

				return entries[limit - 1];
			})
			.then(({description, pid, billable, tags}) => ({description, pid, billable, tags}))
			.then(entryData => toggl.startTimeEntry(token, entryData))
			.then(update)
			.catch(error => {
				console.log(error);
			});
	}

	function startStop() {
		toggl.getCurrentTimeEntry(token, false)
			.then(entry => entry
				? toggl.stopTimeEntry(token, entry.id)
				: toggl.startTimeEntry(token))
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
		},
	};
};

me.showList = function ({toggl, views}, token, limit = 9) {
	toggl.getTimeEntries(token, {limit})
		.then(views.list)
		.then(x => ['', ...x])
		.then(this.render)
		.catch(this.err);
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

		const which = Number.parseInt(key, 10);
		if (!isNaN(which) && which !== 0) {
			current.resume(which);
			return;
		}

		switch (key) {
			case 'v': // Version
				this.render([
					...Array.from({length: 4}),
					`    v${pkg.version}`,
					...Array.from({length: 5}),
				]);
				break;

			case 'x': // Clear
				this.render(undefined);
				break;

			case 'c': // Current
				current.update();
				break;

			case 's': // Start/stop
				current.startStop();
				break;

			case 'l': // List of last 8
				this.showList(token);
				break;

			case 'L': // List of last 16
				this.showList(token, 16);
				break;

			case 'b': // Open in browser
				open(toggl.TIMER_URL);
				break;

			case 'p': // Add project to current entry
				this.render([
					...Array.from({length: 2}),
					yellow('  Oops, you\'ve found a thing that\'s not there yet…'),
					'',
					`  To ${bold('add a project')}`,
					`    Press ${bold('b')} to open in browser.`,
					...Array.from({length: 4}),
				]);
				break;

			case 'r': // Rename current entry
				this.render([
					...Array.from({length: 2}),
					yellow('  Oops, you\'ve found a thing that\'s not there yet…'),
					'',
					`  To ${bold('rename')} current ${bold('time entry')}`,
					`    Exit this mode (press ${bold('q')}), and run:`,
					bold('      $ toggl rename <new name>'),
					...Array.from({length: 3}),
				]);
				break;

			case 'd':
				discard.act(token, state);
				break;

			case 'h': case '?': // Help
				this.help();
				break;

			default:
				this.help(key);
				break;
		}
	};
};

me.start = function (_, {token}) {
	this.loading();

	const current = this.current({token});
	const state = this.state(current.update);

	current.update();

	this.setKeyListener(this.onKey(token, current, state));
};

export default meeEsm(me, {open, logger, chalk, discard, pkg, views, toggl, utils, help, process});

