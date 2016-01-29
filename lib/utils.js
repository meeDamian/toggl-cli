'use strict';

function objectify(arr) {
	return arr.reduce((p, c) => {
		p[c.id] = c;
		return p;
	}, {});
}

Object.assign(module.exports, {
	objectify
});
