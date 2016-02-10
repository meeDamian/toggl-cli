'use strict';

let me = {};

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

// views
me.err = function ({chalk: {red}, console: {error}}, err) {
	if (err instanceof Error) {
		error(red(me.pad([err.message, err.stack])));
	} else {
		me.log(err);
	}
};

me.log = function ({console: {log}}, val, pad = false) {
	log(pad ? me.pad(val) : val);
};

me.started = function ({chalk}, {id, description, start}, out = me.log) {
	out([
		chalk.green('Started'),
		me.getDescription(description),
		'at',
		me.get24hour(start),
		me.getId({id})
	].join(' '), true);
};

me.details = function (_, timeEntry, out = me.log) {
	out([
		me.descriptionLine(timeEntry),
		me.timeLine(timeEntry),
		me.metaLine(timeEntry)
	], true);
};

me.list = function (_, entries, out = me.log) {
	out(entries.map(me.listLine), true);
};

me.stopped = function ({chalk}, {id, description, start, stop, duration}, out = me.log) {
	out([
		chalk.red('Stopped'),
		me.getDescription(description),
		'after',
		me.getDuration({duration, start}),
		'at',
		me.get24hour(stop),
		me.getId({id})
	].join(' '), true);
};

me.renamed = function ({chalk}, oldName, newName, id, out = me.log) {
	out([
		chalk.blue('Renamed'),
		me.getDescription(oldName),
		'to',
		me.getDescription(newName),
		me.getId({id})
	].join(' '), true);
};

// lines
me.listLine = function ({chalk}, {description, duration, start, project}, idx) {
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

me.timeLine = function ({chalk}, {duration, start}) {
	return [
		chalk.dim('Running for:'),
		me.getDuration({duration, start}),
		'  since',
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

// elements
me.getId = function ({chalk: {black}}, {id}, label = 'id') {
	return black(`[${label}:#${id}]`);
};

me.getDescription = function ({chalk: {white, bold}}, description) {
	return white(description ? bold(description) : '(no description)');
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

	return chalk.red(`[${ brackets.join(' • ') }]`);
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
	core: require('./simple/core.js'),

	console
});
