#!/usr/bin/env node # --harmony --harmony_destructuring --harmony_default_parameters
require("babel-register")({ignore: /(?!node_modules\/mee).*/});
require("babel-polyfill");

require('./src/');
