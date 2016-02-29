/* eslint camelcase: 0 */ /* some vars are used as indexes of Toggl API*/
'use strict';

const URL = 'https://www.toggl.com';
const TIMER_URL = `${URL}/app/timer`;
const API_URL = `${URL}/api`;
const API_VER = 'v8';

const DEFS = {
	client: {
		details: {
			endpoint: ['clients', ':id'],
			method: 'GET'
		}
	},
	project: {
		details: {
			endpoint: ['projects', ':id'],
			method: 'GET'
		},
		list: {
			endpoint: ['me', 'projects'],
			method: 'GET',
			version: 'v9'
		}
	},
	timeEntry: {
		create: {
			endpoint: ['time_entries', 'create'],
			method: 'POST'
		},
		current: {
			endpoint: ['time_entries', 'current'],
			method: 'GET'
		},
		delete: {
			endpoint: ['time_entries', ':id'],
			method: 'DELETE'
		},
		details: {
			endpoint: ['time_entries', ':id'],
			method: 'GET'
		},
		list: {
			endpoint: 'time_entries',
			method: 'GET'
		},
		start: {
			endpoint: ['time_entries', 'start'],
			method: 'POST'
		},
		stop: {
			endpoint: ['time_entries', ':id', 'stop'],
			method: 'PUT'
		},
		update: {
			endpoint: ['time_entries', ':id'],
			method: 'PUT'
		}
	}
};
Object.freeze(DEFS);

let me = {
	URL,
	TIMER_URL,
	API_URL,
	API_VER,
	DEFS
};

me.getUrl = function (_, version, endpoint, id) {
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
		...endpoint
	].join('/');
};

me.request = function ({request}, token, {endpoint, method, version}, params) {
	return new Promise((resolve, reject) => {
		const tm = setTimeout(reject, 2000);

		const {id, body, qs} = params || {};

		const url = me.getUrl(version, endpoint, id);

		request({
			method, url, qs, body,
			json: true,
			headers: {
				Authorization: `Basic ${new Buffer(`${token}:api_token`, 'utf8').toString('base64')}`
			}
		}, (error, {statusCode}, body) => {
			clearTimeout(tm);

			if (error) {
				reject({statusCode, error});
				return;
			}

			if (statusCode === 429) {
				reject({statusCode, error: new Error('too many requests')});
				return;
			}

			if (statusCode !== 200) {
				reject({statusCode, error: new Error(`FAIL ${url}`)});
				return;
			}

			resolve({body});
		});
	});
};

me.fetchMany = function (_, fn, token, ids) {
	return Promise.all(ids
		.filter((id, pos, arr) => id && arr.indexOf(id) === pos)  // remove dups
		.map(id => fn(token, id))
	);
};

/**
 * FETCHERS
 */
me.fetchProject = function (_, token, id) {
	return me.request(token, DEFS.project.details, {id})
		.then(({body: {data}}) => data);
};
me.fetchProjects = function (_, token, ids) {
	return me.fetchMany(me.fetchProject, token, ids);
};
me.fetchProjectsList = function (_, token) {
	return me.request(token, DEFS.project.list)
		.then(({body}) => body);
};

me.fetchClient = function (_, token, id) {
	return me.request(token, DEFS.client.details, {id})
		.then(({body: {data}}) => data);
};
me.fetchClients = function (_, token, ids) {
	return me.fetchMany(me.fetchClient, token, ids);
};

me.fetchTimeEntries = function (_, token, {days = 90}) {
	const params = {
		start_date: new Date(new Date().setDate(new Date().getDate() - days)).toISOString()
	};

	return me.request(token, DEFS.timeEntry.list, {qs: params})
		.then(({body}) => body);
};
me.fetchCurrentTimeEntry = function (_, token) {
	return me.request(token, DEFS.timeEntry.current);
};

/**
 * GETTERS
 **/
me.getClients = function (_, token, {ids}) {
	return me.fetchClients(token, ids);
};

me.getProjects = function ({utils}, token, {ids, deps = true}) {
	const partial = ids ?
		me.fetchProjects(token, ids) :
		me.fetchProjectsList(token);

	if (!deps) {
		return partial;
	}

	return partial
		.then(utils.attach(me.getClients, token, 'cid', 'client'));
};

me.getTimeEntries = function ({utils}, token, {amount, deps = true}) {
	const partial = me.fetchTimeEntries(token, {})
		.then(entries => {
			entries.reverse();

			try {
				entries.length = Math.min(entries.length, amount || 8);
			} catch (e) {
				throw new Error('Invalid "amount"');
			}

			return entries;
		});

	if (!deps) {
		return partial;
	}

	return partial
		.then(utils.attach(me.getProjects, token, 'pid', 'project', deps));
};

me.getCurrentTimeEntry = function ({utils}, token, deps = true) {
	return me.fetchCurrentTimeEntry(token)
		.then(({body: {data}}) => {
			if (!data) {
				return undefined;
			}

			if (!deps) {
				return data;
			}

			return Promise.resolve([data])
				.then(utils.attach(me.getProjects, token, 'pid', 'project', deps))
				.then(([data]) => data);
		});
};

/**
 * SETTERS
 **/
me.startTimeEntry = function ({pkg}, token, time_entry = {}) {
	time_entry.created_with = `toggl-cli ${pkg.version}`;
	return me.request(token, DEFS.timeEntry.start, {body: {time_entry}})
		.then(({body: {data}}) => data);
};

me.stopTimeEntry = function (_, token, id) {
	return me.request(token, DEFS.timeEntry.stop, {id})
		.then(({body: {data}}) => data);
};

me.updateTimeEntry = function (_, token, id, changes) {
	return me.request(token, DEFS.timeEntry.update, {id, body: {time_entry: changes}})
		.then(({body: {data}}) => data);
};

me.deleteTimeEntry = function (_, token, id) {
	return me.request(token, DEFS.timeEntry.delete, {id})
		.then(({body}) => body);
};

/**
 * EXPORT
 **/
me = require('mee')(module, me, {
	request: require('request'),

	utils: require('./utils.js'),

	pkg: require('../package.json')
});
