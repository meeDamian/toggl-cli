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

function getUrl(_, {version, endpoint, id}) {
  if (!endpoint)
    throw new Error('endpoint must be provided');

  if (typeof endpoint === 'string')
    endpoint = [endpoint];

  if (id)
    endpoint = endpoint.map(s => s === ':id' ? id : s);

  return [
    URL,
    version || API_VER,
    ...endpoint
  ].join('/');
}

function getAnything({request, url}, token, {endpoint, method, version}, {id, body, qs}) {
  return new Promise((resolve, reject) => {
    let tm = setTimeout(reject, 2000);

    let url = getUrl(undefined, {version, endpoint, id})

    request({
      method,
      url,
      json: true,
      body,
      qs,
      headers: {
        Authorization: 'Basic ' + new Buffer(token + ':api_token', 'utf8').toString('base64')
      }
    }, (error, {statusCode}, body) => {
      clearTimeout(tm);

      if (error) {
        reject({statusCode, error});
        return;
      }

      if (statusCode !== 200) {
        reject({statusCode, error: new Error('FAIL' + url)});
        return;
      }

      resolve({body});
    });
  });
}

// Projects
function getProject(deps, token, id) {
  return getAnything(deps, token, DEFS.project.details, {id})
    .then(({body: {data: project}}) => {
      return project;
    });
}

function getProjects(deps, token, ids) {
  ids = ids.filter((id, pos, arr) => id !== undefined && arr.indexOf(id) === pos);

  if (ids.lenght === 0)
    return null;

  return Promise.all(ids.map(id => getProject(deps, token, id)));
}

// Time Entries
function currentTimeEntry(deps, token) {
  return getAnything(deps, token, DEFS.timeEntry.current, {});
}

function getTimeEntries(deps, token, {days}) {
  let params = {};
  if (days)
    params.start_date = new Date(new Date().setDate(new Date().getDate() - days)).toISOString();

  return getAnything(deps, token, DEFS.timeEntry.list, {qs: params});
}

function startTimeEntry(deps, token, description) {
  let time_entry = {
    description,
    created_with: 'toggl-cli'
  };
  return getAnything(deps, token, DEFS.timeEntry.start, {body: {time_entry}});
}

function stopTimeEntry(deps, token, id) {
  return getAnything(deps, token, DEFS.timeEntry.stop, {id});
}


module.exports = exports = {
  URL, API_VER, DEFS,

  getUrl,
  getAnything,

  getProject,
  getProjects,

  currentTimeEntry,
  getTimeEntries,
  startTimeEntry,
  stopTimeEntry
}
