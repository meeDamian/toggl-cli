'use strict';

let me = {};

me.getDescriptionLine = function ({core, chalk: {bold, red}}, {description, project}) {
	return [
		views.getDescription(description),
		red(core.getBrackets(project, bold))
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

me.printEntry = function ({views}, timeEntry) {
	views.log([
		me.getDescriptionLine(timeEntry),
		me.getTimeLine(timeEntry),
		me.getMetaLine(timeEntry)
	], true);
};

me.get = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.show = function ({toggl, views}, token) {
	me.get(token)
		.then(current => {
			if (!current) {
				throw new Error('No timer is running.');
			}

			me.printEntry(current);
		})
		.catch(views.err);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	views: require('../views.js'),
	toggl: require('../toggl.js'),
	core: require('./core.js')
});
