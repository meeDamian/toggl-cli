'use strict';

let me = {};

me.getMicro = function () {
	return 'What do you want to do [s,r,d,p,l,L,o,v,q,h,?]?';
};

me.getShort = function ({chalk: {bold}}) {
	return [
		bold('Time entry'),
		'  s ⇾ start or stop    r ⇾ rename   l ⇾ list last 8',
		'  p ⇾ add project      d ⇾ delete   L ⇾ list last 16',

		bold('Other'),
		'  x ⇾ clear         h, ? ⇾ help',
		'  q ⇾ quit             v ⇾ version',
		'  o ⇾ open in browser',

		bold('Navigation'),
		' ⇦  ⇾ previous screen  ⇅ ⇾ scroll'
	].join('\n');
};

me.getLong = function ({pkg, pad}) {
	return pad([
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
		'  --examples   - show usage examples',
		'  --no-colors  - disable colors',
		'  --save-token - save provided token and exit',
		'  -t --token   - run with a custom token (will not be saved)',
		'  -f --force   - (NOT recomended) prevent all confirmations',
		'',
		'Commands:',
		'  c current            - see details of currently running time entry (if any).',
		'  l list [number]      - list last <number> of time entries (default: 8)',
		`  s smart [name]       - start or stop the entry, whatever makes more sense.`,
		'  r rename <new-name>  - rename currently running entry to <new name>.',
		'    start [name]       - start new time entry with the given name.',
		'    stop               - stop running entry.',
		'  d delete [name]      - delete latest entry with a matching name. Asks to confirm.',
		'  b browser            - open Toggl timer in default browser.',
		'',
		'Note:',
		'  → Values in [square brackets] are optional.'
	]);
};

me.getHint = function ({pad}) {
	return pad([
		'Invalid option. Try one of:',
		'  current, s, start, stop, rename,',
		'  delete, list, browser.',
		'',
		'Or run:',
		'  $ toggl --help'
	]);
};

me.getExamples = function ({pad, chalk: {white}}) {
	return pad([
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
	]);
};

me = require('mee')(module, me, {
	chalk: require('chalk'),
	pkg: require('../package.json'),

	pad: require('./views.js').pad
});
