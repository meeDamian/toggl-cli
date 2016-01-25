'use strict';

let utils = require('../utils.js');

// dependencies for all files in this dir
let deps = {
  minimist: require('minimist'),
  request: require('request'),
  chalk: require('chalk'),
  path: require('path'),
  url: require('url'),
  fs: require('fs-extended'),

  utils,

  process, require, console
};


let {gimme} = utils;

// return object with deps injected
module.exports = exports = {
  list: gimme('simple/list', deps)
};
