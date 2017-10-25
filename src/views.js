'use strict';

let me = {
	debug: false,
	dark: true
};

me.dim = function ({chalk}, ...args) {
	return (me.dark ? chalk.black : chalk.white)(...args);
};

me.accent = function ({chalk}, ...args) {
	return (me.dark ? chalk.white : chalk.black)(...args);
};

me.pad = function (_, arr) {
	if (typeof arr === 'string') {
		arr = [arr];
	}

	return [
		'',
		...arr.map(l => `  ${l}`),
		''
	].join('\n');
};

me.errMsg = function (_, msg) {
	return err => {
		me.err(new Error(`${msg}: ${err.message}`));
	};
};

me.formatErr = function ({chalk: {red}}, err) {
	const msg = [red(err.message)];

	if (me.debug) {
		msg.push(err.stack);
	}

	return me.pad(msg);
};

// loggers
me.err = function ({console: {error}}, err, fn = error) {
	if (err.message === 'ignore') {
		return;
	}

	fn(me.formatErr(err));
};

me.log = function ({console: {log}}, val, pad = false) {
	log(pad ? me.pad(val) : val);
};

// views
me.details = function (_, timeEntry) {
	if (!timeEntry) {
		throw new Error('No timer is running.');
	}

	return [
		me.descriptionLine(timeEntry),
		me.timeLine(timeEntry),
		me.metaLine(timeEntry)
	];
};

me.list = function (_, entries) {
	return entries.map(me.listLine);
};

me.projects = function (_, entries) {
	return entries.map(me.projectLine);
};

me.clients = function (_, entries) {
	return entries.map(me.clientLine);
};

me.started = function ({chalk}, {id, description, start}) {
	return [
		chalk.green('Started'),
		me.getDescription(description),
		'at',
		me.get24hour(start),
		me.getId({id})
	].join(' ');
};

me.renamed = function ({chalk}, oldName) {
	return ({id, description}) => {
		return [
			chalk.blue('Renamed'),
			me.getDescription(oldName),
			'to',
			me.getDescription(description),
			me.getId({id})
		].join(' ');
	};
};

me.stopped = function ({chalk}, {id, description, start, stop, duration}) {
	return [
		chalk.red('Stopped'),
		me.getDescription(description),
		'after',
		me.getDuration({duration, start}),
		'at',
		me.get24hour(stop),
		me.getId({id})
	].join(' ');
};

me.discard = function ({chalk: {cyan, red}}, entry) {
	return [
		...Array(2),
		red('Discard time entry:'),
		me.pad(me.details(entry)),
		...Array(2),
		cyan.bold('Are you sure [y,n]?')
	];
};

// lines
me.listLine = function ({chalk}, {description, duration, start, project, _id}, idx) {
	idx = _id || idx;

	return [
		chalk.blue(`${(++idx < 10 ? ' ' : '') + idx})`),
		me.getDuration({duration, start}, true),
		me.getDescription(description),
		me.getBrackets(project, true)
	].join(' ');
};

me.descriptionLine = function (_, {description, project}) {
	return [
		me.getDescription(description),
		me.getBrackets(project, true)
	].join(' ');
};

me.timeLine = function (_, {duration, start}) {
	return [
		me.accent('Running for:'),
		me.getDuration({duration, start}),
		'\t',
		me.accent('since'),
		me.get24hour(start)
	].join(' ');
};

me.metaLine = function (_, {id, project}) {
	const line = [me.getId({id})];

	if (project) {
		line.push(me.getId(project, 'pid'));

		if (project.client) {
			line.push(me.getId(project.client, 'cid'));
		}
	}
	return line.join(' ');
};

me.projectLine = function({chalk}, {_id, name, client}, idx) {
    idx = _id || idx;

    const response = [
            chalk.blue(`${(++idx < 10 ? ' ' : '') + idx})`),
            name
	];

    if (client) {
    	response.push(chalk.red(`[${client.name}]`));
    }

    return response.join(' ');
};

me.clientLine = function({chalk}, {_id, name}, idx) {
    idx = _id || idx;

    return [
        chalk.blue(`${(++idx < 10 ? ' ' : '') + idx})`),
        name
    ].join(' ');
};

// elements
me.getId = function (_, {id}, label = 'id') {
	return me.dim(`[${label}:#${id}]`);
};

me.getDescription = function ({chalk: {bold}}, description) {
	return description ? bold(description) : '(no description)';
};

me.getDuration = function ({core, chalk: {bold, green}}, {duration, start}, pad = false) {
	const isCurrent = duration < 0;

	if (isCurrent) {
		duration = Math.floor((new Date() - Date.parse(start)) / 1e3);
	}

	let durStr = core.getDuration({duration});

	if (pad && durStr.length <= 7) {
		durStr = ' '.repeat(7 - durStr.length) + durStr;
	}

	if (isCurrent) {
		durStr = bold(durStr);
	}

	return green(durStr);
};

me.getBrackets = function ({chalk}, project, bold = false) {
	if (!project) {
		return '';
	}

	const {name, client} = project;

	const brackets = [name];

	if (client) {
		brackets.push(bold ? chalk.bold(client.name) : client.name);
	}

	return chalk.red(`[${brackets.join(' • ')}]`);
};

me.get24hour = function ({chalk}, iso8601date) {
	const date = new Date(iso8601date);
	let minutes = date.getMinutes();

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	return chalk.blue([
		date.getHours(),
		minutes
	].join(':'));
};

me = require('mee')(module, me, {
	chalk: require('chalk'),
	core: require('./core.js'),

	console
});
