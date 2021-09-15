/* eslint camelcase: 0 */ /* some vars are used as indexes of Toggl API */

import buffer from 'node:buffer';
import request from 'request';
import meeEsm from './mee-esm.mjs';
import pkg from './pkg.mjs';
import utils from './utils.mjs';

const {Buffer} = buffer;

const TIMER_URL = 'https://track.toggl.com/timer';
const API_URL = 'https://api.track.toggl.com/api';
const API_VER = 'v8';

const V8_RESPONSE_WRAPPER = 'data';

const DEFS = {
	client: {
		details: {
			endpoint: ['clients', ':id'],
			method: 'GET',
		},
		list: {
			endpoint: ['me', 'clients'],
			method: 'GET',
			version: 'v9',
		},
	},
	project: {
		details: {
			endpoint: ['projects', ':id'],
			method: 'GET',
		},
		list: {
			endpoint: ['me', 'projects'],
			method: 'GET',
			version: 'v9',
		},
	},
	timeEntry: {
		create: {
			endpoint: ['time_entries', 'create'],
			method: 'POST',
		},
		current: {
			endpoint: ['time_entries', 'current'],
			method: 'GET',
		},
		delete: {
			endpoint: ['time_entries', ':id'],
			method: 'DELETE',
			wrapped: false,
		},
		details: {
			endpoint: ['time_entries', ':id'],
			method: 'GET',
		},
		list: {
			endpoint: 'time_entries',
			method: 'GET',
			wrapped: false,
		},
		start: {
			endpoint: ['time_entries', 'start'],
			method: 'POST',
		},
		stop: {
			endpoint: ['time_entries', ':id', 'stop'],
			method: 'PUT',
		},
		update: {
			endpoint: ['time_entries', ':id'],
			method: 'PUT',
		},
	},
};
Object.freeze(DEFS);

const me = {
	TIMER_URL,
	API_URL,
	API_VER,
	DEFS,
};

me.buildUrl = function (_, version, endpoint, id) {
	if (!endpoint) {
		throw new Error('endpoint must be provided');
	}

	if (typeof endpoint === 'string') {
		endpoint = [endpoint];
	}

	if (id) {
		endpoint = endpoint.map(s => s === ':id' ? id : s);
	}

	return [
		API_URL,
		version || API_VER,
		...endpoint,
	].join('/');
};

me.request = function ({
	request,
}, token, {
	endpoint,
	method,
	version,
	wrapped,
}, parameters) {
	return new Promise((resolve, reject) => {
		const tm = setTimeout(reject, 2000);

		const {
			id,
			body,
			qs,
		} = parameters || {};

		const url = this.buildUrl(version, endpoint, id);

		request({
			method,
			url,
			qs,
			body,
			json: true,
			headers: {
				Authorization: `Basic ${Buffer.from(`${token}:api_token`, 'utf8').toString('base64')}`,
			},
		}, (error, {
			statusCode,
		}, body) => {
			clearTimeout(tm);

			if (error) {
				reject({
					statusCode,
					error,
				});
				return;
			}

			if (statusCode === 429) {
				reject({
					statusCode,
					error: new Error('too many requests'),
				});
				return;
			}

			if (statusCode !== 200) {
				reject({
					statusCode,
					error: new Error(`FAIL ${url}`),
				});
				return;
			}

			resolve({
				body,
			});
		});
	})
		.then(({
			body,
		}) => {
			if ((!version || version === API_VER) && wrapped !== false) {
				return body[V8_RESPONSE_WRAPPER];
			}

			return body;
		});
};

me.fetchMany = function (_, fn, token, ids) {
	return Promise.all(ids
		.filter((id, pos, array) => id && array.indexOf(id) === pos) // Remove dups
		.map(id => fn(token, id)),
	);
};

/**
 * FETCHERS
 */
me.fetchProject = function (_, token, id) {
	return this.request(token, DEFS.project.details, {
		id,
	});
};

me.fetchProjects = function (_, token, ids) {
	return this.fetchMany(this.fetchProject, token, ids);
};

me.fetchProjectsList = function (_, token) {
	return this.request(token, DEFS.project.list);
};

me.fetchClient = function (_, token, id) {
	return this.request(token, DEFS.client.details, {
		id,
	});
};

me.fetchClients = function (_, token, ids) {
	return this.fetchMany(this.fetchClient, token, ids);
};

me.fetchClientList = function (_, token) {
	return this.request(token, DEFS.client.list);
};

me.fetchTimeEntries = function (_, token, {days = 90}) {
	const parameters = {
		start_date: new Date(new Date().setDate(new Date().getDate() - days)).toISOString(),
	};

	return this.request(token, DEFS.timeEntry.list, {
		qs: parameters,
	});
};

me.fetchCurrentTimeEntry = function (_, token) {
	return this.request(token, DEFS.timeEntry.current);
};

/**
 * GETTERS
 **/
me.getClients = function (_, token, {
	ids,
}) {
	return this.fetchClients(token, ids);
};

me.getProjects = function ({
	utils,
}, token, {
	ids,
	deps = true,
}) {
	const partial = ids
		? this.fetchProjects(token, ids)
		: this.fetchProjectsList(token);

	if (!deps) {
		return partial;
	}

	return partial
		.then(utils.attach(this.getClients, token, 'cid', 'client'));
};

me.getTimeEntries = function ({
	utils,
}, token, {
	limit,
	date,
	deps = true,
}) {
	const partial = this.fetchTimeEntries(token, {})
		.then(entries => {
			entries.reverse();

			if ((limit === undefined && date === undefined) || !isNaN(limit)) {
				try {
					entries.length = Math.min(entries.length, limit || 8);
				} catch (error) {
					throw new Error(`Invalid "amount" ${error}`);
				}

				return entries;
			}

			if (date) {
				return entries.map((entry, i) => {
					entry._id = i;
					return entry;
				})
					.filter(({
						start,
						stop,
					}) => utils.compareDates(start, date) || utils.compareDates(stop, date));
			}
		});

	if (!deps) {
		return partial;
	}

	return partial
		.then(utils.attach(this.getProjects, token, 'pid', 'project', deps));
};

me.getCurrentTimeEntry = function ({
	utils,
}, token, deps = true) {
	return this.fetchCurrentTimeEntry(token)
		.then(data => {
			if (!data) {
				return undefined;
			}

			if (!deps) {
				return data;
			}

			return Promise.resolve([data])
				.then(utils.attach(this.getProjects, token, 'pid', 'project', deps))
				.then(([data]) => data);
		});
};

/**
 * SETTERS
 **/
me.startTimeEntry = function ({
	pkg,
}, token, time_entry = {}) {
	time_entry.created_with = `toggl-cli ${pkg.version}`;
	return this.request(token, DEFS.timeEntry.start, {
		body: {
			time_entry,
		},
	});
};

me.stopTimeEntry = function (_, token, id) {
	return this.request(token, DEFS.timeEntry.stop, {
		id,
	});
};

me.updateTimeEntry = function (_, token, id, changes) {
	return this.request(token, DEFS.timeEntry.update, {
		id,
		body: {
			time_entry: changes,
		},
	});
};

me.deleteTimeEntry = function (_, token, id) {
	return this.request(token, DEFS.timeEntry.delete, {
		id,
	});
};

export default meeEsm(me, {request, utils, pkg});

