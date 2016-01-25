'use strict';

const MIN_IN_SEC  = 60;
const HOUR_IN_SEC = 60 * MIN_IN_SEC;
const DAY_IN_SEC  = 24 * HOUR_IN_SEC;

function isEntryRunning(_, {duration}) {
  return duration < 0;
}

function getDuration(_, {duration}) {
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

// should always return 7 characters
function getDurationStr({green: color}, {duration, start}) {
  if (isEntryRunning(undefined, {duration})) {
    duration = Math.floor((new Date() - Date.parse(start)) / 1e3);
    color = color.bold;
  }

  let durStr = getDuration(undefined, {duration});
  if (durStr.length <= 7)
    durStr = Array(7 + 1 - durStr.length).join(' ') + durStr;

  return color(durStr);
}

function renderTimeEntry({chalk: {white, blue, green, red}}, idx, {description, duration, start, tags}, project) {
  return [
    blue((idx < 10 ? ' ' : '') + idx + ')'),
    getDurationStr({green}, {duration, start}),
    white(description || '(no description)'),
    project ? red('[' + project.name + ']') : ''
  ];
}

function printTimeEntries({log, chalk}) {
  return entries => {
    let idx = isEntryRunning(null, entries[0]) ? 0 : 1;
    for (let entry of entries)
      log(...renderTimeEntry({chalk}, idx++, entry, entry.project));
  };
}

function attachProjects({utils}, {getProjects}, token) {
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

function listTimeEntries({console: {log, error}, chalk, utils}, toggl, token, amount) {
  toggl.getTimeEntries(token, {days: 90})
    .then(({body: entries}) => {
      entries.reverse();

      try {
        entries.length = Math.min(entries.length, amount || 8);
      } catch(e) {
        throw new Error('param must be a number');
      }

      return entries;
    })
    .then(attachProjects({utils}, toggl, token))
    .then(printTimeEntries({log, chalk}))
    .catch(error);
}

function execute(deps, toggl, {cmd, token}) {
  switch (cmd[0].toLowerCase()) {
    case 'l':
    case 'list':
      listTimeEntries(deps, toggl, token, cmd[1]);
      break;

    default:
      deps.console.error('Invalid command. Try `toggl --help`.');
  }
}

module.exports = exports = {
  isEntryRunning,
  getDuration,
  getDurationStr,
  renderTimeEntry,
  printTimeEntries,
  execute
};
