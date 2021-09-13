import minimist from 'minimist';
import config from './config.mjs';
import help from './help.mjs';
import meeEsm from './mee-esm.mjs';
import pkg from './pkg.mjs';
import views from './views.mjs';

function preProcess({minimist, process: {argv}}) {
	return minimist(argv.slice(2), {
		boolean: ['help', 'version', 'examples', 'debug', 'logo'],
		string: ['token', 'save-token', 'set-background'],
		alias: {
			h: 'help',
			v: 'version',
			t: 'token'
		}
	});
}

function chooseToken(_, file, argument) {
	if (argument !== undefined && argument === '') {
		throw new Error('--token can\'t be empty');
	}

	return argument || file;
}

function saveNeeded({config, views: {log, errMsg}}, argv) {
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
}

function processConfig({help, views: {log}}, argv) {
	return config => {
		const input = {
			token: this.chooseToken(config.token, argv.token),
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
}

function parse({views: {log, err: error}, pkg, help, config}) {
	return new Promise(resolve => {
		const argv = this.preProcess();

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

		if (this.saveNeeded(argv)) {
			return;
		}

		config.get()
			.then(this.processConfig(argv))
			.then(resolve)
			.catch(err => {
				if (err.message === 'no config exists') {
					log(help.onBoard());
					return;
				}

				error(err);
			});
	});
}

export default meeEsm({preProcess, chooseToken, saveNeeded, processConfig, parse}, {minimist, pkg, config, views, help, process});
