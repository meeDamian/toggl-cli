#!/bin/bash

if [ `node --version | cut -c 2- | cut -c -1` -le 4 ]; then
	if [ ! -d "./compiled/" ]; then
		printf "preparing legacy version…\n"
		npm run compile
	fi

	./runES5.js $@
else
	./run.js $@
fi
