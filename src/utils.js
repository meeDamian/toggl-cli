'use strict';

// turns an Array of things into a dictionary where ID is the key
function objectify(arr) {
	return arr.reduce((p, c) => {
		p[c.id] = c;
		return p;
	}, {});
}

// Replaces id with a matching object for all given objects
function combine(parents, short, long) {
	return list => {
		return parents.map(l => {
			if (l[short]) {
				l[long] = list[l[short]];
				l[short] = undefined;
				delete l[short];
			}
			return l;
		});
	};
}

// Downloads and attaches dependencies to all "parents" elements
function attach(fn, token, short, long, deps = false) {
	return parents => {
		const ids = parents.map(p => p[short]);

		return fn(token, {ids, deps})
			.then(objectify)
			.then(combine(parents, short, long));
	};
}

function getPackage() {
	try {
		return require('../package.json');
	} catch (e) {
		return require('../../package.json');
	}
}

Object.assign(module.exports, {
	objectify,
	combine,
	attach,
	getPackage
});
