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
    for(let k in o)
      if (typeof o[k] === 'function')
        o[k] = o[k].bind(undefined, deps);

  return o;
}

module.exports = exports = {
  objectify,
  gimme
};
