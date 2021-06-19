#!/bin/sh
':'; // ; FLAGS=''; NODE="$(command -v nodejs || command -v node)"; if $(printf $($NODE --version) | grep -Eq '^v5\.'); then FLAGS="--harmony_destructuring --harmony_default_parameters --harmony_rest_parameters"; fi; exec "$NODE" $FLAGS "$0" "$@"
'use strict';

require('./cli.js').main();
