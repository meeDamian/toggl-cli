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

me.list = function ({views, toggl}, token, amount) {
	toggl.getTimeEntries(token, {amount})
		.then(views.list)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me.start = function ({toggl, views}, token, description) {
	toggl.startTimeEntry(token, description)
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
			me.list(token, cmd[1]);
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
