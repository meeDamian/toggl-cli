'use strict';

let me = {};

me.getDescriptionLine = function ({core, chalk: {bold, red}}, {description, project}) {
	return [
		description ? bold(description) : '(no description)',
		project ? red(core.getBrackets(project, bold)) : ''
	].join(' ');
};

me.getTimeLine = function ({core, chalk: {dim, green, blue}}, {duration, start}) {
	return [
		dim('Running for:'),
		green(core.getDuration({duration, start}).durStr),
		'  since',
		blue(core.to24hour(start))
	].join(' ');
};

me.getMetaLine = function ({chalk: {black}}, {id, project}) {
	const line = [`id:${id}`];
	if (project) {
		line.push(`pid:${project.id}`);

		if (project.client) {
			line.push(`cid:${project.client.id}`);
		}
	}
	return black(line.join(', '));
};

me.printEntry = function ({console: {log}}, timeEntry) {
	log([
		'',
		me.getDescriptionLine(timeEntry),
		me.getTimeLine(timeEntry),
		me.getMetaLine(timeEntry)
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
