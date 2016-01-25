#!/usr/bin/env node --harmony --harmony_destructuring --harmony_default_parameters
'use strict';

let {
  flags,
  help,
  toggl,
  config,
  simple,
  interactive
} = require('./lib/');

flags.processInput({help, config})
  .then(input => {
    if (!input.cmd) {
      interactive.start(toggl, input);
      return;
    }

    simple.execute(toggl, input);
  })
  .catch(err => {
    console.log(err);
  });
