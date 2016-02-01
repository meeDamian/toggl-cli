'use strict';

let me = {};

// always returns 7 characters
me.getDuration = function ({chalk: {bold}, core: {isEntryRunning, getDurationStr}}, duration, start) {
	const isCurrent = isEntryRunning(duration);

	let durStr = getDurationStr(isCurrent ?
		Math.floor((new Date() - Date.parse(start)) / 1e3) :
		duration
	);

	if (durStr.length <= 7) {
		durStr = Array(7 + 1 - durStr.length).join(' ') + durStr;
	}

	return isCurrent ? bold(durStr) : durStr;
};

me.getBrackets = function ({chalk: {bold}}, {name, client}) {
	const brackets = [name];

	if (client) {
		brackets.push(bold(client.name));
	}

	return `[${ brackets.join(' • ') }]`;
};

me.renderOne = function ({chalk: {white, blue, red, green}, core}, idx, {description, duration, start, project}) {
	return [
		blue(`${(idx < 10 ? ' ' : '') + idx})`),
		green(me.getDuration(duration, start)),
		white(description || '(no description)'),
		project ? red(me.getBrackets(project)) : ''
	];
};

me.printList = function ({console: {log}, core}) {
	return entries => {
		let idx = core.isEntryRunning(entries[0]) ? 0 : 1;
		for (const entry of entries) {
			log(...me.renderOne(idx++, entry));
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
