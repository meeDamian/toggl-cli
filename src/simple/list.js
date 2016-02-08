'use strict';

let me = {};

me.getListElement = function ({chalk: {white, blue, red, green, bold}, core}, idx, {description, duration, start, project}) {
	const {durStr, isCurrent} = core.getDuration({duration, start}, true);

	return [
		blue(`${(idx < 10 ? ' ' : '') + idx})`),
		green(isCurrent ? bold(durStr) : durStr),
		white(description || '(no description)'),
		project ? red(core.getBrackets(project, bold)) : ''
	];
};

me.printList = function ({console: {log}, core}) {
	return entries => {
		let idx = core.isEntryRunning(entries[0]) ? 0 : 1;
		for (const entry of entries) {
			log(...me.getListElement(idx++, entry));
		}
	};
};

me.show = function ({console: {error}, toggl}, token, amount) {
	toggl.getTimeEntries(token, {amount, deps: true})
		.then(me.printList())
		.catch(error);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),

	toggl: require('../toggl.js'),
	core: require('./core.js'),

	console
});
