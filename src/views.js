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

me.err = function ({chalk: {red}, console: {error}}, err) {
	if (err instanceof Error) {
		error(me.pad(red(err.message)));
	} else {
		me.log(err);
	}
};

me.errMsg = function (_, msg) {
	return err => {
		me.err(new Error(`${msg}: ${err.message}`));
	};
};

me.log = function ({console: {log}}, val, pad = false) {
	log(pad ? me.pad(val) : val);
};

me.started = function ({core, chalk: {green, blue}}, {id, description, start}) {
	me.log([
		green('Started'),
		me.getDescription(description),
		'at',
		blue(core.to24hour(start)),
		me.getId(id)
	].join(' '), true);
};

me.details = function () {

};

me.oneLine = function ({chalk: {blue, red, green, bold}, core}, {description, duration, start, project}, idx) {
	const {durStr, isCurrent} = core.getDuration({duration, start}, true);

	return [
		blue(`${(++idx < 10 ? ' ' : '') + idx})`),
		green(isCurrent ? bold(durStr) : durStr),
		me.getDescription(description),
		red(core.getBrackets(project, bold))
	].join(' ');
};

me.stopped = function ({core, chalk: {red, green, blue}}, {id, description, start, stop, duration}) {
	me.log([
		red('Stopped'),
		me.getDescription(description),
		'after',
		green(core.getDuration({duration, start}).durStr),
		'at',
		blue(core.to24hour(stop)),
		me.getId(id)
	].join(' '), true);
};

me.renamed = function ({chalk: {blue}}, oldName, newName, id) {
	me.log([
		blue('Renamed'),
		'from',
		me.getDescription(oldName),
		'to',
		me.getDescription(newName),
		me.getId(id)
	].join(' '), true);
};

me.getId = function ({chalk: {black}}, id) {
	return black(`[id:#${id}]`);
};

me.getDescription = function ({chalk: {white, bold}}, {description}) {
	return white(description ? bold(description) : '(no description)');
};

me = require('mee')(module, me, {
	chalk: require('chalk'),
	core: require('./simple/core.js'),

	console
});
