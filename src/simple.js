'use strict';

let me = {};

me.getCurrent = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.showCurrent = function ({views}, token) {
	me.getCurrent(token)
		.then(views.details)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me.list = function ({views, toggl}, token, params) {
	Promise.resolve()
		.then(() => {
			if (params[0] === undefined || !isNaN(params[0])) {
				return {limit: params[0]};
			}

			return Promise.resolve(params.map(p => p.toLowerCase()))
				.then(params => {
					if (params[0] === 'today') {
						return 0;
					}

					if (params[0] === 'yesterday') {
						return 1;
					}

					if (params[0] === 'last') {
						const days = ['sun', 'sat', 'fri', 'thu', 'wed', 'tue', 'mon'];

						// Shift array so that item at [0] is yesterday
						let i = new Date().getDay();
						while (--i) {
							days.unshift(days.pop());
						}

						// add one dummy value as idx [0], to have `days.indexOf(day)` match the shift required
						days.unshift(undefined);

						const requested = params[1].trim().substring(0, 3);
						if (days.indexOf(requested) === -1) {
							throw new Error(`Sorry, I don't know how to show entries from "last ${requested}".`);
						}

						return days.indexOf(requested);
					}
				})
				.then(shift => new Date(new Date().setDate(new Date().getDate() - shift)))
				.then(date => ({date}));
		})
		.then(opts => {
			toggl.getTimeEntries(token, opts)
				.then(views.list)
				.then(views.pad)
				.then(views.log)
				.catch(views.err);
		});
};

me.start = function ({toggl, views}, token, description) {
	Promise.resolve(description)
		.then(which => {
			if (!which || isNaN(which) || which > 16) {
				return {description};
			}

			const limit = parseFloat(which);

			return toggl.getTimeEntries(token, {limit, deps: false})
				.then(entries => entries[limit - 1])
				.then(({description, pid, billable, tags}) => ({description, pid, billable, tags}));
		})
		.then(entryData => toggl.startTimeEntry(token, entryData))
		.then(views.started)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me.rename = function ({toggl, views}, token, newName) {
	me.getCurrent(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			const {id, description} = entry;
			if (description === newName) {
				throw new Error('Can\'t rename to the same…');
			}

			return {id, description};
		})
		.then(({id, description}) => {
			return toggl.updateTimeEntry(token, id, {description: newName})
				.then(views.renamed(description))
				.then(views.pad)
				.then(views.log);
		})
		.catch(views.err);
};

me.smart = function (_, token, description) {
	if (description) {
		me.start(token, description);
		return;
	}

	me.getCurrent(token, false)
		.then(current => {
			if (!current) {
				me.start(token, description);
				return;
			}

			me.stop(token, current.id);
		});
};

me.stop = function ({toggl, views}, token, id) {
	return toggl.stopTimeEntry(token, id)
		.then(views.stopped)
		.then(views.pad)
		.then(views.log);
};

me.stopCurrent = function ({views}, token) {
	me.getCurrent(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			return me.stop(token, entry.id);
		})
		.catch(views.err);
};

me.execute = function ({open, help, views, toggl}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'list': case 'l': case 'ls':
			me.list(token, cmd.splice(1));
			break;

		case 'current': case 'c': case 'top':
			me.showCurrent(token);
			break;

		case 'smart': case 's':
			me.smart(token, cmd.splice(1).join(' '));
			break;

		case 'start': case 'up':
			me.start(token, cmd.splice(1).join(' '));
			break;

		case 'stop': case 'down':
			me.stopCurrent(token);
			break;

		case 'rename': case 'r': case 'mv':
			me.rename(token, cmd.splice(1).join(' '));
			break;

		case 'browser': case 'b': case 'open':
			open(toggl.TIMER_URL);
			break;

		default:
			views.log(help.getHint());
	}
};

me = require('mee')(module, me, {
	open: require('open'),

	toggl: require('./toggl.js'),
	help: require('./help.js'),
	views: require('./views.js')
});
