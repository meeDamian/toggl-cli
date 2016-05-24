#!/bin/sh
':' //; NODE="$(command -v nodejs || command -v node)"; if [[ `$NODE --version` =~ ^v5\. ]]; then FLAGS="--harmony_destructuring --harmony_default_parameters --harmony_rest_parameters"; fi; exec "$NODE" $FLAGS "$0" "$@"
'use strict';

require('./cli.js').main();
