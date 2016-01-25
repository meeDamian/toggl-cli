'use strict';

function getPath({path, process:{env}}) {
  return path.resolve(...[
    env.HOME || env.USERPROFILE,
    '.config/toggl-cli/config.json',
  ]);
}

function getConfig(deps) {
  try {
    return deps.require(getPath(deps));
  } catch(err) {
    return null;
  }
}

function getToken(deps) {
  return new Promise((resolve, reject) => {
    let config = getConfig(deps);
    if (config && config.token && typeof config.token === 'string') {
      resolve(config.token);
      return;
    }
    reject('no token saved');
  });
}

function setToken(deps, token) {
  return new Promise((resolve, reject) => {
    let config = getConfig(deps);
    if (!config || typeof config !== 'object')
      config = {};

    config.token = token;

    deps.fs.writeJSON(getPath(deps), config, 2, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token);
    });
  });
}

module.exports = exports = {
  getPath,
  getConfig,
  getToken,
  setToken
}
