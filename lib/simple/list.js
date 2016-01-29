'use strict';

let me = {};

// should always return 7 characters
me.getFormattedDuration = function({chalk: {green: color}, core: {isEntryRunning, getDurationStr}}, duration, start) {
  if (isEntryRunning(duration)) {
    duration = Math.floor((new Date() - Date.parse(start)) / 1e3);
    color = color.bold;
  }

  let durStr = getDurationStr(duration);
  if (durStr.length <= 7)
    durStr = Array(7 + 1 - durStr.length).join(' ') + durStr;

  return color(durStr);
}

me.renderTimeEntry = function({chalk: {white, blue, red}, core}, idx, {description, duration, start, tags, project}) {
  return [
    blue((idx < 10 ? ' ' : '') + idx + ')'),
    me.getFormattedDuration(duration, start),
    white(description || '(no description)'),
    project ? red('[' + project.name + ']') : ''
  ];
}

me.printTimeEntries = function({console: {log}, chalk, core}) {
  return entries => {
    let idx = core.isEntryRunning(entries[0]) ? 0 : 1;
    for (let entry of entries)
      log(...me.renderTimeEntry(idx++, entry));
  };
}

me.attachProjects = function({utils, toggl: {getProjects}}, token) {
  return entries => {
    let pids = entries.map(e => e.pid);

    return getProjects(token, pids)
      .then(utils.objectify)
      .then(projects => {
        return entries.map(e => {
          if (e.pid) {
            e.project = projects[e.pid];
            e.pid = undefined;
            delete e.pid;
          }
          return e;
        });
      });
  };
}

me.listTimeEntries = function({console: {error}, toggl}, token, amount) {
  toggl.getTimeEntries(token, {days: 90})
    .then(({body: entries}) => {
      entries.reverse();

      try {
        entries.length = Math.min(entries.length, amount || 8);
      } catch (e) {
        throw new Error('param must be a number');
      }

      return entries;
    })
    .then(me.attachProjects(token))
    .then(me.printTimeEntries())
    .catch(error);
}

me = require('../utils.js')(module, me, {
	chalk: require('chalk'),

	utils: require('../utils.js'),
	toggl: require('../toggl.js'),

	core: require('./core.js'),

	console
});
