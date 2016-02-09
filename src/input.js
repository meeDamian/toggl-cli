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

me.parse = function ({process, views: {log, err, errMsg}, pkg, help, config}) {
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

		if (argv['save-token'] !== undefined) {
			config.setToken(argv['save-token'])
				.then(token => log(`token '${token}' saved`))
				.catch(errMsg('token NOT saved'));
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
			.catch(err);
	});
};

me = require('mee')(module, me, {
	minimist: require('minimist'),
	chalk: require('chalk'),

	pkg: require('../package.json'),

	config: require('./config.js'),
	views: require('./views.js'),
	help: require('./help.js'),

	process
});
