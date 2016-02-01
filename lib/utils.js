'use strict';

function objectify(arr) {
	return arr.reduce((p, c) => {
		p[c.id] = c;
		return p;
	}, {});
}

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

function attach(fn, token, short, long, deps = false) {
	return parents => {
		const ids = parents.map(p => p[short]);

		return fn(token, {ids, deps})
			.then(objectify)
			.then(combine(parents, short, long));
	};
}

Object.assign(module.exports, {
	objectify,
	combine,
	attach
});
