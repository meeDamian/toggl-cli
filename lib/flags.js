'use strict';

function preProcessFlags({minimist, argv}) {
  return minimist(argv.slice(2), {
    boolean: ['help', 'version', 'force'],
    string: ['token', 'save-token'],
    alias: {
      h: 'help',
      v: 'version',
      t: 'token',
      f: 'force'
    }
  });
}

function chooseToken({config:{getToken}, argv:{token}}) {
  return new Promise((resolve, reject) => {
    if (token === '') {
      reject('`--token` can\'t be empty');
      return;
    }

    if (token) {
      resolve(token);
      return;
    }

    return getToken()
      .then(resolve, reject);
  });
}

function processInput({minimist, process, console:{log}, pkg, chalk}, {help, config}) {
  return new Promise((resolve, reject) => {
    let argv = process.argv;

    argv = preProcessFlags({minimist, argv});

    if (argv.version) {
      log(pkg.version);
      return;
    }

    if (argv.help) {
      log(help.getLong({pkg, chalk}));
      return;
    }

    if (argv['save-token']) {
      config.setToken(argv['save-token'])
        .then((token) => log('token `' + token + '` saved'))
        .catch((err) => log('token NOT saved:', err));
      return;
    }

    let force = argv.force;

    chooseToken({config, argv})
      .then(token => {
        if (!argv._.length) {
          resolve({token, force});
          return;
        }

        resolve({
          cmd: argv._,
          force,
          token
        });
      })
      .catch(log);
  });
}

module.exports = exports = {
  preProcessFlags,
  chooseToken,
  processInput
};
