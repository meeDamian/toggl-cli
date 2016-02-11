'use strict';

let me = {};

me.preProcessFlags = function ({minimist, process: {argv}}) {
	return minimist(argv.slice(2), {
		boolean: ['help', 'version', 'examples', 'force', 'debug'],
		string: ['token', 'save-token'],
		alias: {
			h: 'help',
			v: 'version',
			t: 'token',
			f: 'force'
		}
	});
};

me.chooseToken = function (_, file, argument) {
	if (argument !== undefined && argument === '') {
		reject('`--token` can\'t be empty');
		return undefined;
	}

	return argument || file;
};

me.parse = function ({views: {log, err, errMsg}, pkg, help, config}) {
	return new Promise(resolve => {
		const argv = me.preProcessFlags();

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

		const {force, debug} = argv;

		config.get()
			.then(c => {
				const token = me.chooseToken(c.token, argv.token);

				// TODO: check theme
				// TODO: check init-ed
				// TODO: onboarding?

				if (!argv._.length) {
					resolve({token, force, debug});
					return;
				}

				resolve({
					cmd: argv._,
					token, force, debug
				});
			})
			.catch(e => {
				console.error('a', e);
			});
			// .catch(err);
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
