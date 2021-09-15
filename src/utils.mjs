// Turns an Array of things into a dictionary where ID is the key
function objectify(array) {
	return Object.fromEntries(array.map(item => [item.id, item]));
}

// Replaces id with a matching object for all given objects
function combine(parents, short, long) {
	return list => parents.map(l => {
		if (l[short]) {
			l[long] = list[l[short]];
			l[short] = undefined;
			delete l[short];
		}

		return l;
	});
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

// Execute sth in `.then()` without breaking the pipe
function pass(fn) {
	return value => {
		if (fn) {
			fn(value);
		}

		return value;
	};
}

function toDate(ts) {
	ts = new Date(ts);
	return `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`;
}

function compareDates(one, two) {
	return toDate(one) === toDate(two);
}

const utils = {
	objectify,
	combine,
	attach,
	pass,
	toDate,
	compareDates,
};
export default utils;
