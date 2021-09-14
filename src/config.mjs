import path from 'node:path';
import fs from 'fs-extra';
import meeEsm from './mee-esm.mjs';

function getPath({path, process: {env}}) {
	return path.resolve(
		env.HOME || env.USERPROFILE,
		'.config/toggl-cli/config.json',
	);
}

function open({fs}) {
	try {
		return fs.readJsonSync(this.getPath()); // TODO: Make async?
	} catch {
		return null;
	}
}

function get() {
	return Promise.resolve(this.open())
		.then(config => {
			if (!config) {
				throw new Error('no config exists');
			}

			return config;
		});
}

function save({fs}, newConfig) {
	return new Promise((resolve, reject) => {
		let config = this.open();

		if (!config || typeof config !== 'object') {
			config = {};
		}

		Object.assign(config, newConfig);

		fs.outputJson(this.getPath(), config, {spaces: 2}, error => {
			if (error) {
				reject(error);
				return;
			}

			resolve(config);
		});
	});
}

export default meeEsm({getPath, open, get, save}, {path, fs, process});
