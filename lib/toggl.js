/* eslint camelcase: 0 */ /* some vars are used as indexes of Toggl API*/
'use strict';

const URL = 'https://www.toggl.com/api';
const API_VER = 'v8';

const DEFS = {
	project: {
		details: {
			endpoint: ['projects', ':id'],
			method: 'GET'
		}
	},
	timeEntry: {
		create: {
			endpoint: ['time_entires', 'create'],
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
			endpoint: ['time_entires', ':id'],
			method: 'PUT'
		}
	}
};

let me = {};

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
		URL,
		version || API_VER,
		...endpoint
	].join('/');
};

me.getAnything = function ({request, url}, token, {endpoint, method, version}, params) {
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

// Projects
me.getProject = function (_, token, id) {
	return me.getAnything(token, DEFS.project.details, {id})
		.then(({body: {data: project}}) => {
			return project;
		});
};

me.getProjects = function (_, token, ids) {
	ids = ids.filter((id, pos, arr) => id !== undefined && arr.indexOf(id) === pos); // remove dups

	if (ids.lenght === 0) {
		return undefined;
	}

	return Promise.all(ids.map(id => me.getProject(token, id)));
};

// Time Entries
me.currentTimeEntry = function (_, token) {
	return me.getAnything(token, DEFS.timeEntry.current);
};

me.getTimeEntries = function (_, token, {days}) {
	const params = {};
	if (days) {
		params.start_date = new Date(new Date().setDate(new Date().getDate() - days)).toISOString();
	}

	return me.getAnything(token, DEFS.timeEntry.list, {qs: params});
};

me.startTimeEntry = function (_, token, description) {
	const time_entry = {
		description,
		created_with: 'toggl-cli'
	};
	return me.getAnything(token, DEFS.timeEntry.start, {body: {time_entry}});
};

me.stopTimeEntry = function (_, token, id) {
	return me.getAnything(token, DEFS.timeEntry.stop, {id});
};

me = require('mee')(module, me, {
	request: require('request'),
	url: require('url')
});
