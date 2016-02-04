'use strict';

let me = {};

me.getDescriptionLine = function ({chalk: {bold}}, description) {
	return [
		description ? bold(description) : '(no description)'
	].join(' ');
};

me.getTimeLine = function ({core, chalk: {dim, green, blue}}, duration, start) {
	return [
		dim('Running for:'),
		green(core.getDuration(duration, start, false).durStr),
		'  since',
		blue(core.to24hour(start))
	].join(' ');
};

me.printEntry = function ({console: {log}}, {description, duration, start}) {
	log([
		'',
		me.getDescriptionLine(description),
		me.getTimeLine(duration, start),
		''
	].join('\n  '));
};

me.printEmpty = function ({chalk: {red}, console: {log}}) {
	log(red('\n  No timer is running.\n'));
};

me.get = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.show = function ({toggl, console: {error}}, token) {
	me.get(token)
		.then(current => {
			if (!current) {
				me.printEmpty();
				return;
			}

			me.printEntry(current);
		})
		.catch(err => {
			error(err);
		});
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	toggl: require('../toggl.js'),
	core: require('./core.js'),

	console
});
