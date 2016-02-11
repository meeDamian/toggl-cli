'use strict';

let me = {};

me.getPath = function ({path, process: {env}}) {
	return path.resolve(...[
		env.HOME || env.USERPROFILE,
		'.config/toggl-cli/config.json'
	]);
};

me.getConfig = function ({require}) {
	try {
		return require(me.getPath());
	} catch (err) {
		return null;
	}
};

me.get = function () {
	return Promise.resolve(me.getConfig())
		.then(config => {
			if (!config) {
				throw new Error('no config exists');
			}

			return config;
		});
};

me.setToken = function ({fs}, token) {
	return new Promise((resolve, reject) => {
		if (!token) {
			throw new Error('token can\'t be empty.');
		}

		let config = me.getConfig();
		if (!config || typeof config !== 'object') {
			config = {};
		}

		config.token = token;

		fs.writeJSON(me.getPath(), config, 2, err => {
			if (err) {
				reject(err);
				return;
			}

			resolve(token);
		});
	});
};

me = require('mee')(module, me, {
	path: require('path'),
	fs: require('fs-extended'),

	process,
	require
});
