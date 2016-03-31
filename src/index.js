#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" --harmony_destructuring --harmony_default_parameters --harmony_rest_parameters "$0" "$@"
'use strict';

require('./cli.js').main();
