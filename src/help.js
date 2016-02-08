'use strict';

let me = {};

me.getShort = function () {
	return [
		'Time entry management:',
		'  s - start or stop',
		'  r - rename',
		'  d - delete',
		'  p - assign to project',
		// '  t - edit time',

		'Recent:',
		'  l - list last 8',
		'  L - list last 16',

		'Other:',
		'  o - open Toggl in browser',
		'  v - version',
		'  q - quit',
		'  h, ? - help',
		'What do you want to do [s,r,d,p,l,L,o,v,q,h,?]?'
	].join('\n');
};

me.getLong = function ({pkg, chalk}) {
	return [
		'',
		pkg.description,
		'',
		'Usage:',
		'  Interactive mode:',
		'    $ toggl',
		'',
		'  Single request:',
		'    $ toggl <cmd>',
		'',
		'Flags:',
		'  -v --version - output version',
		'  -h --help    - output this help',
		'  --examples   -  show usage examples',
		'  --no-color   - disable colors',
		'  --save-token - save provided token and exit',
		'  -t --token   - run with a custom token (will not be saved)',
		'  -f --force   - (NOT recomended) prevent all confirmations',
		'',
		'Commands:',
		'  b                    - open in default browser.',
		'  c current            - see details of currently running time entry (if any).',
		`  s [name]             - start ${chalk.gray('x')}or stop the entry, whatever makes more sense.`,
		'  start [name]         - start new time entry with the given name.',
		'  stop [name]          - stop running entry. If name is provided, stop only if matches.',
		'  r rename <new-name>  - rename currently running entry to <new name>.',
		'  d delete [name]      - delete latest entry with a matching name. Asks to confirm.',
		'  l list [number]      - list last <number> of time entries (default: 8)',
		'',
		'Notes:',
		'  → The last command requires quotes.',
		'  → Values in [square brackets] are optional.'
	].map(l => `  ${l}`).join('\n');
};

me.getExamples = function ({chalk: {white}}) {
	return [
		'',
		white('Set default token for all future launches:'),
		'  $ toggl --save-token d9db051bf06be16c2027d3cb08769451',
		'',
		white('List last 17 time entries for a different account:'),
		'  $ toggl --token a1ad615af03be16c2027d3dc08291457 list 17',
		'',
		white('Run interactive mode with a different token and force no confirmations:'),
		'  $ toggl --force --token a1ad615af03be16c2027d3dc08291457',
		'',
		white('Start a new task named "Writing toggl-cli docs":'),
		'  $ toggl start Writing toggl-cli docs'
	].map(l => `  ${l}`).join('\n');
};

me = require('mee')(module, me, {
	chalk: require('chalk'),
	pkg: require('./utils.js').getPackage()
});
