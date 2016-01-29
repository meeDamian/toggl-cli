'use strict';

const MIN_IN_SEC = 60;
const HOUR_IN_SEC = 60 * MIN_IN_SEC;
const DAY_IN_SEC = 24 * HOUR_IN_SEC;

let me = {};

me.isEntryRunning = function(duration) {
  return duration < 0;
}

me.getDurationStr = function(duration) {
  let dur = [];

  if (duration >= DAY_IN_SEC) {
    dur.push(Math.floor(duration / DAY_IN_SEC) + 'd');
    duration %= DAY_IN_SEC;
  }

  if (duration >= HOUR_IN_SEC) {
    dur.push(Math.floor(duration / HOUR_IN_SEC) + 'h');
    duration %= HOUR_IN_SEC;
  }

  if (duration >= MIN_IN_SEC && dur.length < 2) {
    dur.push(Math.floor(duration / MIN_IN_SEC) + 'm');
    duration %= MIN_IN_SEC;
  }

  if (duration >= 1 && dur.length < 2)
    dur.push(duration + 's');

  return dur.join(' ');
}

me = require('../utils.js')(module, me);
