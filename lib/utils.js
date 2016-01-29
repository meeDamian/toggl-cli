'use strict';

function objectify(arr) {
  return arr.reduce((p, c) => {
    p[c.id] = c;
    return p;
  }, {});
}

// dependency-aware "require"
function gimme(name, deps) {
  let o = require('./' + name + '.js');

  if (deps)
    for (let k in o)
      if (typeof o[k] === 'function')
        o[k] = o[k].bind(undefined, deps);

  return o;
}

function wrap(o) {
	return d => {
		if (!d)
			return o;

		let n = {};
		for (let f in o) {
			n[f] = typeof o[f] === 'function'
				? o[f].bind(undefined, d)
				: o[f];
		}

		return n;
	};
}

module.exports = function(m, o, d) {
	m.exports = wrap(o);
	return Object.assign(m.exports, wrap(o)(d));
}

Object.assign(module.exports, {
  objectify,
  gimme,
	wrap
});
