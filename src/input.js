'use strict';

let me = {};

me.preProcess = function ({minimist, process: {argv}}) {
	return minimist(argv.slice(2), {
		boolean: ['help', 'version', 'examples', 'debug', 'logo'],
		string: ['token', 'save-token', 'set-background'],
		alias: {
			h: 'help',
			v: 'version',
			t: 'token'
		}
	});
};

me.chooseToken = function (_, file, argument) {
	if (argument !== undefined && argument === '') {
		throw new Error('--token can\'t be empty');
	}

	return argument || file;
};

me.saveNeeded = function ({config, views: {log, errMsg}}, argv) {
	const newConfig = {};

	if (argv['save-token'] !== undefined) {
		if (!argv['save-token']) {
			throw new Error('--save-token can\'t be empty.');
		}

		newConfig.token = argv['save-token'];
	}

	if (argv['set-background'] !== undefined) {
		switch (argv['set-background']) {
			case 'dark':
				newConfig.dark = true;
				break;

			case 'light':
				newConfig.dark = false;
				break;

			default: throw new Error('Invalid --set-background value. Allowed: dark, light');
		}
	}

	const keys = Object.keys(newConfig);
	if (keys.length) {
		config.save(newConfig)
			.then(config => {
				const status = keys.map(k => `${k} '${config[k]}'`).join(' and ');
				log(`${status} saved.`, true);
			})
			.catch(errMsg(`${keys.join(' and ')} NOT saved.`));

		return true;
	}

	return false;
};

me.process = function ({help, views: {log}}, argv) {
	return config => {
		const input = {
			token: me.chooseToken(config.token, argv.token),
			dark: config.dark,
			debug: argv.debug
		};

		if (argv._.length) {
			input.cmd = argv._;
		}

		if (!input.token || input.dark === undefined) {
			log(help.onBoard(
				!input.token,
				input.dark === undefined
			));

			throw new Error('ignore');
		}

		return input;
	};
};

me.parse = function ({views: {log, err: error}, pkg, help, config}) {
	return new Promise(resolve => {
		const argv = me.preProcess();

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

		if (argv.logo) {
			log(help.getLogo());
			return;
		}

		if (me.saveNeeded(argv)) {
			return;
		}

		config.get()
			.then(me.process(argv))
			.then(resolve)
			.catch(err => {
				if (err.message === 'no config exists') {
					log(help.onBoard());
					return;
				}

				error(err);
			});
	});
};

me = require('mee')(module, me, {
	minimist: require('minimist'),

	pkg: require('../package.json'),

	config: require('./config.js'),
	views: require('./views.js'),
	help: require('./help.js'),

	process
});
