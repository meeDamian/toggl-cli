'use strict';

let me = {};

me.getMicro = function () {
	return 'What do you want to do [c,1-9,s,r,d,p,l,L,b,v,h,?,q]?';
};

me.getShort = function ({chalk: {bold, dim}}) {
	return [
		bold('Time entry'),
		'  c ⇾ current        1-9 ⇾ resume from the list',
		`  s ⇾ start or stop    ${dim('r ⇾ rename')}        l ⇾ list last 8`,
		`  d ⇾ discard          ${dim('p ⇾ add project')}   L ⇾ list last 16`,
		'',
		bold('Other'),
		'  x ⇾ clear         h, ? ⇾ help          v ⇾ version',
		'  b ⇾ open in browser  q ⇾ quit'
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
		'  c current 				- see details of currently running time entry (if any).',
		'  l list [amount|when] 		- list last <amount> of time entries (default: 8) or <when> (see Notes)',
		`  s smart [properties] [name|number]	- start or stop the entry, whatever makes more sense.`,
		'    start [properties] [name|number]	- start new time entry with the given name, or resume if number is given.',
		'    stop  				- stop running entry.',
		'  r rename <new-name> 		- rename currently running entry to <new-name>.',
		'  pr projects  			- list existing projects.',
		'  cl clients				- list existing clients.',
		'  b browser				- open Toggl timer in default browser.',
		'',
		'Properties:',
		'  New tasks can have properties defined as the first parameters after "start"',
		'  → project:, proj: - set the project for this task, can be either a number, or partial name of the project',
		'  → billable:, bill: - if passed "yes", will mark the task as billable',
		'  → tag: - can add tags to the task, can be called multiple times',
		'',
		'Notes:',
		'  → Values in [square brackets] are optional.',
		'  → <when> is one of:',
		'      today, yesterday, last Monday, last tue, etc…'

	]);
};

me.getHint = function ({pad}) {
	return pad([
		'Invalid option. Try one of:',
		'  current, smart, start, stop,',
		'  rename, list, browser.',
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

me.getExamples = function ({pad, chalk: {bold}}) {
	return pad([
		bold('Set default token for all future launches:'),
		'  $ toggl --save-token d9db051bf06be16c2027d3cb08769451',
		'',
		bold('List last 17 time entries for a different account:'),
		'  $ toggl --token a1ad615af03be16c2027d3dc08291457 list 17',
		'',
		bold('Run interactive mode with a different token:'),
		'  $ toggl --token a1ad615af03be16c2027d3dc08291457',
		'',
		bold('Start a new task named "Writing toggl-cli docs":'),
		'  $ toggl start Writing toggl-cli docs',
		'',
        bold('Start a new task named "Writing toggl-cli docs" in the "toggl" project, with the "test" tag:'),
        '  $ toggl start tag:test proj:toggl Writing toggl-cli docs',
        '',
		bold('Resume last running time entry:'),
		'  $ toggl start 1',
		'',
		bold('List entries from the last Friday:'),
		'  $ toggl list last friday',
		'',
        bold('List all the projects in the workspace:'),
        '  $ toggl pr',
        '',
        bold('Alias toggl for work:'),
		`  $ echo "toggl2='toggl --token <work-token>'" >> ~/.bashrc`,
		'  $ toggl list yesterday  # yesterday entries from your private account',
		'  $ toggl2 list           # last 8 entries from your work account'
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
