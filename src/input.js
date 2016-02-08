'use strict';

let me = {};

me.preProcessFlags = function ({minimist, process: {argv}}) {
	return minimist(argv.slice(2), {
		boolean: ['help', 'version', 'examples', 'force'],
		string: ['token', 'save-token'],
		alias: {
			h: 'help',
			v: 'version',
			t: 'token',
			f: 'force'
		}
	});
};

me.chooseToken = function ({config: {getToken}}, token) {
	return new Promise((resolve, reject) => {
		if (token === '') {
			reject('`--token` can\'t be empty');
			return undefined;
		}

		if (token) {
			resolve(token);
			return undefined;
		}

		return getToken()
			.then(resolve, reject);
	});
};

me.parse = function ({process, console: {log}, pkg, help, config}) {
	return new Promise(resolve => {
		let argv = process.argv;

		argv = me.preProcessFlags();

		if (argv.version) {
			log(pkg.version);
			return;
		}

		if (argv.help) {
			log(help.getLong());
			return;
		}

		if (argv.examples) {
			log(help.getExamples());
			return;
		}

		if (argv['save-token']) {
			config.setToken(argv['save-token'])
				.then(token => log(`token '${token}' saved`))
				.catch(err => log('token NOT saved:', err));
			return;
		}

		const {force} = argv;

		me.chooseToken(argv.token)
			.then(token => {
				if (!argv._.length) {
					resolve({token, force});
					return;
				}

				resolve({
					cmd: argv._,
					force,
					token
				});
			})
			.catch(log);
	});
};

me = require('mee')(module, me, {
	minimist: require('minimist'),
	chalk: require('chalk'),

	pkg: require('./utils.js').getPackage(),

	config: require('./config.js'),
	help: require('./help.js'),

	process,
	console
});
