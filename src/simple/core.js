'use strict';

const MIN_IN_SEC = 60;
const HOUR_IN_SEC = 60 * MIN_IN_SEC;
const DAY_IN_SEC = 24 * HOUR_IN_SEC;

let me = {};

me.isEntryRunning = function ({duration}) {
	return duration < 0;
};

me.to24hour = function (iso8601date) {
	const date = new Date(iso8601date);
	const minutes = date.getMinutes();

	return [
		date.getHours(),
		minutes > 9 ? minutes : `0${minutes}`
	].join(':');
};

me.getDurationStr = function ({duration}) {
	const dur = [];

	if (duration >= DAY_IN_SEC) {
		dur.push(`${ Math.floor(duration / DAY_IN_SEC) }d`);
		duration %= DAY_IN_SEC;
	}

	if (duration >= HOUR_IN_SEC) {
		dur.push(`${ Math.floor(duration / HOUR_IN_SEC) }h`);
		duration %= HOUR_IN_SEC;
	}

	if (duration >= MIN_IN_SEC && dur.length < 2) {
		dur.push(`${ Math.floor(duration / MIN_IN_SEC) }m`);
		duration %= MIN_IN_SEC;
	}

	if (duration >= 1 && dur.length < 2) {
		dur.push(`${ duration }s`);
	}

	return dur.join(' ');
};

// always returns 7 characters
me.getDuration = function ({duration, start}, pad = false) {
	const isCurrent = me.isEntryRunning({duration});

	duration = isCurrent ?
		Math.floor((new Date() - Date.parse(start)) / 1e3) :
		duration;

	let durStr = me.getDurationStr({duration});

	if (pad && durStr.length <= 7) {
		durStr = Array(7 + 1 - durStr.length).join(' ') + durStr;
	}

	return {durStr, isCurrent};
};

me.getBrackets = function ({name, client}, clientFn = (v => v)) {
	const brackets = [name];

	if (client) {
		brackets.push(clientFn(client.name));
	}

	return `[${ brackets.join(' • ') }]`;
};

me = require('mee')(module, me);
