#!/bin/bash

if [ `node --version | cut -c 2- | cut -c -1` -le 4 ]; then
	printf "preparing legacy version…\n"
	npm run compile && mocha compiled/test
else
	xo && mocha --harmony --harmony_destructuring --harmony_default_parameters
fi
