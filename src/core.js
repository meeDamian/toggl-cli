'use strict';

const MIN_IN_SEC = 60;
const HOUR_IN_SEC = 60 * MIN_IN_SEC;
const DAY_IN_SEC = 24 * HOUR_IN_SEC;

let me = {
	MIN_IN_SEC,
	HOUR_IN_SEC,
	DAY_IN_SEC
};

me.getDuration = function ({duration}, maxLength = 2) {
	const dur = [];

	if (duration >= DAY_IN_SEC) {
		dur.push(`${Math.floor(duration / DAY_IN_SEC)}d`);
		duration %= DAY_IN_SEC;
	}

	if (duration >= HOUR_IN_SEC && dur.length < maxLength) {
		dur.push(`${Math.floor(duration / HOUR_IN_SEC)}h`);
		duration %= HOUR_IN_SEC;
	}

	if (duration >= MIN_IN_SEC && dur.length < maxLength) {
		dur.push(`${Math.floor(duration / MIN_IN_SEC)}m`);
		duration %= MIN_IN_SEC;
	}

	if (duration > 0 && dur.length < maxLength || (dur.length === 0 && duration === 0)) {
		dur.push(`${duration}s`);
	}

	return dur.join(' ');
};

me = require('mee')(module, me);
