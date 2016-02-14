'use strict';

let me = {};

me.getMicro = function () {
	return 'What do you want to do [s,r,d,p,l,L,b,v,q,h,?]?';
};

me.getShort = function ({chalk: {bold}}) {
	return [
		bold('Time entry'),
		'  s ⇾ start or stop    r ⇾ rename   l ⇾ list last 8',
		'  p ⇾ add project      d ⇾ delete   L ⇾ list last 16',

		bold('Other'),
		'  x ⇾ clear         h, ? ⇾ help',
		'  q ⇾ quit             v ⇾ version',
		'  b ⇾ open in browser',

		bold('Navigation'),
		' ⇦  ⇾ previous screen  ⇅ ⇾ scroll'
	].join('\n');
};

me.getLong = function ({pkg, pad, chalk: {white, black}}) {
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
		'  -v --version     - output version',
		'  -h --help        - output this help',
		'  --examples       - show usage examples',
		'  --no-colors      - disable colors',
		'  --save-token     - save provided token and exit',
		'  -t --token       - run with a custom token (will not be saved)',
		`  --set-background - set color theme. Choose more readible: ${white('dark')} or ${black('light')}`,
		'',
		'Commands:',
		'  c current            - see details of currently running time entry (if any).',
		'  l list [number]      - list last <number> of time entries (default: 8)',
		`  s smart [name]       - start or stop the entry, whatever makes more sense.`,
		'    start [name]       - start new time entry with the given name.',
		'    stop               - stop running entry.',
		'  r rename <new-name>  - rename currently running entry to <new name>.',
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
		'  current, smart, start, stop,',
		'  rename, delete, list, browser.',
		'',
		'Or run:',
		'  $ toggl --help'
	]);
};

me.onBoard = function ({pad, chalk: {white, yellow, magenta}}, token = true, theme = true) {
	const flags = [];
	const desc = [];

	if (token) {
		const TOKEN = magenta('TOKEN');
		flags.push('--save-token', TOKEN);
		desc.push(`  ${TOKEN} is the thingy from the very bottom of this website: ${white.underline('https://www.toggl.com/app/profile')}`);
	}

	if (theme) {
		const BACKGROUND = yellow('BACKGROUND');
		flags.push('--set-background', BACKGROUND);
		desc.push(`  ${BACKGROUND} is the background color of your terminal. Either ${white('dark')} or ${white('light')}`);
	}

	return pad([
		'Oops, some things are missing. Run:',
		white(['  $ toggl', ...flags].join(' ')),
		'',
		'Where:',
		...desc
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
		white('Run interactive mode with a different token:'),
		'  $ toggl --token a1ad615af03be16c2027d3dc08291457',
		'',
		white('Start a new task named "Writing toggl-cli docs":'),
		'  $ toggl start Writing toggl-cli docs'
	]);
};

me.getLogo = function ({pad, chalk: {red}}) {
	return red(pad([
		'      NN',
		'   .: NN :.',
		' cX0l NN l0Nc',
		'xM;   NN   ;Mx',
		'WK    OO    KW',
		'oMc        cMo',
		' ;0Xd:,,:dX0;',
		'   .xNMMNx.'
	].map(v => ' '.repeat(6) + v)));
};

me = require('mee')(module, me, {
	chalk: require('chalk'),
	pkg: require('../package.json'),

	pad: require('./views.js').pad
});
