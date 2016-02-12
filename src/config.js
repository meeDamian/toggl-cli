'use strict';

let me = {};

me.getPath = function ({path, process: {env}}) {
	return path.resolve(...[
		env.HOME || env.USERPROFILE,
		'.config/toggl-cli/config.json'
	]);
};

me.open = function ({require}) {
	try {
		return require(me.getPath());
	} catch (err) {
		return null;
	}
};

me.get = function () {
	return Promise.resolve(me.open())
		.then(config => {
			if (!config) {
				throw new Error('no config exists');
			}

			return config;
		});
};

me.save = function ({fs}, newConfig) {
	return new Promise((resolve, reject) => {
		let config = me.open();

		if (!config || typeof config !== 'object') {
			config = {};
		}

		Object.assign(config, newConfig);

		fs.writeJSON(me.getPath(), config, 2, err => {
			if (err) {
				reject(err);
				return;
			}

			resolve(config);
		});
	});
};

me = require('mee')(module, me, {
	path: require('path'),
	fs: require('fs-extended'),

	process,
	require
});
