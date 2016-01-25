'use strict';

let utils = require('./utils.js');

// dependencies for all files in this dir
let deps = {
  minimist: require('minimist'),
  request: require('request'),
  chalk: require('chalk'),
  path: require('path'),
  url: require('url'),
  fs: require('fs-extended'),

  pkg: require('../package.json'),
  utils,

  process, require, console
};


let {gimme} = utils;

// return object with deps injected
module.exports = exports = {
  simple2: require('./simple/'),
  interactive: gimme('interactive', deps),
  simple: gimme('simple', deps),
  config: gimme('config', deps),
  toggl: gimme('toggl', deps),
  help: gimme('help', deps),
  flags: gimme('flags', deps)
};
